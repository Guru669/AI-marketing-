import cron from 'node-cron';
import { Post } from '../db';
import { executePublish } from '../routes/posts';

export function startScheduler() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Find all scheduled posts whose time has come or passed
      const postsToPublish = await Post.find({
        status: 'scheduled',
        scheduledTime: { $lte: now }
      });

      if (postsToPublish.length > 0) {
        console.log(`[Scheduler] Found ${postsToPublish.length} posts to publish`);
        
        for (const post of postsToPublish) {
          console.log(`[Scheduler] Publishing post ${post._id} for ${post.platform}`);
          await executePublish(post);
        }
      }
    } catch (err: any) {
      if (err.name === 'MongoServerSelectionError' || err.message.includes('ECONNREFUSED')) {
        // Quietly log connection errors to avoid flooding the console
        return;
      }
      console.error('[Scheduler] Error checking scheduled posts:', err);
    }
  });

  console.log('Scheduler started. Checking for scheduled posts every minute.');
}
