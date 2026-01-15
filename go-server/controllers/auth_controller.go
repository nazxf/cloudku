package controllers

import (
	"context"
	"errors"
	"net/http"
	"time"

	"cloudku-server/dto"
	"cloudku-server/services"

	"github.com/gin-gonic/gin"
)

// AuthController handles authentication endpoints
// This is a thin controller - it only handles HTTP concerns (bind request, response)
// All business logic is delegated to services
type AuthController struct {
	authService   *services.AuthService
	googleService *services.GoogleOAuthService
	githubService *services.GithubOAuthService
}

// NewAuthController creates a new auth controller with dependencies
func NewAuthController() *AuthController {
	return &AuthController{
		authService:   services.NewAuthService(),
		googleService: services.NewGoogleOAuthService(),
		githubService: services.NewGithubOAuthService(),
	}
}

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

// Register handles email/password registration
func (ac *AuthController) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	result := ac.authService.Register(ctx, req)
	if result.Error != nil {
		ac.handleAuthError(c, result.Error, "register")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Registration successful",
		"data": gin.H{
			"token": result.Token,
			"user":  result.User.ToResponse(),
		},
	})
}

// Login handles email/password login
func (ac *AuthController) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	result := ac.authService.Login(ctx, req)
	if result.Error != nil {
		ac.handleAuthError(c, result.Error, "login")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"data": gin.H{
			"token": result.Token,
			"user":  result.User.ToResponse(),
		},
	})
}

// ============================================================================
// GOOGLE OAUTH AUTHENTICATION
// ============================================================================

// GoogleAuth handles Google OAuth login with ID token
func (ac *AuthController) GoogleAuth(c *gin.Context) {
	var req dto.GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 15*time.Second)
	defer cancel()

	// Verify Google token
	googleUser, err := ac.googleService.VerifyToken(ctx, req.Token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid Google token",
		})
		return
	}

	// Process OAuth login
	result := ac.googleService.ProcessLogin(ctx, googleUser)
	if result.Error != nil {
		ac.handleAuthError(c, result.Error, "google_auth")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Google login successful",
		"data": gin.H{
			"token": result.Token,
			"user":  result.User.ToResponse(),
		},
	})
}

// GoogleAuthCallback handles Google OAuth callback with authorization code
func (ac *AuthController) GoogleAuthCallback(c *gin.Context) {
	var req dto.GoogleCallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 15*time.Second)
	defer cancel()

	// Exchange code for tokens
	tokenResp, err := ac.googleService.ExchangeCode(ctx, req.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to exchange authorization code",
		})
		return
	}

	// Verify ID token
	googleUser, err := ac.googleService.VerifyToken(ctx, tokenResp.IDToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid Google token",
		})
		return
	}

	// Process OAuth login
	result := ac.googleService.ProcessLogin(ctx, googleUser)
	if result.Error != nil {
		ac.handleAuthError(c, result.Error, "google_callback")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Google login successful",
		"data": gin.H{
			"token": result.Token,
			"user":  result.User.ToResponse(),
		},
	})
}

// ============================================================================
// GITHUB OAUTH AUTHENTICATION
// ============================================================================

// GithubAuth handles GitHub OAuth login
func (ac *AuthController) GithubAuth(c *gin.Context) {
	var req dto.GithubAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 15*time.Second)
	defer cancel()

	// Exchange code for access token
	accessToken, err := ac.githubService.ExchangeCode(ctx, req.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to exchange authorization code",
		})
		return
	}

	// Get user info from GitHub
	githubUser, err := ac.githubService.GetUserInfo(ctx, accessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get GitHub user info",
		})
		return
	}

	// Process GitHub login
	result := ac.githubService.ProcessLogin(ctx, githubUser)
	if result.Error != nil {
		ac.handleAuthError(c, result.Error, "github_auth")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "GitHub login successful",
		"data": gin.H{
			"token": result.Token,
			"user":  result.User.ToResponse(),
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

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	user, err := ac.authService.GetUserByID(ctx, userID.(int))
	if err != nil {
		if errors.Is(err, dto.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
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

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	if err := ac.authService.DeleteUser(ctx, userID.(int)); err != nil {
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
// ERROR HANDLING HELPER
// ============================================================================

// handleAuthError maps service errors to HTTP responses
func (ac *AuthController) handleAuthError(c *gin.Context, err error, operation string) {
	// Check for specific auth errors
	var authErr *dto.AuthError
	if errors.As(err, &authErr) {
		switch authErr.Code {
		case "EMAIL_EXISTS":
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Email already registered",
			})
			return
		case "INVALID_CREDENTIALS":
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid email or password",
			})
			return
		case "ACCOUNT_DEACTIVATED":
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Account is deactivated. Please contact support.",
			})
			return
		case "WRONG_AUTH_PROVIDER":
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": authErr.Message,
			})
			return
		case "USER_NOT_FOUND":
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
	}

	// Default error response
	c.JSON(http.StatusInternalServerError, gin.H{
		"success": false,
		"message": "Failed to process " + operation,
	})
}
