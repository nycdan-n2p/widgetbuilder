# AI Chat Widget System - Developer Documentation

A complete AI chat widget solution with hosted architecture, visual builder, and comprehensive security features.

## 📋 Overview

This system allows customers to easily embed AI chat widgets on their websites with just a small configuration code. The widget connects to your AI API, includes spam protection, and provides a beautiful customizable interface.

## 🏗️ Architecture

### Hosted Widget Model
- **Core functionality** is hosted on your servers (`http://aiagent.net2phone.com/widget.js`)
- **Customer websites** only need to paste a small configuration script
- **Automatic updates** - all widgets get improvements instantly
- **Centralized control** - manage security and features from one place

## 📁 File Structure

### Core Files (Required for Production)

#### 1. `production-widget.js` ⭐ **CRITICAL**
**Purpose**: The complete widget functionality that customers load from your server
**Deploy to**: `http://aiagent.net2phone.com/widget.js`
**Contains**:
- Full widget UI and functionality
- API communication with your AI service
- Comprehensive spam protection and rate limiting
- Domain validation and security enforcement
- Auto-updating features

#### 2. `builder.html` + `builder.js` ⭐ **REQUIRED**
**Purpose**: Admin interface for creating customized widgets
**Deploy to**: Your admin dashboard or internal tools
**Features**:
- Visual theme selection (6 preset themes + custom colors)
- Domain management with secure token generation
- Live preview functionality
- Security settings configuration
- Clean code generation for customers

### Development Files (Reference Only)

#### 3. `index.html`
**Purpose**: Original demo/prototype file
**Status**: ⚠️ Reference only - superseded by hosted architecture

#### 4. `widget.js` (original)
**Purpose**: Builder's logic (not the customer widget)
**Status**: ⚠️ Superseded by `production-widget.js`

#### 5. `mockup-builder.html`
**Purpose**: Design mockup from development process
**Status**: ⚠️ Reference only

## 🚀 Deployment Instructions

### Step 1: Deploy the Core Widget
```bash
# Upload production-widget.js to your server
scp production-widget.js user@server:/path/to/widget.js
# Ensure it's accessible at: http://aiagent.net2phone.com/widget.js
```

### Step 2: Deploy the Builder Interface
```bash
# Upload builder files to your admin area
scp builder.html builder.js user@server:/path/to/admin/
# Access via: https://youradmin.com/widget-builder/
```

### Step 3: Verify Deployment
1. Test widget loads: `curl http://aiagent.net2phone.com/widget.js`
2. Test builder interface opens correctly
3. Generate test widget code and verify it works

## 🛡️ Security Features

### Enforced Limits (Cannot be overridden by customers)
- **Messages per minute**: 1-20 (default: 10)
- **Messages per hour**: 5-100 (default: 50)  
- **Messages per day**: 10-500 (default: 200)
- **Message cooldown**: 1-10 seconds (default: 2s)
- **Conversation length**: 10-200 messages (default: 100)
- **Session timeout**: 10-120 minutes (default: 30min)

### Progressive Protection
1. Rate limiting with friendly warnings
2. Content filtering (URLs, HTML, suspicious patterns)
3. 3-strike warning system
4. Temporary blocks (5-minute cooldowns)
5. Automatic session resets
6. Domain validation

## 👥 Customer Integration

### What Customers Get
A simple configuration script (30-50 lines) that includes:
```html
<script>
window.aiWidgetConfig = {
    apiToken: 'domain-specific-token',
    primaryColor: '#667eea',
    greeting: 'Hi! How can I help?',
    // ... their custom settings
};
// Loads your hosted widget
var script = document.createElement('script');
script.src = 'http://aiagent.net2phone.com/widget.js';
document.head.appendChild(script);
</script>
```

### Benefits for Customers
- ✅ **One-code paste** - just add before `</body>`
- ✅ **No file hosting** - everything loads from your servers
- ✅ **Auto-updates** - always get latest features
- ✅ **Mobile responsive** - works on all devices
- ✅ **Spam protected** - built-in abuse prevention

## 🔧 Customization Options

### Themes
- **Default**: Blue gradient theme
- **Dark**: Professional dark mode
- **Ocean**: Cyan/blue water theme
- **Glassmorphic**: Modern frosted glass effect
- **Sunset**: Warm amber/yellow theme
- **Forest**: Natural green theme
- **Custom**: Full color customization

### Widget Styles
- **Modern**: Clean rounded corners (16px)
- **Rounded**: Extra rounded for friendly feel (24px)
- **Minimal**: Sharp, clean lines (8px)
- **Glassmorphic**: Frosted glass with backdrop blur

### Positioning
- Bottom right (default)
- Bottom left
- Top right
- Top left

## 🔌 API Integration

### Required Endpoints
Your AI service needs to handle:
```
POST https://aiagent.net2phone.com/api/chat
```

### Request Format
```json
{
    "message": "User's message",
    "conversation_id": "unique_session_id",
    "domain": "customer-website.com"
}
```

### Response Format
```json
{
    "response": "AI's response message",
    "success": true
}
```

## 🔑 Token Management

### Domain-Specific Tokens
- Format: `dwt_[timestamp]_[domain_hash]_[random]`
- Example: `dwt_lm2a3x4b_ZXhhbX_k8n9m2q`
- Each domain gets unique tokens
- Tokens are validated server-side

### Security Benefits
- Prevents token reuse across domains
- Easy to revoke access per domain
- Tracks usage by customer
- Prevents unauthorized embedding

## 📊 Monitoring & Analytics

### Trackable Events
- Widget loads per domain
- Message volume by customer
- Rate limiting triggers
- Security violations
- API errors

### Recommended Logging
```javascript
// Log these events from production-widget.js
- Widget initialization
- Domain validation failures  
- Rate limit violations
- Security blocks
- API communication errors
```

## 🚨 Troubleshooting

### Common Issues

#### Widget Not Loading
1. Check if `widget.js` is accessible
2. Verify domain is in `allowedDomains` array
3. Check browser console for errors

#### API Errors
1. Verify API endpoint is responding
2. Check token format and validity
3. Confirm domain matches token

#### Rate Limiting Issues
1. Check security settings in builder
2. Verify limits are within acceptable ranges
3. Monitor for unusual traffic patterns

## 🔄 Updates & Maintenance

### Updating the Widget
1. Test changes locally
2. Deploy new `production-widget.js`
3. All customer widgets update automatically
4. Monitor for any issues

### Adding Features
1. Add to `production-widget.js`
2. Update builder interface if needed
3. Document new configuration options
4. Test with existing customer configs

## 📝 Development Notes

### Widget Builder Logic Flow
1. User configures settings in builder interface
2. Domain-specific tokens generated automatically  
3. Configuration code generated with security limits
4. Customer pastes code → loads hosted widget
5. Widget validates domain and initializes

### Security Implementation
- Client-side validation for UX
- Server-side enforcement for security
- Progressive warnings before blocking
- Automatic recovery mechanisms

## 🎯 Next Steps

### Recommended Enhancements
- [ ] Analytics dashboard for usage monitoring
- [ ] Webhook notifications for security events
- [ ] A/B testing framework for widget variations
- [ ] White-label builder interface for resellers
- [ ] Advanced conversation flow management

### Scaling Considerations
- CDN distribution for `widget.js`
- Load balancing for API endpoints
- Rate limiting at infrastructure level
- Database optimization for token validation

---

## 📞 Support

For technical questions about this implementation:
- Review the code comments in `production-widget.js`
- Check browser console for error messages
- Test with the builder interface first
- Monitor server logs for API issues