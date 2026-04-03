import {
  pgTable,
  serial,
  varchar,
  timestamp,
  foreignKey,
  integer,
  check,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const issues = pgTable(
  'issues',
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 100 }).notNull(),
    description: text().notNull(),
    status: varchar({ length: 20 }).default('open').notNull(),
    priority: varchar({ length: 20 }).default('medium').notNull(),
    projectId: integer('project_id').notNull(),
    isProjectDeleted: boolean('is_project_deleted').default(false).notNull(),
    userId: integer('user_id').notNull(),
    userName: varchar('user_name', { length: 30 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
    lastProjectEventUpdatedAt: timestamp('last_project_event_updated_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    lastUserEventUpdatedAt: timestamp('last_user_event_updated_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  () => [
    check(
      'issues_status_check',
      sql`(status)::text = ANY ((ARRAY['open'::character varying, 'in progress'::character varying, 'closed'::character varying])::text[])`,
    ),
    check(
      'issues_priority_check',
      sql`(priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[])`,
    ),
  ],
);

export const issueHistories = pgTable(
  'issue_histories',
  {
    id: serial().primaryKey().notNull(),
    issueId: integer('issue_id').notNull(),
    userId: integer('user_id').notNull(),
    userName: varchar('user_name', { length: 30 }).notNull(),
    type: varchar({ length: 50 }).notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
    lastEventUpdatedAt: timestamp('last_event_updated_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.issueId],
      foreignColumns: [issues.id],
      name: 'issue_histories_issue_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const comments = pgTable(
  'comments',
  {
    id: serial().primaryKey().notNull(),
    content: text().notNull(),
    issueId: integer('issue_id').notNull(),
    userId: integer('user_id').notNull(),
    userName: varchar('user_name', { length: 30 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
    lastEventUpdatedAt: timestamp('last_event_updated_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.issueId],
      foreignColumns: [issues.id],
      name: 'comments_issue_id_fkey',
    }).onDelete('cascade'),
  ],
);
