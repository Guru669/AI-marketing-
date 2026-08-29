import express from 'express';
import { Competitor } from '../db';

const router = express.Router();

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
