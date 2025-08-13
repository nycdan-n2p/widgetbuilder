class WidgetBuilder {
    constructor() {
        this.domains = [];
        this.settings = {
            primaryColor: '#667eea',
            secondaryColor: '#f3f4f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            position: 'bottom-right',
            widgetTitle: 'AI Assistant',
            greeting: 'Hi! How can I help you today?',
            placeholder: 'Type your message...',
            maxMessages: 50,
            maxMessagesPerMinute: 10,
            maxDailyMessages: 200,
            minMessageInterval: 2,
            widgetStyle: 'modern',
            currentTheme: 'default'
        };
        
        this.themes = {
            default: {
                primaryColor: '#667eea',
                secondaryColor: '#f3f4f6',
                backgroundColor: '#ffffff',
                textColor: '#1f2937'
            },
            dark: {
                primaryColor: '#1f2937',
                secondaryColor: '#374151',
                backgroundColor: '#4b5563',
                textColor: '#f9fafb'
            },
            ocean: {
                primaryColor: '#0891b2',
                secondaryColor: '#e0f2fe',
                backgroundColor: '#ffffff',
                textColor: '#0f172a'
            },
            glassmorphic: {
                primaryColor: 'rgba(255, 255, 255, 0.2)',
                secondaryColor: 'rgba(255, 255, 255, 0.05)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                textColor: '#1f2937'
            },
            sunset: {
                primaryColor: '#f59e0b',
                secondaryColor: '#fef3c7',
                backgroundColor: '#fffbeb',
                textColor: '#92400e'
            },
            forest: {
                primaryColor: '#059669',
                secondaryColor: '#d1fae5',
                backgroundColor: '#f0fdf4',
                textColor: '#064e3b'
            }
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.renderDomains();
        this.updateCodeOutput();
    }

    // Generate secure domain token
    generateToken(domain) {
        const prefix = 'dwt';
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        const domainHash = btoa(domain.substring(0, 5)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
        const suffix = Math.random().toString(36).substring(2, 8);
        
        return `${prefix}_${timestamp}_${domainHash}_${suffix}`;
    }

    // Add new domain
    addDomain() {
        const input = document.getElementById('domainInput');
        const domain = input.value.trim().toLowerCase();
        
        if (!domain) {
            alert('Please enter a domain name');
            return;
        }
        
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
            alert('Please enter a valid domain (e.g., example.com)');
            return;
        }
        
        if (this.domains.find(d => d.name === domain)) {
            alert('Domain already exists');
            return;
        }
        
        const newDomain = {
            name: domain,
            token: this.generateToken(domain),
            created: new Date().toISOString()
        };
        
        this.domains.push(newDomain);
        input.value = '';
        this.renderDomains();
        this.updateCodeOutput();
        this.saveDomains();
    }

    // Remove domain
    removeDomain(domain) {
        if (confirm(`Remove domain "${domain}"? This will invalidate the widget on that domain.`)) {
            this.domains = this.domains.filter(d => d.name !== domain);
            this.renderDomains();
            this.updateCodeOutput();
            this.saveDomains();
        }
    }

    // Render domains list
    renderDomains() {
        const container = document.getElementById('domainList');
        
        if (this.domains.length === 0) {
            container.innerHTML = '<div class="empty-state">No domains added yet</div>';
            return;
        }
        
        container.innerHTML = this.domains.map(domain => `
            <div class="domain-item">
                <div class="domain-info">
                    <div class="domain-name">${domain.name}</div>
                    <div class="domain-token">${domain.token}</div>
                </div>
                <button class="btn-danger" onclick="widgetBuilder.removeDomain('${domain.name}')">
                    Remove
                </button>
            </div>
        `).join('');
    }

    // Apply theme preset
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;
        
        // Update settings with theme colors
        this.settings.primaryColor = theme.primaryColor;
        this.settings.secondaryColor = theme.secondaryColor;
        this.settings.backgroundColor = theme.backgroundColor;
        this.settings.textColor = theme.textColor;
        this.settings.currentTheme = themeName;
        
        // Update form inputs
        document.getElementById('primaryColor').value = theme.primaryColor.includes('rgba') ? '#667eea' : theme.primaryColor;
        document.getElementById('secondaryColor').value = theme.secondaryColor.includes('rgba') ? '#f3f4f6' : theme.secondaryColor;
        document.getElementById('backgroundColor').value = theme.backgroundColor.includes('rgba') ? '#ffffff' : theme.backgroundColor;
        document.getElementById('textColor').value = theme.textColor.includes('rgba') ? '#1f2937' : theme.textColor;
        
        // Update active theme button
        document.querySelectorAll('.theme-preset').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        // Special handling for glassmorphic theme
        if (themeName === 'glassmorphic') {
            this.settings.widgetStyle = 'glassmorphic';
            document.getElementById('widgetStyle').value = 'glassmorphic';
        }
        
        this.updateCodeOutput();
        this.saveSettings();
        
        // Update live preview if it's currently shown
        if (document.getElementById('previewTab')?.classList.contains('active')) {
            this.updatePreview();
        }
    }

    // Update settings from form
    updateSettings() {
        this.settings.primaryColor = document.getElementById('primaryColor').value;
        this.settings.secondaryColor = document.getElementById('secondaryColor').value;
        this.settings.backgroundColor = document.getElementById('backgroundColor').value;
        this.settings.textColor = document.getElementById('textColor').value;
        this.settings.position = document.getElementById('position').value;
        this.settings.widgetTitle = document.getElementById('widgetTitle').value;
        this.settings.greeting = document.getElementById('greeting').value;
        this.settings.placeholder = document.getElementById('placeholder').value;
        this.settings.maxMessages = parseInt(document.getElementById('maxMessages').value) || 50;
        this.settings.maxMessagesPerMinute = parseInt(document.getElementById('maxMessagesPerMinute').value) || 10;
        this.settings.maxDailyMessages = parseInt(document.getElementById('maxDailyMessages').value) || 200;
        this.settings.minMessageInterval = parseFloat(document.getElementById('minMessageInterval').value) * 1000 || 2000;
        this.settings.widgetStyle = document.getElementById('widgetStyle').value;
        
        // Remove active theme when custom colors are changed
        if (this.settings.currentTheme !== 'custom') {
            document.querySelectorAll('.theme-preset').forEach(btn => btn.classList.remove('active'));
            this.settings.currentTheme = 'custom';
        }
        
        this.updateCodeOutput();
        this.saveSettings();
        
        // Update live preview if it's currently shown
        if (document.getElementById('previewTab')?.classList.contains('active')) {
            this.updatePreview();
        }
    }

    // Generate widget code
    generateCode() {
        if (this.domains.length === 0) {
            alert('Please add at least one domain first');
            return;
        }

        const domainConfigs = this.domains.map(domain => {
            return `    // Configuration for ${domain.name}
    if (window.location.hostname === '${domain.name}' || window.location.hostname.endsWith('.${domain.name}')) {
        widgetToken = '${domain.token}';
    }`;
        }).join('\n\n');

        const allowedDomains = this.domains.map(d => `'${d.name}'`).join(', ');

        const code = `<!-- AI Chat Widget - Generated by Widget Builder -->
<!-- Simply paste this code before the closing </body> tag of your website -->

<script>
(function() {
    // Secure domain-based token selection
    var widgetToken = '';
    
${domainConfigs}
    
    if (!widgetToken) {
        console.warn('AI Chat Widget: No token configured for domain:', window.location.hostname);
        return; // Don't load widget on unauthorized domains
    }
    
    // Widget Configuration
    window.aiWidgetConfig = {
        // Authentication (secure domain-specific token)
        apiToken: widgetToken,
        apiUrl: 'https://aiagent.net2phone.com',
        
        // Domain Security
        allowedDomains: [${allowedDomains}],
        
        // Spam Protection (enforced server-side)
        maxMessagesPerMinute: ${this.settings.maxMessagesPerMinute},
        maxMessagesPerHour: ${this.settings.maxMessages},
        maxDailyMessages: ${this.settings.maxDailyMessages},
        maxMessageLength: 2000,
        minMessageInterval: ${this.settings.minMessageInterval},
        blockSuspiciousContent: true,
        
        // Widget Appearance
        primaryColor: '${this.settings.primaryColor}',
        secondaryColor: '${this.settings.secondaryColor}',
        backgroundColor: '${this.settings.backgroundColor}',
        textColor: '${this.settings.textColor}',
        position: '${this.settings.position}',
        widgetStyle: '${this.settings.widgetStyle}',
        borderRadius: '${this.getBorderRadius()}',
        
        // Widget Content
        greeting: '${this.settings.greeting.replace(/'/g, "\\'")}',
        placeholder: '${this.settings.placeholder.replace(/'/g, "\\'")}',
        title: '${this.settings.widgetTitle.replace(/'/g, "\\'")}',
        
        // Widget Size
        width: '350px',
        height: '500px',
        iconSize: '56px',
        showUnreadBadge: true
    };
    
    // Load the hosted widget script
    var script = document.createElement('script');
    script.src = 'http://aiagent.net2phone.com/widget.js';
    script.onload = function() {
        console.log('✅ AI Chat Widget loaded successfully');
    };
    script.onerror = function() {
        console.error('❌ Failed to load AI Chat Widget');
    };
    document.head.appendChild(script);
})();
</script>`;

        this.updateCodeOutput(code);
    }

    // Get position CSS for button
    getPositionCSS() {
        switch (this.settings.position) {
            case 'bottom-right':
                return 'bottom: 20px; right: 20px;';
            case 'bottom-left':
                return 'bottom: 20px; left: 20px;';
            case 'top-right':
                return 'top: 20px; right: 20px;';
            case 'top-left':
                return 'top: 20px; left: 20px;';
            default:
                return 'bottom: 20px; right: 20px;';
        }
    }

    // Get position CSS for container
    getContainerPositionCSS() {
        switch (this.settings.position) {
            case 'bottom-right':
                return 'bottom: 90px; right: 20px;';
            case 'bottom-left':
                return 'bottom: 90px; left: 20px;';
            case 'top-right':
                return 'top: 90px; right: 20px;';
            case 'top-left':
                return 'top: 90px; left: 20px;';
            default:
                return 'bottom: 90px; right: 20px;';
        }
    }

    // Get border radius based on style
    getBorderRadius() {
        switch (this.settings.widgetStyle) {
            case 'modern':
                return '16px';
            case 'rounded':
                return '24px';
            case 'minimal':
                return '8px';
            case 'glassmorphic':
                return '20px';
            default:
                return '16px';
        }
    }

    // Get widget container style based on theme
    getWidgetContainerStyle() {
        if (this.settings.widgetStyle === 'glassmorphic') {
            return `
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
        }
        return '';
    }

    // Get box shadow based on style
    getBoxShadow() {
        switch (this.settings.widgetStyle) {
            case 'modern':
                return '0 10px 40px rgba(0, 0, 0, 0.15)';
            case 'rounded':
                return '0 20px 60px rgba(0, 0, 0, 0.2)';
            case 'minimal':
                return '0 4px 12px rgba(0, 0, 0, 0.1)';
            case 'glassmorphic':
                return '0 8px 32px rgba(0, 0, 0, 0.1)';
            default:
                return '0 10px 40px rgba(0, 0, 0, 0.15)';
        }
    }

    // Get header text color based on primary color
    getHeaderTextColor() {
        if (this.settings.primaryColor.includes('rgba')) {
            return 'var(--text-color)';
        }
        // Simple check for dark/light primary color
        const hex = this.settings.primaryColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    // Get header style for glassmorphic theme
    getHeaderStyle() {
        if (this.settings.widgetStyle === 'glassmorphic') {
            return `
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            `;
        }
        return '';
    }

    // Update code output display
    updateCodeOutput(code = null) {
        const output = document.getElementById('codeOutput');
        
        if (this.domains.length === 0) {
            output.textContent = 'Add at least one domain to generate your widget code...';
        } else if (code) {
            output.textContent = code;
        }
    }

    // Copy code to clipboard
    copyCode() {
        const code = document.getElementById('codeOutput').textContent;
        
        if (code.includes('Add at least one domain')) {
            alert('Please generate the widget code first');
            return;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.querySelector('.copy-btn:last-child');
            const originalText = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }).catch(() => {
            alert('Please select the code and copy manually');
        });
    }

    // Show tab content
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab
        document.getElementById(`${tabName}Tab`).classList.add('active');
        document.querySelector(`[onclick="widgetBuilder.showTab('${tabName}')"]`).classList.add('active');
        
        // If switching to preview tab, create/update the widget
        if (tabName === 'preview') {
            this.updatePreview();
        }
    }

    // Update preview widget
    updatePreview() {
        if (this.domains.length === 0) {
            const container = document.getElementById('livePreviewContainer');
            container.innerHTML = `
                <div class="preview-background-text">
                    Please add at least one domain first to see the preview
                </div>
            `;
            return;
        }

        const container = document.getElementById('livePreviewContainer');
        
        // Clear existing widget
        const existingWidget = document.getElementById('livePreviewWidget');
        if (existingWidget) {
            existingWidget.remove();
        }

        // Add background text
        container.innerHTML = `
            <div class="preview-background-text">
                Your website background<br>
                <small>Click "Open Widget" to test the chat interface</small>
            </div>
        `;

        // Create and add preview widget
        const widgetHTML = this.createLivePreviewWidget();
        container.insertAdjacentHTML('beforeend', widgetHTML);
        
        // Initialize widget functionality
        this.initializeLivePreviewWidget();
    }

    // Toggle widget open/closed
    toggleWidget() {
        const widget = document.getElementById('livePreviewWidget');
        if (!widget) {
            this.updatePreview();
            return;
        }

        const button = document.getElementById('livePreviewWidgetButton');
        const container = document.getElementById('livePreviewWidgetContainer');
        const toggleBtn = document.getElementById('toggleWidgetBtn');
        
        const isOpen = container.classList.contains('open');
        
        if (isOpen) {
            container.classList.remove('open');
            button.classList.remove('open');
            toggleBtn.textContent = 'Open Widget';
            toggleBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        } else {
            container.classList.add('open');
            button.classList.add('open');
            toggleBtn.textContent = 'Close Widget';
            toggleBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        }
    }

    // Create live preview widget HTML (renamed and updated IDs)
    createLivePreviewWidget() {
        return `
        <div id="livePreviewWidget">
            <!-- Floating Button -->
            <button id="livePreviewWidgetButton" class="live-preview-ai-widget-button">
                <svg class="live-preview-ai-widget-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                <div id="livePreviewWidgetBadge" class="live-preview-ai-widget-badge">1</div>
            </button>
            
            <!-- Chat Container -->
            <div id="livePreviewWidgetContainer" class="live-preview-ai-widget-container">
                <div class="live-preview-ai-widget-header">
                    <div class="live-preview-ai-widget-title">${this.settings.widgetTitle}</div>
                    <button id="livePreviewWidgetClose" class="live-preview-ai-widget-close">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                
                <div id="livePreviewWidgetMessages" class="live-preview-ai-widget-messages">
                    <div class="live-preview-ai-message">
                        <div class="live-preview-message-bubble">${this.settings.greeting}</div>
                    </div>
                </div>
                
                <div class="live-preview-ai-widget-input">
                    <textarea id="livePreviewInputField" class="live-preview-ai-input-field" placeholder="${this.settings.placeholder}" rows="1"></textarea>
                    <button id="livePreviewSendButton" class="live-preview-ai-send-button">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        <style>
        .live-preview-ai-widget-button {
            position: absolute;
            z-index: 100;
            background: ${this.settings.primaryColor};
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            ${this.getLivePreviewPositionCSS()}
        }

        .live-preview-ai-widget-button:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
        }

        .live-preview-ai-widget-icon {
            width: 24px;
            height: 24px;
            fill: white;
            transition: transform 0.3s ease;
        }

        .live-preview-ai-widget-button.open .live-preview-ai-widget-icon {
            transform: rotate(45deg);
        }

        .live-preview-ai-widget-badge {
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
        }

        .live-preview-ai-widget-container {
            position: absolute;
            z-index: 99;
            background: ${this.settings.backgroundColor};
            ${this.getWidgetContainerStyle()}
            border-radius: ${this.getBorderRadius()};
            box-shadow: ${this.getBoxShadow()};
            overflow: hidden;
            transform: scale(0.8) translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            width: 300px;
            height: 400px;
            display: flex;
            flex-direction: column;
            ${this.getLivePreviewContainerPositionCSS()}
        }

        .live-preview-ai-widget-container.open {
            transform: scale(1) translateY(0);
            opacity: 1;
        }

        .live-preview-ai-widget-header {
            background: ${this.settings.primaryColor};
            color: ${this.getHeaderTextColor()};
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 14px;
            ${this.getHeaderStyle()}
        }

        .live-preview-ai-widget-close {
            background: none;
            border: none;
            color: ${this.getHeaderTextColor()};
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .live-preview-ai-widget-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .live-preview-ai-widget-close svg {
            width: 16px;
            height: 16px;
        }

        .live-preview-ai-widget-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: ${this.settings.secondaryColor};
        }

        .live-preview-ai-message {
            margin-bottom: 12px;
        }

        .live-preview-message-bubble {
            background: ${this.settings.backgroundColor};
            color: ${this.settings.textColor};
            padding: 10px 12px;
            border-radius: 18px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            max-width: 80%;
            word-wrap: break-word;
            font-size: 13px;
        }

        .live-preview-ai-widget-input {
            padding: 12px 16px;
            border-top: 1px solid ${this.settings.secondaryColor};
            background: ${this.settings.backgroundColor};
            display: flex;
            gap: 10px;
            align-items: end;
        }

        .live-preview-ai-input-field {
            flex: 1;
            border: 1px solid ${this.settings.secondaryColor};
            background: ${this.settings.backgroundColor};
            color: ${this.settings.textColor};
            border-radius: 16px;
            padding: 8px 12px;
            resize: none;
            font-family: inherit;
            font-size: 13px;
            max-height: 80px;
            min-height: 16px;
        }

        .live-preview-ai-input-field:focus {
            outline: none;
            border-color: ${this.settings.primaryColor};
        }

        .live-preview-ai-send-button {
            background: ${this.settings.primaryColor};
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .live-preview-ai-send-button:hover {
            transform: scale(1.05);
        }

        .live-preview-ai-send-button svg {
            width: 14px;
            height: 14px;
            fill: white;
        }
        </style>
        `;
    }

    // Get live preview position CSS for button
    getLivePreviewPositionCSS() {
        switch (this.settings.position) {
            case 'bottom-right':
                return 'bottom: 20px; right: 20px;';
            case 'bottom-left':
                return 'bottom: 20px; left: 20px;';
            case 'top-right':
                return 'top: 20px; right: 20px;';
            case 'top-left':
                return 'top: 20px; left: 20px;';
            default:
                return 'bottom: 20px; right: 20px;';
        }
    }

    // Get live preview position CSS for container
    getLivePreviewContainerPositionCSS() {
        switch (this.settings.position) {
            case 'bottom-right':
                return 'bottom: 90px; right: 20px;';
            case 'bottom-left':
                return 'bottom: 90px; left: 20px;';
            case 'top-right':
                return 'top: 90px; right: 20px;';
            case 'top-left':
                return 'top: 90px; left: 20px;';
            default:
                return 'bottom: 90px; right: 20px;';
        }
    }

    // Initialize live preview widget functionality
    initializeLivePreviewWidget() {
        const button = document.getElementById('livePreviewWidgetButton');
        const container = document.getElementById('livePreviewWidgetContainer');
        const closeBtn = document.getElementById('livePreviewWidgetClose');
        const sendBtn = document.getElementById('livePreviewSendButton');
        const input = document.getElementById('livePreviewInputField');
        const messages = document.getElementById('livePreviewWidgetMessages');
        const badge = document.getElementById('livePreviewWidgetBadge');
        
        if (!button || !container) return; // Safety check
        
        let isOpen = false;
        
        // Toggle widget via button click
        button.addEventListener('click', () => {
            this.toggleWidget();
        });
        
        // Close widget via close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.toggleWidget();
            });
        }
        
        // Send message (demo functionality)
        const sendMessage = () => {
            if (!input || !messages) return;
            
            const message = input.value.trim();
            if (!message) return;
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'live-preview-ai-message';
            userMsg.style.textAlign = 'right';
            userMsg.innerHTML = `<div class="live-preview-message-bubble" style="background: ${this.settings.primaryColor}; color: white; margin-left: auto;">${message}</div>`;
            messages.appendChild(userMsg);
            
            input.value = '';
            messages.scrollTop = messages.scrollHeight;
            
            // Simulate AI response
            setTimeout(() => {
                const aiMsg = document.createElement('div');
                aiMsg.className = 'live-preview-ai-message';
                aiMsg.innerHTML = `<div class="live-preview-message-bubble">This is a preview of your AI widget. In the real version, I would respond to: "${message}"</div>`;
                messages.appendChild(aiMsg);
                messages.scrollTop = messages.scrollHeight;
            }, 1000);
        };
        
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
    }

    // Save domains to localStorage
    saveDomains() {
        localStorage.setItem('aiWidgetDomains', JSON.stringify(this.domains));
    }

    // Load domains from localStorage
    loadDomains() {
        const saved = localStorage.getItem('aiWidgetDomains');
        if (saved) {
            this.domains = JSON.parse(saved);
        }
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('aiWidgetSettings', JSON.stringify(this.settings));
    }

    // Load settings from localStorage
    loadSettings() {
        const saved = localStorage.getItem('aiWidgetSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.populateForm();
        }
        this.loadDomains();
    }

    // Populate form with saved settings
    populateForm() {
        document.getElementById('primaryColor').value = this.settings.primaryColor.includes('rgba') ? '#667eea' : this.settings.primaryColor;
        document.getElementById('secondaryColor').value = this.settings.secondaryColor.includes('rgba') ? '#f3f4f6' : this.settings.secondaryColor;
        document.getElementById('backgroundColor').value = this.settings.backgroundColor.includes('rgba') ? '#ffffff' : this.settings.backgroundColor;
        document.getElementById('textColor').value = this.settings.textColor.includes('rgba') ? '#1f2937' : this.settings.textColor;
        document.getElementById('position').value = this.settings.position;
        document.getElementById('widgetTitle').value = this.settings.widgetTitle;
        document.getElementById('greeting').value = this.settings.greeting;
        document.getElementById('placeholder').value = this.settings.placeholder;
        document.getElementById('maxMessages').value = this.settings.maxMessages;
        document.getElementById('maxMessagesPerMinute').value = this.settings.maxMessagesPerMinute;
        document.getElementById('maxDailyMessages').value = this.settings.maxDailyMessages;
        document.getElementById('minMessageInterval').value = this.settings.minMessageInterval / 1000;
        document.getElementById('widgetStyle').value = this.settings.widgetStyle;
        
        // Update active theme
        if (this.settings.currentTheme && this.settings.currentTheme !== 'custom') {
            document.querySelector(`[data-theme="${this.settings.currentTheme}"]`)?.classList.add('active');
        }
    }
}

// Initialize the widget builder when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.widgetBuilder = new WidgetBuilder();
});

// Handle Enter key in domain input
document.addEventListener('DOMContentLoaded', function() {
    const domainInput = document.getElementById('domainInput');
    if (domainInput) {
        domainInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                widgetBuilder.addDomain();
            }
        });
    }
});