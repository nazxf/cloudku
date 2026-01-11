package database

import (
	"context"
	"log"
	"time"
)

// InitSchema initializes the database schema
func InitSchema() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	log.Println("🔄 Initializing database schema...")

	// Users table
	_, err := DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			name VARCHAR(255) NOT NULL,
			password_hash VARCHAR(255),
			profile_picture TEXT,
			auth_provider VARCHAR(50) NOT NULL,
			google_id VARCHAR(255),
			facebook_id VARCHAR(255),
			github_id VARCHAR(255),
			email_verified BOOLEAN DEFAULT FALSE,
			is_active BOOLEAN DEFAULT TRUE,
			last_login TIMESTAMP WITH TIME ZONE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return err
	}

	// Domains table
	_, err = DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS domains (
			id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			domain_name VARCHAR(255) UNIQUE NOT NULL,
			document_root VARCHAR(255) NOT NULL,
			status VARCHAR(50) DEFAULT 'pending',
			ssl_enabled BOOLEAN DEFAULT FALSE,
			ssl_provider VARCHAR(50),
			ssl_expires_at TIMESTAMP WITH TIME ZONE,
			auto_renew_ssl BOOLEAN DEFAULT TRUE,
			verified_at TIMESTAMP WITH TIME ZONE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return err
	}

	// DNS Records table
	_, err = DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS dns_records (
			id SERIAL PRIMARY KEY,
			domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
			record_type VARCHAR(10) NOT NULL,
			name VARCHAR(255) NOT NULL,
			value TEXT NOT NULL,
			ttl INTEGER DEFAULT 3600,
			priority INTEGER,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return err
	}

	// User Databases table
	_, err = DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS user_databases (
			id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			database_name VARCHAR(255) NOT NULL,
			database_user VARCHAR(255) NOT NULL,
			database_type VARCHAR(50) NOT NULL,
			charset VARCHAR(50) DEFAULT 'utf8mb4',
			"collation" VARCHAR(50) DEFAULT 'utf8mb4_unicode_ci',
			size_mb DOUBLE PRECISION DEFAULT 0.0,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return err
	}

	log.Println("✅ Database schema initialized successfully")
	return nil
}
