# Backend API Requirements for AI Chat Widget System

## 📋 Overview

The widget frontend is complete, but we need to build the backend API system to handle token management, security enforcement, and chat processing. This document outlines the required backend components.

## 🎯 Required Components

### 1. Token Management System
### 2. Widget Chat API with Security
### 3. Rate Limiting & Abuse Prevention
### 4. Admin Dashboard API
### 5. Analytics & Monitoring

---

## 🔑 1. Token Management System

### Database Schema

#### `widget_tokens` Table
```sql
CREATE TABLE widget_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(64) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP NULL,
    
    -- Security limits (enforced server-side)
    max_messages_per_minute INT DEFAULT 10,
    max_messages_per_hour INT DEFAULT 50,
    max_messages_per_day INT DEFAULT 200,
    max_message_length INT DEFAULT 2000,
    min_message_interval INT DEFAULT 2000, -- milliseconds
    max_conversation_length INT DEFAULT 100,
    session_timeout_minutes INT DEFAULT 30,
    
    -- Widget customization
    settings JSON, -- Store widget appearance/config
    
    INDEX idx_token (token),
    INDEX idx_domain (domain),
    INDEX idx_revoked (revoked)
);
```

#### `usage_tracking` Table
```sql
CREATE TABLE usage_tracking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(64) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Usage counters
    messages_this_minute INT DEFAULT 0,
    messages_this_hour INT DEFAULT 0,
    messages_today INT DEFAULT 0,
    
    -- Time windows
    minute_reset_at TIMESTAMP,
    hour_reset_at TIMESTAMP,
    day_reset_at TIMESTAMP,
    
    -- Session tracking
    conversation_id VARCHAR(128),
    session_start TIMESTAMP,
    last_message_at TIMESTAMP,
    
    FOREIGN KEY (token) REFERENCES widget_tokens(token),
    INDEX idx_token_domain (token, domain),
    INDEX idx_timestamp (timestamp)
);
```

#### `security_events` Table
```sql
CREATE TABLE security_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(64),
    domain VARCHAR(255),
    event_type ENUM('rate_limit', 'suspicious_content', 'domain_mismatch', 'invalid_token', 'blocked'),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_token (token),
    INDEX idx_event_type (event_type),
    INDEX idx_timestamp (timestamp)
);
```

### Required API Endpoints

#### Create Token
```http
POST /api/admin/tokens
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "domain": "customer-website.com",
    "settings": {
        "maxMessagesPerHour": 50,
        "maxMessagesPerDay": 200,
        "primaryColor": "#667eea",
        "greeting": "Hi! How can I help?",
        // ... other widget settings
    }
}

Response:
{
    "success": true,
    "token": "dwt_lm2a3x4b_ZXhhbX_k8n9m2q",
    "domain": "customer-website.com",
    "created_at": "2024-01-15T10:30:00Z"
}
```

#### List Tokens
```http
GET /api/admin/tokens?domain=customer.com&page=1&limit=50
Authorization: Bearer <admin_token>

Response:
{
    "success": true,
    "tokens": [
        {
            "token": "dwt_lm2a3x4b_ZXhhbX_k8n9m2q",
            "domain": "customer-website.com",
            "created_at": "2024-01-15T10:30:00Z",
            "revoked": false,
            "usage_today": 45,
            "settings": { ... }
        }
    ],
    "total": 123,
    "page": 1,
    "limit": 50
}
```

#### Revoke Token
```http
DELETE /api/admin/tokens/{token}
Authorization: Bearer <admin_token>

Response:
{
    "success": true,
    "message": "Token revoked successfully"
}
```

---

## 💬 2. Widget Chat API with Security

### Main Chat Endpoint
```http
POST /api/chat
Authorization: Bearer <widget_token>
Content-Type: application/json
Referer: https://customer-website.com

{
    "message": "Hello, I need help with my order",
    "conversation_id": "conv_1642251000_abc123",
    "domain": "customer-website.com"
}

Response (Success):
{
    "success": true,
    "response": "Hi! I'd be happy to help you with your order. Could you please provide your order number?",
    "conversation_id": "conv_1642251000_abc123",
    "usage": {
        "messages_remaining_today": 155,
        "reset_at": "2024-01-16T00:00:00Z"
    }
}

Response (Rate Limited):
{
    "success": false,
    "error": "rate_limit_exceeded",
    "message": "Too many messages per hour. Please try again in 15 minutes.",
    "retry_after": 900, // seconds
    "usage": {
        "messages_remaining_today": 0,
        "reset_at": "2024-01-16T00:00:00Z"
    }
}

Response (Blocked):
{
    "success": false,
    "error": "temporarily_blocked",
    "message": "Temporarily blocked due to suspicious activity. Try again in 5 minutes.",
    "retry_after": 300,
    "block_expires_at": "2024-01-15T11:05:00Z"
}
```

### Security Middleware (Required)
```javascript
// Pseudocode - implement in your language/framework
async function validateWidgetRequest(req, res, next) {
    try {
        // 1. Extract token and domain
        const token = extractBearerToken(req.headers.authorization);
        const referer = req.headers.referer;
        const domain = extractDomain(referer);
        const clientIP = getClientIP(req);
        
        // 2. Validate token format
        if (!isValidTokenFormat(token)) {
            await logSecurityEvent(token, domain, 'invalid_token', { ip: clientIP });
            return res.status(401).json({ error: 'invalid_token' });
        }
        
        // 3. Check token in database
        const tokenRecord = await db.findToken(token);
        if (!tokenRecord || tokenRecord.revoked) {
            await logSecurityEvent(token, domain, 'invalid_token', { ip: clientIP });
            return res.status(401).json({ error: 'token_not_found_or_revoked' });
        }
        
        // 4. Validate domain matches
        if (domain !== tokenRecord.domain) {
            await logSecurityEvent(token, domain, 'domain_mismatch', { 
                expected: tokenRecord.domain, 
                actual: domain,
                ip: clientIP 
            });
            return res.status(403).json({ error: 'domain_mismatch' });
        }
        
        // 5. Check rate limits
        const rateLimitResult = await checkRateLimit(token, domain);
        if (rateLimitResult.blocked) {
            await logSecurityEvent(token, domain, 'rate_limit', { 
                limit_type: rateLimitResult.limit_type,
                ip: clientIP 
            });
            return res.status(429).json({
                error: 'rate_limit_exceeded',
                message: rateLimitResult.message,
                retry_after: rateLimitResult.retry_after
            });
        }
        
        // 6. Content filtering
        const message = req.body.message;
        const contentCheck = await filterSuspiciousContent(message);
        if (!contentCheck.allowed) {
            await logSecurityEvent(token, domain, 'suspicious_content', { 
                message: message.substring(0, 100),
                reason: contentCheck.reason,
                ip: clientIP 
            });
            return res.status(400).json({ 
                error: 'content_filtered',
                message: contentCheck.reason 
            });
        }
        
        // 7. Update usage counters
        await updateUsageCounters(token, domain);
        
        // 8. Add validated data to request
        req.widgetToken = tokenRecord;
        req.validatedDomain = domain;
        req.clientIP = clientIP;
        
        next();
        
    } catch (error) {
        console.error('Widget validation error:', error);
        res.status(500).json({ error: 'internal_server_error' });
    }
}
```

---

## 🛡️ 3. Rate Limiting & Security Functions

### Rate Limit Check Function
```javascript
async function checkRateLimit(token, domain) {
    const usage = await getUsageData(token, domain);
    const tokenLimits = await getTokenLimits(token);
    const now = Date.now();
    
    // Reset counters if time windows expired
    if (now > usage.minute_reset_at) {
        usage.messages_this_minute = 0;
        usage.minute_reset_at = now + (60 * 1000);
    }
    
    if (now > usage.hour_reset_at) {
        usage.messages_this_hour = 0;
        usage.hour_reset_at = now + (60 * 60 * 1000);
    }
    
    if (now > usage.day_reset_at) {
        usage.messages_today = 0;
        usage.day_reset_at = now + (24 * 60 * 60 * 1000);
    }
    
    // Check limits
    if (usage.messages_this_minute >= tokenLimits.max_messages_per_minute) {
        return {
            blocked: true,
            limit_type: 'per_minute',
            message: 'Too many messages per minute. Please slow down.',
            retry_after: Math.ceil((usage.minute_reset_at - now) / 1000)
        };
    }
    
    if (usage.messages_this_hour >= tokenLimits.max_messages_per_hour) {
        return {
            blocked: true,
            limit_type: 'per_hour',
            message: 'Hourly message limit exceeded.',
            retry_after: Math.ceil((usage.hour_reset_at - now) / 1000)
        };
    }
    
    if (usage.messages_today >= tokenLimits.max_messages_per_day) {
        return {
            blocked: true,
            limit_type: 'per_day',
            message: 'Daily message limit exceeded.',
            retry_after: Math.ceil((usage.day_reset_at - now) / 1000)
        };
    }
    
    // Check message interval
    if (now - usage.last_message_at < tokenLimits.min_message_interval) {
        return {
            blocked: true,
            limit_type: 'interval',
            message: 'Please wait before sending another message.',
            retry_after: Math.ceil((tokenLimits.min_message_interval - (now - usage.last_message_at)) / 1000)
        };
    }
    
    return { blocked: false };
}
```

### Content Filtering Function
```javascript
async function filterSuspiciousContent(message) {
    const suspiciousPatterns = [
        /(?:https?:\/\/|www\.)[^\s]+/gi, // URLs
        /\b(?:spam|bot|hack|exploit|script|eval)\b/gi, // Suspicious keywords
        /(.)\1{10,}/g, // Repeated characters (aaaaaaaaaa)
        /<[^>]*>/g, // HTML tags
        /javascript:/gi, // JavaScript protocol
        /data:/gi, // Data protocol
    ];
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(message)) {
            return { 
                allowed: false, 
                reason: 'Message contains suspicious content' 
            };
        }
    }
    
    // Check message length
    if (message.length > 5000) {
        return { 
            allowed: false, 
            reason: 'Message too long' 
        };
    }
    
    // Check for too many special characters
    const specialCharRatio = (message.match(/[^a-zA-Z0-9\s]/g) || []).length / message.length;
    if (specialCharRatio > 0.5) {
        return { 
            allowed: false, 
            reason: 'Message contains too many special characters' 
        };
    }
    
    return { allowed: true };
}
```

---

## 📊 4. Admin Dashboard API

### Usage Analytics
```http
GET /api/admin/analytics/usage?period=7d&token=optional_token
Authorization: Bearer <admin_token>

Response:
{
    "success": true,
    "data": {
        "total_messages": 15420,
        "unique_domains": 45,
        "active_tokens": 67,
        "blocked_requests": 234,
        "daily_breakdown": [
            { "date": "2024-01-15", "messages": 2100, "blocked": 12 },
            { "date": "2024-01-14", "messages": 1950, "blocked": 8 }
        ],
        "top_domains": [
            { "domain": "customer1.com", "messages": 890, "token": "dwt_abc..." },
            { "domain": "customer2.com", "messages": 654, "token": "dwt_def..." }
        ]
    }
}
```

### Security Events
```http
GET /api/admin/security/events?type=rate_limit&hours=24
Authorization: Bearer <admin_token>

Response:
{
    "success": true,
    "events": [
        {
            "id": 12345,
            "token": "dwt_abc123...",
            "domain": "suspicious-site.com",
            "event_type": "rate_limit",
            "details": { "limit_type": "per_minute" },
            "ip_address": "192.168.1.100",
            "timestamp": "2024-01-15T14:30:00Z"
        }
    ],
    "total": 23
}
```

---

## 🚀 5. Integration with AI Service

### Forward to Existing AI API
```javascript
// After security validation passes
async function handleChatMessage(req, res) {
    try {
        // Extract validated data
        const { message, conversation_id } = req.body;
        const { widgetToken, validatedDomain, clientIP } = req;
        
        // Forward to your existing AI API
        const aiResponse = await fetch('https://aiagent.net2phone.com/api/internal/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.INTERNAL_AI_TOKEN}`,
                'X-Widget-Token': widgetToken.token,
                'X-Domain': validatedDomain,
                'X-Client-IP': clientIP
            },
            body: JSON.stringify({
                message,
                conversation_id,
                domain: validatedDomain,
                widget_settings: widgetToken.settings
            })
        });
        
        const aiData = await aiResponse.json();
        
        if (!aiResponse.ok) {
            throw new Error(`AI API error: ${aiData.error}`);
        }
        
        // Log successful interaction
        await logUsage(widgetToken.token, validatedDomain, {
            message_length: message.length,
            response_length: aiData.response.length,
            conversation_id,
            processing_time: aiData.processing_time
        });
        
        // Return to widget
        res.json({
            success: true,
            response: aiData.response,
            conversation_id: conversation_id,
            usage: await getUsageStatus(widgetToken.token)
        });
        
    } catch (error) {
        console.error('Chat processing error:', error);
        res.status(500).json({ 
            success: false,
            error: 'processing_error',
            message: 'Unable to process your message right now. Please try again.'
        });
    }
}
```

---

## ⚙️ Implementation Requirements

### Environment Variables
```env
# Database
DATABASE_URL=your_database_connection_string
REDIS_URL=your_redis_connection_string

# Security
ADMIN_JWT_SECRET=your_admin_jwt_secret
WIDGET_TOKEN_SECRET=your_widget_token_secret

# AI Integration
AI_API_URL=https://aiagent.net2phone.com/api/internal
AI_API_TOKEN=your_internal_ai_api_token

# Rate Limiting
DEFAULT_RATE_LIMIT_WINDOW=3600 # 1 hour in seconds
DEFAULT_MAX_REQUESTS=50

# Security
SUSPICIOUS_CONTENT_THRESHOLD=0.7
AUTO_BLOCK_AFTER_WARNINGS=3
COOLDOWN_PERIOD_MINUTES=5
```

### Recommended Tech Stack
- **Language**: Node.js, Python, PHP, or Java
- **Framework**: Express.js, FastAPI, Laravel, or Spring Boot  
- **Database**: PostgreSQL or MySQL with Redis for caching
- **Authentication**: JWT tokens for admin API
- **Rate Limiting**: Redis-based counters
- **Monitoring**: Prometheus + Grafana or similar

---

## 🧪 Testing Requirements

### Security Tests
1. **Token Validation**: Test invalid, expired, and revoked tokens
2. **Domain Validation**: Test domain mismatches and spoofing
3. **Rate Limiting**: Test all rate limit scenarios
4. **Content Filtering**: Test malicious content detection
5. **SQL Injection**: Test database query security

### Load Tests
1. **Concurrent Requests**: Test 1000+ simultaneous widget requests
2. **Rate Limit Performance**: Ensure rate limiting doesn't slow normal requests
3. **Database Performance**: Test token lookups and usage updates

### Integration Tests
1. **Widget → API → AI Service** full flow
2. **Admin Dashboard** all CRUD operations
3. **Error Handling** for all failure scenarios

---

## 📚 Documentation Needed

1. **API Documentation** (OpenAPI/Swagger)
2. **Database Migration Scripts**
3. **Deployment Guide** 
4. **Monitoring Setup Guide**
5. **Security Incident Response Procedures**

---

This backend system will provide bulletproof security for your AI chat widgets while maintaining excellent performance and user experience.