import express from 'express';
import { Analytics } from '../db';

const router = express.Router();

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
