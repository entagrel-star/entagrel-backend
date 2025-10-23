import { Router } from 'express';
import axios from 'axios';

const router = Router();

// POST /api/seo/analyze
router.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  try {
    // Call Flask microservice (assume running at http://localhost:5001/analyze)
    const flaskRes = await axios.post('http://localhost:5001/analyze', { url });
    return res.json(flaskRes.data);
  } catch (err: any) {
    console.error('SEO analyze error:', err?.message, err?.response?.data);
    return res.status(500).json({ error: err.message || 'SEO analysis failed', details: err?.response?.data });
  }
});

export default router;
