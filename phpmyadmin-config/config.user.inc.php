<?php

/**
 * CloudKu phpMyAdmin Security Configuration
 * 
 * This file adds additional security restrictions to phpMyAdmin
 * to ensure users can only access their own databases.
 * 
 * CRITICAL SECURITY SETTINGS:
 * - Root login is COMPLETELY DISABLED
 * - System databases are hidden from non-root users
 * - No password login is disabled
 * - Session timeout is enforced
 * - SIGNON authentication enabled for auto-login
 */

// ============================================
// SECURITY: Session Configuration
// ============================================
// Auto-logout after 30 minutes of inactivity
$cfg['LoginCookieValidity'] = 1800; // 30 minutes in seconds

// Regenerate session ID on login (prevent session fixation)
$cfg['LoginCookieRecall'] = false;

// Use more secure session cookie settings
$cfg['CookieSameSite'] = 'Lax'; // Changed from Strict to Lax for signon redirect

// ============================================
// SECURITY: Disable Arbitrary Server Connection
// ============================================
// Users can only connect to the predefined server
$cfg['AllowArbitraryServer'] = false;

// ============================================
// SIGNON AUTHENTICATION: Enable Auto-Login
// ============================================
// This enables the signon authentication method used by shared hosting providers
// Configure first server for signon authentication
$i = 1;

// Authentication type - signon uses external session
$cfg['Servers'][$i]['auth_type'] = 'signon';

// Session name that the signon script uses
$cfg['Servers'][$i]['SignonSession'] = 'SignonSession';

// URL to the signon script (used when session expires)
$cfg['Servers'][$i]['SignonURL'] = 'signon.php';

// URL to redirect after logout
$cfg['Servers'][$i]['LogoutURL'] = '/';

// Host configuration
$cfg['Servers'][$i]['host'] = 'cloudku-mysql';
$cfg['Servers'][$i]['port'] = '3306';

// ============================================
// SECURITY: Apply Validations to ALL Servers
// ============================================
// We iterate through all configured servers to ensure security settings applied globally
if (isset($cfg['Servers']) && is_array($cfg['Servers'])) {
    foreach ($cfg['Servers'] as $i => $server) {
        // Disable Root Login
        $cfg['Servers'][$i]['AllowRoot'] = false;

        // Disable No Password Login
        $cfg['Servers'][$i]['AllowNoPassword'] = false;

        // Hide System Databases
        $cfg['Servers'][$i]['hide_db'] = '^(information_schema|performance_schema|mysql|sys)$';
    }
}

// ============================================
// UI/UX: Improve User Experience
// ============================================
// Show server uptime and version in interface
$cfg['ShowServerInfo'] = true;
$cfg['ShowPhpInfo'] = false; // Hide PHP info for security

// Default language
$cfg['DefaultLang'] = 'en';

// Theme
$cfg['ThemeDefault'] = 'pmahomme';

// ============================================
// QUERY LIMITS: Prevent Resource Abuse
// ============================================
// Maximum rows to return in browse mode
$cfg['MaxRows'] = 100;

// Maximum execution time for queries (seconds)
$cfg['ExecTimeLimit'] = 300; // 5 minutes

// Maximum file upload size (let Docker limit handle it, but good to set here too)
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';

// ============================================
// NAVIGATION: Database Tree Settings
// ============================================
// Show database size in navigation tree
$cfg['ShowDatabasesNavigationAsTree'] = false; // Simpler for users with 1 DB

// ============================================
// LOGGING: Disable (for privacy)
// ============================================
// Don't log user SQL queries
$cfg['QueryHistoryMax'] = 0;

// ============================================
// EXPORT/IMPORT: Safe Defaults
// ============================================
// Compression for exports
$cfg['ZipDump'] = true;
$cfg['GZipDump'] = true;

// ============================================
// End of CloudKu Configuration
// ============================================
