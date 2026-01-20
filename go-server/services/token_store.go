package services

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"
)

// TokenData stores information associated with a token
type TokenData struct {
	DatabaseName     string
	DatabaseUser     string
	DatabasePassword string
	CreatedAt        time.Time
}

// TokenStore manages temporary tokens for phpMyAdmin signon
type TokenStore struct {
	tokens map[string]TokenData
	mu     sync.RWMutex
}

// NewTokenStore creates a new token store
func NewTokenStore() *TokenStore {
	store := &TokenStore{
		tokens: make(map[string]TokenData),
	}

	// Start cleanup goroutine
	go store.cleanupExpiredTokens()

	return store
}

// GenerateToken creates a new random token
func (ts *TokenStore) GenerateToken(dbName, dbUser, dbPassword string) (string, error) {
	// Generate 32 bytes (256 bits) random token
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	token := hex.EncodeToString(bytes)

	// Store token data
	ts.mu.Lock()
	defer ts.mu.Unlock()

	ts.tokens[token] = TokenData{
		DatabaseName:     dbName,
		DatabaseUser:     dbUser,
		DatabasePassword: dbPassword,
		CreatedAt:        time.Now(),
	}

	return token, nil
}

// ValidateToken checks if a token exists and is valid, then returns its data
// The token is automatically deleted after validation (one-time use)
func (ts *TokenStore) ValidateToken(token string) (*TokenData, bool) {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	data, exists := ts.tokens[token]
	if !exists {
		return nil, false
	}

	// Check if token has expired (30 seconds)
	if time.Since(data.CreatedAt) > 30*time.Second {
		delete(ts.tokens, token)
		return nil, false
	}

	// Delete token after validation (one-time use)
	delete(ts.tokens, token)

	return &data, true
}

// cleanupExpiredTokens periodically removes expired tokens
func (ts *TokenStore) cleanupExpiredTokens() {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		ts.mu.Lock()
		now := time.Now()
		for token, data := range ts.tokens {
			if now.Sub(data.CreatedAt) > 30*time.Second {
				delete(ts.tokens, token)
			}
		}
		ts.mu.Unlock()
	}
}

// Global token store instance
var globalTokenStore = NewTokenStore()

// GetTokenStore returns the global token store instance
func GetTokenStore() *TokenStore {
	return globalTokenStore
}
