package controllers

import (
	"context"
	"net"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"

	"cloudku-server/middleware"
	"cloudku-server/models"

	"github.com/gin-gonic/gin"
)

// DomainController handles domain management endpoints
type DomainController struct{}

// NewDomainController creates a new domain controller
func NewDomainController() *DomainController {
	return &DomainController{}
}

// GetDomains returns all domains for the authenticated user
func (dc *DomainController) GetDomains(c *gin.Context) {
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	domains, err := models.GetDomainsByUserID(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch domains",
			"error":   err.Error(),
		})
		return
	}

	// Convert to response format
	domainsResponse := make([]models.DomainResponse, len(domains))
	for i, d := range domains {
		domainsResponse[i] = d.ToResponse()
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"domains": domainsResponse,
	})
}

// GetDomain returns a single domain
func (dc *DomainController) GetDomain(c *gin.Context) {
	userID := middleware.GetUserID(c)
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	ctx := context.Background()
	domain, err := models.GetDomainByID(ctx, id, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Domain not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"domain":  domain.ToResponse(),
	})
}

// CreateDomainRequest represents the create domain request
type CreateDomainRequest struct {
	DomainName   string `json:"domain_name" binding:"required"`
	DocumentRoot string `json:"document_root"`
}

// CreateDomain creates a new domain
func (dc *DomainController) CreateDomain(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req CreateDomainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Domain name is required",
		})
		return
	}

	// Validate domain name format
	domainRegex := regexp.MustCompile(`^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$`)
	domainName := strings.ToLower(req.DomainName)
	if !domainRegex.MatchString(domainName) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain name format",
		})
		return
	}

	ctx := context.Background()

	// Check if domain already exists
	exists, _ := models.DomainExists(ctx, domainName)
	if exists {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Domain already exists",
		})
		return
	}

	// Set default document root
	documentRoot := req.DocumentRoot
	if documentRoot == "" {
		documentRoot = "/public_html"
	}

	// Create domain
	domain, err := models.CreateDomain(ctx, userID, domainName, documentRoot)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create domain",
			"error":   err.Error(),
		})
		return
	}

	// Create default DNS records
	serverIP := os.Getenv("SERVER_IP")
	if serverIP == "" {
		serverIP = "0.0.0.0"
	}
	models.CreateDefaultDNSRecords(ctx, domain.ID, domainName, serverIP)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Domain created successfully",
		"domain":  domain.ToResponse(),
	})
}

// UpdateDomainRequest represents the update domain request
type UpdateDomainRequest struct {
	DocumentRoot string `json:"document_root"`
	Status       string `json:"status"`
	SSLEnabled   *bool  `json:"ssl_enabled"`
	AutoRenewSSL *bool  `json:"auto_renew_ssl"`
}

// UpdateDomain updates a domain
func (dc *DomainController) UpdateDomain(c *gin.Context) {
	userID := middleware.GetUserID(c)
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	var req UpdateDomainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
		})
		return
	}

	ctx := context.Background()

	// Verify ownership
	_, err = models.GetDomainByID(ctx, id, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Domain not found",
		})
		return
	}

	// Build updates map
	updates := make(map[string]interface{})
	if req.DocumentRoot != "" {
		updates["document_root"] = req.DocumentRoot
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.SSLEnabled != nil {
		updates["ssl_enabled"] = *req.SSLEnabled
	}
	if req.AutoRenewSSL != nil {
		updates["auto_renew_ssl"] = *req.AutoRenewSSL
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No fields to update",
		})
		return
	}

	domain, err := models.UpdateDomain(ctx, id, userID, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update domain",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Domain updated successfully",
		"domain":  domain.ToResponse(),
	})
}

// DeleteDomain deletes a domain
func (dc *DomainController) DeleteDomain(c *gin.Context) {
	userID := middleware.GetUserID(c)
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	ctx := context.Background()
	domainName, err := models.DeleteDomain(ctx, id, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Domain not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Domain " + domainName + " deleted successfully",
	})
}

// GetDNSRecords returns DNS records for a domain
func (dc *DomainController) GetDNSRecords(c *gin.Context) {
	userID := middleware.GetUserID(c)
	domainIDStr := c.Param("id")
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

	records, err := models.GetDNSRecordsByDomainID(ctx, domainID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch DNS records",
		})
		return
	}

	// Convert to response format
	recordsResponse := make([]models.DNSRecordResponse, len(records))
	for i, r := range records {
		recordsResponse[i] = r.ToResponse()
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"records": recordsResponse,
	})
}

// CreateDNSRecordRequest represents create DNS record request
type CreateDNSRecordRequest struct {
	RecordType string `json:"record_type" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Value      string `json:"value" binding:"required"`
	TTL        int    `json:"ttl"`
	Priority   *int   `json:"priority"`
}

// CreateDNSRecord creates a new DNS record
func (dc *DomainController) CreateDNSRecord(c *gin.Context) {
	userID := middleware.GetUserID(c)
	domainIDStr := c.Param("id")
	domainID, err := strconv.Atoi(domainIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	var req CreateDNSRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Record type, name, and value are required",
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

	// Default TTL
	ttl := req.TTL
	if ttl == 0 {
		ttl = 3600
	}

	record, err := models.CreateDNSRecord(ctx, domainID, req.RecordType, req.Name, req.Value, ttl, req.Priority)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create DNS record",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "DNS record created successfully",
		"record":  record.ToResponse(),
	})
}

// DeleteDNSRecord deletes a DNS record
func (dc *DomainController) DeleteDNSRecord(c *gin.Context) {
	userID := middleware.GetUserID(c)
	domainIDStr := c.Param("id")
	recordIDStr := c.Param("recordId")

	domainID, err := strconv.Atoi(domainIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	recordID, err := strconv.Atoi(recordIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid record ID",
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

	err = models.DeleteDNSRecord(ctx, recordID, domainID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "DNS record not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "DNS record deleted successfully",
	})
}

// VerifyDomain verifies domain DNS is pointing to server
func (dc *DomainController) VerifyDomain(c *gin.Context) {
	userID := middleware.GetUserID(c)
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid domain ID",
		})
		return
	}

	ctx := context.Background()

	domain, err := models.GetDomainByID(ctx, id, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Domain not found",
		})
		return
	}

	expectedIP := os.Getenv("SERVER_IP")
	if expectedIP == "" {
		expectedIP = "127.0.0.1"
	}

	// Perform DNS lookup
	ips, err := net.LookupIP(domain.DomainName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Domain '" + domain.DomainName + "' could not be resolved. Please ensure DNS records are propagated.",
		})
		return
	}

	// Check if any IP matches expected
	var resolvedIPs []string
	verified := false
	for _, ip := range ips {
		if ipv4 := ip.To4(); ipv4 != nil {
			resolvedIPs = append(resolvedIPs, ipv4.String())
			if ipv4.String() == expectedIP {
				verified = true
			}
		}
	}

	if verified {
		// Update domain status
		updates := map[string]interface{}{
			"status": "active",
		}
		models.UpdateDomain(ctx, id, userID, updates)

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Domain verified successfully! Pointing to " + expectedIP,
		})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Verification failed. Domain points to: " + strings.Join(resolvedIPs, ", ") + ". Please update your DNS A Record to point to: " + expectedIP,
		})
	}
}
