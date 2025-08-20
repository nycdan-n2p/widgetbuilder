# 🤖 AI Chat Widget Template

A beautiful, customizable floating chat widget that integrates with Net2Phone's AI Agent platform. Designed for easy embedding and customization by non-technical users.

## ✨ Features

- **🎨 Easy Customization** - Configure colors, position, size, and content without touching code
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices
- **🚀 Modern UI** - Smooth animations, typing indicators, and professional design
- **🛡️ Built-in Spam Protection** - Advanced rate limiting and content filtering to prevent abuse
- **🔧 Zero Dependencies** - Pure HTML, CSS, and JavaScript - no frameworks required
- **⚡ Lightweight** - Fast loading and minimal footprint
- **🎯 Ready to Embed** - Just upload and customize - no complex setup
- **🔒 Domain Security** - Optional domain restrictions for additional security

## 🚀 Quick Start

1. **Download the files**: Copy `index.html` and `widget.js` to your web server
2. **Configure your AI Agent**: Edit the config object in `index.html`
3. **Upload to your website**: Place the files where they can be publicly accessed
4. **Test it out**: Open the page and click the floating chat icon!

## ⚙️ Configuration

### Step 1: Get Your Net2Phone AI Agent Credentials

1. Log into your Net2Phone AI Agent dashboard
2. Navigate to **API Settings** or **Integration**
3. Copy your **API Token** and **API URL**

### Step 2: Configure the Widget

Open `index.html` and modify the `aiWidgetConfig` object:

```javascript
window.aiWidgetConfig = {
    // === AI AGENT SETTINGS ===
    apiToken: 'YOUR_AI_AGENT_API_TOKEN',     // 👈 Add your token here
    apiUrl: 'https://aiagent.net2phone.com', // 👈 Your AI Agent URL
    enabled: true,
    
    // === SPAM PROTECTION SETTINGS ===
    maxMessagesPerMinute: 10,        // Max messages per minute per user
    maxMessagesPerHour: 50,          // Max messages per hour per user
    maxMessageLength: 2000,          // Max characters per message
    minMessageInterval: 2000,        // Min milliseconds between messages (2 sec)
    allowedDomains: [],              // Leave empty to allow all domains
    blockSuspiciousContent: true,    // Enable content filtering
    
    // === WIDGET APPEARANCE ===
    primaryColor: '#4F46E5',        // Main widget color (hex code)
    secondaryColor: '#F3F4F6',      // Background color
    textColor: '#1F2937',           // Text color
    position: 'bottom-right',       // Where to show the widget
    
    // === WIDGET CONTENT ===
    greeting: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    title: 'AI Assistant',
    
    // === SIZE & STYLING ===
    borderRadius: '16px',           // Roundness of corners
    width: '350px',                 // Widget width (desktop)
    height: '500px',                // Widget height (desktop)
    iconSize: '56px',               // Floating button size
    showUnreadBadge: true,          // Show notification badge
};
```

### Step 3: Customize Your Widget

#### 🎨 Colors
Change the look and feel:
- `primaryColor`: Main widget color (header, buttons, user messages)
- `secondaryColor`: Background color of the chat area
- `textColor`: Color of text in AI messages

#### 📍 Position
Choose where the widget appears:
- `'bottom-right'` - Bottom right corner (default)
- `'bottom-left'` - Bottom left corner
- `'top-right'` - Top right corner  
- `'top-left'` - Top left corner

#### 📏 Size
Adjust the dimensions:
- `width`: Chat window width (e.g., '350px', '400px')
- `height`: Chat window height (e.g., '500px', '600px')
- `iconSize`: Floating button size (e.g., '56px', '64px')

#### 💬 Content
Personalize the messages:
- `title`: Header title in the chat window
- `greeting`: First message users see
- `placeholder`: Hint text in the input field

## 🌟 Customization Examples

### Corporate Blue Theme
```javascript
primaryColor: '#1E40AF',
secondaryColor: '#F1F5F9',
title: 'Support Assistant',
greeting: 'Hello! How can we assist you today?'
```

### Friendly Green Theme
```javascript
primaryColor: '#059669',
secondaryColor: '#ECFDF5',
title: 'Help Center',
greeting: 'Hi there! What can I help you with? 😊'
```

### Minimalist Dark Theme
```javascript
primaryColor: '#374151',
secondaryColor: '#F9FAFB',
textColor: '#111827',
title: 'AI Chat'
```

## 🛡️ Spam Protection Features

### Built-in Protection
The widget includes comprehensive spam protection to prevent abuse and protect your API credits:

#### 📊 Rate Limiting
- **Per-minute limits**: Default 10 messages per minute per user
- **Hourly limits**: Default 50 messages per hour per user  
- **Message intervals**: Minimum 2 seconds between messages
- **Auto-blocking**: Temporary blocks for excessive usage

#### 🔍 Content Filtering
- **Message length limits**: Configurable maximum characters
- **Keyword blocking**: Filters spam, inappropriate content, and promotional messages
- **Pattern detection**: Identifies suspicious content like repeated characters or excessive URLs
- **Input sanitization**: Removes potentially malicious content

#### 🌐 Domain Security
- **Domain restrictions**: Optional whitelist of allowed domains
- **Origin validation**: Ensures widget is used only on authorized sites
- **Easy configuration**: Simple array of allowed domains

### Protection Configuration

```javascript
window.aiWidgetConfig = {
    // === SPAM PROTECTION SETTINGS ===
    maxMessagesPerMinute: 10,        // Adjust based on your needs (1-60)
    maxMessagesPerHour: 50,          // Hourly limit (1-200)
    maxMessageLength: 2000,          // Character limit (100-5000)
    minMessageInterval: 2000,        // Milliseconds (1000-10000)
    
    // Domain restrictions (optional)
    allowedDomains: [                // Leave empty [] to allow all
        'yourdomain.com',
        'subdomain.yourdomain.com',
        'anotherdomain.com'
    ],
    
    blockSuspiciousContent: true,    // Enable content filtering
};
```

### Advanced Protection Management

For developers who need more control:

```javascript
// Get current protection status
const status = window.myAIAgentWidget.getProtectionStatus();
console.log('Messages this hour:', status.messagesThisHour);
console.log('Is blocked:', status.isBlocked);

// Update protection settings (advanced users only)
window.myAIAgentWidget.updateProtectionConfig({
    maxMessagesPerMinute: 5,  // More restrictive
    maxMessageLength: 1000    // Shorter messages
});

// Reset protection limits (testing only)
window.myAIAgentWidget.resetProtection();
```

### Protection Recommendations

#### Conservative (High Security)
```javascript
maxMessagesPerMinute: 5,
maxMessagesPerHour: 25,
maxMessageLength: 1000,
minMessageInterval: 5000,
allowedDomains: ['yourdomain.com']
```

#### Balanced (Recommended)
```javascript
maxMessagesPerMinute: 10,
maxMessagesPerHour: 50,
maxMessageLength: 2000,
minMessageInterval: 2000,
allowedDomains: []  // Allow all domains
```

#### Permissive (Low Restrictions)
```javascript
maxMessagesPerMinute: 20,
maxMessagesPerHour: 100,
maxMessageLength: 3000,
minMessageInterval: 1000,
allowedDomains: []
```

## 🔧 Integration Guide

### For Website Owners

1. **Host the files**: Upload `index.html` and `widget.js` to your web server
2. **Test locally**: Open `index.html` in your browser to test
3. **Embed in existing sites**: Copy the widget HTML and scripts to your existing pages

### For Developers

The widget can be easily integrated into existing websites:

```html
<!-- Add this to your existing HTML pages -->
<script>
    window.aiWidgetConfig = {
        // Your configuration here
    };
</script>

<!-- Copy the widget HTML structure -->
<div id="aiWidget">
    <!-- Widget HTML from index.html -->
</div>

<!-- Include the widget scripts -->
<script>
    // Widget JavaScript from index.html
</script>
<script src="widget.js"></script>
```

## 📱 Mobile Optimization

The widget automatically adapts to mobile devices:
- Full-screen chat on smaller screens
- Touch-friendly button sizes
- Responsive text and spacing
- Optimized keyboard interactions

## 🛠️ Advanced Customization

### Custom CSS
Add your own styles by modifying the CSS variables:

```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-background;
    --border-radius: 20px;
}
```

### API Integration
The widget uses your existing `widget.js` file for Net2Phone AI Agent integration. The chat interface connects automatically when users send messages.

### Event Handling
The widget fires events you can listen for:

```javascript
// Listen for widget open/close
document.addEventListener('ai-widget-toggle', function(e) {
    console.log('Widget is now:', e.detail.isOpen ? 'open' : 'closed');
});
```

## 🚨 Troubleshooting

### Widget Not Appearing
- Check that both `index.html` and `widget.js` are uploaded
- Verify your API token and URL are correct
- Ensure `enabled: true` in your config
- Check browser console for JavaScript errors

### Messages Not Sending
- Verify your Net2Phone AI Agent API token
- Check the browser console for error messages  
- Confirm your API URL is accessible
- Ensure domain is in `allowedDomains` list (if configured)

### Rate Limiting Issues
- Check if you're hitting message limits with `getProtectionStatus()`
- Adjust rate limits in configuration if needed
- Wait for rate limit reset (shown in error messages)
- Use `resetProtection()` for testing only

### Blocked Messages
- Review message content for blocked keywords
- Check message length against `maxMessageLength`
- Ensure messages aren't too short or repetitive
- Verify `minMessageInterval` time has passed

### Domain Restrictions
- Add your domain to `allowedDomains` array
- Include subdomains if needed
- Check exact domain name spelling
- Leave array empty `[]` to allow all domains

### Styling Issues
- Clear your browser cache
- Check that CSS custom properties are supported
- Verify color codes are valid hex values

## 📚 API Reference

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiToken` | string | required | Your Net2Phone AI Agent API token |
| `apiUrl` | string | required | Your AI Agent API endpoint |
| `enabled` | boolean | true | Enable/disable the AI agent |
| `maxMessagesPerMinute` | number | 10 | Rate limit per minute (1-60) |
| `maxMessagesPerHour` | number | 50 | Rate limit per hour (1-200) |
| `maxMessageLength` | number | 2000 | Max characters per message |
| `minMessageInterval` | number | 2000 | Min milliseconds between messages |
| `allowedDomains` | array | [] | Allowed domains (empty = all) |
| `blockSuspiciousContent` | boolean | true | Enable content filtering |
| `primaryColor` | string | '#4F46E5' | Main widget color |
| `position` | string | 'bottom-right' | Widget position |
| `width` | string | '350px' | Desktop widget width |
| `height` | string | '500px' | Desktop widget height |
| `title` | string | 'AI Assistant' | Widget header title |
| `greeting` | string | 'Hi! How can I help...' | Initial AI message |

## 🤝 Support

Need help? Here are your options:

1. **Documentation**: Check this README for common questions
2. **Net2Phone Support**: Contact Net2Phone for AI Agent API issues
3. **GitHub Issues**: Report bugs or request features

## 📄 License

This template is provided as-is for integration with Net2Phone AI Agent services.

---

**Made with ❤️ for easy AI Agent integration**