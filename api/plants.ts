import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initDb();

  if (req.method === 'GET') {
    const plants = await sql`SELECT * FROM plants ORDER BY created_at DESC`;
    return res.status(200).json(plants);
  }

  if (req.method === 'POST') {
    const { garden_id, name, planted_date, next_watering, harvest_date } = req.body;
    if (!name || !planted_date) {
      return res.status(400).json({ error: 'name and planted_date are required' });
    }
    const [plant] = await sql`
      INSERT INTO plants (garden_id, name, planted_date, next_watering, harvest_date)
      VALUES (${garden_id ?? null}, ${name}, ${planted_date}, ${next_watering ?? null}, ${harvest_date ?? null})
      RETURNING *
    `;
    return res.status(201).json(plant);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id is required' });
    await sql`DELETE FROM plants WHERE id = ${id}`;
    return res.status(204).end();
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const { watered } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const [plant] = await sql`
      UPDATE plants SET watered = ${watered} WHERE id = ${id} RETURNING *
    `;
    return res.status(200).json(plant);
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PATCH']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
