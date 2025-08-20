# Backend API Requirements for AI Chat Widget System

## 📋 Overview

**UPDATED FOR SECURITY**: The widget frontend has been updated to eliminate client-side token exposure and implement proper server-side security validation. This document outlines the required backend components for a secure implementation.

## 🔒 Security Model

**CRITICAL**: The new security model eliminates client-side tokens and relies entirely on server-side validation:

- **No client tokens**: Widgets authenticate via domain validation only
- **Server-side security**: All rate limiting, domain validation, and security checks happen server-side
- **Immutable config**: Widget configuration is protected from client-side tampering
- **HTTPS only**: All communication is encrypted
- **SRI protection**: Hosted widgets use Subresource Integrity

## 🎯 Required Components

### 1. Domain-Based Authentication System
### 2. Widget Chat API with Security
### 3. Rate Limiting & Abuse Prevention  
### 4. Admin Dashboard API
### 5. Analytics & Monitoring
### 6. Production Security Requirements

---

## 🔑 1. Domain-Based Authentication System

### Database Schema

#### `widget_configs` Table (Replaces token-based system)
```sql
CREATE TABLE widget_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    widget_id VARCHAR(64) UNIQUE NOT NULL,
    widget_name VARCHAR(255) NOT NULL,
    
    -- Owner/admin info
    user_id BIGINT NOT NULL,
    agent_id VARCHAR(64) NOT NULL,
    
    -- Security: domain allowlist (NO TOKENS)
    allowed_domains JSON NOT NULL, -- Array of authorized domains
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Security limits (enforced server-side ONLY)
    max_messages_per_minute INT DEFAULT 10 CHECK (max_messages_per_minute > 0),
    max_messages_per_hour INT DEFAULT 600 CHECK (max_messages_per_hour >= max_messages_per_minute * 60),
    max_messages_per_day INT DEFAULT 1000,
    max_message_length INT DEFAULT 2000,
    min_message_interval INT DEFAULT 2000, -- milliseconds
    max_conversation_length INT DEFAULT 100,
    session_timeout_minutes INT DEFAULT 30,
    
    -- Widget customization
    settings JSON, -- Store widget appearance/config
    
    INDEX idx_widget_id (widget_id),
    INDEX idx_user_id (user_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_active (is_active),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE RESTRICT
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

#### Create Widget Configuration
```http
POST /api/admin/widgets
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "widget_id": "widget_abc123_def456",
    "widget_name": "Customer Support Widget",
    "agent_id": "boss-support",
    "allowed_domains": ["customer-website.com", "app.customer.com"],
    "settings": {
        "maxMessagesPerHour": 600,
        "maxMessagesPerDay": 1000,
        "primaryColor": "#667eea",
        "greeting": "Hi! How can I help?",
        // ... other widget settings
    }
}

Response:
{
    "success": true,
    "widget_id": "widget_abc123_def456",
    "allowed_domains": ["customer-website.com", "app.customer.com"],
    "created_at": "2024-01-15T10:30:00Z"
}
```

#### List Widget Configurations
```http
GET /api/admin/widgets?user_id=123&page=1&limit=50
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

**SECURITY CRITICAL**: No tokens in requests. Domain validation and rate limiting enforced server-side.

### Main Chat Endpoint
```http
POST /api/chat
Content-Type: application/json
Origin: https://customer-website.com
Referer: https://customer-website.com
X-Widget-ID: widget_abc123_def456

{
    "message": "Hello, I need help with my order",
    "conversation_id": "conv_1642251000_abc123",
    "widget_id": "widget_abc123_def456"
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

### Security Validation (CRITICAL - Server-Side Only)
```javascript
// Pseudocode - implement in your language/framework
async function validateWidgetRequest(req, res, next) {
    try {
        // 1. Extract domain and widget info
        const widgetId = req.body.widget_id || req.headers['x-widget-id'];
        const origin = req.headers.origin;
        const referer = req.headers.referer;
        const domain = extractDomain(origin || referer);
        const clientIP = getClientIP(req);
        
        // 2. Validate widget ID format
        if (!isValidWidgetId(widgetId)) {
            await logSecurityEvent(null, domain, 'invalid_widget_id', { ip: clientIP, widget_id: widgetId });
            return res.status(400).json({ error: 'invalid_widget_id' });
        }
        
        // 3. Find widget configuration in database
        const widgetConfig = await db.findWidgetConfig(widgetId);
        if (!widgetConfig || !widgetConfig.is_active) {
            await logSecurityEvent(widgetId, domain, 'widget_not_found', { ip: clientIP });
            return res.status(404).json({ error: 'widget_not_found_or_inactive' });
        }
        
        // 4. Validate domain is in allowlist (CRITICAL SECURITY)
        const isAllowedDomain = widgetConfig.allowed_domains.some(allowedDomain => {
            // Exact match or subdomain match
            return domain === allowedDomain || domain.endsWith('.' + allowedDomain);
        });
        
        if (!isAllowedDomain) {
            await logSecurityEvent(widgetId, domain, 'domain_not_allowed', { 
                allowed_domains: widgetConfig.allowed_domains, 
                actual_domain: domain,
                ip: clientIP 
            });
            return res.status(403).json({ error: 'domain_not_authorized' });
        }
        
        // 5. Check rate limits (SERVER ENFORCED)
        const rateLimitResult = await checkRateLimit(widgetId, domain, widgetConfig);
        if (rateLimitResult.blocked) {
            await logSecurityEvent(widgetId, domain, 'rate_limit', { 
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
        if (message.length > widgetConfig.max_message_length) {
            await logSecurityEvent(widgetId, domain, 'message_too_long', { 
                length: message.length,
                max_allowed: widgetConfig.max_message_length,
                ip: clientIP 
            });
            return res.status(400).json({ error: 'message_too_long' });
        }
        
        const contentCheck = await filterSuspiciousContent(message);
        if (!contentCheck.allowed) {
            await logSecurityEvent(widgetId, domain, 'suspicious_content', { 
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
        await updateUsageCounters(widgetId, domain);
        
        // 8. Add validated data to request
        req.widgetConfig = widgetConfig;
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

## 🛡️ 6. Production Security Requirements

**CRITICAL**: These security measures must be implemented during deployment to ensure production-ready security.

### 6.1 Infrastructure Security

#### Required Security Headers
```nginx
# Nginx configuration example
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://aiagent.net2phone.com; connect-src 'self' https://aiagent.net2phone.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

#### TLS Configuration
```nginx
# Minimum TLS 1.2, prefer TLS 1.3
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:MozTLS:10m;
ssl_session_tickets off;
```

### 6.2 Application Security

#### CSRF Protection
```javascript
// Add CSRF middleware to all state-changing endpoints
app.use('/api', csrfProtection);

// For CORS requests, use SameSite cookies
app.use(session({
  cookie: {
    sameSite: 'strict',
    secure: true, // HTTPS only
    httpOnly: true
  }
}));
```

#### Input Validation Schema
```javascript
// Example validation schema for chat endpoint
const chatSchema = {
  widget_id: {
    type: 'string',
    pattern: '^widget_[a-z0-9_]{12,64}$',
    maxLength: 100
  },
  message: {
    type: 'string',
    minLength: 1,
    maxLength: 2000,
    sanitize: true
  },
  conversation_id: {
    type: 'string',
    pattern: '^conv_[a-z0-9_]{12,64}$',
    maxLength: 100
  }
};
```

### 6.3 Security Monitoring & Alerting

#### Required Security Events to Monitor
```yaml
# Security events that MUST trigger alerts
critical_events:
  - rate_limit_exceeded: > 100 events/minute
  - domain_not_allowed: > 50 events/minute  
  - suspicious_content: > 10 events/minute
  - widget_not_found: > 200 events/minute
  - message_too_long: > 50 events/minute
  - multiple_failed_validations: > 5 from same IP/minute

# Log aggregation required
log_destinations:
  - SIEM system (Splunk/ELK)
  - Security monitoring (DataDog/NewRelic)
  - Incident response system
```

#### Real-time Monitoring Dashboard
```javascript
// Required monitoring metrics
const securityMetrics = {
  // Rate limiting effectiveness
  'rate_limit.blocked_requests_per_minute': 'counter',
  'rate_limit.legitimate_requests_per_minute': 'counter',
  
  // Domain validation
  'domain.validation_failures_per_minute': 'counter',
  'domain.new_unauthorized_domains': 'counter',
  
  // Content filtering
  'content.suspicious_messages_blocked': 'counter',
  'content.false_positive_rate': 'gauge',
  
  // System security
  'security.failed_authentications': 'counter',
  'security.anomalous_traffic_patterns': 'gauge'
};
```

### 6.4 Incident Response Procedures

#### Security Incident Runbook
```markdown
## SECURITY INCIDENT RESPONSE PLAN

### Level 1: Automated Response (< 1 minute)
1. Rate limiting triggered → Block IP/domain automatically
2. Suspicious content detected → Block message, log details
3. Domain validation failure → Reject request, alert security team

### Level 2: Manual Investigation (< 15 minutes) 
1. Review security event logs
2. Analyze attack patterns
3. Determine if additional blocking needed
4. Notify stakeholders if widespread

### Level 3: Security Breach (< 1 hour)
1. Activate incident response team
2. Preserve evidence and logs
3. Implement emergency blocks
4. Notify legal/compliance teams
5. Begin forensic analysis

### Communication Plan
- Internal: Slack #security-incidents
- External: security@company.com  
- Escalation: CISO within 2 hours
```

### 6.5 Data Privacy & Compliance

#### GDPR/CCPA Requirements
```sql
-- Data retention policies
CREATE EVENT gdpr_cleanup
ON SCHEDULE EVERY 24 HOUR
DO
  DELETE FROM chat_conversations 
  WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND user_consent_withdrawn = 1;

-- User data export capability
CREATE PROCEDURE export_user_data(user_domain VARCHAR(255))
BEGIN
  SELECT * FROM chat_conversations WHERE domain = user_domain;
  SELECT * FROM usage_tracking WHERE domain = user_domain;
END;
```

#### Privacy-by-Design Implementation
```javascript
// Automatic PII detection and removal
function sanitizeMessage(message) {
  // Remove email addresses
  message = message.replace(/\S+@\S+\.\S+/g, '[EMAIL_REDACTED]');
  
  // Remove phone numbers
  message = message.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
  
  // Remove credit card numbers
  message = message.replace(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, '[CC_REDACTED]');
  
  return message;
}
```

### 6.6 Dependency Security

#### Required Security Scanning
```yaml
# GitHub Actions workflow for security scanning
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run dependency audit
        run: npm audit --audit-level=moderate
      - name: Run SAST scan
        uses: github/codeql-action/analyze@v2
      - name: Run container scan
        uses: anchore/scan-action@v3
```

#### Dependency Management Policy
```json
{
  "security_policy": {
    "allowed_licenses": ["MIT", "Apache-2.0", "BSD-3-Clause"],
    "blocked_packages": ["lodash <4.17.19", "moment <2.29.2"],
    "vulnerability_threshold": "moderate",
    "auto_update": {
      "security_updates": true,
      "major_versions": false
    }
  }
}
```

### 6.7 Deployment Security Checklist

#### Pre-Deployment Security Verification
- [ ] All security headers configured
- [ ] TLS 1.3 enabled with strong cipher suites
- [ ] CSRF protection enabled on all endpoints
- [ ] Input validation implemented for all endpoints
- [ ] Rate limiting configured and tested
- [ ] Security monitoring alerts configured
- [ ] Incident response procedures documented
- [ ] PII detection and removal implemented
- [ ] Dependency vulnerabilities resolved
- [ ] Security penetration testing completed
- [ ] GDPR/CCPA compliance verified
- [ ] Backup and disaster recovery tested
- [ ] Security audit logs configured
- [ ] Error messages sanitized (no info disclosure)
- [ ] Database queries parameterized (no SQL injection)
- [ ] File upload restrictions implemented (if applicable)

#### Post-Deployment Security Monitoring
- [ ] Security dashboard operational
- [ ] Alerting system tested and functional
- [ ] Log aggregation working
- [ ] Incident response team briefed
- [ ] Regular security review schedule established
- [ ] Vulnerability scanning automated
- [ ] Security metrics baseline established

---

**⚠️ WARNING**: Do not deploy to production without implementing ALL security requirements above. This system handles user data and API access - security is not optional.

---

This backend system will provide bulletproof security for your AI chat widgets while maintaining excellent performance and user experience.