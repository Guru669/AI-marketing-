import express from 'express';
import { Campaign } from '../db';

const router = express.Router();

// GET /api/campaigns/business/:businessId
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const campaigns = await Campaign.find({ businessId }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch campaigns' });
  }
});

// POST /api/campaigns
router.post('/', async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create campaign' });
  }
});

// PUT /api/campaigns/:id
router.put('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(campaign);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update campaign' });
  }
});

// DELETE /api/campaigns/:id
router.delete('/:id', async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete campaign' });
  }
});

export default router;
