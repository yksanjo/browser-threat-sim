import type { NextApiRequest, NextApiResponse } from 'next';

// Mock campaigns data store
let campaigns = [
  {
    id: '1',
    name: 'Q1 Security Awareness',
    description: 'Baseline phishing simulation for all employees',
    targetPlatforms: ['github', 'linkedin', 'gmail'],
    schedule: { startDate: Date.now(), frequency: 'weekly' },
    metrics: { participants: 156, emailsSent: 468, linksClicked: 89, credentialsEntered: 23, detectionRate: 68.5, averageTimeToDetection: 12400 },
    active: true,
    createdAt: Date.now() - 86400000 * 7
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple API key check
  const apiKey = req.headers['x-api-key'];
  if (!apiKey && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return res.status(200).json(campaigns);
    
    case 'POST':
      const newCampaign = {
        id: String(Date.now()),
        ...req.body,
        createdAt: Date.now()
      };
      campaigns.push(newCampaign);
      return res.status(201).json(newCampaign);
    
    case 'PUT':
      const { id, ...updates } = req.body;
      campaigns = campaigns.map(c => c.id === id ? { ...c, ...updates } : c);
      return res.status(200).json({ success: true });
    
    case 'DELETE':
      const { campaignId } = req.query;
      campaigns = campaigns.filter(c => c.id !== campaignId);
      return res.status(200).json({ success: true });
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
