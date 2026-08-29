import express from 'express';
import { Post } from '../db';
import { getYouTubeComments } from '../services/youtube';
import { getInstagramComments, getFacebookComments, getInstagramLikes, getFacebookLikes } from '../services/instagram';
// Note: TikTok comments/likes not supported by current API scopes

const router = express.Router();

router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.platformPostId) return res.status(400).json({ error: 'Post has not been published yet' });

    let comments: any[] = [];

    switch (post.platform) {
      case 'youtube':
        comments = await getYouTubeComments(post.businessId.toString(), post.platformPostId);
        break;
      case 'instagram':
        comments = await getInstagramComments(post.businessId.toString(), post.platformPostId);
        break;
      case 'facebook':
        comments = await getFacebookComments(post.businessId.toString(), post.platformPostId);
        break;
      case 'tiktok':
        return res.status(400).json({ error: 'TikTok does not support fetching comments via current API' });
      default:
        return res.status(400).json({ error: `Unsupported platform: ${post.platform}` });
    }

    res.json(comments);
  } catch (error: any) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch comments' });
  }
});

router.get('/:postId/likes', async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.platformPostId) return res.status(400).json({ error: 'Post has not been published yet' });

    let likes: any[] = [];

    switch (post.platform) {
      case 'instagram':
        likes = await getInstagramLikes(post.businessId.toString(), post.platformPostId);
        break;
      case 'facebook':
        likes = await getFacebookLikes(post.businessId.toString(), post.platformPostId);
        break;
      case 'youtube':
        return res.status(400).json({ error: 'YouTube does not support fetching individual likers due to privacy restrictions' });
      case 'tiktok':
        return res.status(400).json({ error: 'TikTok does not support fetching likers via current API' });
      default:
        return res.status(400).json({ error: `Unsupported platform: ${post.platform}` });
    }

    res.json(likes);
  } catch (error: any) {
    console.error('Fetch likes error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch likes' });
  }
});

export default router;
