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
    TRUNCATE notifications
    RESTART IDENTITY CASCADE
    `);

    console.log('Table has been reset!');

    console.log('Seeding started...');

    // notifications from alice and bob
    await client.query(`
  with generated as (
    select
      1 as user_id,
      case
        when random() > 0.5 then 2
        else 3
      end as actor_id,
      case
        when random() > 0.5 then 'new_comment'
        else 'add_collaboration'
      end as type,
      case
        when random() > 0.5 then 'issue'
        else 'project'
      end as entity_type,
      case
        when random() > 0.5 then false
        else true
      end as is_read,
      now() + (i * interval '2 minutes') as created_at,
      now() + (i * interval '2 minutes') as last_event_updated_at
    from generate_series(1, 100) as s(i)
  )
  insert into notifications (user_id, user_name, actor_id, actor_name, type, entity_type, entity_id, entity_name, message, is_read, created_at, last_event_updated_at)
  select
    user_id,
    'John',
    actor_id,
    case
      when actor_id = 2 then 'Alice'
      else 'Bob'
    end as actor_name,
    type,
    entity_type,
    case
      when entity_type = 'issue' then floor(1 + random() * 200)::int 
      else floor(201 + random() * 100)::int
    end as entity_id,
    case
      when entity_type = 'issue' then 'buggy issue' 
      else 'brilliant project'
    end as entity_name,
    case
      when entity_type = 'issue' then 'left a comment on your issue' 
      else 'added you as a collaborator on'
    end as message,
    is_read,
    created_at,
    last_event_updated_at
  from generated;
`);

    // notifications from john
    await client.query(`
  with generated as (
    select
      case
        when random() > 0.5 then 2
        else 3
      end as user_id,
      1 as actor_id,
      case
        when random() > 0.5 then 'new_comment'
        else 'add_collaboration'
      end as type,
      case
        when random() > 0.5 then 'issue'
        else 'project'
      end as entity_type,
      case
        when random() > 0.5 then false
        else true
      end as is_read,
      now() + (i * interval '2 minutes') as created_at,
      now() + (i * interval '2 minutes') as last_event_updated_at
    from generate_series(1, 100) as s(i)
  )
  insert into notifications (user_id, user_name, actor_id, actor_name, type, entity_type, entity_id, entity_name, message, is_read, created_at, last_event_updated_at)
  select
    user_id,
    case
      when user_id = 2 then 'Alice'
      else 'Bob'
    end as user_name,
    actor_id,
    'John',
    type,
    entity_type,
    case
      when entity_type = 'issue' then floor(1 + random() * 200)::int 
      else floor(201 + random() * 100)::int
    end as entity_id,
    case
      when entity_type = 'issue' then 'buggy issue' 
      else 'brilliant project'
    end as entity_name,
    case
      when entity_type = 'issue' then 'left a comment on your issue' 
      else 'added you as a collaborator on'
    end as message,
    is_read,
    created_at,
    last_event_updated_at
  from generated;
`);

    console.log('Notifications seeded!');

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
