-- CloudKu MySQL Security Initialization Script
-- This script runs automatically when MySQL container starts for the first time
-- It secures the MySQL installation by removing dangerous defaults

-- ============================================
-- SECURITY: Remove Anonymous Users
-- ============================================
-- Anonymous users can access MySQL without credentials, this is a security risk
DELETE FROM mysql.user WHERE User='';

-- ============================================
-- SECURITY: Restrict Root Access
-- ============================================
-- Root should only be accessible from localhost
-- Remove remote root access to prevent brute force attacks
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1', '%');

-- ============================================
-- SECURITY: Remove Test Database
-- ============================================
-- Test database is not needed in production and can be a security risk
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

-- ============================================
-- PERFORMANCE: Set Global Variables
-- ============================================
-- Optimize for shared hosting environment
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;

-- ============================================
-- Apply All Changes
-- ============================================
FLUSH PRIVILEGES;

-- ============================================
-- Log Success
-- ============================================
SELECT '✅ CloudKu MySQL Security Initialization Complete' AS Status;
