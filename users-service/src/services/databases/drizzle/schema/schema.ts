import {
  pgTable,
  unique,
  serial,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 30 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique('users_email_key').on(table.email)],
);
