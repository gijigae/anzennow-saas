import { sql } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

export async function up(db: any) {
  await db.schema.alterTable('team_members').alterColumn('user_id', (col: any) =>
    col.setDataType(varchar('user_id', { length: 256 })).notNull(),
  );

  await db.schema.alterTable('activity_logs').alterColumn('user_id', (col: any) =>
    col.setDataType(varchar('user_id', { length: 256 })).notNull(),
  );

  await db.schema.alterTable('invitations').alterColumn('invited_by', (col: any) =>
    col.setDataType(varchar('invited_by', { length: 256 })).notNull(),
  );
}

export async function down(db: any) {
  await db.schema.alterTable('team_members').alterColumn('user_id', (col: any) =>
    col.setDataType(sql`integer`).notNull(),
  );

  await db.schema.alterTable('activity_logs').alterColumn('user_id', (col: any) =>
    col.setDataType(sql`integer`).notNull(),
  );

  await db.schema.alterTable('invitations').alterColumn('invited_by', (col: any) =>
    col.setDataType(sql`integer`).notNull(),
  );
} 