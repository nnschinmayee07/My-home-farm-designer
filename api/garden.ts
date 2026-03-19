import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initDb();

  if (req.method === 'POST') {
    const { width, length, sunlight } = req.body;
    if (!width || !length || !sunlight) {
      return res.status(400).json({ error: 'width, length, and sunlight are required' });
    }
    const [garden] = await sql`
      INSERT INTO gardens (width, length, sunlight)
      VALUES (${width}, ${length}, ${sunlight})
      RETURNING *
    `;
    return res.status(201).json(garden);
  }

  if (req.method === 'GET') {
    const gardens = await sql`SELECT * FROM gardens ORDER BY created_at DESC`;
    return res.status(200).json(gardens);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
