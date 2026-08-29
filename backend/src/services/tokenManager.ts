import { ConnectedAccount, IConnectedAccount } from '../db';
import { decrypt, encrypt } from '../lib/crypto';
import axios from 'axios';

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Retrieves the decrypted access token for a platform/business, refreshing if expired.
 * Returns null if the account isn't connected.
 */
export async function getValidToken(
  businessId: string,
  platform: IConnectedAccount['platform']
): Promise<TokenInfo | null> {
  const account = await ConnectedAccount.findOne({ businessId, platform });
  if (!account) return null;

  // Check expiry (give 5-min buffer)
  const isExpired =
    account.expiresAt && new Date(account.expiresAt).getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired && account.refreshToken) {
    try {
      const fresh = await refreshToken(platform, decrypt(account.refreshToken));
      account.accessToken = encrypt(fresh.accessToken);
      if (fresh.refreshToken) account.refreshToken = encrypt(fresh.refreshToken);
      if (fresh.expiresAt) account.expiresAt = fresh.expiresAt;
      await account.save();
    } catch (err) {
      console.error(`[tokenManager] Failed to refresh ${platform} token:`, err);
      // Return the stale token and let the platform API return the real error
    }
  }

  return {
    accessToken: decrypt(account.accessToken),
    refreshToken: account.refreshToken ? decrypt(account.refreshToken) : undefined,
    expiresAt: account.expiresAt,
  };
}

async function refreshToken(
  platform: IConnectedAccount['platform'],
  refreshToken: string
): Promise<TokenInfo> {
  switch (platform) {
    case 'youtube': {
      const res = await axios.post('https://oauth2.googleapis.com/token', null, {
        params: {
          client_id: process.env.YOUTUBE_CLIENT_ID,
          client_secret: process.env.YOUTUBE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
      });
      const data = res.data as any;
      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
    }

    case 'instagram':
    case 'facebook': {
      const res = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: refreshToken,
        },
      });
      const data = res.data as any;
      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000),
      };
    }

    case 'tiktok': {
      const res = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      const data = res.data as any;
      return {
        accessToken: data.data.access_token,
        refreshToken: data.data.refresh_token,
        expiresAt: new Date(Date.now() + data.data.expires_in * 1000),
      };
    }

    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
