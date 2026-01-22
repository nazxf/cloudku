package v1

import (
	"time"

	"cloudku-server/controllers"
	"cloudku-server/middleware"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// RegisterAuthRoutes sets up authentication routes
//
// PUBLIC ENDPOINTS (no authentication required):
//   - POST /auth/register     - Email/password registration
//   - POST /auth/login        - Email/password login
//   - POST /auth/google       - Google OAuth initiation
//   - POST /auth/google/callback - Google OAuth callback
//   - POST /auth/github       - GitHub OAuth login
//
// PROTECTED ENDPOINTS (requires valid JWT):
//   - GET    /auth/me         - Get current authenticated user
//   - DELETE /auth/me         - Delete current user account
func RegisterAuthRoutes(rg *gin.RouterGroup, ctrl *controllers.AuthController) {
	// SECURITY: Create rate limiters for auth endpoints
	// Strict limiter: 10 requests per minute for sensitive operations
	strictLimiter := middleware.NewRateLimiter(rate.Every(time.Minute/10), 10)

	auth := rg.Group("/auth")
	{
		// ==========================================
		// PUBLIC AUTH ROUTES
		// SECURITY: Rate limited to prevent brute force attacks
		// ==========================================
		auth.POST("/register", middleware.RateLimitMiddleware(strictLimiter), ctrl.Register)
		auth.POST("/login", middleware.RateLimitMiddleware(strictLimiter), ctrl.Login)
		auth.POST("/google", ctrl.GoogleAuth)
		auth.POST("/google/callback", ctrl.GoogleAuthCallback)
		auth.POST("/github", ctrl.GithubAuth)

		// ==========================================
		// PROTECTED AUTH ROUTES
		// All routes below require valid JWT token
		// ==========================================
		protected := auth.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/me", ctrl.GetMe)
			protected.DELETE("/me", ctrl.DeleteAccount)
		}
	}
}
