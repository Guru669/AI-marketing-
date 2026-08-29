import express from 'express';
import axios from 'axios';
import { ConnectedAccount } from '../db';
import { encryptToken } from '../lib/crypto';

const router = express.Router();

/* ------------------------------------------------------------------ */
/*  YOUTUBE (Google OAuth 2.0)                                         */
/* ------------------------------------------------------------------ */

// Step 1: Redirect owner to Google's consent screen
router.get(['/youtube/connect', '/youtube'], (req, res) => {
  const { businessId } = req.query;
  if (!businessId) return res.status(400).send('businessId is required');

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/youtube/callback`;

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline', // needed to get a refresh_token
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
    ].join(' '),
    state: businessId as string, // carry businessId through redirect
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// Step 2: Google redirects back here with ?code=
router.get('/youtube/callback', async (req, res) => {
  const { code, state: businessId } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code || !businessId) {
    return res.redirect(`${frontendUrl}?view=settings&error=invalid_callback`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/youtube/callback`;

    const { data } = await axios.post<any>('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code,
      },
    });

    const { access_token, refresh_token, expires_in } = data;

    // Fetch the connected channel's details
    const channelRes = await axios.get<any>(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const channel = channelRes.data.items?.[0];

    await ConnectedAccount.findOneAndUpdate(
      { businessId, platform: 'youtube' },
      {
        businessId,
        platform: 'youtube',
        accessToken: encryptToken(access_token),
        refreshToken: refresh_token ? encryptToken(refresh_token) : undefined,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
        platformUserId: channel?.id || 'unknown',
        platformUsername: channel?.snippet?.title || 'YouTube Channel',
        platformAvatarUrl: channel?.snippet?.thumbnails?.default?.url || '',
        connectedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.redirect(`${frontendUrl}?view=settings&connected=youtube`);
  } catch (err: any) {
    console.error('YouTube OAuth error:', err?.response?.data || err.message);
    res.redirect(`${frontendUrl}?view=settings&error=youtube_connect_failed`);
  }
});

/* ------------------------------------------------------------------ */
/*  INSTAGRAM / FACEBOOK (Meta OAuth 2.0)                              */
/* ------------------------------------------------------------------ */

// Step 1: Redirect to Facebook's consent screen
router.get(['/instagram/connect', '/instagram', '/facebook/connect', '/facebook'], (req, res) => {
  const { businessId } = req.query;
  if (!businessId) return res.status(400).send('businessId is required');

  const appId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
  const redirectUri =
    process.env.META_REDIRECT_URI ||
    `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/instagram/callback`;

  const params = new URLSearchParams({
    client_id: appId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
    ].join(','),
    state: businessId as string,
  });

  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
});

// Step 2: Meta redirects back here with ?code=
const handleMetaCallback = async (req: express.Request, res: express.Response) => {
  const { code, state: businessId } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code || !businessId) {
    return res.redirect(`${frontendUrl}?view=settings&error=invalid_callback`);
  }

  try {
    const appId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
    const redirectUri = req.path.includes('facebook')
      ? `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/facebook/callback`
      : (process.env.META_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/instagram/callback`);

    // 1. Exchange code for a short-lived user access token
    const tokenRes = await axios.get<any>('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code,
      },
    });
    const shortLivedToken = tokenRes.data.access_token;

    // 2. Exchange for a long-lived token (~60 days)
    const longLivedRes = await axios.get<any>('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken,
      },
    });
    const longLivedToken = longLivedRes.data.access_token;
    const expiresIn = longLivedRes.data.expires_in;

    // 3. Find the Page connected to this user
    const pagesRes = await axios.get<any>('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: longLivedToken },
    });
    const page = pagesRes.data.data?.[0];

    if (page) {
      await ConnectedAccount.findOneAndUpdate(
        { businessId, platform: 'facebook' },
        {
          businessId,
          platform: 'facebook',
          accessToken: encryptToken(page.access_token || longLivedToken),
          expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
          platformUserId: page.id,
          platformUsername: page.name,
          connectedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    // 4. Find linked Instagram Business Account
    if (page) {
      const igRes = await axios.get<any>(`https://graph.facebook.com/v19.0/${page.id}`, {
        params: {
          fields: 'instagram_business_account,name',
          access_token: page.access_token || longLivedToken,
        },
      });
      const igAccountId = igRes.data.instagram_business_account?.id;

      if (igAccountId) {
        const igProfileRes = await axios.get<any>(`https://graph.facebook.com/v19.0/${igAccountId}`, {
          params: { fields: 'username,profile_picture_url', access_token: page.access_token || longLivedToken },
        });

        await ConnectedAccount.findOneAndUpdate(
          { businessId, platform: 'instagram' },
          {
            businessId,
            platform: 'instagram',
            accessToken: encryptToken(page.access_token || longLivedToken),
            expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
            platformUserId: igAccountId,
            platformUsername: igProfileRes.data.username,
            platformAvatarUrl: igProfileRes.data.profile_picture_url || '',
            connectedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      }
    }

    res.redirect(`${frontendUrl}?view=settings&connected=instagram`);
  } catch (err: any) {
    console.error('Meta OAuth error:', err?.response?.data || err.message);
    res.redirect(`${frontendUrl}?view=settings&error=instagram_connect_failed`);
  }
};

router.get('/instagram/callback', handleMetaCallback);
router.get('/facebook/callback', handleMetaCallback);

/* ------------------------------------------------------------------ */
/*  SHARED: status + disconnect                                        */
/* ------------------------------------------------------------------ */

// GET /api/auth/status?businessId=...
router.get('/status', async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) return res.status(400).json({ error: 'businessId is required' });

  try {
    const accounts = await ConnectedAccount.find({ businessId: businessId as string }).select(
      'platform platformUsername platformAvatarUrl connectedAt expiresAt'
    );

    const platforms = ['instagram', 'facebook', 'youtube', 'tiktok'];
    const status = platforms.reduce((acc: Record<string, any>, platform: string) => {
      const found = accounts.find((a) => a.platform === platform);
      acc[platform] = found
        ? {
            connected: true,
            username: found.platformUsername,
            avatarUrl: found.platformAvatarUrl,
            connectedAt: found.connectedAt,
          }
        : { connected: false };
      return acc;
    }, {});

    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/auth/disconnect?businessId=...&platform=...
router.delete('/disconnect', async (req, res) => {
  const { businessId, platform } = req.query;
  if (!businessId || !platform) {
    return res.status(400).json({ error: 'businessId and platform are required' });
  }

  try {
    await ConnectedAccount.findOneAndDelete({
      businessId: businessId as string,
      platform: platform as string,
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
