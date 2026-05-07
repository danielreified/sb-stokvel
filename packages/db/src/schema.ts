import { bigint, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';

/**
 * Stokvels — community savings groups. `monthlyTargetCents` is per-member.
 */
export const stokvels = pgTable('stokvels', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  rules: text('rules').notNull(),
  monthlyTargetCents: integer('monthly_target_cents').notNull(),
  createdAt: text('created_at').notNull(),
});

export const members = pgTable('members', {
  id: uuid('id').primaryKey(),
  stokvelId: uuid('stokvel_id')
    .notNull()
    .references(() => stokvels.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  joinedAt: text('joined_at').notNull(),
});

/**
 * `month` is the YYYY-MM string the contribution covers — kept as text rather
 * than a date so the API contract round-trips byte-identical between client
 * and server with no timezone games.
 */
export const contributions = pgTable('contributions', {
  id: uuid('id').primaryKey(),
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  stokvelId: uuid('stokvel_id')
    .notNull()
    .references(() => stokvels.id, { onDelete: 'cascade' }),
  amountCents: integer('amount_cents').notNull(),
  month: text('month').notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'missed'] }).notNull(),
  createdAt: text('created_at').notNull(),
});

/**
 * Sessions live in Postgres so Lambda invocations share state. `sessionKey`
 * is the per-session AES-256 key (base64) returned to the client at login
 * and re-served on /api/me. Timestamps are epoch-ms bigints so the existing
 * Date.now()-based idle/absolute checks port over unchanged.
 */
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  lastSeenAt: bigint('last_seen_at', { mode: 'number' }).notNull(),
  uaFingerprint: text('ua_fingerprint').notNull(),
  sessionKey: text('session_key').notNull(),
});
