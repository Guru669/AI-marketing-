import { getValidToken } from './tokenManager';
import axios from 'axios';
import { IConnectedAccount } from '../db';

export interface PublishParams {
  businessId: string;
  mediaUrl: string;
  caption: string;
  contentType: string; // 'post', 'story', 'reel'
  platform: 'instagram' | 'facebook';
}

export async function publishToMeta({ businessId, mediaUrl, caption, contentType, platform }: PublishParams) {
  const tokens = await getValidToken(businessId, platform);
  if (!tokens) throw new Error(`${platform} account not connected`);

  // We need the platformUserId (the IG or FB Page ID) to post
  // Assuming it's passed or can be fetched. For this demo, let's assume tokenManager or db has it.
  // Actually, we need to import ConnectedAccount to get the userId.
  const { ConnectedAccount } = await import('../db');
  const account = await ConnectedAccount.findOne({ businessId, platform });
  if (!account || !account.platformUserId) {
    throw new Error(`Invalid ${platform} account configuration`);
  }

  const userId = account.platformUserId;
  const accessToken = tokens.accessToken;

  try {
    let containerId: string;

    const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.mov');
    
    // 1. Create Media Container
    if (platform === 'instagram') {
      let mediaType = 'IMAGE';
      if (contentType === 'reel') mediaType = 'REELS';
      else if (contentType === 'story' && isVideo) mediaType = 'VIDEO';
      else if (contentType === 'story') mediaType = 'STORIES'; // Requires specific parameters
      
      const containerRes = await axios.post(`https://graph.facebook.com/v18.0/${userId}/media`, null, {
        params: {
          access_token: accessToken,
          [isVideo ? 'video_url' : 'image_url']: mediaUrl,
          caption: contentType !== 'story' ? caption : undefined,
          media_type: mediaType !== 'IMAGE' ? mediaType : undefined,
        },
      });
      const containerData = containerRes.data as any;
      containerId = containerData.id;
    } else {
      // Facebook Page Publish
      const endpoint = isVideo ? 'videos' : 'photos';
      const containerRes = await axios.post(`https://graph.facebook.com/v18.0/${userId}/${endpoint}`, null, {
        params: {
          access_token: accessToken,
          [isVideo ? 'file_url' : 'url']: mediaUrl,
          description: caption, // FB uses description for both videos and photos
          published: false, // create container first (though FB can publish in one step, IG needs 2. To align, we might just publish in 1 step for FB)
        }
      });
      // Actually, for FB, if published=true, it's done. Let's just publish directly for FB.
      const containerData = containerRes.data as any;
      return {
        success: true,
        postId: containerData.id,
        postUrl: `https://facebook.com/${containerData.id}`,
      };
    }

    // 2. Wait for container to be ready if video (for IG)
    if (isVideo && platform === 'instagram') {
      let isReady = false;
      let attempts = 0;
      while (!isReady && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const statusRes = await axios.get(`https://graph.facebook.com/v18.0/${containerId}`, {
          params: { access_token: accessToken, fields: 'status_code' }
        });
        const statusData = statusRes.data as any;
        if (statusData.status_code === 'FINISHED') {
          isReady = true;
        } else if (statusData.status_code === 'ERROR') {
          throw new Error('Instagram failed to process the video');
        }
        attempts++;
      }
      if (!isReady) throw new Error('Video processing timed out');
    }

    // 3. Publish Media (IG only)
    const publishRes = await axios.post(`https://graph.facebook.com/v18.0/${userId}/media_publish`, null, {
      params: {
        creation_id: containerId,
        access_token: accessToken,
      },
    });

    const publishData = publishRes.data as any;
    return {
      success: true,
      postId: publishData.id,
      postUrl: `https://instagram.com/p/${publishData.id}`, // Not exact URL, but a placeholder
    };

  } catch (error: any) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`[${platform} Publish Error]:`, error.response?.data || error);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function getInstagramComments(businessId: string, platformPostId: string) {
  const tokens = await getValidToken(businessId, 'instagram');
  if (!tokens) throw new Error('Instagram account not connected');

  try {
    const res = await axios.get<any>(`https://graph.facebook.com/v18.0/${platformPostId}/comments`, {
      params: { access_token: tokens.accessToken, fields: 'id,text,username,timestamp' }
    });
    return res.data.data.map((c: any) => ({
      id: c.id,
      username: c.username || 'Anonymous',
      text: c.text,
      timestamp: c.timestamp,
    }));
  } catch (error: any) {
    console.error('[Instagram Comments Error]:', error.response?.data || error.message);
    throw new Error('Failed to fetch Instagram comments');
  }
}

export async function getFacebookComments(businessId: string, platformPostId: string) {
  const tokens = await getValidToken(businessId, 'facebook');
  if (!tokens) throw new Error('Facebook account not connected');

  try {
    const res = await axios.get<any>(`https://graph.facebook.com/v18.0/${platformPostId}/comments`, {
      params: { access_token: tokens.accessToken, fields: 'id,message,from,created_time' }
    });
    return res.data.data.map((c: any) => ({
      id: c.id,
      username: c.from?.name || 'Anonymous',
      text: c.message,
      timestamp: c.created_time,
    }));
  } catch (error: any) {
    console.error('[Facebook Comments Error]:', error.response?.data || error.message);
    throw new Error('Failed to fetch Facebook comments');
  }
}

export async function getInstagramLikes(businessId: string, platformPostId: string) {
  const tokens = await getValidToken(businessId, 'instagram');
  if (!tokens) throw new Error('Instagram account not connected');

  try {
    // Note: 'likes' edge on IG Media returns users who liked it
    const res = await axios.get<any>(`https://graph.facebook.com/v18.0/${platformPostId}/likes`, {
      params: { access_token: tokens.accessToken }
    });
    return res.data.data.map((l: any) => ({
      id: l.id,
      username: l.username || l.name || 'Anonymous',
    }));
  } catch (error: any) {
    console.error('[Instagram Likes Error]:', error.response?.data || error.message);
    throw new Error('Failed to fetch Instagram likes');
  }
}

export async function getFacebookLikes(businessId: string, platformPostId: string) {
  const tokens = await getValidToken(businessId, 'facebook');
  if (!tokens) throw new Error('Facebook account not connected');

  try {
    const res = await axios.get<any>(`https://graph.facebook.com/v18.0/${platformPostId}/likes`, {
      params: { access_token: tokens.accessToken }
    });
    return res.data.data.map((l: any) => ({
      id: l.id,
      username: l.name || 'Anonymous',
    }));
  } catch (error: any) {
    console.error('[Facebook Likes Error]:', error.response?.data || error.message);
    throw new Error('Failed to fetch Facebook likes');
  }
}
