import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const waitlist = sqliteTable("waitlist", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  joinedAt: integer("joined_at").notNull(),
  consentVersion: text("consent_version").notNull(),
  source: text("source").notNull(),
});
export const signupLimits = sqliteTable("signup_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
