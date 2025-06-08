
-- Database Initialization Script
-- This script is run when the PostgreSQL container starts for the first time

-- Create additional databases if needed
-- (The main database is created by the POSTGRES_DB environment variable)

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create additional users if needed
-- (The main user is created by the POSTGRES_USER environment variable)

-- Set up database configuration
ALTER DATABASE course_shop_platform_dev SET timezone TO 'UTC';

-- Create indexes for better performance (will be created by Prisma migrations)
-- This is just a placeholder for any additional setup needed

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed at %', NOW();
END $$;
