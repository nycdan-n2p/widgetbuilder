/**
 * AI Chat Widget - Core Library
 * Hosted at: http://aiagent.net2phone.com/widget.js
 * Version: 1.0.0
 */

(function() {
    'use strict';
    
    // Prevent multiple initialization
    if (window.AIChatWidget) return;
    
    class AIChatWidget {
        constructor(config) {
            this.config = {
                // Default configuration
                apiUrl: 'https://aiagent.net2phone.com',
                primaryColor: '#667eea',
                secondaryColor: '#f3f4f6',
                backgroundColor: '#ffffff',
                textColor: '#1f2937',
                position: 'bottom-right',
                greeting: 'Hi! How can I help you today?',
                placeholder: 'Type your message...',
                title: 'AI Assistant',
                borderRadius: '16px',
                width: '350px',
                height: '500px',
                iconSize: '56px',
                widgetStyle: 'modern',
                showUnreadBadge: true,
                
                // Spam protection defaults (with enforced limits)
                maxMessagesPerMinute: 10,
                maxMessagesPerHour: 50,
                maxMessageLength: 2000,
                minMessageInterval: 2000,
                maxConversationLength: 100,
                maxDailyMessages: 200,
                blockSuspiciousContent: true,
                suspiciousContentThreshold: 0.7,
                autoBlockAfterWarnings: 3,
                sessionTimeoutMinutes: 30,
                cooldownPeriodMinutes: 5,
                
                // Override with user config but enforce security limits
                ...config
            };
            
            // Enforce security limits (customers cannot override these)
            this.enforceSecurity();
            
            this.isOpen = false;
            this.unreadCount = 0;
            this.messageHistory = [];
            this.warningCount = 0;
            this.isBlocked = false;
            this.blockUntil = 0;
            this.sessionStart = Date.now();
            this.rateLimitData = {
                lastMessageTime: 0,
                messagesThisMinute: 0,
                messagesThisHour: 0,
                messagesToday: 0,
                minuteReset: Date.now() + 60000,
                hourReset: Date.now() + 3600000,
                dayReset: Date.now() + 86400000
            };
            
            this.init();
        }
        
        enforceSecurity() {
            const limits = {
                maxMessagesPerMinute: { min: 1, max: 20, default: 10 },
                maxMessagesPerHour: { min: 5, max: 100, default: 50 },
                maxDailyMessages: { min: 10, max: 500, default: 200 },
                maxMessageLength: { min: 100, max: 5000, default: 2000 },
                minMessageInterval: { min: 1000, max: 10000, default: 2000 },
                maxConversationLength: { min: 10, max: 200, default: 100 },
                sessionTimeoutMinutes: { min: 10, max: 120, default: 30 },
                cooldownPeriodMinutes: { min: 1, max: 60, default: 5 }
            };

            Object.keys(limits).forEach(key => {
                const limit = limits[key];
                if (this.config[key] !== undefined) {
                    // Enforce min/max bounds
                    this.config[key] = Math.max(limit.min, Math.min(limit.max, this.config[key]));
                } else {
                    this.config[key] = limit.default;
                }
            });

            // Force enable certain security features
            this.config.blockSuspiciousContent = true;
            this.config.autoBlockAfterWarnings = Math.min(this.config.autoBlockAfterWarnings || 3, 5);
            this.config.suspiciousContentThreshold = Math.max(0.5, Math.min(1.0, this.config.suspiciousContentThreshold || 0.7));
        }

        init() {
            if (!this.validateDomain()) {
                console.warn('AI Widget: Not authorized for this domain');
                return;
            }

            // Check if session timed out
            if (this.isSessionExpired()) {
                this.resetSession();
            }

            // Check if still in cooldown period
            if (this.isInCooldown()) {
                console.warn('AI Widget: In cooldown period');
                return;
            }
            
            this.createWidgetHTML();
            this.createWidgetStyles();
            this.bindEvents();
            this.showUnreadBadge();
        }

        isSessionExpired() {
            return Date.now() - this.sessionStart > (this.config.sessionTimeoutMinutes * 60000);
        }

        isInCooldown() {
            return this.isBlocked && Date.now() < this.blockUntil;
        }

        resetSession() {
            this.messageHistory = [];
            this.warningCount = 0;
            this.sessionStart = Date.now();
            this.rateLimitData.messagesThisMinute = 0;
            this.rateLimitData.messagesThisHour = 0;
            // Don't reset daily counter
        }
        
        validateDomain() {
            if (!this.config.allowedDomains || this.config.allowedDomains.length === 0) {
                return true; // No domain restrictions
            }
            
            const currentDomain = window.location.hostname;
            return this.config.allowedDomains.some(domain => 
                currentDomain === domain || currentDomain.endsWith('.' + domain)
            );
        }
        
        createWidgetHTML() {
            const widgetHTML = `
                <div id="aiChatWidget" class="ai-chat-widget">
                    <!-- Floating Button -->
                    <button id="aiWidgetButton" class="ai-widget-button" title="${this.config.title}">
                        <svg class="ai-widget-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                        </svg>
                        <div id="aiWidgetBadge" class="ai-widget-badge" style="display: none;">1</div>
                    </button>
                    
                    <!-- Chat Container -->
                    <div id="aiWidgetContainer" class="ai-widget-container">
                        <div class="ai-widget-header">
                            <div class="ai-widget-title">${this.config.title}</div>
                            <button id="aiWidgetClose" class="ai-widget-close" title="Close chat">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div id="aiWidgetMessages" class="ai-widget-messages">
                            <div class="ai-message">
                                <div class="ai-message-bubble">${this.config.greeting}</div>
                            </div>
                        </div>
                        
                        <div class="ai-widget-input-container">
                            <div class="ai-widget-input">
                                <textarea 
                                    id="aiInputField" 
                                    class="ai-input-field" 
                                    placeholder="${this.config.placeholder}" 
                                    rows="1"
                                    maxlength="${this.config.maxMessageLength}"
                                ></textarea>
                                <button id="aiSendButton" class="ai-send-button" title="Send message">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                                    </svg>
                                </button>
                            </div>
                            <div id="aiTypingIndicator" class="ai-typing-indicator" style="display: none;">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', widgetHTML);
        }
        
        createWidgetStyles() {
            const styles = `
                <style id="aiWidgetStyles">
                .ai-chat-widget {
                    --primary-color: ${this.config.primaryColor};
                    --secondary-color: ${this.config.secondaryColor};
                    --background-color: ${this.config.backgroundColor};
                    --text-color: ${this.config.textColor};
                    --border-radius: ${this.config.borderRadius};
                    --widget-width: ${this.config.width};
                    --widget-height: ${this.config.height};
                    --icon-size: ${this.config.iconSize};
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .ai-widget-button {
                    position: fixed;
                    z-index: 10000;
                    background: var(--primary-color);
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: var(--icon-size);
                    height: var(--icon-size);
                    ${this.getPositionCSS()}
                    ${this.getWidgetButtonStyle()}
                }
                
                .ai-widget-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
                }
                
                .ai-widget-icon {
                    width: 24px;
                    height: 24px;
                    fill: white;
                    transition: transform 0.3s ease;
                }
                
                .ai-widget-button.open .ai-widget-icon {
                    transform: rotate(45deg);
                }
                
                .ai-widget-badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: #EF4444;
                    color: white;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    font-size: 10px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: bounce 0.5s ease-in-out;
                }
                
                .ai-widget-container {
                    position: fixed;
                    z-index: 9999;
                    background: var(--background-color);
                    border-radius: var(--border-radius);
                    box-shadow: ${this.getBoxShadow()};
                    overflow: hidden;
                    transform: scale(0.8) translateY(20px);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    width: var(--widget-width);
                    height: var(--widget-height);
                    display: flex;
                    flex-direction: column;
                    ${this.getContainerPositionCSS()}
                    ${this.getWidgetContainerStyle()}
                }
                
                .ai-widget-container.open {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                    visibility: visible;
                }
                
                .ai-widget-header {
                    background: var(--primary-color);
                    color: ${this.getHeaderTextColor()};
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 600;
                    font-size: 16px;
                    ${this.getHeaderStyle()}
                }
                
                .ai-widget-close {
                    background: none;
                    border: none;
                    color: ${this.getHeaderTextColor()};
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                
                .ai-widget-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .ai-widget-close svg {
                    width: 18px;
                    height: 18px;
                }
                
                .ai-widget-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: var(--secondary-color);
                    scroll-behavior: smooth;
                }
                
                .ai-message {
                    margin-bottom: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .user-message {
                    justify-content: flex-end;
                }
                
                .ai-message-bubble, .user-message-bubble {
                    padding: 12px 16px;
                    border-radius: 18px;
                    max-width: 80%;
                    word-wrap: break-word;
                    font-size: 14px;
                    line-height: 1.4;
                }
                
                .ai-message-bubble {
                    background: var(--background-color);
                    color: var(--text-color);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                .user-message-bubble {
                    background: var(--primary-color);
                    color: white;
                }
                
                .ai-widget-input-container {
                    border-top: 1px solid var(--secondary-color);
                    background: var(--background-color);
                }
                
                .ai-widget-input {
                    padding: 16px 20px;
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                }
                
                .ai-input-field {
                    flex: 1;
                    border: 1px solid var(--secondary-color);
                    background: var(--background-color);
                    color: var(--text-color);
                    border-radius: 20px;
                    padding: 10px 16px;
                    resize: none;
                    font-family: inherit;
                    font-size: 14px;
                    max-height: 100px;
                    min-height: 20px;
                    transition: border-color 0.2s;
                }
                
                .ai-input-field:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                
                .ai-send-button {
                    background: var(--primary-color);
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .ai-send-button:hover {
                    transform: scale(1.05);
                }
                
                .ai-send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .ai-send-button svg {
                    width: 18px;
                    height: 18px;
                    fill: white;
                }
                
                .ai-typing-indicator {
                    padding: 8px 20px;
                    font-size: 12px;
                    color: var(--text-color);
                    opacity: 0.6;
                }
                
                .ai-typing-indicator span {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background: var(--text-color);
                    border-radius: 50%;
                    margin-right: 4px;
                    animation: typing 1.4s infinite;
                }
                
                .ai-typing-indicator span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .ai-typing-indicator span:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
                    30% { transform: translateY(-10px); opacity: 1; }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                
                /* Mobile responsive */
                @media (max-width: 480px) {
                    .ai-widget-container {
                        width: calc(100vw - 40px) !important;
                        height: calc(100vh - 40px) !important;
                        bottom: 20px !important;
                        right: 20px !important;
                        left: 20px !important;
                    }
                }
                </style>
            `;
            
            document.head.insertAdjacentHTML('beforeend', styles);
        }
        
        getPositionCSS() {
            switch (this.config.position) {
                case 'bottom-right': return 'bottom: 20px; right: 20px;';
                case 'bottom-left': return 'bottom: 20px; left: 20px;';
                case 'top-right': return 'top: 20px; right: 20px;';
                case 'top-left': return 'top: 20px; left: 20px;';
                default: return 'bottom: 20px; right: 20px;';
            }
        }
        
        getContainerPositionCSS() {
            switch (this.config.position) {
                case 'bottom-right': return 'bottom: 90px; right: 20px;';
                case 'bottom-left': return 'bottom: 90px; left: 20px;';
                case 'top-right': return 'top: 90px; right: 20px;';
                case 'top-left': return 'top: 90px; left: 20px;';
                default: return 'bottom: 90px; right: 20px;';
            }
        }
        
        getWidgetButtonStyle() {
            return this.config.widgetStyle === 'glassmorphic' ? 
                'backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);' : '';
        }
        
        getWidgetContainerStyle() {
            return this.config.widgetStyle === 'glassmorphic' ? 
                'backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2);' : '';
        }
        
        getHeaderStyle() {
            return this.config.widgetStyle === 'glassmorphic' ? 
                'backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255, 255, 255, 0.1);' : '';
        }
        
        getBoxShadow() {
            switch (this.config.widgetStyle) {
                case 'modern': return '0 10px 40px rgba(0, 0, 0, 0.15)';
                case 'rounded': return '0 20px 60px rgba(0, 0, 0, 0.2)';
                case 'minimal': return '0 4px 12px rgba(0, 0, 0, 0.1)';
                case 'glassmorphic': return '0 8px 32px rgba(0, 0, 0, 0.1)';
                default: return '0 10px 40px rgba(0, 0, 0, 0.15)';
            }
        }
        
        getHeaderTextColor() {
            if (this.config.primaryColor.includes('rgba')) {
                return 'var(--text-color)';
            }
            
            // Calculate if primary color is light or dark
            const hex = this.config.primaryColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 128 ? '#000000' : '#ffffff';
        }
        
        bindEvents() {
            const button = document.getElementById('aiWidgetButton');
            const container = document.getElementById('aiWidgetContainer');
            const closeBtn = document.getElementById('aiWidgetClose');
            const sendBtn = document.getElementById('aiSendButton');
            const input = document.getElementById('aiInputField');
            
            // Toggle widget
            button?.addEventListener('click', () => this.toggleWidget());
            closeBtn?.addEventListener('click', () => this.closeWidget());
            
            // Send message
            sendBtn?.addEventListener('click', () => this.sendMessage());
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-resize textarea
            input?.addEventListener('input', () => this.autoResizeInput(input));
            
            // Close on outside click (optional)
            document.addEventListener('click', (e) => {
                if (this.isOpen && !container.contains(e.target) && !button.contains(e.target)) {
                    // Uncomment to enable close on outside click
                    // this.closeWidget();
                }
            });
        }
        
        toggleWidget() {
            if (this.isOpen) {
                this.closeWidget();
            } else {
                this.openWidget();
            }
        }
        
        openWidget() {
            const button = document.getElementById('aiWidgetButton');
            const container = document.getElementById('aiWidgetContainer');
            const badge = document.getElementById('aiWidgetBadge');
            
            this.isOpen = true;
            button?.classList.add('open');
            container?.classList.add('open');
            
            // Hide badge when opened
            if (badge) badge.style.display = 'none';
            this.unreadCount = 0;
            
            // Focus input
            setTimeout(() => {
                document.getElementById('aiInputField')?.focus();
            }, 300);
        }
        
        closeWidget() {
            const button = document.getElementById('aiWidgetButton');
            const container = document.getElementById('aiWidgetContainer');
            
            this.isOpen = false;
            button?.classList.remove('open');
            container?.classList.remove('open');
        }
        
        showUnreadBadge() {
            const badge = document.getElementById('aiWidgetBadge');
            if (badge && this.config.showUnreadBadge && !this.isOpen && this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
                badge.style.display = 'flex';
            }
        }
        
        autoResizeInput(input) {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        }
        
        checkRateLimit() {
            const now = Date.now();
            
            // Check if user is blocked
            if (this.isInCooldown()) {
                const remainingMinutes = Math.ceil((this.blockUntil - now) / 60000);
                return { allowed: false, reason: `Temporarily blocked. Try again in ${remainingMinutes} minutes.` };
            }
            
            // Reset counters if time windows have passed
            if (now > this.rateLimitData.minuteReset) {
                this.rateLimitData.messagesThisMinute = 0;
                this.rateLimitData.minuteReset = now + 60000;
            }
            
            if (now > this.rateLimitData.hourReset) {
                this.rateLimitData.messagesThisHour = 0;
                this.rateLimitData.hourReset = now + 3600000;
            }
            
            if (now > this.rateLimitData.dayReset) {
                this.rateLimitData.messagesToday = 0;
                this.rateLimitData.dayReset = now + 86400000;
            }
            
            // Check minimum interval
            if (now - this.rateLimitData.lastMessageTime < this.config.minMessageInterval) {
                return { allowed: false, reason: 'Please wait before sending another message' };
            }
            
            // Check conversation length
            if (this.messageHistory.length >= this.config.maxConversationLength) {
                return { allowed: false, reason: 'Conversation too long. Please refresh to start a new session.' };
            }
            
            // Check session timeout
            if (this.isSessionExpired()) {
                this.resetSession();
                return { allowed: false, reason: 'Session expired. Please refresh to continue.' };
            }
            
            // Check rate limits
            if (this.rateLimitData.messagesThisMinute >= this.config.maxMessagesPerMinute) {
                this.incrementWarning();
                return { allowed: false, reason: 'Too many messages per minute. Please slow down.' };
            }
            
            if (this.rateLimitData.messagesThisHour >= this.config.maxMessagesPerHour) {
                this.incrementWarning();
                return { allowed: false, reason: 'Hourly message limit reached. Please try again later.' };
            }
            
            if (this.rateLimitData.messagesToday >= this.config.maxDailyMessages) {
                this.incrementWarning();
                return { allowed: false, reason: 'Daily message limit reached. Please try again tomorrow.' };
            }
            
            return { allowed: true };
        }
        
        incrementWarning() {
            this.warningCount++;
            if (this.warningCount >= this.config.autoBlockAfterWarnings) {
                this.isBlocked = true;
                this.blockUntil = Date.now() + (this.config.cooldownPeriodMinutes * 60000);
                console.warn('AI Widget: User temporarily blocked due to excessive warnings');
            }
        }
        
        filterContent(message) {
            if (!this.config.blockSuspiciousContent) return { clean: true };
            
            const suspiciousPatterns = [
                /(?:https?:\/\/|www\.)[^\s]+/gi,  // URLs
                /\b(?:spam|bot|hack|exploit)\b/gi,  // Suspicious words
                /(.)\1{10,}/g,  // Repeated characters
                /<[^>]*>/g  // HTML tags
            ];
            
            for (let pattern of suspiciousPatterns) {
                if (pattern.test(message)) {
                    return { clean: false, reason: 'Message contains suspicious content' };
                }
            }
            
            return { clean: true };
        }
        
        async sendMessage() {
            const input = document.getElementById('aiInputField');
            const message = input?.value?.trim();
            
            if (!message) return;
            
            // Check rate limiting
            const rateLimitCheck = this.checkRateLimit();
            if (!rateLimitCheck.allowed) {
                this.showErrorMessage(rateLimitCheck.reason);
                return;
            }
            
            // Filter content
            const contentCheck = this.filterContent(message);
            if (!contentCheck.clean) {
                this.showErrorMessage(contentCheck.reason);
                return;
            }
            
            // Update rate limit data
            this.rateLimitData.lastMessageTime = Date.now();
            this.rateLimitData.messagesThisMinute++;
            this.rateLimitData.messagesThisHour++;
            this.rateLimitData.messagesToday++;
            
            // Clear input and disable send button
            input.value = '';
            this.autoResizeInput(input);
            const sendBtn = document.getElementById('aiSendButton');
            if (sendBtn) sendBtn.disabled = true;
            
            // Add user message to chat
            this.addMessage(message, 'user');
            
            // Show typing indicator
            this.showTypingIndicator();
            
            try {
                // Send to AI API
                const response = await this.callAIAPI(message);
                this.hideTypingIndicator();
                
                if (response.success) {
                    this.addMessage(response.message, 'ai');
                } else {
                    this.showErrorMessage(response.error || 'Sorry, I encountered an error. Please try again.');
                }
            } catch (error) {
                this.hideTypingIndicator();
                this.showErrorMessage('Network error. Please check your connection and try again.');
                console.error('AI Widget API Error:', error);
            }
            
            // Re-enable send button
            if (sendBtn) sendBtn.disabled = false;
        }
        
        async callAIAPI(message) {
            if (!this.config.apiToken) {
                return { success: false, error: 'API token not configured' };
            }
            
            const response = await fetch(`${this.config.apiUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiToken}`
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: this.getConversationId(),
                    domain: window.location.hostname
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, message: data.response || data.message };
        }
        
        getConversationId() {
            // Generate or retrieve conversation ID for session continuity
            if (!this.conversationId) {
                this.conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            return this.conversationId;
        }
        
        addMessage(message, type) {
            const messagesContainer = document.getElementById('aiWidgetMessages');
            if (!messagesContainer) return;
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `${type}-message`;
            
            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = `${type}-message-bubble`;
            bubbleDiv.textContent = message;
            
            messageDiv.appendChild(bubbleDiv);
            messagesContainer.appendChild(messageDiv);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Store in history
            this.messageHistory.push({ message, type, timestamp: Date.now() });
            
            // Update unread count if widget is closed
            if (!this.isOpen && type === 'ai') {
                this.unreadCount++;
                this.showUnreadBadge();
            }
        }
        
        showErrorMessage(error) {
            this.addMessage(error, 'ai');
        }
        
        showTypingIndicator() {
            const indicator = document.getElementById('aiTypingIndicator');
            if (indicator) indicator.style.display = 'block';
        }
        
        hideTypingIndicator() {
            const indicator = document.getElementById('aiTypingIndicator');
            if (indicator) indicator.style.display = 'none';
        }
        
        // Public API methods
        destroy() {
            // Clean up the widget
            document.getElementById('aiChatWidget')?.remove();
            document.getElementById('aiWidgetStyles')?.remove();
        }
        
        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
            // Re-initialize with new config
            this.destroy();
            this.init();
        }
    }
    
    // Initialize widget when DOM is ready
    function initWidget() {
        if (!window.aiWidgetConfig) {
            console.warn('AI Widget: Configuration not found. Please define window.aiWidgetConfig');
            return;
        }
        
        window.AIChatWidget = new AIChatWidget(window.aiWidgetConfig);
    }
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
    
})();