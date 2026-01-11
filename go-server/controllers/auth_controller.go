package controllers

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
	"cloudku-server/models"
	"cloudku-server/utils"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
)

// AuthController handles authentication endpoints
type AuthController struct{}

// NewAuthController creates a new auth controller
func NewAuthController() *AuthController {
	return &AuthController{}
}

// Request/Response structures
type (
	RegisterRequest struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
		Name     string `json:"name" binding:"required,min=2"`
	}

	LoginRequest struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	GoogleAuthRequest struct {
		Token string `json:"token" binding:"required"`
	}

	GoogleCallbackRequest struct {
		Code string `json:"code" binding:"required"`
	}

	GithubAuthRequest struct {
		Code string `json:"code" binding:"required"`
	}

	GoogleUserInfo struct {
		Sub           string `json:"sub"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
	}

	GithubUserInfo struct {
		ID        int    `json:"id"`
		Login     string `json:"login"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		AvatarURL string `json:"avatar_url"`
	}

	GithubEmail struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}
)

// Custom errors
var (
	ErrUserNotFound        = errors.New("user not found")
	ErrInvalidCredentials  = errors.New("invalid credentials")
	ErrAccountDeactivated  = errors.New("account is deactivated")
	ErrEmailExists         = errors.New("email already registered")
	ErrInvalidAuthProvider = errors.New("invalid authentication provider")
)

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

// Register handles email/password registration
func (ac *AuthController) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if email already exists
	existingUser, err := models.FindUserByEmail(ctx, req.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("ERROR: Register - Database error checking email: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database error",
		})
		return
	}

	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Email already registered",
		})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		log.Printf("ERROR: Register - Failed to hash password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process password",
		})
		return
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
		log.Printf("ERROR: Register - Failed to create user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create user",
		})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		log.Printf("ERROR: Register - Failed to generate token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Registration successful but failed to generate token",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Registration successful",
		"data": gin.H{
			"token": token,
			"user":  user.ToResponse(),
		},
	})
}

// Login handles email/password login
func (ac *AuthController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find user by email
	user, err := models.FindUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid email or password",
			})
			return
		}
		log.Printf("ERROR: Login - Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database error",
		})
		return
	}

	// Check if user uses email auth
	if user.AuthProvider != models.AuthProviderEmail {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": fmt.Sprintf("This account uses %s login. Please use the correct login method.", user.AuthProvider),
		})
		return
	}

	// Verify password
	if !user.PasswordHash.Valid || !utils.CheckPassword(req.Password, user.PasswordHash.String) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid email or password",
		})
		return
	}

	// Check if user is active
	if !user.IsActive {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Account is deactivated. Please contact support.",
		})
		return
	}

	// Update last login
	if err := models.UpdateLastLogin(ctx, user.ID); err != nil {
		log.Printf("WARN: Login - Failed to update last login for user %d: %v", user.ID, err)
		// Don't fail login if this fails
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		log.Printf("ERROR: Login - Failed to generate token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"data": gin.H{
			"token": token,
			"user":  user.ToResponse(),
		},
	})
}

// ============================================================================
// GOOGLE OAUTH AUTHENTICATION
// ============================================================================

// GoogleAuth handles Google OAuth login with ID token
func (ac *AuthController) GoogleAuth(c *gin.Context) {
	var req GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Verify Google token securely
	googleUser, err := verifyGoogleTokenSecure(ctx, req.Token)
	if err != nil {
		log.Printf("ERROR: GoogleAuth - Token verification failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid Google token",
		})
		return
	}

	// Process OAuth login
	user, token, err := ac.processOAuthLogin(ctx, googleUser, models.AuthProviderGoogle)
	if err != nil {
		log.Printf("ERROR: GoogleAuth - OAuth processing failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process Google login",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Google login successful",
		"data": gin.H{
			"token": token,
			"user":  user.ToResponse(),
		},
	})
}

// GoogleAuthCallback handles Google OAuth callback with authorization code
func (ac *AuthController) GoogleAuthCallback(c *gin.Context) {
	var req GoogleCallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	cfg := config.AppConfig

	// Exchange code for tokens
	tokenResp, err := exchangeGoogleCode(ctx, req.Code, cfg)
	if err != nil {
		log.Printf("ERROR: GoogleAuthCallback - Code exchange failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to exchange authorization code",
		})
		return
	}

	// Verify ID token securely
	googleUser, err := verifyGoogleTokenSecure(ctx, tokenResp.IDToken)
	if err != nil {
		log.Printf("ERROR: GoogleAuthCallback - Token verification failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid Google token",
		})
		return
	}

	// Process OAuth login
	user, token, err := ac.processOAuthLogin(ctx, googleUser, models.AuthProviderGoogle)
	if err != nil {
		log.Printf("ERROR: GoogleAuthCallback - OAuth processing failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process Google login",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Google login successful",
		"data": gin.H{
			"token": token,
			"user":  user.ToResponse(),
		},
	})
}

// ============================================================================
// GITHUB OAUTH AUTHENTICATION
// ============================================================================

// GithubAuth handles GitHub OAuth login
func (ac *AuthController) GithubAuth(c *gin.Context) {
	var req GithubAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	cfg := config.AppConfig

	// Exchange code for access token
	accessToken, err := exchangeGithubCode(ctx, req.Code, cfg)
	if err != nil {
		log.Printf("ERROR: GithubAuth - Code exchange failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to exchange authorization code",
		})
		return
	}

	// Get user info from GitHub
	githubUser, err := getGithubUser(ctx, accessToken)
	if err != nil {
		log.Printf("ERROR: GithubAuth - Failed to get user info: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get GitHub user info",
		})
		return
	}

	// Process GitHub login
	user, token, err := ac.processGithubLogin(ctx, githubUser)
	if err != nil {
		log.Printf("ERROR: GithubAuth - OAuth processing failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to process GitHub login",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "GitHub login successful",
		"data": gin.H{
			"token": token,
			"user":  user.ToResponse(),
		},
	})
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

// GetMe returns the current authenticated user
func (ac *AuthController) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user, err := models.FindUserByID(ctx, userID.(int))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		log.Printf("ERROR: GetMe - Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user": user.ToResponse(),
		},
	})
}

// DeleteAccount deletes the authenticated user's account
func (ac *AuthController) DeleteAccount(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := models.DeleteUser(ctx, userID.(int)); err != nil {
		log.Printf("ERROR: DeleteAccount - Failed to delete user %d: %v", userID.(int), err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete account",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Account deleted successfully",
	})
}

// ============================================================================
// HELPER FUNCTIONS - GOOGLE OAUTH
// ============================================================================

// verifyGoogleTokenSecure verifies Google ID token using official Google library
func verifyGoogleTokenSecure(ctx context.Context, token string) (*GoogleUserInfo, error) {
	cfg := config.AppConfig

	// Validate token using Google's official library
	payload, err := idtoken.Validate(ctx, token, cfg.GoogleClientID)
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

	return &GoogleUserInfo{
		Sub:           payload.Subject,
		Email:         email,
		EmailVerified: emailVerified,
		Name:          name,
		Picture:       picture,
	}, nil
}

// exchangeGoogleCode exchanges authorization code for tokens
func exchangeGoogleCode(ctx context.Context, code string, cfg *config.Config) (*struct {
	AccessToken string `json:"access_token"`
	IDToken     string `json:"id_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}, error) {
	tokenURL := "https://oauth2.googleapis.com/token"
	data := url.Values{
		"client_id":     {cfg.GoogleClientID},
		"client_secret": {cfg.GoogleClientSecret},
		"code":          {code},
		"grant_type":    {"authorization_code"},
		"redirect_uri":  {cfg.GoogleRedirectURI},
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

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		IDToken     string `json:"id_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int    `json:"expires_in"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

// processOAuthLogin handles the common OAuth login flow for Google
func (ac *AuthController) processOAuthLogin(ctx context.Context, googleUser *GoogleUserInfo, provider models.AuthProvider) (*models.User, string, error) {
	// Try to find user by Google ID
	user, err := models.FindUserByGoogleID(ctx, googleUser.Sub)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, "", fmt.Errorf("database error finding user by Google ID: %w", err)
	}

	if user == nil {
		// User not found by Google ID, try by email
		user, err = models.FindUserByEmail(ctx, googleUser.Email)

		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return nil, "", fmt.Errorf("database error finding user by email: %w", err)
		}

		if user == nil {
			// Create new user
			user = &models.User{
				Email:          googleUser.Email,
				Name:           googleUser.Name,
				ProfilePicture: sql.NullString{String: googleUser.Picture, Valid: googleUser.Picture != ""},
				AuthProvider:   provider,
				GoogleID:       sql.NullString{String: googleUser.Sub, Valid: true},
				EmailVerified:  googleUser.EmailVerified,
				IsActive:       true,
			}

			if err := models.CreateUser(ctx, user); err != nil {
				return nil, "", fmt.Errorf("failed to create user: %w", err)
			}
		} else {
			// User exists by email, link Google account
			if err := models.UpdateGoogleInfo(ctx, user.ID, googleUser.Sub, googleUser.Email, googleUser.Name, googleUser.Picture); err != nil {
				log.Printf("WARN: Failed to link Google account for user %d: %v", user.ID, err)
			}

			// Update local user object
			user.Email = googleUser.Email
			user.Name = googleUser.Name
			user.AuthProvider = provider
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
		user.AuthProvider = provider
		if googleUser.Picture != "" {
			user.ProfilePicture = sql.NullString{String: googleUser.Picture, Valid: true}
		}
	}

	// Check if user is active
	if !user.IsActive {
		return nil, "", ErrAccountDeactivated
	}

	// Update last login
	if err := models.UpdateLastLogin(ctx, user.ID); err != nil {
		log.Printf("WARN: Failed to update last login for user %d: %v", user.ID, err)
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}

// ============================================================================
// HELPER FUNCTIONS - GITHUB OAUTH
// ============================================================================

// exchangeGithubCode exchanges authorization code for access token
func exchangeGithubCode(ctx context.Context, code string, cfg *config.Config) (string, error) {
	tokenURL := "https://github.com/login/oauth/access_token"
	data := url.Values{
		"client_id":     {cfg.GithubClientID},
		"client_secret": {cfg.GithubClientSecret},
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

// getGithubUser gets user info from GitHub API
func getGithubUser(ctx context.Context, accessToken string) (*GithubUserInfo, error) {
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

	var userInfo GithubUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	// If email is empty, fetch from emails endpoint
	if userInfo.Email == "" {
		emails, err := getGithubEmails(ctx, accessToken)
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

// getGithubEmails gets user emails from GitHub API
func getGithubEmails(ctx context.Context, accessToken string) ([]GithubEmail, error) {
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

	var emails []GithubEmail
	if err := json.NewDecoder(resp.Body).Decode(&emails); err != nil {
		return nil, err
	}

	return emails, nil
}

// processGithubLogin handles the GitHub login flow
func (ac *AuthController) processGithubLogin(ctx context.Context, githubUser *GithubUserInfo) (*models.User, string, error) {
	githubIDStr := fmt.Sprintf("%d", githubUser.ID)

	// Try to find user by GitHub ID
	user, err := models.FindUserByGithubID(ctx, githubIDStr)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, "", fmt.Errorf("database error finding user by GitHub ID: %w", err)
	}

	if user == nil && githubUser.Email != "" {
		// User not found by GitHub ID, try by email
		user, err = models.FindUserByEmail(ctx, githubUser.Email)

		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return nil, "", fmt.Errorf("database error finding user by email: %w", err)
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
			return nil, "", fmt.Errorf("failed to create user: %w", err)
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
		return nil, "", ErrAccountDeactivated
	}

	// Update last login
	if err := models.UpdateLastLogin(ctx, user.ID); err != nil {
		log.Printf("WARN: Failed to update last login for user %d: %v", user.ID, err)
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}
