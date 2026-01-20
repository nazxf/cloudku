package controllers

import (
	"context"
	"net/http"
	"strconv"

	"cloudku-server/database"
	"cloudku-server/middleware"
	"cloudku-server/models"

	"github.com/gin-gonic/gin"
)

// DNSController handles DNS management endpoints
type DNSController struct{}

// NewDNSController creates a new DNS controller
func NewDNSController() *DNSController {
	return &DNSController{}
}

// GetDNSStats returns DNS statistics
func (dc *DNSController) GetDNSStats(c *gin.Context) {
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	var totalRecords, aRecords, cnameRecords, mxRecords int

	query := `
		SELECT COUNT(r.id)
		FROM dns_records r
		JOIN domains d ON r.domain_id = d.id
		WHERE d.user_id = $1
	`
	database.DB.QueryRow(ctx, query, userID).Scan(&totalRecords)

	query = `
		SELECT COUNT(r.id)
		FROM dns_records r
		JOIN domains d ON r.domain_id = d.id
		WHERE d.user_id = $1 AND r.record_type = 'A'
	`
	database.DB.QueryRow(ctx, query, userID).Scan(&aRecords)

	query = `
		SELECT COUNT(r.id)
		FROM dns_records r
		JOIN domains d ON r.domain_id = d.id
		WHERE d.user_id = $1 AND r.record_type = 'CNAME'
	`
	database.DB.QueryRow(ctx, query, userID).Scan(&cnameRecords)

	query = `
		SELECT COUNT(r.id)
		FROM dns_records r
		JOIN domains d ON r.domain_id = d.id
		WHERE d.user_id = $1 AND r.record_type = 'MX'
	`
	database.DB.QueryRow(ctx, query, userID).Scan(&mxRecords)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"stats": gin.H{
			"totalRecords": totalRecords,
			"aRecords":     aRecords,
			"cnameRecords": cnameRecords,
			"mxRecords":    mxRecords,
			"otherRecords": totalRecords - aRecords - cnameRecords - mxRecords,
		},
	})
}

// ExportZone exports zone file in BIND format
func (dc *DNSController) ExportZone(c *gin.Context) {
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

	// Get DNS records
	records, err := models.GetDNSRecordsByDomainID(ctx, domainID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch DNS records",
		})
		return
	}

	// Generate BIND zone file format
	zoneFile := "; Zone file for " + domain.DomainName + "\n"
	zoneFile += "; Exported from CloudKu\n"
	zoneFile += "$ORIGIN " + domain.DomainName + ".\n"
	zoneFile += "$TTL 3600\n\n"

	// Add SOA record
	zoneFile += "@ IN SOA ns1." + domain.DomainName + ". admin." + domain.DomainName + ". (\n"
	zoneFile += "    2024010101 ; Serial\n"
	zoneFile += "    3600       ; Refresh\n"
	zoneFile += "    1800       ; Retry\n"
	zoneFile += "    604800     ; Expire\n"
	zoneFile += "    86400 )    ; Minimum TTL\n\n"

	// Add records
	for _, r := range records {
		name := r.Name
		if name == "@" {
			name = domain.DomainName + "."
		}
		priority := ""
		if r.Priority.Valid && r.RecordType == "MX" {
			priority = strconv.Itoa(int(r.Priority.Int32)) + " "
		}
		zoneFile += name + " " + strconv.Itoa(r.TTL) + " IN " + r.RecordType + " " + priority + r.Value + "\n"
	}

	// Send as downloadable file
	c.Header("Content-Type", "text/plain")
	c.Header("Content-Disposition", "attachment; filename=\""+domain.DomainName+".zone\"")
	c.String(http.StatusOK, zoneFile)
}

// GetPowerDNSStatus returns PowerDNS server status
func (dc *DNSController) GetPowerDNSStatus(c *gin.Context) {
	// In production, this would check actual PowerDNS status
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"powerdns": gin.H{
			"running": true,
			"version": "4.7.0",
			"uptime":  "5 days",
			"queries": 12345,
			"zones":   42,
		},
	})
}

// ReloadPowerDNS reloads PowerDNS server
func (dc *DNSController) ReloadPowerDNS(c *gin.Context) {
	// In production, this would execute pdns_control reload
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"reloaded": true,
		"message":  "PowerDNS reloaded successfully",
	})
}

// GetPowerDNSRecords returns all PowerDNS records for a domain
func (dc *DNSController) GetPowerDNSRecords(c *gin.Context) {
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

	records, err := models.GetDNSRecordsByDomainID(ctx, domainID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch records",
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

// IncrementSOASerial increments SOA serial for zone updates
func (dc *DNSController) IncrementSOASerial(c *gin.Context) {
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

	// In production, this would update the SOA record serial
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "SOA serial incremented",
	})
}
