import { getValidToken } from './tokenManager';
import axios from 'axios';
import { ConnectedAccount } from '../db';

export interface PublishParams {
  businessId: string;
  mediaUrl: string; // Must be a video URL for TikTok
  caption: string;
}

export async function publishToTikTok({ businessId, mediaUrl, caption }: PublishParams) {
  const tokens = await getValidToken(businessId, 'tiktok');
  if (!tokens) throw new Error('TikTok account not connected');

  try {
    // Note: TikTok API usually requires uploading chunks, but for some partner levels
    // or simplified APIs, you can pull from URL. The Direct Post API v2 requires init,
    // then upload chunks, then complete.
    // For simplicity in this demo, we'll outline the init request and mock the rest if a direct URL isn't supported,
    // or we'd have to download and chunk it.

    // 1. Download video to get size
    const headRes = await axios.head(mediaUrl);
    const videoSize = headRes.headers['content-length'];

    // 2. Initialize upload
    const initRes = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        post_info: {
          title: caption,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL', // If TikTok supports this for the app's scope
          video_url: mediaUrl,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const initData = initRes.data as any;
    if (initData.error.code !== 'ok') {
      throw new Error(initData.error.message);
    }

    // If source is PULL_FROM_URL, TikTok handles the downloading.
    // We just return the publish_id.
    const publishId = initData.data.publish_id;

    return {
      success: true,
      postId: publishId,
      // TikTok doesn't immediately return a URL
      postUrl: `https://tiktok.com/@user/video/${publishId}`, 
    };

  } catch (error: any) {
    console.error('[TikTok Publish Error]:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to publish to TikTok',
    };
  }
}
