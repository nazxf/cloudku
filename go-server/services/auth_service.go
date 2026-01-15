package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"cloudku-server/dto"
	"cloudku-server/models"
	"cloudku-server/utils"
)

// AuthService handles core authentication business logic
type AuthService struct{}

// NewAuthService creates a new AuthService instance
func NewAuthService() *AuthService {
	return &AuthService{}
}

// Register handles user registration with email/password
func (s *AuthService) Register(ctx context.Context, req dto.RegisterRequest) *dto.AuthResult {
	// Check if email already exists
	existingUser, err := models.FindUserByEmail(ctx, req.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("ERROR: AuthService.Register - Database error checking email: %v", err)
		return &dto.AuthResult{Error: fmt.Errorf("database error")}
	}

	if existingUser != nil {
		return &dto.AuthResult{Error: dto.ErrEmailExists}
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		log.Printf("ERROR: AuthService.Register - Failed to hash password: %v", err)
		return &dto.AuthResult{Error: fmt.Errorf("failed to process password")}
	}

	// Create user
	user := &models.User{
		Email:        req.Email,
		Name:         req.Name,
		PasswordHash: sql.NullString{String: hashedPassword, Valid: true},
		AuthProvider: models.AuthProviderEmail,
		IsActive:     true,
	}

	if err := models.CreateUser(ctx, user); err != nil {
		log.Printf("ERROR: AuthService.Register - Failed to create user: %v", err)
		return &dto.AuthResult{Error: fmt.Errorf("failed to create user")}
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		log.Printf("ERROR: AuthService.Register - Failed to generate token: %v", err)
		return &dto.AuthResult{
			User:  user,
			Error: fmt.Errorf("registration successful but failed to generate token"),
		}
	}

	return &dto.AuthResult{
		User:  user,
		Token: token,
	}
}

// Login handles email/password authentication
func (s *AuthService) Login(ctx context.Context, req dto.LoginRequest) *dto.AuthResult {
	// Find user by email
	user, err := models.FindUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &dto.AuthResult{Error: dto.ErrInvalidCredentials}
		}
		log.Printf("ERROR: AuthService.Login - Database error: %v", err)
		return &dto.AuthResult{Error: fmt.Errorf("database error")}
	}

	// Check if user uses email auth
	if user.AuthProvider != models.AuthProviderEmail {
		return &dto.AuthResult{
			Error: &dto.AuthError{
				Code:    "WRONG_AUTH_PROVIDER",
				Message: fmt.Sprintf("This account uses %s login. Please use the correct login method.", user.AuthProvider),
			},
		}
	}

	// Verify password
	if !user.PasswordHash.Valid || !utils.CheckPassword(req.Password, user.PasswordHash.String) {
		return &dto.AuthResult{Error: dto.ErrInvalidCredentials}
	}

	// Check if user is active
	if !user.IsActive {
		return &dto.AuthResult{Error: dto.ErrAccountDeactivated}
	}

	// Update last login
	if err := models.UpdateLastLogin(ctx, user.ID); err != nil {
		log.Printf("WARN: AuthService.Login - Failed to update last login for user %d: %v", user.ID, err)
		// Don't fail login if this fails
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		log.Printf("ERROR: AuthService.Login - Failed to generate token: %v", err)
		return &dto.AuthResult{Error: fmt.Errorf("failed to generate token")}
	}

	return &dto.AuthResult{
		User:  user,
		Token: token,
	}
}

// GetUserByID retrieves a user by their ID
func (s *AuthService) GetUserByID(ctx context.Context, userID int) (*models.User, error) {
	user, err := models.FindUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, dto.ErrUserNotFound
		}
		log.Printf("ERROR: AuthService.GetUserByID - Database error: %v", err)
		return nil, fmt.Errorf("database error")
	}
	return user, nil
}

// DeleteUser deletes a user account
func (s *AuthService) DeleteUser(ctx context.Context, userID int) error {
	if err := models.DeleteUser(ctx, userID); err != nil {
		log.Printf("ERROR: AuthService.DeleteUser - Failed to delete user %d: %v", userID, err)
		return fmt.Errorf("failed to delete account")
	}
	return nil
}

// CreateContextWithTimeout creates a context with default timeout
func CreateContextWithTimeout(timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), timeout)
}
