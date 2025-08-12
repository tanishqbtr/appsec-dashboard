# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Security Improvements

### 🔒 Security Enhancements

#### Password Security Overhaul
- **BREAKING**: Migrated from plaintext password storage to secure Argon2id hashing
- Added server-side password pepper for additional security layer
- Implemented automatic password migration on login for existing users
- Added password rehashing when stronger parameters are available
- Password parameters: Argon2id with configurable time/memory costs

#### Authentication Improvements
- Added rate limiting to authentication endpoints (5 attempts per 15 minutes)
- Added general API rate limiting (100 requests per 15 minutes)
- Implemented uniform error messages to prevent username enumeration
- Added password change endpoint with current password verification
- Enhanced session security with environment-based configuration

#### Database Schema Updates
- Added `password_hash` column for storing Argon2id hashes
- Added `password_algo` column to track hashing algorithm used
- Added `password_updated_at` timestamp for audit purposes
- Added database index on username for improved lookup performance
- Maintained backward compatibility during migration phase

### 🚀 New Features
- Password migration script for safe transition from plaintext to hashed passwords
- Environment configuration for password security parameters
- Password strength validation (minimum 8 characters)
- Automatic password rehashing with stronger parameters

### 🛠️ Technical Changes
- Added `argon2` dependency for secure password hashing
- Added `express-rate-limit` for API protection
- Enhanced error handling and logging for security events
- Added comprehensive migration script with verification
- Updated environment configuration with security-focused defaults

### 📚 Documentation
- Added `.env.example` with all required environment variables
- Documented password migration process
- Added security configuration guidelines

### 🔧 Configuration
New environment variables:
- `PASSWORD_PEPPER`: Server-side pepper for additional password security
- `ARGON2_TIME_COST`: Time parameter for Argon2 (default: 3)
- `ARGON2_MEMORY_COST`: Memory parameter for Argon2 (default: 65536)
- `ARGON2_PARALLELISM`: Parallelism parameter for Argon2 (default: 1)
- `SESSION_SECRET`: Secure session secret key

### 🚨 Breaking Changes
- Database schema changes require migration
- Plaintext passwords will be automatically migrated to hashes on first login
- Enhanced rate limiting may affect high-frequency API usage

### 📋 Migration Notes
1. Run the migration script to add new database columns
2. Existing users will be automatically migrated on their next login
3. Monitor logs for successful password migrations
4. Consider removing plaintext password column after successful migration

---

## Previous Versions

### [1.0.0] - Initial Release
- Basic authentication system with plaintext passwords
- User management functionality
- Session-based authentication
- Role-based access control (Admin/User)