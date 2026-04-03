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
    TRUNCATE issues, comments, issue_histories
    RESTART IDENTITY CASCADE
    `);

    console.log('Table has been reset!');

    console.log('Seeding started...');

    // issues
    await client.query(`
    insert into issues(title, description, status, priority, project_id, is_project_deleted, user_id, user_name, created_at, last_project_event_updated_at, last_user_event_updated_at)
    select
        'Issues by John #' || i,
        'Description for issues #' || i,
        case
            when random() > 0.7 then 'open'
            when random() > 0.2 then 'in progress'
            else 'closed'
        end,
        case
            when random() > 0.7 then 'low'
            when random() > 0.2 then 'medium'
            else 'high'
        end,
        1,
        false,
        1,
        'John',
        now() + (i * interval '1 minute'),
        now() + (i * interval '1 minute'),
        now() + (i * interval '1 minute')
    from generate_series(1,200) as s(i)
    `);

    console.log('Issues seeded!');

    // comments
    await client.query(`
    with generated as (
        select
        '#' || i || ' This is user comment and is very detailed, informative, and constructive so that the issue will be solved quickly' as content,
        1 as issue_id,
        case
            when random() > 0.7 then 2
            else 3
        end as user_id,
        now() + (i * interval '1 minute') as created_at,
        now() + (i * interval '1 minute') as last_event_updated_at
    from generate_series(1,200) as s(i)
    )
    insert into comments(content, issue_id, user_id, user_name, created_at, last_event_updated_at)
    select
        content,
        issue_id,
        user_id,
        case
            when user_id = 2 then 'Alice'
            else 'Bob'
        end as user_name,
        created_at,
        last_event_updated_at
    from generated
        `);

    console.log('Comments seeded!');

    // issue histories
    await client.query(`
    with generated as (
    select
      1 as issue_id,
      case
        when random() > 0.5 then 1
        when random() > 0.25 then 2
        else 3
      end as user_id,
      case
        when random() > 0.8 then 'add_comment'
        when random() > 0.5 then 'edit_title'
        when random() > 0.4 then 'edit_description'
        when random() > 0.3 then 'edit_status'
        else 'edit_priority'
      end as type,
      now() + (i * interval '2 minutes') as created_at,
      now() + (i * interval '2 minutes') as last_event_updated_at
    from generate_series(1, 100) as s(i)
  )
  insert into issue_histories (issue_id, user_id, user_name, type, old_value, new_value, created_at, last_event_updated_at)
  select
    issue_id,
    user_id,
    case
        when user_id = 2 then 'Alice'
        else 'Bob'
    end as user_name,
    type,
    case
      when type = 'edit_title' then 'old title'
      when type = 'edit_description' then 'old desc'
      when type = 'edit_status' then 'open'
      when type = 'edit_priority' then 'low'
      else null
    end,
    case
      when type = 'edit_title' then 'new title'
      when type = 'edit_description' then 'new description'
      when type = 'edit_status' then 'closed'
      when type = 'edit_priority' then 'high'
      else null
    end,
    created_at,
    last_event_updated_at
  from generated;
`);

    console.log('Issue histories seeded!');

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
