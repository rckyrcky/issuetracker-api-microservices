import {
  pgTable,
  unique,
  serial,
  varchar,
  timestamp,
  integer,
  foreignKey,
} from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  userId: integer('user_id').notNull(),
  userName: varchar('user_name', { length: 30 }).notNull(),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string', withTimezone: true }),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  lastEventUpdatedAt: timestamp('last_event_updated_at', {
    mode: 'string',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const collaborations = pgTable(
  'collaborations',
  {
    id: serial().primaryKey().notNull(),
    projectId: integer('project_id').notNull(),
    collaboratorId: integer('collaborator_id').notNull(),
    collaboratorName: varchar('collaborator_name', { length: 30 }).notNull(),
    collaboratorEmail: varchar('collaborator_email', { length: 255 }).notNull(),
    ownerId: integer('owner_id').notNull(),
    ownerName: varchar('owner_name', { length: 30 }).notNull(),
    ownerEmail: varchar('owner_email', { length: 255 }).notNull(),
    status: varchar({ length: 20 }).default('member').notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
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
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: 'collaborations_project_id_fkey',
    }).onDelete('cascade'),
    unique('collaborations_uniq_project_id_collaborator_id').on(
      table.projectId,
      table.collaboratorId,
    ),
  ],
);
