-- Initialize AppSec Dashboard Database
-- This file is automatically executed when PostgreSQL starts for the first time

-- Create the database (optional, since it's already created by environment variable)
-- CREATE DATABASE appsec_dashboard;

-- You can add any initial database setup here
-- For example, creating extensions, initial users, etc.

-- Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a default admin user (this will be handled by the application)
-- The actual table creation is handled by Drizzle migrations