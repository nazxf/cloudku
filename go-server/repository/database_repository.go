package repository

import (
	"context"
	"time"

	"cloudku-server/database"
	"cloudku-server/dto"
)

// DatabaseRepository handles database CRUD operations (SQL only)
type DatabaseRepository struct{}

// NewDatabaseRepository creates a new repository instance
func NewDatabaseRepository() *DatabaseRepository {
	return &DatabaseRepository{}
}

// GetByUserID returns all databases for a user
func (r *DatabaseRepository) GetByUserID(ctx context.Context, userID int) ([]dto.UserDatabase, error) {
	query := `
		SELECT id, user_id, database_name, database_user, database_type, 
		       charset, "collation", size_mb, created_at
		FROM user_databases
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := database.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var databases []dto.UserDatabase
	for rows.Next() {
		var db dto.UserDatabase
		if err := rows.Scan(&db.ID, &db.UserID, &db.DatabaseName, &db.DatabaseUser,
			&db.DatabaseType, &db.Charset, &db.Collation, &db.SizeMB, &db.CreatedAt); err != nil {
			continue
		}
		databases = append(databases, db)
	}

	return databases, nil
}

// GetByID returns a database by ID with ownership check
func (r *DatabaseRepository) GetByID(ctx context.Context, id, userID int) (*dto.UserDatabase, error) {
	query := `
		SELECT id, user_id, database_name, database_user, database_type, 
		       charset, "collation", size_mb, created_at
		FROM user_databases
		WHERE id = $1 AND user_id = $2
	`

	var db dto.UserDatabase
	err := database.DB.QueryRow(ctx, query, id, userID).Scan(
		&db.ID, &db.UserID, &db.DatabaseName, &db.DatabaseUser,
		&db.DatabaseType, &db.Charset, &db.Collation, &db.SizeMB, &db.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &db, nil
}

// GetDBCredentials returns database name, user, type, AND stored password
func (r *DatabaseRepository) GetDBCredentials(ctx context.Context, id, userID int) (dbName, dbUser, dbType, dbPassword string, err error) {
	query := `SELECT database_name, database_user, database_type, COALESCE(db_password, '') FROM user_databases WHERE id = $1 AND user_id = $2`
	err = database.DB.QueryRow(ctx, query, id, userID).Scan(&dbName, &dbUser, &dbType, &dbPassword)
	return
}

// Create inserts a new database record and returns the created database
func (r *DatabaseRepository) Create(ctx context.Context, userID int, dbName, dbUser, dbPass, dbType, charset, collation string) (*dto.UserDatabase, error) {
	query := `
		INSERT INTO user_databases (user_id, database_name, database_user, db_password, database_type, charset, "collation")
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, database_name, database_user, database_type, charset, "collation", size_mb, created_at
	`

	var db dto.UserDatabase
	err := database.DB.QueryRow(ctx, query, userID, dbName, dbUser, dbPass, dbType, charset, collation).Scan(
		&db.ID, &db.UserID, &db.DatabaseName, &db.DatabaseUser,
		&db.DatabaseType, &db.Charset, &db.Collation, &db.SizeMB, &db.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &db, nil
}

// UpdatePassword updates the stored database password
func (r *DatabaseRepository) UpdatePassword(ctx context.Context, id, userID int, newPassword string) error {
	query := `UPDATE user_databases SET db_password = $1 WHERE id = $2 AND user_id = $3`
	_, err := database.DB.Exec(ctx, query, newPassword, id, userID)
	return err
}

// Delete removes a database record
func (r *DatabaseRepository) Delete(ctx context.Context, id, userID int) error {
	query := `DELETE FROM user_databases WHERE id = $1 AND user_id = $2`
	_, err := database.DB.Exec(ctx, query, id, userID)
	return err
}

// UpdateSize updates the size_mb of a database
func (r *DatabaseRepository) UpdateSize(ctx context.Context, id, userID int, sizeMB float64) error {
	query := `UPDATE user_databases SET size_mb = $1 WHERE id = $2 AND user_id = $3`
	_, err := database.DB.Exec(ctx, query, sizeMB, id, userID)
	return err
}

// Exists checks if a database exists and belongs to user
func (r *DatabaseRepository) Exists(ctx context.Context, id, userID int) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM user_databases WHERE id = $1 AND user_id = $2)`
	var exists bool
	err := database.DB.QueryRow(ctx, query, id, userID).Scan(&exists)
	return exists, err
}

// GetStats returns aggregated stats for a user
func (r *DatabaseRepository) GetStats(ctx context.Context, userID int) (*dto.DatabaseStats, error) {
	stats := &dto.DatabaseStats{}

	// Total count
	database.DB.QueryRow(ctx,
		`SELECT COUNT(*) FROM user_databases WHERE user_id = $1`, userID).Scan(&stats.TotalDatabases)

	// MySQL count
	database.DB.QueryRow(ctx,
		`SELECT COUNT(*) FROM user_databases WHERE user_id = $1 AND database_type = 'mysql'`, userID).Scan(&stats.MySQLCount)

	// PostgreSQL count
	database.DB.QueryRow(ctx,
		`SELECT COUNT(*) FROM user_databases WHERE user_id = $1 AND database_type = 'postgresql'`, userID).Scan(&stats.PostgresCount)

	// Total size
	database.DB.QueryRow(ctx,
		`SELECT COALESCE(SUM(size_mb), 0) FROM user_databases WHERE user_id = $1`, userID).Scan(&stats.TotalSizeMB)

	return stats, nil
}

// GetUserPrefix retrieves user's database prefix (stored in users table)
func (r *DatabaseRepository) GetUserPrefix(ctx context.Context, userID int) (string, error) {
	var prefix string
	err := database.DB.QueryRow(ctx,
		`SELECT COALESCE(db_prefix, '') FROM users WHERE id = $1`, userID).Scan(&prefix)
	return prefix, err
}

// SetUserPrefix stores user's database prefix
func (r *DatabaseRepository) SetUserPrefix(ctx context.Context, userID int, prefix string) error {
	_, err := database.DB.Exec(ctx,
		`UPDATE users SET db_prefix = $1, updated_at = $2 WHERE id = $3`, prefix, time.Now(), userID)
	return err
}
