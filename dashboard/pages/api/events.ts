import type { NextApiRequest, NextApiResponse } from 'next';

// Event store (in production, use a database)
const events: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      // Return recent events
      const limit = parseInt(req.query.limit as string) || 100;
      return res.status(200).json(events.slice(-limit));
    
    case 'POST':
      const event = {
        ...req.body,
        receivedAt: Date.now()
      };
      events.push(event);
      
      // Keep only last 10000 events
      if (events.length > 10000) {
        events.shift();
      }
      
      return res.status(201).json({ success: true, id: event.id });
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
