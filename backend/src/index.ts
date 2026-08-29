import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { connectDB, Business, Post, Analytics, IPost, IAnalytics } from './db';
import { getAIClient, getAIModel } from './lib/ai';
import mediaRoutes from './routes/media';
import authRoutes from './routes/auth';
import userAuthRoutes from './routes/userAuth';
import postsRoutes from './routes/posts';
import accountsRoutes from './routes/accounts';
import engagementRoutes from './routes/engagement';
import businessRoutes from './routes/businesses';
import campaignsRoutes from './routes/campaigns';
import analyticsRoutes from './routes/analytics';
import competitorsRoutes from './routes/competitors';
import { startScheduler } from './services/scheduler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Start the scheduler for scheduled posts
startScheduler();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/media', mediaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user-auth', userAuthRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/competitors', competitorsRoutes);

app.get('/api/business/:id/stats', async (req, res) => {
  const { id } = req.params;

  try {
    const posts = await Post.find({ businessId: id });
    const analytics = await Analytics.find({ businessId: id });

    const stats = {
      totalPosts: posts.length,
      publishedPosts: posts.filter((p: IPost) => p.status === 'published').length,
      totalEngagement: analytics.reduce((acc: number, curr: IAnalytics) => acc + curr.likes + curr.comments + curr.shares, 0),
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-content', async (req, res) => {
  const {
    businessName,
    businessType,
    description,
    targetAudience,
    brandVoice,
    platform,
    contentType,
    topic,
    goal
  } = req.body;

  if (!businessName || !topic) {
    return res.status(400).json({ error: 'Business name and topic are required' });
  }

  try {
    const aiClient = getAIClient();
    const model = getAIModel();

    if (aiClient) {
      const prompt = `
        You are an expert social media manager. Create a ${contentType} for ${businessName}, a ${businessType} business.
        Business Description: ${description}
        Target Audience: ${targetAudience}
        Brand Voice: ${brandVoice}
        Platform: ${platform}
        Topic: ${topic}
        Goal: ${goal}

        Provide the response in JSON format with:
        - caption: The post caption text
        - hashtags: An array of 10-15 relevant hashtags
        - bestPostTime: Recommended day and time to post
        - aiScore: A quality score between 80-100
        - suggestions: 3-5 tips for the post
      `;

      const completion = await aiClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: model,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return res.json(result);
    } else {
      // Mock implementation if no OpenAI key
      const result = {
        caption: `Hey everyone! We're so excited to share about ${topic} at ${businessName}. ${description}. Targeted for ${targetAudience}.`,
        hashtags: ['#' + businessType.replace(/\s/g, ''), '#' + topic.replace(/\s/g, ''), '#marketing', '#smallbusiness'],
        bestPostTime: 'Wednesday, 6:00 PM',
        aiScore: 85,
        suggestions: [
          'Use a high-quality photo',
          'Engage with comments in the first hour',
          'Share to your story for more reach'
        ]
      };
      return res.json(result);
    }
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
