-- Migration: Add missing columns to user_databases table
-- Date: 2026-01-09
-- Purpose: Fix 500 error on /api/databases endpoint

-- Add missing columns
ALTER TABLE user_databases 
ADD COLUMN IF NOT EXISTS database_user VARCHAR(255),
ADD COLUMN IF NOT EXISTS charset VARCHAR(50) DEFAULT 'utf8mb4',
ADD COLUMN IF NOT EXISTS "collation" VARCHAR(100) DEFAULT 'utf8mb4_unicode_ci';

-- Change size_mb from INTEGER to NUMERIC for decimal support
ALTER TABLE user_databases 
ALTER COLUMN size_mb TYPE NUMERIC(10,2);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_databases_database_user ON user_databases(database_user);

-- Update existing records with default values
UPDATE user_databases 
SET database_user = database_name || '_user'
WHERE database_user IS NULL;

UPDATE user_databases 
SET charset = CASE 
    WHEN database_type = 'mysql' THEN 'utf8mb4'
    WHEN database_type = 'postgresql' THEN 'UTF8'
    ELSE 'utf8mb4'
END
WHERE charset IS NULL;

UPDATE user_databases 
SET "collation" = CASE 
    WHEN database_type = 'mysql' THEN 'utf8mb4_unicode_ci'
    WHEN database_type = 'postgresql' THEN 'en_US.UTF-8'
    ELSE 'utf8mb4_unicode_ci'
END
WHERE "collation" IS NULL;

-- Verify the changes
SELECT column_name, data_type, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_name = 'user_databases'
ORDER BY ordinal_position;
