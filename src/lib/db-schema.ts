import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const walletAddress = pgTable(
  "wallet_address",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    address: text("address").notNull(),
    chainId: integer("chain_id").notNull(),
    isPrimary: boolean("is_primary").default(false),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [index("walletAddress_userId_idx").on(table.userId)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  walletAddresss: many(walletAddress),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const walletAddressRelations = relations(walletAddress, ({ one }) => ({
  user: one(user, {
    fields: [walletAddress.userId],
    references: [user.id],
  }),
}));

// Mentor profile extension
export const mentorProfile = pgTable("mentor_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  professionalField: text("professional_field").notNull(),
  timezone: text("timezone").notNull().default('UTC'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [index("mentorProfile_userId_idx").on(table.userId)]);

export const bookingSession = pgTable("booking_session", {
  id: text("id").primaryKey(),
  mentorId: text("mentor_id")
    .notNull()
    .references(() => mentorProfile.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'FREE', 'PAID', 'COMMITMENT'
  token: text("token").notNull(), // 'USDC', 'USDT', 'mockUSDC', 'mockUSDT'
  price: text("price"), // stored as string for decimal precision
  duration: integer("duration").notNull(), // in minutes
  timeBreak: integer("time_break").notNull().default(5), // in minutes
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  index("bookingSession_mentorId_idx").on(table.mentorId),
  index("bookingSession_type_idx").on(table.type),
]);

export const booking = pgTable("booking", {
  id: text("id").primaryKey(),
  bookingSessionId: text("booking_session_id")
    .notNull()
    .references(() => bookingSession.id, { onDelete: "cascade" }),
  menteeId: text("mentee_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  mentorId: text("mentor_id")
    .notNull()
    .references(() => mentorProfile.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'confirmed', 'completed', 'cancelled', 'refunded'
  paymentTxHash: text("payment_tx_hash"),
  paymentAmount: text("payment_amount"),
  token: text("token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  index("booking_menteeId_idx").on(table.menteeId),
  index("booking_mentorId_idx").on(table.mentorId),
  index("booking_sessionId_idx").on(table.bookingSessionId),
  index("booking_status_idx").on(table.status),
]);

export const mentorProfileRelations = relations(mentorProfile, ({ one, many }) => ({
  user: one(user, {
    fields: [mentorProfile.userId],
    references: [user.id],
  }),
  bookingSessions: many(bookingSession),
  bookings: many(booking),
}));

export const bookingSessionRelations = relations(bookingSession, ({ one, many }) => ({
  mentor: one(mentorProfile, {
    fields: [bookingSession.mentorId],
    references: [mentorProfile.id],
  }),
  bookings: many(booking),
}));

export const bookingRelations = relations(booking, ({ one }) => ({
  mentee: one(user, {
    fields: [booking.menteeId],
    references: [user.id],
  }),
  mentor: one(mentorProfile, {
    fields: [booking.mentorId],
    references: [mentorProfile.id],
  }),
  session: one(bookingSession, {
    fields: [booking.bookingSessionId],
    references: [bookingSession.id],
  }),
}));;
