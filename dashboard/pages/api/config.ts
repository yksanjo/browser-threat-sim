import type { NextApiRequest, NextApiResponse } from 'next';

// Config store
let config = {
  campaignId: 'default-campaign',
  active: true,
  difficulty: 'medium',
  frequency: 'weekly'
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(config);
    
    case 'POST':
    case 'PUT':
      config = { ...config, ...req.body };
      return res.status(200).json(config);
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
