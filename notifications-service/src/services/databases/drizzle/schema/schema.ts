import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const notifications = pgTable('notifications', {
  id: serial().primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  userName: varchar('user_name', { length: 30 }).notNull(),
  actorId: integer('actor_id').notNull(),
  actorName: varchar('actor_name', { length: 30 }).notNull(),
  type: varchar({ length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id').notNull(),
  entityName: varchar('entity_name', { length: 100 }).notNull(),
  message: text().notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  lastEventUpdatedAt: timestamp('last_event_updated_at', {
    mode: 'string',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
