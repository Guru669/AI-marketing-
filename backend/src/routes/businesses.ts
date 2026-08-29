import express from 'express';
import { Business } from '../db';

const router = express.Router();

// GET /api/businesses/user/:userId
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const businesses = await Business.find({ userId });
    res.json(businesses);
  } catch (error: any) {
    console.error('Fetch businesses error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch businesses' });
  }
});

// GET /api/businesses/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
  } catch (error: any) {
    console.error('Fetch business error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch business' });
  }
});

// POST /api/businesses
router.post('/', async (req, res) => {
  const { userId, name, type, description, targetAudience, platforms, brandVoice, primaryColor } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ error: 'User ID and Business Name are required' });
  }

  try {
    const business = new Business({
      userId,
      name,
      type,
      description,
      targetAudience,
      platforms,
      brandVoice,
      primaryColor
    });
    await business.save();
    res.status(201).json(business);
  } catch (error: any) {
    console.error('Create business error:', error);
    res.status(500).json({ error: error.message || 'Failed to create business' });
  }
});

// PUT /api/businesses/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const business = await Business.findByIdAndUpdate(id, updates, { new: true });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
  } catch (error: any) {
    console.error('Update business error:', error);
    res.status(500).json({ error: error.message || 'Failed to update business' });
  }
});

export default router;
