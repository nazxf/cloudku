package dto

import (
	"database/sql"

	"cloudku-server/models"
)

// ============================================================================
// REQUEST DTOs
// ============================================================================

// RegisterRequest represents registration request payload
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required,min=2"`
}

// LoginRequest represents login request payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// GoogleAuthRequest represents Google ID token auth request
type GoogleAuthRequest struct {
	Token string `json:"token" binding:"required"`
}

// GoogleCallbackRequest represents Google authorization code callback
type GoogleCallbackRequest struct {
	Code string `json:"code" binding:"required"`
}

// GithubAuthRequest represents GitHub authorization code request
type GithubAuthRequest struct {
	Code string `json:"code" binding:"required"`
}

// ============================================================================
// RESPONSE/RESULT DTOs
// ============================================================================

// AuthResult represents the result of an authentication operation
type AuthResult struct {
	User  *models.User
	Token string
	Error error
}

// ============================================================================
// OAUTH USER INFO DTOs
// ============================================================================

// GoogleUserInfo represents user info from Google
type GoogleUserInfo struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

// GithubUserInfo represents user info from GitHub
type GithubUserInfo struct {
	ID        int    `json:"id"`
	Login     string `json:"login"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
}

// GithubEmail represents email info from GitHub API
type GithubEmail struct {
	Email    string `json:"email"`
	Primary  bool   `json:"primary"`
	Verified bool   `json:"verified"`
}

// ============================================================================
// GOOGLE TOKEN RESPONSE
// ============================================================================

// GoogleTokenResponse represents Google OAuth token exchange response
type GoogleTokenResponse struct {
	AccessToken string `json:"access_token"`
	IDToken     string `json:"id_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

// ============================================================================
// ERROR TYPES
// ============================================================================

// AuthError represents authentication-specific errors
type AuthError struct {
	Code    string
	Message string
}

func (e *AuthError) Error() string {
	return e.Message
}

// Predefined auth errors
var (
	ErrUserNotFound        = &AuthError{Code: "USER_NOT_FOUND", Message: "user not found"}
	ErrInvalidCredentials  = &AuthError{Code: "INVALID_CREDENTIALS", Message: "invalid credentials"}
	ErrAccountDeactivated  = &AuthError{Code: "ACCOUNT_DEACTIVATED", Message: "account is deactivated"}
	ErrEmailExists         = &AuthError{Code: "EMAIL_EXISTS", Message: "email already registered"}
	ErrInvalidAuthProvider = &AuthError{Code: "INVALID_AUTH_PROVIDER", Message: "invalid authentication provider"}
	ErrInvalidToken        = &AuthError{Code: "INVALID_TOKEN", Message: "invalid token"}
)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// NullStringFromPtr creates sql.NullString from a string pointer
func NullStringFromPtr(s *string) sql.NullString {
	if s == nil || *s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: *s, Valid: true}
}

// NullStringFromValue creates sql.NullString from a string value
func NullStringFromValue(s string) sql.NullString {
	if s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: s, Valid: true}
}
