import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Resetting table first...');

    await client.query(`
    TRUNCATE projects, collaborations
    RESTART IDENTITY CASCADE
    `);

    console.log('Table has been reset!');

    console.log('Seeding started...');

    // projects john
    await client.query(`
    insert into projects(name, user_id, user_name, user_email, created_at, updated_at, last_event_updated_at)
    select
        'Projects John #' || i,
        1,
        'John',
        'john@example.com',
        now() + (i * interval '1 minute'),
        now() + (i * interval '1 minute'),
        now() + (i * interval '1 minute')
    from generate_series(1,100) as s(i)
    `);

    console.log("John's projects seeded!");

    // soft deleted projects john
    await client.query(`
    insert into projects(name, user_id, user_name, user_email, created_at, deleted_at, updated_at, last_event_updated_at)
    select
        'Projects John #' || i,
        1,
        'John',
        'john@example.com',
        now() + (i * interval '1 minute'),
        now() + (i * interval '10 minute'),
        now() + (i * interval '10 minute'),
        now() + (i * interval '10 minute')
    from generate_series(101,200) as s(i)
    `);

    console.log("John's soft deleted projects seeded!");

    // projects
    await client.query(`
    with generated as (
      select
        '#' || i as name,
        case
          when random() > 0.5 then 2
          else 3
        end as user_id,
        now() + (i * interval '1 minute') as created_at,
        now() + (i * interval '1 minute') as updated_at,
        now() + (i * interval '1 minute') as last_event_updated_at
      from generate_series(201,400) as s(i)
    )
    insert into projects(name, user_id, user_name, user_email, created_at, updated_at, last_event_updated_at)
    select
        case
          when g.user_id = 2 then 'Projects Alice ' || g.name
          else 'Projects Bob ' || g.name
        end,
        g.user_id,
        case
          when g.user_id = 2 then 'Alice'
          else 'Bob'
        end,
        case
          when g.user_id = 2 then 'alice@example.com'
          else 'bob@example.com'
        end,
        g.created_at,
        g.updated_at,
        g.last_event_updated_at
    from generated g
    `);

    console.log("Someone's projects seeded!");

    // collaborations
    await client.query(`
    insert into collaborations(project_id, collaborator_id, collaborator_name, collaborator_email, owner_id, owner_name, owner_email)
    values ('1', '2', 'Alice', 'alice@example.com', '1', 'John', 'john@example.com'), ('1', '3', 'Bob', 'bob@example.com', '1', 'John', 'john@example.com')
    `);

    await client.query(`
    with projects as (
      select id, user_id, user_name, user_email
      from projects
      where id >= 201 and id <=400
    )
    insert into collaborations(project_id, collaborator_id, collaborator_name, collaborator_email, owner_id, owner_name, owner_email)
    select
      id,
      1,
      'John',
      'john@example.com',
      user_id,
      user_name,
      user_email
    from projects
    `);

    console.log('Collaborations seeded!');

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
