package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"cloudku-server/config"
	"cloudku-server/dto"
	"cloudku-server/models"
	"cloudku-server/utils"

	"google.golang.org/api/idtoken"
)

// GoogleOAuthService handles Google OAuth operations
type GoogleOAuthService struct {
	config *config.Config
}

// NewGoogleOAuthService creates a new GoogleOAuthService instance
func NewGoogleOAuthService() *GoogleOAuthService {
	return &GoogleOAuthService{
		config: config.AppConfig,
	}
}

// VerifyToken verifies Google ID token using official Google library
func (s *GoogleOAuthService) VerifyToken(ctx context.Context, token string) (*dto.GoogleUserInfo, error) {
	// Validate token using Google's official library
	payload, err := idtoken.Validate(ctx, token, s.config.GoogleClientID)
	if err != nil {
		return nil, fmt.Errorf("token validation failed: %w", err)
	}

	// Extract user info from payload
	email, _ := payload.Claims["email"].(string)
	emailVerified, _ := payload.Claims["email_verified"].(bool)
	name, _ := payload.Claims["name"].(string)
	picture, _ := payload.Claims["picture"].(string)

	if email == "" {
		return nil, errors.New("email not found in token")
	}

	return &dto.GoogleUserInfo{
		Sub:           payload.Subject,
		Email:         email,
		EmailVerified: emailVerified,
		Name:          name,
		Picture:       picture,
	}, nil
}

// ExchangeCode exchanges authorization code for tokens
func (s *GoogleOAuthService) ExchangeCode(ctx context.Context, code string) (*dto.GoogleTokenResponse, error) {
	tokenURL := "https://oauth2.googleapis.com/token"
	data := url.Values{
		"client_id":     {s.config.GoogleClientID},
		"client_secret": {s.config.GoogleClientSecret},
		"code":          {code},
		"grant_type":    {"authorization_code"},
		"redirect_uri":  {s.config.GoogleRedirectURI},
	}

	req, err := http.NewRequestWithContext(ctx, "POST", tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed: %s", string(body))
	}

	var tokenResp dto.GoogleTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

// ProcessLogin handles the Google OAuth login flow
func (s *GoogleOAuthService) ProcessLogin(ctx context.Context, googleUser *dto.GoogleUserInfo) *dto.AuthResult {
	// Try to find user by Google ID
	user, err := models.FindUserByGoogleID(ctx, googleUser.Sub)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return &dto.AuthResult{Error: fmt.Errorf("database error finding user by Google ID: %w", err)}
	}

	if user == nil {
		// User not found by Google ID, try by email
		user, err = models.FindUserByEmail(ctx, googleUser.Email)

		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return &dto.AuthResult{Error: fmt.Errorf("database error finding user by email: %w", err)}
		}

		if user == nil {
			// Create new user
			user = &models.User{
				Email:          googleUser.Email,
				Name:           googleUser.Name,
				ProfilePicture: sql.NullString{String: googleUser.Picture, Valid: googleUser.Picture != ""},
				AuthProvider:   models.AuthProviderGoogle,
				GoogleID:       sql.NullString{String: googleUser.Sub, Valid: true},
				EmailVerified:  googleUser.EmailVerified,
				IsActive:       true,
			}

			if err := models.CreateUser(ctx, user); err != nil {
				return &dto.AuthResult{Error: fmt.Errorf("failed to create user: %w", err)}
			}
		} else {
			// User exists by email, link Google account
			if err := models.UpdateGoogleInfo(ctx, user.ID, googleUser.Sub, googleUser.Email, googleUser.Name, googleUser.Picture); err != nil {
				log.Printf("WARN: Failed to link Google account for user %d: %v", user.ID, err)
			}

			// Update local user object
			user.Email = googleUser.Email
			user.Name = googleUser.Name
			user.AuthProvider = models.AuthProviderGoogle
			user.GoogleID = sql.NullString{String: googleUser.Sub, Valid: true}
			if googleUser.Picture != "" {
				user.ProfilePicture = sql.NullString{String: googleUser.Picture, Valid: true}
			}
		}
	} else {
		// User found by Google ID, update profile info
		if err := models.UpdateGoogleInfo(ctx, user.ID, googleUser.Sub, googleUser.Email, googleUser.Name, googleUser.Picture); err != nil {
			log.Printf("WARN: Failed to update Google info for user %d: %v", user.ID, err)
		}

		// Update local user object
		user.Email = googleUser.Email
		user.Name = googleUser.Name
		user.AuthProvider = models.AuthProviderGoogle
		if googleUser.Picture != "" {
			user.ProfilePicture = sql.NullString{String: googleUser.Picture, Valid: true}
		}
	}

	// Check if user is active
	if !user.IsActive {
		return &dto.AuthResult{Error: dto.ErrAccountDeactivated}
	}

	// Update last login
	if err := models.UpdateLastLogin(ctx, user.ID); err != nil {
		log.Printf("WARN: Failed to update last login for user %d: %v", user.ID, err)
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		return &dto.AuthResult{Error: fmt.Errorf("failed to generate token: %w", err)}
	}

	return &dto.AuthResult{
		User:  user,
		Token: token,
	}
}
