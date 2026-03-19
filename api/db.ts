import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Run once to initialize schema
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS gardens (
      id SERIAL PRIMARY KEY,
      width NUMERIC NOT NULL,
      length NUMERIC NOT NULL,
      sunlight VARCHAR(20) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS plants (
      id SERIAL PRIMARY KEY,
      garden_id INTEGER REFERENCES gardens(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      planted_date DATE NOT NULL,
      next_watering DATE,
      harvest_date DATE,
      watered BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
