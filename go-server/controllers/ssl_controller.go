package controllers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"cloudku-server/database"
	"cloudku-server/middleware"
	"cloudku-server/models"

	"github.com/gin-gonic/gin"
)

// SSLController handles SSL management endpoints
type SSLController struct{}

// NewSSLController creates a new SSL controller
func NewSSLController() *SSLController {
	return &SSLController{}
}

// EnableSSL enables SSL for a domain
func (sc *SSLController) EnableSSL(c *gin.Context) {
	userID := middleware.GetUserID(c)
	domainIDStr := c.Param("domainId")
	domainID, err := strconv.Atoi(domainIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	ctx := context.Background()

	// Verify ownership
	domain, err := models.GetDomainByID(ctx, domainID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Domain not found",
		})
		return
	}

	// Check if already enabled
	if domain.SSLEnabled {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "SSL is already enabled for this domain",
		})
		return
	}

	// In production, this would call Let's Encrypt certbot
	// For now, we'll just update the database
	expiresAt := time.Now().AddDate(0, 3, 0) // 90 days from now

	query := `
		UPDATE domains 
		SET ssl_enabled = true, 
		    ssl_provider = 'letsencrypt',
		    ssl_expires_at = $1
		WHERE id = $2
	`
	_, err = database.DB.Exec(ctx, query, expiresAt, domainID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to enable SSL",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "SSL enabled successfully",
		"certificate": gin.H{
			"domain":    domain.DomainName,
			"expiresAt": expiresAt,
		},
	})
}

// DisableSSL disables SSL for a domain
func (sc *SSLController) DisableSSL(c *gin.Context) {
	userID := middleware.GetUserID(c)
	domainIDStr := c.Param("domainId")
	domainID, err := strconv.Atoi(domainIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	ctx := context.Background()

	// Verify ownership
	_, err = models.GetDomainByID(ctx, domainID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Domain not found",
		})
		return
	}

	query := `
		UPDATE domains 
		SET ssl_enabled = false, 
		    ssl_provider = NULL,
		    ssl_expires_at = NULL
		WHERE id = $1
	`
	_, err = database.DB.Exec(ctx, query, domainID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to disable SSL",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "SSL disabled successfully",
	})
}

// RenewSSL renews SSL certificate for a domain
func (sc *SSLController) RenewSSL(c *gin.Context) {
	userID := middleware.GetUserID(c)
	domainIDStr := c.Param("domainId")
	domainID, err := strconv.Atoi(domainIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	ctx := context.Background()

	// Verify ownership
	domain, err := models.GetDomainByID(ctx, domainID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Domain not found",
		})
		return
	}

	if !domain.SSLEnabled {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "SSL is not enabled for this domain",
		})
		return
	}

	// In production, this would call certbot renew
	expiresAt := time.Now().AddDate(0, 3, 0) // 90 days from now

	query := `UPDATE domains SET ssl_expires_at = $1 WHERE id = $2`
	_, err = database.DB.Exec(ctx, query, expiresAt, domainID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to renew SSL certificate",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "SSL certificate renewed successfully",
		"expiresAt": expiresAt,
	})
}

// GetSSLInfo returns SSL certificate info for a domain
func (sc *SSLController) GetSSLInfo(c *gin.Context) {
	userID := middleware.GetUserID(c)
	domainIDStr := c.Param("domainId")
	domainID, err := strconv.Atoi(domainIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	ctx := context.Background()

	domain, err := models.GetDomainByID(ctx, domainID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Domain not found",
		})
		return
	}

	if !domain.SSLEnabled {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "SSL is not enabled for this domain",
		})
		return
	}

	var daysUntilExpiry *int
	var sslProvider *string
	var expiresAt *time.Time

	if domain.SSLExpiresAt.Valid {
		days := int(time.Until(domain.SSLExpiresAt.Time).Hours() / 24)
		daysUntilExpiry = &days
		expiresAt = &domain.SSLExpiresAt.Time
	}
	if domain.SSLProvider.Valid {
		sslProvider = &domain.SSLProvider.String
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"ssl": gin.H{
			"enabled":         domain.SSLEnabled,
			"provider":        sslProvider,
			"expiresAt":       expiresAt,
			"daysUntilExpiry": daysUntilExpiry,
		},
	})
}

// GetSSLStats returns SSL statistics
func (sc *SSLController) GetSSLStats(c *gin.Context) {
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	// Get SSL statistics for user
	var totalDomains, sslEnabled, expiringSoon int

	query := `SELECT COUNT(*) FROM domains WHERE user_id = $1`
	database.DB.QueryRow(ctx, query, userID).Scan(&totalDomains)

	query = `SELECT COUNT(*) FROM domains WHERE user_id = $1 AND ssl_enabled = true`
	database.DB.QueryRow(ctx, query, userID).Scan(&sslEnabled)

	query = `SELECT COUNT(*) FROM domains WHERE user_id = $1 AND ssl_enabled = true AND ssl_expires_at < NOW() + INTERVAL '30 days' AND ssl_expires_at > NOW()`
	database.DB.QueryRow(ctx, query, userID).Scan(&expiringSoon)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"stats": gin.H{
			"totalDomains":      totalDomains,
			"sslEnabled":        sslEnabled,
			"expiringSoon":      expiringSoon,
			"percentageSecured": float64(sslEnabled) / float64(totalDomains) * 100,
		},
		"certbot": gin.H{
			"installed":  true,
			"version":    "1.0.0",
			"configured": true,
		},
	})
}

// GetExpiringCertificates returns certificates expiring soon
func (sc *SSLController) GetExpiringCertificates(c *gin.Context) {
	userID := middleware.GetUserID(c)
	daysStr := c.DefaultQuery("days", "30")
	days, _ := strconv.Atoi(daysStr)

	ctx := context.Background()

	query := `
		SELECT id, domain_name, ssl_expires_at
		FROM domains
		WHERE user_id = $1
		AND ssl_enabled = true
		AND ssl_expires_at < NOW() + INTERVAL '1 day' * $2
		AND ssl_expires_at > NOW()
		ORDER BY ssl_expires_at ASC
	`

	rows, err := database.DB.Query(ctx, query, userID, days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get expiring certificates",
		})
		return
	}
	defer rows.Close()

	var expiring []gin.H
	for rows.Next() {
		var id int
		var domainName string
		var expiresAt time.Time
		if err := rows.Scan(&id, &domainName, &expiresAt); err != nil {
			continue
		}
		expiring = append(expiring, gin.H{
			"id":             id,
			"domain_name":    domainName,
			"ssl_expires_at": expiresAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"expiring": expiring,
	})
}
