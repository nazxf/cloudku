package middleware

import (
	"cloudku-server/config"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware handles Cross-Origin Resource Sharing
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := config.AppConfig.FrontendURL

		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, HEAD, PATCH, OPTIONS, GET, PUT, DELETE")
		c.Header("Cross-Origin-Opener-Policy", "same-origin-allow-popups")

		// SECURITY: Add headers to prevent common attacks (OWASP best practices)
		c.Header("X-Content-Type-Options", "nosniff") // Prevent MIME sniffing
		c.Header("X-Frame-Options", "DENY")           // Prevent clickjacking
		c.Header("X-XSS-Protection", "1; mode=block") // Enable browser XSS filter
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// SECURITY: Content Security Policy - prevents XSS and injection attacks
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; frame-ancestors 'none'")

		// SECURITY: Strict Transport Security - enforce HTTPS (set when using HTTPS)
		if config.AppConfig.Environment == "production" {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}

		// SECURITY: Permissions Policy - disable sensitive features by default
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
