import express from 'express';
import { ConnectedAccount } from '../db';

const router = express.Router();

router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const accounts = await ConnectedAccount.find({ businessId }).select('-accessToken -refreshToken');
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper endpoint to disconnect an account
router.delete('/:businessId/:platform', async (req, res) => {
  try {
    const { businessId, platform } = req.params;
    await ConnectedAccount.findOneAndDelete({ businessId, platform });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
