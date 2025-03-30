import express from 'express';
import cors from 'cors';
import { fetchDuneQueryResults } from '../api/duneAnalytics';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/dune/query-results', async (req, res) => {
  try {
    const data = await fetchDuneQueryResults();
    res.json(data);
  } catch (error) {
    console.error('Error in Dune API route:', error);
    res.status(500).json({ error: 'Failed to fetch Dune Analytics data' });
  }
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

export default app; 