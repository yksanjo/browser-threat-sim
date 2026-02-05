import type { NextApiRequest, NextApiResponse } from 'next';

// Stats store
const userStats: Record<string, any> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      const { userId } = req.query;
      if (userId) {
        return res.status(200).json(userStats[userId as string] || null);
      }
      // Return aggregate stats
      const allStats = Object.values(userStats);
      return res.status(200).json({
        totalUsers: allStats.length,
        overallDetectionRate: allStats.reduce((acc, s) => acc + (s.simulationsDetected / s.simulationsSeen), 0) / allStats.length * 100,
        averageRiskScore: allStats.reduce((acc, s) => acc + s.riskScore, 0) / allStats.length
      });
    
    case 'POST':
      const stats = req.body;
      userStats[stats.userId] = stats;
      return res.status(200).json({ success: true });
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
