import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql, initDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initDb();
  const { action } = req.query;

  if (req.method === 'POST' && action === 'signup') {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const [user] = await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${hash}) RETURNING id, email`;
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id: user.id, email: user.email } });
  }

  if (req.method === 'POST' && action === 'login') {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ token, user: { id: user.id, email: user.email } });
  }

  return res.status(404).json({ error: 'Not found' });
}
