#!/usr/bin/env tsx
/**
 * Migration script to add password hashing fields to the users table
 * and migrate existing plaintext passwords to secure Argon2id hashes.
 * 
 * This script performs a safe two-step migration:
 * 1. Add new password hashing columns to the database
 * 2. Migrate existing plaintext passwords to hashed versions
 */

import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../server/auth/passwords';

async function runMigration() {
  console.log('🚀 Starting password migration...');
  
  try {
    // Step 1: Add new columns to the users table (if not already present)
    console.log('📊 Adding new password hashing columns...');
    
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash TEXT,
      ADD COLUMN IF NOT EXISTS password_algo TEXT DEFAULT 'argon2id',
      ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMPTZ;
    `);
    
    // Add index on username for faster lookups
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
    
    console.log('✅ Database schema updated successfully');
    
    // Step 2: Migrate existing plaintext passwords
    console.log('🔄 Migrating existing plaintext passwords...');
    
    const allUsers = await db.select().from(users);
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const user of allUsers) {
      // Skip users who already have hashed passwords
      if (user.passwordHash) {
        console.log(`⏭️  Skipping user ${user.username} - already has hashed password`);
        skippedCount++;
        continue;
      }
      
      if (!user.password) {
        console.log(`⚠️  Skipping user ${user.username} - no password found`);
        skippedCount++;
        continue;
      }
      
      try {
        console.log(`🔐 Hashing password for user: ${user.username}`);
        const hashedPassword = await hashPassword(user.password);
        
        await db
          .update(users)
          .set({
            passwordHash: hashedPassword,
            passwordAlgo: 'argon2id',
            passwordUpdatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
        
        console.log(`✅ Successfully migrated password for user: ${user.username}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to migrate password for user ${user.username}:`, error);
        throw error; // Stop migration on any error
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`  • Users migrated: ${migratedCount}`);
    console.log(`  • Users skipped: ${skippedCount}`);
    console.log(`  • Total users: ${allUsers.length}`);
    
    // Step 3: Verify migration
    console.log('\n🔍 Verifying migration...');
    const usersWithHashes = await db.select().from(users);
    const hashedCount = usersWithHashes.filter(u => u.passwordHash).length;
    const plaintextCount = usersWithHashes.filter(u => u.password && !u.passwordHash).length;
    
    console.log(`  • Users with hashed passwords: ${hashedCount}`);
    console.log(`  • Users with plaintext passwords: ${plaintextCount}`);
    
    if (plaintextCount === 0) {
      console.log('🎉 All passwords successfully migrated to secure hashes!');
    } else {
      console.log('⚠️  Some users still have plaintext passwords. Review migration logs.');
    }
    
    console.log('\n✨ Password migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test login functionality with existing users');
    console.log('   2. Monitor application logs for any migration issues');
    console.log('   3. After successful testing, consider removing plaintext password column');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runMigration };