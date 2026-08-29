import { google } from 'googleapis';
import { getValidToken } from './tokenManager';
import axios from 'axios';
import { Readable } from 'stream';

export interface PublishParams {
  businessId: string;
  mediaUrl: string;
  caption: string;
  hashtags: string[];
}

export async function publishToYouTube({ businessId, mediaUrl, caption, hashtags }: PublishParams) {
  const tokens = await getValidToken(businessId, 'youtube');
  if (!tokens) throw new Error('YouTube account not connected');

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: tokens.accessToken });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Download media from Cloudinary/S3 as a stream to pipe to YouTube
  const mediaStreamResponse = await axios.get(mediaUrl, { responseType: 'stream' });

  // Add hashtags to description
  const description = `${caption}\n\n${hashtags.join(' ')}`;
  
  // Truncate caption for title if it's too long
  const title = caption.length > 90 ? caption.substring(0, 90) + '...' : caption;

  try {
    const res = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          tags: hashtags.map(t => t.replace('#', '')),
          categoryId: '22', // People & Blogs - adjust as needed
        },
        status: {
          privacyStatus: 'public', // Or 'private'/'unlisted'
        },
      },
      media: {
        body: mediaStreamResponse.data,
      },
    });

    return {
      success: true,
      postId: res.data.id || undefined,
      postUrl: `https://youtube.com/watch?v=${res.data.id}`,
    };
  } catch (error: any) {
    console.error('[YouTube Publish Error]:', error.response?.data || error);
    return {
      success: false,
      error: error.message || 'Failed to publish to YouTube',
    };
  }
}

export async function getYouTubeComments(businessId: string, platformPostId: string) {
  const tokens = await getValidToken(businessId, 'youtube');
  if (!tokens) throw new Error('YouTube account not connected');

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: tokens.accessToken });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  try {
    const res = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: platformPostId,
      maxResults: 50,
    });

    return (res.data.items || []).map(item => {
      const comment = item.snippet?.topLevelComment?.snippet;
      return {
        id: item.id,
        username: comment?.authorDisplayName || 'Anonymous',
        text: comment?.textDisplay || '',
        timestamp: comment?.publishedAt || '',
      };
    });
  } catch (error: any) {
    console.error('[YouTube Comments Error]:', error.response?.data || error.message);
    // 403 usually means comments are disabled for the video
    if (error.code === 403) return [];
    throw new Error('Failed to fetch YouTube comments');
  }
}
