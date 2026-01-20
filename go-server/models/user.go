package models

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"cloudku-server/database"

	"github.com/jackc/pgx/v5"
)

// AuthProvider represents the authentication provider type
type AuthProvider string

const (
	AuthProviderGoogle   AuthProvider = "google"
	AuthProviderFacebook AuthProvider = "facebook"
	AuthProviderGithub   AuthProvider = "github"
	AuthProviderEmail    AuthProvider = "email"
)

// User represents a user in the system
type User struct {
	ID             int            `json:"id"`
	Email          string         `json:"email"`
	Name           string         `json:"name"`
	PasswordHash   sql.NullString `json:"-"`
	ProfilePicture sql.NullString `json:"profile_picture"`
	AuthProvider   AuthProvider   `json:"auth_provider"`
	GoogleID       sql.NullString `json:"-"`
	FacebookID     sql.NullString `json:"-"`
	GithubID       sql.NullString `json:"-"`
	EmailVerified  bool           `json:"email_verified"`
	IsActive       bool           `json:"is_active"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	LastLogin      sql.NullTime   `json:"last_login"`
}

// UserResponse is the safe response structure (without sensitive data)
type UserResponse struct {
	ID             int          `json:"id"`
	Email          string       `json:"email"`
	Name           string       `json:"name"`
	ProfilePicture *string      `json:"profile_picture"`
	AuthProvider   AuthProvider `json:"auth_provider"`
	EmailVerified  bool         `json:"email_verified"`
	IsActive       bool         `json:"is_active"`
	CreatedAt      time.Time    `json:"created_at"`
}

// ToResponse converts User to UserResponse (safe for API response)
func (u *User) ToResponse() UserResponse {
	var profilePic *string
	if u.ProfilePicture.Valid {
		profilePic = &u.ProfilePicture.String
	}

	return UserResponse{
		ID:             u.ID,
		Email:          u.Email,
		Name:           u.Name,
		ProfilePicture: profilePic,
		AuthProvider:   u.AuthProvider,
		EmailVerified:  u.EmailVerified,
		IsActive:       u.IsActive,
		CreatedAt:      u.CreatedAt,
	}
}

// ============================================================================
// QUERY FUNCTIONS WITH PROPER ERROR HANDLING
// ============================================================================

// FindUserByEmail finds a user by email
// Returns sql.ErrNoRows if user not found
func FindUserByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, email, name, password_hash, profile_picture, auth_provider,
		       google_id, facebook_id, github_id, email_verified, is_active,
		       created_at, updated_at, last_login
		FROM users
		WHERE email = $1
	`

	var user User
	err := database.DB.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.Name, &user.PasswordHash,
		&user.ProfilePicture, &user.AuthProvider, &user.GoogleID,
		&user.FacebookID, &user.GithubID, &user.EmailVerified,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt, &user.LastLogin,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}

	return &user, nil
}

// FindUserByID finds a user by ID
// Returns sql.ErrNoRows if user not found
func FindUserByID(ctx context.Context, id int) (*User, error) {
	query := `
		SELECT id, email, name, password_hash, profile_picture, auth_provider,
		       google_id, facebook_id, github_id, email_verified, is_active,
		       created_at, updated_at, last_login
		FROM users
		WHERE id = $1
	`

	var user User
	err := database.DB.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.Name, &user.PasswordHash,
		&user.ProfilePicture, &user.AuthProvider, &user.GoogleID,
		&user.FacebookID, &user.GithubID, &user.EmailVerified,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt, &user.LastLogin,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to find user by ID: %w", err)
	}

	return &user, nil
}

// FindUserByGoogleID finds a user by Google ID
// Returns sql.ErrNoRows if user not found
func FindUserByGoogleID(ctx context.Context, googleID string) (*User, error) {
	query := `
		SELECT id, email, name, password_hash, profile_picture, auth_provider,
		       google_id, facebook_id, github_id, email_verified, is_active,
		       created_at, updated_at, last_login
		FROM users
		WHERE google_id = $1
	`

	var user User
	err := database.DB.QueryRow(ctx, query, googleID).Scan(
		&user.ID, &user.Email, &user.Name, &user.PasswordHash,
		&user.ProfilePicture, &user.AuthProvider, &user.GoogleID,
		&user.FacebookID, &user.GithubID, &user.EmailVerified,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt, &user.LastLogin,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to find user by Google ID: %w", err)
	}

	return &user, nil
}

// FindUserByGithubID finds a user by GitHub ID
// Returns sql.ErrNoRows if user not found
func FindUserByGithubID(ctx context.Context, githubID string) (*User, error) {
	query := `
		SELECT id, email, name, password_hash, profile_picture, auth_provider,
		       google_id, facebook_id, github_id, email_verified, is_active,
		       created_at, updated_at, last_login
		FROM users
		WHERE github_id = $1
	`

	var user User
	err := database.DB.QueryRow(ctx, query, githubID).Scan(
		&user.ID, &user.Email, &user.Name, &user.PasswordHash,
		&user.ProfilePicture, &user.AuthProvider, &user.GoogleID,
		&user.FacebookID, &user.GithubID, &user.EmailVerified,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt, &user.LastLogin,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to find user by GitHub ID: %w", err)
	}

	return &user, nil
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

// CreateUser creates a new user
func CreateUser(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (email, name, password_hash, profile_picture, auth_provider,
		                   google_id, github_id, email_verified, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	var passwordHash, profilePic, googleID, githubID interface{}

	if user.PasswordHash.Valid {
		passwordHash = user.PasswordHash.String
	}
	if user.ProfilePicture.Valid {
		profilePic = user.ProfilePicture.String
	}
	if user.GoogleID.Valid {
		googleID = user.GoogleID.String
	}
	if user.GithubID.Valid {
		githubID = user.GithubID.String
	}

	err := database.DB.QueryRow(ctx, query,
		user.Email,
		user.Name,
		passwordHash,
		profilePic,
		user.AuthProvider,
		googleID,
		githubID,
		user.EmailVerified,
		user.IsActive,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// UpdateLastLogin updates the user's last login timestamp
func UpdateLastLogin(ctx context.Context, userID int) error {
	query := `UPDATE users SET last_login = NOW() WHERE id = $1`

	commandTag, err := database.DB.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// UpdateGoogleInfo links Google account and updates auth provider, email, name, and picture
func UpdateGoogleInfo(ctx context.Context, userID int, googleID string, email string, name string, picture string) error {
	query := `
		UPDATE users 
		SET google_id = $2, 
		    email = $3, 
		    name = $4, 
		    auth_provider = 'google', 
		    profile_picture = $5, 
		    updated_at = NOW() 
		WHERE id = $1
	`

	commandTag, err := database.DB.Exec(ctx, query, userID, googleID, email, name, picture)
	if err != nil {
		return fmt.Errorf("failed to update Google info: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// UpdateGithubInfo links GitHub account and updates auth provider and picture
func UpdateGithubInfo(ctx context.Context, userID int, githubID string, picture string) error {
	query := `
		UPDATE users 
		SET github_id = $2, 
		    auth_provider = 'github', 
		    profile_picture = $3, 
		    updated_at = NOW() 
		WHERE id = $1
	`

	commandTag, err := database.DB.Exec(ctx, query, userID, githubID, picture)
	if err != nil {
		return fmt.Errorf("failed to update GitHub info: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// DeleteUser deletes a user by ID
func DeleteUser(ctx context.Context, userID int) error {
	query := `DELETE FROM users WHERE id = $1`

	commandTag, err := database.DB.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// ============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// ============================================================================

// DeactivateUser soft-deletes a user by setting is_active to false
func DeactivateUser(ctx context.Context, userID int) error {
	query := `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`

	commandTag, err := database.DB.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to deactivate user: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// ActivateUser reactivates a deactivated user
func ActivateUser(ctx context.Context, userID int) error {
	query := `UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1`

	commandTag, err := database.DB.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to activate user: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// UpdateEmailVerified updates the email verification status
func UpdateEmailVerified(ctx context.Context, userID int, verified bool) error {
	query := `UPDATE users SET email_verified = $2, updated_at = NOW() WHERE id = $1`

	commandTag, err := database.DB.Exec(ctx, query, userID, verified)
	if err != nil {
		return fmt.Errorf("failed to update email verification: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return sql.ErrNoRows
	}

	return nil
}
