import express from 'express';
import { Post, ConnectedAccount } from '../db';
import { publishToPlatform } from '../services/publisher';

const router = express.Router();

/**
 * Executes the actual publish logic based on platform
 */
export async function executePublish(post: any) {
  try {
    return await publishToPlatform(post._id || post.id);
  } catch (err: any) {
    post.status = 'failed';
    post.errorMessage = err.message || 'Unknown error occurred during publish';
    await post.save();
    return post;
  }
}

/**
 * POST /api/posts/publish
 */
router.post('/publish', async (req, res) => {
  try {
    const { businessId, platform, contentType, mediaUrl, caption, hashtags, campaignGoal } = req.body;

    // Pre-check if account is connected
    const account = await ConnectedAccount.findOne({ businessId, platform });
    if (!account) {
      return res.status(400).json({ error: `${platform} account is not connected. Please connect it in Settings.` });
    }

    const newPost = new Post({
      businessId,
      platform,
      contentType,
      mediaUrl,
      caption,
      hashtags,
      campaignGoal,
      status: 'draft', // Initial status
    });

    await newPost.save();
    
    // Execute publish synchronously for the frontend to show immediate feedback
    const resultPost = await executePublish(newPost);

    if (resultPost.status === 'failed') {
      return res.status(400).json({ error: resultPost.errorMessage, post: resultPost });
    }

    res.json({ success: true, post: resultPost });
  } catch (err: any) {
    console.error('[posts/publish] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to publish post' });
  }
});

/**
 * POST /api/posts/schedule
 */
router.post('/schedule', async (req, res) => {
  try {
    const { businessId, platform, contentType, mediaUrl, caption, hashtags, campaignGoal, scheduledTime } = req.body;

    const account = await ConnectedAccount.findOne({ businessId, platform });
    if (!account) {
      return res.status(400).json({ error: `${platform} account is not connected. Please connect it in Settings.` });
    }

    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const newPost = new Post({
      businessId,
      platform,
      contentType,
      mediaUrl,
      caption,
      hashtags,
      campaignGoal,
      status: 'scheduled',
      scheduledTime: scheduledDate,
    });

    await newPost.save();

    res.json({ success: true, post: newPost });
  } catch (err: any) {
    console.error('[posts/schedule] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to schedule post' });
  }
});

/**
 * GET /api/posts/business/:businessId
 */
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const posts = await Post.find({ businessId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch posts' });
  }
});

// POST /api/posts/bulk
router.post('/bulk', async (req, res) => {
  try {
    const { posts } = req.body;
    const inserted = await Post.insertMany(posts);
    res.status(201).json(inserted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to bulk insert posts' });
  }
});

export default router;
