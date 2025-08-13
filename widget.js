// widget.js - Self-contained AI Agent Integration Widget with Spam Protection

(function() {
  // Ensure the widget is not loaded multiple times
  if (window.myAIAgentWidget) {
    console.warn('myAIAgentWidget already loaded. Skipping.');
    return;
  }

  // --- Spam Protection & Rate Limiting ---
  const protectionConfig = {
    maxMessagesPerMinute: 10,        // Max messages per minute per session
    maxMessagesPerHour: 50,          // Max messages per hour per session
    maxMessageLength: 2000,          // Max characters per message
    minMessageInterval: 2000,        // Min milliseconds between messages (2 seconds)
    blockedKeywords: [               // Spam/inappropriate content keywords
      'viagra', 'casino', 'lottery', 'crypto', 'bitcoin', 'investment',
      'make money', 'get rich', 'free money', 'click here', 'buy now'
    ],
    allowedDomains: [],              // Empty = allow all, populate to restrict
    suspiciousPatterns: [
      /^.{1,3}$/,                    // Too short messages
      /^(.)\1{10,}$/,                // Repeated characters
      /https?:\/\/[^\s]+/gi,        // URLs (configurable)
      /[0-9]{10,}/,                  // Long number sequences
    ]
  };

  // Rate limiting storage
  const rateLimits = {
    messageHistory: [],
    lastMessageTime: 0,
    hourlyCount: 0,
    hourlyResetTime: Date.now() + 3600000,
    blockedUntil: 0,
    warningCount: 0
  };

  // --- Configuration ---
  // Users must define window.myAIAgentConfig before including this script.
  // Example:
  // window.myAIAgentConfig = {
  //   apiToken: 'YOUR_AI_AGENT_API_TOKEN',
  //   apiUrl: 'https://aiagent.net2phone.com', // Or your custom AI agent URL
  //   enabled: true // Set to true to enable AI agent functionality
  // };

  // --- Protection Utility Functions ---

  /**
   * Validates if the current domain is allowed
   * @returns {boolean} True if domain is allowed
   */
  function validateDomain() {
    if (protectionConfig.allowedDomains.length === 0) return true;
    const currentDomain = window.location.hostname.toLowerCase();
    return protectionConfig.allowedDomains.some(domain => 
      currentDomain === domain.toLowerCase() || 
      currentDomain.endsWith('.' + domain.toLowerCase())
    );
  }

  /**
   * Checks if message contains blocked keywords or suspicious patterns
   * @param {string} message The message to validate
   * @returns {object} Validation result with isValid and reason
   */
  function validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { isValid: false, reason: 'Invalid message format' };
    }

    // Check message length
    if (message.length > protectionConfig.maxMessageLength) {
      return { isValid: false, reason: 'Message too long' };
    }

    if (message.trim().length < 1) {
      return { isValid: false, reason: 'Message too short' };
    }

    const lowerMessage = message.toLowerCase();

    // Check for blocked keywords
    for (const keyword of protectionConfig.blockedKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return { isValid: false, reason: 'Message contains inappropriate content' };
      }
    }

    // Check for suspicious patterns
    for (const pattern of protectionConfig.suspiciousPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, reason: 'Message appears to be spam' };
      }
    }

    return { isValid: true };
  }

  /**
   * Checks rate limits for the current session
   * @returns {object} Rate limit result with isAllowed and reason
   */
  function checkRateLimit() {
    const now = Date.now();
    
    // Check if currently blocked
    if (rateLimits.blockedUntil > now) {
      const remainingSeconds = Math.ceil((rateLimits.blockedUntil - now) / 1000);
      return { isAllowed: false, reason: `Temporarily blocked. Try again in ${remainingSeconds} seconds.` };
    }

    // Reset hourly counter if needed
    if (now > rateLimits.hourlyResetTime) {
      rateLimits.hourlyCount = 0;
      rateLimits.hourlyResetTime = now + 3600000;
    }

    // Check minimum interval between messages
    if (now - rateLimits.lastMessageTime < protectionConfig.minMessageInterval) {
      const waitTime = Math.ceil((protectionConfig.minMessageInterval - (now - rateLimits.lastMessageTime)) / 1000);
      return { isAllowed: false, reason: `Please wait ${waitTime} seconds between messages.` };
    }

    // Check hourly limit
    if (rateLimits.hourlyCount >= protectionConfig.maxMessagesPerHour) {
      return { isAllowed: false, reason: 'Hourly message limit reached. Please try again later.' };
    }

    // Check per-minute rate (last 60 seconds)
    const oneMinuteAgo = now - 60000;
    const recentMessages = rateLimits.messageHistory.filter(time => time > oneMinuteAgo);
    
    if (recentMessages.length >= protectionConfig.maxMessagesPerMinute) {
      // Apply temporary block for excessive requests
      rateLimits.warningCount++;
      if (rateLimits.warningCount >= 3) {
        rateLimits.blockedUntil = now + 300000; // 5 minute block
        return { isAllowed: false, reason: 'Too many messages. Blocked for 5 minutes.' };
      }
      return { isAllowed: false, reason: 'Rate limit exceeded. Please slow down.' };
    }

    return { isAllowed: true };
  }

  /**
   * Records a message in the rate limiting system
   */
  function recordMessage() {
    const now = Date.now();
    rateLimits.messageHistory.push(now);
    rateLimits.lastMessageTime = now;
    rateLimits.hourlyCount++;
    
    // Clean old entries (keep only last hour)
    const oneHourAgo = now - 3600000;
    rateLimits.messageHistory = rateLimits.messageHistory.filter(time => time > oneHourAgo);
  }

  /**
   * Sanitizes user input to prevent injection attacks
   * @param {string} input The input to sanitize
   * @returns {string} Sanitized input
   */
  function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters and normalize
    return input
      .replace(/[<>"'&]/g, '') // Remove HTML/script chars
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim()
      .substring(0, protectionConfig.maxMessageLength); // Enforce length limit
  }

  // --- Utility Functions ---

  /**
   * Generates a unique session ID.
   * @returns {string} A unique session ID.
   */
  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Formats the AI response by embedding YouTube links and converting other URLs to clickable links.
   * This logic is adapted from the Netlify Edge Function.
   * @param {string} response The raw AI response string.
   * @returns {string} The formatted HTML string.
   */
  function formatResponse(response) {
    if (!response) return '';

    // First, handle YouTube URLs (with or without parentheses) and embed them
    // Updated to handle spaces between parentheses and URL
    const YOUTUBE_REGEX = /(\(\s*)?https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]{11})(\s*\))?/g;
    let formattedResponse = response.replace(YOUTUBE_REGEX, (match, openParen, id, closeParen) =>
      `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="pointer-events: auto !important; z-index: 9999 !important; border: none; outline: none;"></iframe>`
    );

    // Then, convert remaining URLs in parentheses to clickable links that open in new tab
    const URL_IN_PARENS_REGEX = /\(\s*(https?:\/\/[^\s\)]+)\s*\)/g;
    formattedResponse = formattedResponse.replace(URL_IN_PARENS_REGEX, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Finally, convert any remaining URLs (without parentheses) to clickable links that open in new tab
    // But exclude URLs that are already inside HTML attributes (like iframe src)
    const REMAINING_URL_REGEX = /(?<!src="|href=")https?:\/\/[^\s<"]+(?!")/g;
    formattedResponse = formattedResponse.replace(REMAINING_URL_REGEX, '<a href="$&" target="_blank" rel="noopener noreferrer">$&</a>');

    return formattedResponse;
  }

  // --- Main AI Agent Widget Logic ---

  /**
   * Sends a message to the configured AI agent and returns its response.
   * @param {string} message The user's message to send to the AI agent.
   * @param {string} [sessionId] Optional session ID for conversation continuity. If not provided, a new one will be generated.
   * @returns {Promise<string>} A promise that resolves with the formatted AI agent's response.
   * @throws {Error} If the AI agent is not configured, or if the API call fails.
   */
  async function sendAIAgentMessage(message, sessionId) {
    const config = window.myAIAgentConfig;

    if (!config || !config.enabled || !config.apiToken || !config.apiUrl) {
      throw new Error('AI agent is not configured. Please define window.myAIAgentConfig with apiToken, apiUrl, and enabled: true.');
    }

    // --- SPAM PROTECTION CHECKS ---
    
    // 1. Validate domain
    if (!validateDomain()) {
      throw new Error('Widget not authorized for this domain.');
    }

    // 2. Sanitize input
    const sanitizedMessage = sanitizeInput(message);
    
    // 3. Validate message content
    const messageValidation = validateMessage(sanitizedMessage);
    if (!messageValidation.isValid) {
      throw new Error(messageValidation.reason);
    }

    // 4. Check rate limits
    const rateCheck = checkRateLimit();
    if (!rateCheck.isAllowed) {
      throw new Error(rateCheck.reason);
    }

    // 5. Record this message attempt
    recordMessage();

    const currentSessionId = sessionId || generateSessionId();

    // You can add more context data here if needed for your AI agent
    const contextData = {
      domain: window.location.hostname,
      timestamp: new Date().toISOString(),
      // Add any other relevant context for your AI agent
    };

    const requestBody = {
      message: sanitizedMessage, // Use sanitized message
      session_id: currentSessionId,
      stored_values: {
        ...contextData,
        widget_version: '2.0.0-protected',
        protection_enabled: true,
        message_count: rateLimits.hourlyCount
      },
      stream: false, // Assuming non-streaming for simplicity
    };

    // Smart URL handling - remove /api if it exists, then add /api/chat
    const cleanBaseUrl = config.apiUrl.replace(/\/api\/?$/, '');
    const apiUrl = `${cleanBaseUrl}/api/chat`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `AI agent error: ${response.status}`;
        if (response.status === 401) {
          errorMessage = 'Invalid AI agent token. Please check your configuration.';
        } else if (response.status === 403) {
          errorMessage = 'AI agent usage limits exceeded.';
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        }
        const errorText = await response.text();
        console.error('AI agent API response error:', errorText);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiMessage = data.message || 'I apologize, but I encountered an issue processing your request.';

      // Apply formatting to the AI's response
      return formatResponse(aiMessage);

    } catch (error) {
      console.error('AI agent connection failed:', error);
      throw new Error(`AI agent connection failed: ${error.message || 'Unknown error'}`);
    }
  }

  // Expose the public API
  window.myAIAgentWidget = {
    sendMessage: sendAIAgentMessage,
    
    // Protection configuration methods (for advanced users)
    updateProtectionConfig: function(newConfig) {
      if (typeof newConfig === 'object') {
        Object.assign(protectionConfig, newConfig);
        console.log('Protection config updated:', protectionConfig);
      }
    },
    
    getProtectionStatus: function() {
      const now = Date.now();
      return {
        messagesThisHour: rateLimits.hourlyCount,
        maxHourly: protectionConfig.maxMessagesPerHour,
        isBlocked: rateLimits.blockedUntil > now,
        blockedUntil: rateLimits.blockedUntil > now ? new Date(rateLimits.blockedUntil) : null,
        lastMessage: rateLimits.lastMessageTime ? new Date(rateLimits.lastMessageTime) : null,
        warningCount: rateLimits.warningCount
      };
    },
    
    resetProtection: function() {
      if (confirm('Are you sure you want to reset protection limits? This should only be used for testing.')) {
        rateLimits.messageHistory = [];
        rateLimits.hourlyCount = 0;
        rateLimits.blockedUntil = 0;
        rateLimits.warningCount = 0;
        console.log('Protection limits reset');
      }
    }
  };

  console.log('AI Agent Widget loaded successfully with spam protection enabled.');
  console.log('Protection config:', {
    maxPerMinute: protectionConfig.maxMessagesPerMinute,
    maxPerHour: protectionConfig.maxMessagesPerHour,
    domainRestricted: protectionConfig.allowedDomains.length > 0,
    allowedDomains: protectionConfig.allowedDomains
  });

})();
 