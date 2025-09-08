#!/usr/bin/env tsx
/**
 * Set or reset the admin user's password in the database.
 *
 * Usage examples:
 *   DATABASE_URL=postgresql://user:pass@host:5432/db \
 *   tsx scripts/set-admin-password.ts admin@hingehealth.com 'password@hh'
 */

import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../server/auth/passwords";

async function main() {
  const username = (process.argv[2] || process.env.ADMIN_USERNAME || "").trim();
  const newPassword = process.argv[3] || process.env.ADMIN_NEW_PASSWORD;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  if (!username) {
    throw new Error("Provide username as argv[2] or ADMIN_USERNAME env var");
  }
  if (!newPassword) {
    throw new Error("Provide new password as argv[3] or ADMIN_NEW_PASSWORD env var");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  const passwordHash = await hashPassword(newPassword);

  // Try update; if no rows updated, insert a new admin user
  const updated = await db
    .update(users)
    .set({
      passwordHash,
      passwordAlgo: "argon2id",
      passwordUpdatedAt: new Date(),
      status: "Active",
      type: "Admin",
      name: "Admin User",
    })
    .where(eq(users.username, username))
    .returning();

  if (updated.length > 0) {
    console.log(`✅ Updated password for ${username}`);
    return;
  }

  const inserted = await db
    .insert(users)
    .values({
      name: "Admin User",
      username,
      passwordHash,
      passwordAlgo: "argon2id",
      status: "Active",
      type: "Admin",
    })
    .returning();

  if (inserted.length > 0) {
    console.log(`✅ Created admin user ${username} with the provided password`);
  } else {
    console.log("❌ Failed to set admin password");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err?.message || err);
  process.exit(1);
});


