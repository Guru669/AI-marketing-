import express from 'express';
import { Competitor } from '../db';
import { getAIClient, getAIModel } from '../lib/ai';

const router = express.Router();

// POST /api/competitors/:id/teardown
router.post('/:id/teardown', async (req, res) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    if (!competitor) return res.status(404).json({ error: 'Competitor not found' });

    const aiClient = getAIClient();
    if (!aiClient) return res.status(400).json({ error: 'AI Client not configured' });

    const prompt = `
      Analyze this competitor for a business:
      Competitor Name: ${competitor.name}
      Platform: ${competitor.platform}
      Handle: ${competitor.handle}
      Followers: ${competitor.followerCount}
      Avg Engagement: ${competitor.avgEngagementRate}%
      Posting Frequency: ${competitor.postingFrequency}
      Top Content: ${competitor.topContentType}
      Notes: ${competitor.notes}

      Provide a strategic teardown in JSON format:
      - sentiment: String (e.g. "High Engagement", "Moderate")
      - sentimentScore: Number (0-100)
      - weakSpot: String (specific vulnerability)
      - topHashtags: Array of strings
      - aiCounterStrategy: String (how to beat them)
    `;

    const completion = await aiClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: getAIModel(),
      response_format: { type: 'json_object' },
    });

    const teardown = JSON.parse(completion.choices[0].message.content || '{}');
    res.json(teardown);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/competitors/business/:businessId
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const competitors = await Competitor.find({ businessId }).sort({ createdAt: -1 });
    res.json(competitors);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch competitors' });
  }
});

// POST /api/competitors
router.post('/', async (req, res) => {
  try {
    const competitor = new Competitor(req.body);
    await competitor.save();
    res.status(201).json(competitor);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create competitor' });
  }
});

// PUT /api/competitors/:id
router.put('/:id', async (req, res) => {
  try {
    const competitor = await Competitor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(competitor);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update competitor' });
  }
});

// DELETE /api/competitors/:id
router.delete('/:id', async (req, res) => {
  try {
    await Competitor.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete competitor' });
  }
});

export default router;
