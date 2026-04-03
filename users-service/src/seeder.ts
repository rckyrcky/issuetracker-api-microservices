import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function seed() {
  const password = await bcrypt.hash('halo12345', 12);
  const users = [
    { name: 'John', email: 'john@example.com', password },
    { name: 'Alice', email: 'alice@example.com', password },
    { name: 'Bob', email: 'bob@example.com', password },
    { name: 'Charlie', email: 'charlie@example.com', password },
  ];
  const usersValues = users
    .map((u) => `('${u.name}', '${u.email}', '${u.password}')`)
    .join(', ');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Resetting table first...');

    await client.query(`
    TRUNCATE users
    RESTART IDENTITY CASCADE
    `);

    console.log('Table has been reset!');

    console.log('Seeding started...');

    // users
    await client.query(`
    insert into users(name, email, password)
    values ${usersValues}`);

    console.log('Users seeded!');

    await client.query('COMMIT');

    console.log('Seeding complete!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed: ', error);
    console.log("Don't worry, all seeding has been cancelled!");
  } finally {
    client.release();
    await pool.end();
    console.log('Database connection has been released!');
  }
}

seed().catch(console.error);
