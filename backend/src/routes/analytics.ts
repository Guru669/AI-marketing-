import express from 'express';
import { Analytics, Business } from '../db';
import { getAIClient, getAIModel } from '../lib/ai';

const router = express.Router();

// POST /api/analytics/predict-sales
router.post('/predict-sales', async (req, res) => {
  try {
    const { businessId, platform } = req.body;
    const business = await Business.findById(businessId);
    const data = await Analytics.find({ businessId }).sort({ recordedDate: -1 }).limit(30);

    const aiClient = getAIClient();
    if (!aiClient) return res.status(400).json({ error: 'AI Client not configured' });

    const prompt = `
      Predict sales for this business based on engagement data:
      Business: ${business?.name} (${business?.type})
      Data (last 30 days): ${JSON.stringify(data)}

      Provide prediction in JSON:
      - nextMonthEstimate: Number (in INR)
      - growthPercentage: Number
      - confidenceScore: Number (0-100)
      - topDriver: String
      - reasoning: String
    `;

    const completion = await aiClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: getAIModel(),
      response_format: { type: 'json_object' },
    });

    res.json(JSON.parse(completion.choices[0].message.content || '{}'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analytics/recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { businessId } = req.body;
    const business = await Business.findById(businessId);
    const data = await Analytics.find({ businessId }).sort({ recordedDate: -1 }).limit(14);

    const aiClient = getAIClient();
    if (!aiClient) return res.status(400).json({ error: 'AI Client not configured' });

    const prompt = `
      Provide 4 high-priority growth recommendations for this business:
      Business: ${business?.name} (${business?.type})
      Target: ${business?.targetAudience}
      Recent Analytics: ${JSON.stringify(data)}

      Provide in JSON format:
      - recommendations: Array of { title, desc, priority: "High" | "Medium" | "Low" }
    `;

    const completion = await aiClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: getAIModel(),
      response_format: { type: 'json_object' },
    });

    res.json(JSON.parse(completion.choices[0].message.content || '{}'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/business/:businessId
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const analytics = await Analytics.find({ businessId }).sort({ recordedDate: 1 });
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
  }
});

// POST /api/analytics/bulk
router.post('/bulk', async (req, res) => {
  try {
    const { records } = req.body;
    const inserted = await Analytics.insertMany(records);
    res.status(201).json(inserted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to bulk insert analytics' });
  }
});

export default router;
