import type { NextApiRequest, NextApiResponse } from 'next';

// Red team scenarios store
const scenarios: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return res.status(200).json(scenarios);
    
    case 'POST':
      const { type } = req.query;
      
      if (type === 'simulate') {
        // Handle simulation trigger
        const { targetUsers, customPayload, difficulty } = req.body;
        console.log('Red team simulation triggered:', { targetUsers, customPayload, difficulty });
        
        // In production, this would trigger simulations via the extension
        return res.status(200).json({ 
          success: true, 
          simulationId: String(Date.now()),
          status: 'triggered'
        });
      }
      
      // Create new scenario
      const scenario = {
        id: String(Date.now()),
        ...req.body,
        createdAt: Date.now(),
        status: 'pending'
      };
      scenarios.push(scenario);
      return res.status(201).json(scenario);
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
