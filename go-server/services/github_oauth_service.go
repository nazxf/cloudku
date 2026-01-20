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
)

// GithubOAuthService handles GitHub OAuth operations
type GithubOAuthService struct {
	config *config.Config
}

// NewGithubOAuthService creates a new GithubOAuthService instance
func NewGithubOAuthService() *GithubOAuthService {
	return &GithubOAuthService{
		config: config.AppConfig,
	}
}

// ExchangeCode exchanges authorization code for access token
func (s *GithubOAuthService) ExchangeCode(ctx context.Context, code string) (string, error) {
	tokenURL := "https://github.com/login/oauth/access_token"
	data := url.Values{
		"client_id":     {s.config.GithubClientID},
		"client_secret": {s.config.GithubClientSecret},
		"code":          {code},
	}

	req, err := http.NewRequestWithContext(ctx, "POST", tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("token exchange failed: %s", string(body))
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		Scope       string `json:"scope"`
		Error       string `json:"error"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", err
	}

	if tokenResp.Error != "" {
		return "", fmt.Errorf("GitHub error: %s", tokenResp.Error)
	}

	if tokenResp.AccessToken == "" {
		return "", errors.New("no access token received")
	}

	return tokenResp.AccessToken, nil
}

// GetUserInfo gets user info from GitHub API
func (s *GithubOAuthService) GetUserInfo(ctx context.Context, accessToken string) (*dto.GithubUserInfo, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", "https://api.github.com/user", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitHub API error: %s", string(body))
	}

	var userInfo dto.GithubUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	// If email is empty, fetch from emails endpoint
	if userInfo.Email == "" {
		emails, err := s.getEmails(ctx, accessToken)
		if err == nil && len(emails) > 0 {
			// Prefer primary verified email
			for _, email := range emails {
				if email.Primary && email.Verified {
					userInfo.Email = email.Email
					break
				}
			}
			// Fallback to first verified email
			if userInfo.Email == "" {
				for _, email := range emails {
					if email.Verified {
						userInfo.Email = email.Email
						break
					}
				}
			}
			// Last resort: use first email
			if userInfo.Email == "" && len(emails) > 0 {
				userInfo.Email = emails[0].Email
			}
		}
	}

	return &userInfo, nil
}

// getEmails gets user emails from GitHub API
func (s *GithubOAuthService) getEmails(ctx context.Context, accessToken string) ([]dto.GithubEmail, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", "https://api.github.com/user/emails", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get emails: status %d", resp.StatusCode)
	}

	var emails []dto.GithubEmail
	if err := json.NewDecoder(resp.Body).Decode(&emails); err != nil {
		return nil, err
	}

	return emails, nil
}

// ProcessLogin handles the GitHub login flow
func (s *GithubOAuthService) ProcessLogin(ctx context.Context, githubUser *dto.GithubUserInfo) *dto.AuthResult {
	githubIDStr := fmt.Sprintf("%d", githubUser.ID)

	// Try to find user by GitHub ID
	user, err := models.FindUserByGithubID(ctx, githubIDStr)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return &dto.AuthResult{Error: fmt.Errorf("database error finding user by GitHub ID: %w", err)}
	}

	if user == nil && githubUser.Email != "" {
		// User not found by GitHub ID, try by email
		user, err = models.FindUserByEmail(ctx, githubUser.Email)

		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return &dto.AuthResult{Error: fmt.Errorf("database error finding user by email: %w", err)}
		}
	}

	if user == nil {
		// Create new user
		email := githubUser.Email
		if email == "" {
			email = fmt.Sprintf("%s@github.local", githubUser.Login)
		}

		name := githubUser.Name
		if name == "" {
			name = githubUser.Login
		}

		user = &models.User{
			Email:          email,
			Name:           name,
			ProfilePicture: sql.NullString{String: githubUser.AvatarURL, Valid: githubUser.AvatarURL != ""},
			AuthProvider:   models.AuthProviderGithub,
			GithubID:       sql.NullString{String: githubIDStr, Valid: true},
			EmailVerified:  githubUser.Email != "",
			IsActive:       true,
		}

		if err := models.CreateUser(ctx, user); err != nil {
			return &dto.AuthResult{Error: fmt.Errorf("failed to create user: %w", err)}
		}
	} else {
		// User exists, link GitHub account
		if err := models.UpdateGithubInfo(ctx, user.ID, githubIDStr, githubUser.AvatarURL); err != nil {
			log.Printf("WARN: Failed to link GitHub account for user %d: %v", user.ID, err)
		}

		// Update local user object
		user.AuthProvider = models.AuthProviderGithub
		user.GithubID = sql.NullString{String: githubIDStr, Valid: true}
		if githubUser.AvatarURL != "" {
			user.ProfilePicture = sql.NullString{String: githubUser.AvatarURL, Valid: true}
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
