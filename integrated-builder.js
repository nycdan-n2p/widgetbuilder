// Integrated Widget Builder - Matching Net2Phone AI Interface
class IntegratedWidgetBuilder {
    constructor() {
        this.domains = [];
        this.settings = {
            selectedAgent: 'boss-support',
            primaryColor: '#667eea',
            secondaryColor: '#f3f4f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            position: 'bottom-right',
            widgetTitle: 'AI Assistant',
            greeting: 'Hi! How can I help you today?',
            placeholder: 'Type your message...',
            maxMessages: 50,
            widgetStyle: 'modern',
            currentTheme: 'default',
            buttonStyle: 'modern-chat'
        };
        
        // Mock agents data (will be replaced with database call)
        this.availableAgents = [
            {
                id: 'boss-support',
                name: 'Boss Support',
                description: 'Expert support for IDT Boss Money Transfer',
                category: 'Support',
                avatar: '🛠️'
            },
            {
                id: 'boss-sales',
                name: 'Boss Sales',
                description: 'Sales specialist for Boss Money services',
                category: 'Sales',
                avatar: '💰'
            },
            {
                id: 'net2phone-support',
                name: 'Net2Phone Support',
                description: 'Technical support for Net2Phone services',
                category: 'Support',
                avatar: '📞'
            },
            {
                id: 'net2phone-sales',
                name: 'Net2Phone Sales',
                description: 'Sales representative for Net2Phone solutions',
                category: 'Sales',
                avatar: '📈'
            },
            {
                id: 'general-assistant',
                name: 'General Assistant',
                description: 'Multi-purpose AI assistant for general inquiries',
                category: 'General',
                avatar: '🤖'
            }
        ];
        
        this.buttonStyles = {
            'modern-chat': {
                name: 'Modern Chat',
                icon: '💬',
                text: '',
                shape: 'circle',
                size: '56px',
                description: 'Clean round button with chat icon'
            },
            'chat-with-us': {
                name: 'Chat With Us',
                icon: '💬',
                text: 'Chat with us',
                shape: 'pill',
                size: 'auto',
                description: 'Pill-shaped button with text'
            },
            'help-question': {
                name: 'Help & Questions',
                icon: '❓',
                text: 'Need help?',
                shape: 'pill',
                size: 'auto',
                description: 'Friendly help button'
            },
            'support-headset': {
                name: 'Live Support',
                icon: '🎧',
                text: 'Live Support',
                shape: 'rounded',
                size: 'auto',
                description: 'Professional support look'
            },
            'message-bubble': {
                name: 'Message Bubble',
                icon: '💭',
                text: '',
                shape: 'bubble',
                size: '52px',
                description: 'Speech bubble design'
            },
            'minimal-plus': {
                name: 'Minimal Plus',
                icon: '+',
                text: '',
                shape: 'circle',
                size: '48px',
                description: 'Simple plus icon'
            },
            'assistant-robot': {
                name: 'AI Assistant',
                icon: '🤖',
                text: 'AI Assistant',
                shape: 'rounded',
                size: 'auto',
                description: 'AI-focused branding'
            },
            'customer-service': {
                name: 'Customer Service',
                icon: '👋',
                text: 'Hello!',
                shape: 'pill',
                size: 'auto',
                description: 'Welcoming customer service'
            }
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
            sunset: {
                primaryColor: '#f59e0b',
                secondaryColor: '#fef3c7',
                backgroundColor: '#ffffff',
                textColor: '#1f2937'
            },
            forest: {
                primaryColor: '#10b981',
                secondaryColor: '#d1fae5',
                backgroundColor: '#ffffff',
                textColor: '#1f2937'
            },
            purple: {
                primaryColor: '#8b5cf6',
                secondaryColor: '#f3e8ff',
                backgroundColor: '#ffffff',
                textColor: '#1f2937'
            },
            glassmorphic: {
                primaryColor: 'rgba(255, 255, 255, 0.2)',
                secondaryColor: 'rgba(255, 255, 255, 0.05)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                textColor: '#1f2937'
            },
            minimal: {
                primaryColor: '#6b7280',
                secondaryColor: '#f9fafb',
                backgroundColor: '#ffffff',
                textColor: '#111827'
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.renderAgentSelection();
        this.renderDomains();
        this.renderButtonStyles();
        this.updateCodeOutput();
        this.highlightActiveNav();
    }
    
    // Agent Selection Management
    renderAgentSelection() {
        const select = document.getElementById('selectedAgent');
        
        // Populate dropdown options
        select.innerHTML = this.availableAgents.map(agent => 
            `<option value="${agent.id}" ${this.settings.selectedAgent === agent.id ? 'selected' : ''}>
                ${agent.avatar} ${agent.name}
            </option>`
        ).join('');
        
        // Show selected agent info
        this.showAgentInfo();
    }
    
    showAgentInfo() {
        const selectedAgent = this.availableAgents.find(agent => agent.id === this.settings.selectedAgent);
        const infoContainer = document.getElementById('agentInfo');
        
        if (selectedAgent) {
            infoContainer.innerHTML = `
                <div class="agent-details">
                    <div class="agent-avatar">${selectedAgent.avatar}</div>
                    <div class="agent-meta">
                        <div class="agent-name">${selectedAgent.name}</div>
                        <div class="agent-description">${selectedAgent.description}</div>
                        <span class="agent-category">${selectedAgent.category}</span>
                    </div>
                </div>
            `;
            infoContainer.classList.add('show');
        } else {
            infoContainer.classList.remove('show');
        }
    }
    
    updateAgentSelection() {
        const select = document.getElementById('selectedAgent');
        this.settings.selectedAgent = select.value;
        
        this.showAgentInfo();
        this.updateCodeOutput();
        this.saveSettings();
        
        const selectedAgent = this.availableAgents.find(agent => agent.id === this.settings.selectedAgent);
        this.showNotification(`Selected agent: ${selectedAgent.name}`, 'success');
    }
    
    // Domain Management
    addDomain() {
        const input = document.getElementById('domainInput');
        const domain = input.value.trim().toLowerCase();
        
        if (!domain) {
            this.showNotification('Please enter a domain name', 'error');
            return;
        }
        
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
            this.showNotification('Please enter a valid domain (e.g., example.com)', 'error');
            return;
        }
        
        if (this.domains.find(d => d.name === domain)) {
            this.showNotification('Domain already exists', 'error');
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
        this.showNotification(`Domain "${domain}" added successfully`, 'success');
    }
    
    removeDomain(domain) {
        if (confirm(`Remove domain "${domain}"? This will invalidate the widget on that domain.`)) {
            this.domains = this.domains.filter(d => d.name !== domain);
            this.renderDomains();
            this.updateCodeOutput();
            this.saveDomains();
            this.showNotification(`Domain "${domain}" removed`, 'success');
        }
    }
    
    generateToken(domain) {
        const prefix = 'dwt';
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        const domainHash = btoa(domain.substring(0, 5)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
        const suffix = Math.random().toString(36).substring(2, 8);
        return `${prefix}_${timestamp}_${domainHash}_${suffix}`;
    }
    
    renderDomains() {
        const container = document.getElementById('domainList');
        
        if (this.domains.length === 0) {
            container.innerHTML = '<div class="empty-state">No domains added yet</div>';
            return;
        }
        
        // Display domains as tags like in design.png
        container.innerHTML = this.domains.map(domain => `
            <div class="domain-tag">
                ${domain.name}
                <button class="domain-tag-remove" onclick="widgetBuilder.removeDomain('${domain.name}')" title="Remove domain">
                    ×
                </button>
            </div>
        `).join('');
    }
    
    // Button Style Management
    renderButtonStyles() {
        const container = document.getElementById('buttonStylesContainer');
        
        container.innerHTML = Object.keys(this.buttonStyles).map(styleKey => {
            const style = this.buttonStyles[styleKey];
            const isActive = this.settings.buttonStyle === styleKey;
            
            return `
                <div class="button-style-option ${isActive ? 'active' : ''}" 
                     onclick="widgetBuilder.selectButtonStyle('${styleKey}')">
                    <div class="button-preview">
                        <div class="button-preview-element ${style.shape}">
                            ${style.icon} ${style.text}
                        </div>
                    </div>
                    <div class="button-style-name">${style.name}</div>
                    <div class="button-style-description">${style.description}</div>
                </div>
            `;
        }).join('');
    }
    
    selectButtonStyle(styleKey) {
        this.settings.buttonStyle = styleKey;
        this.renderButtonStyles();
        this.updateCodeOutput();
        this.saveSettings();
        
        // Auto-update preview if visible
        const previewTab = document.getElementById('previewTabContent');
        if (previewTab && previewTab.style.display !== 'none') {
            this.updatePreview();
        }
        
        this.showNotification(`Applied ${this.buttonStyles[styleKey].name} button style`, 'success');
    }
    
    // Theme Management
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;
        
        this.settings.primaryColor = theme.primaryColor;
        this.settings.secondaryColor = theme.secondaryColor;
        this.settings.backgroundColor = theme.backgroundColor;
        this.settings.textColor = theme.textColor;
        this.settings.currentTheme = themeName;
        
        // Update form inputs
        document.getElementById('primaryColor').value = theme.primaryColor.includes('rgba') ? '#667eea' : theme.primaryColor;
        
        // Update active theme button
        document.querySelectorAll('.theme-preset').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        this.updateCodeOutput();
        this.saveSettings();
        this.showNotification(`Applied ${themeName} theme`, 'success');
        
        // Auto-update preview if it's currently visible
        const previewTab = document.getElementById('previewTabContent');
        if (previewTab && previewTab.style.display !== 'none') {
            this.updatePreview();
        }
    }
    
    updateSettings() {
        this.settings.primaryColor = document.getElementById('primaryColor').value;
        this.settings.position = document.getElementById('position').value;
        this.settings.widgetTitle = document.getElementById('widgetTitle').value;
        this.settings.greeting = document.getElementById('greeting').value;
        this.settings.placeholder = document.getElementById('placeholder').value;
        this.settings.maxMessages = parseInt(document.getElementById('maxMessages').value) || 50;
        
        // Remove active theme when custom colors are changed
        if (this.settings.currentTheme !== 'custom') {
            document.querySelectorAll('.theme-preset').forEach(btn => btn.classList.remove('active'));
            this.settings.currentTheme = 'custom';
        }
        
        this.updateCodeOutput();
        this.saveSettings();
        
        // Auto-update preview if it's currently visible
        const previewTab = document.getElementById('previewTabContent');
        if (previewTab && previewTab.style.display !== 'none') {
            this.updatePreview();
        }
    }
    
    // Output Tab Management
    showOutputTab(tabName) {
        const codeTab = document.getElementById('codeTabContent');
        const previewTab = document.getElementById('previewTabContent');
        const codeTabBtn = document.getElementById('codeTabBtn');
        const previewTabBtn = document.getElementById('previewTabBtn');
        
        if (tabName === 'preview') {
            // Show preview tab
            codeTab.style.display = 'none';
            previewTab.style.display = 'block';
            
            // Update button styles
            codeTabBtn.className = 'btn btn-secondary';
            previewTabBtn.className = 'btn btn-primary';
            
            // Update and show preview
            this.updatePreview();
        } else {
            // Show code tab
            codeTab.style.display = 'block';
            previewTab.style.display = 'none';
            
            // Update button styles
            codeTabBtn.className = 'btn btn-primary';
            previewTabBtn.className = 'btn btn-secondary';
        }
    }
    
    // Legacy showTab method for compatibility
    showTab(tabName) {
        this.showOutputTab(tabName);
    }
    
    // Preview Management
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
    
    createLivePreviewWidget() {
        const buttonStyle = this.buttonStyles[this.settings.buttonStyle] || this.buttonStyles['modern-chat'];
        
        return `
        <div id="livePreviewWidget">
            <!-- Floating Button -->
            <button id="livePreviewWidgetButton" class="live-preview-ai-widget-button" data-style="${this.settings.buttonStyle}">
                <span class="live-preview-button-content">
                    ${buttonStyle.icon} ${buttonStyle.text}
                </span>
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
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 500;
            font-size: 14px;
            ${this.getLivePreviewPositionCSS()}
            ${this.getButtonStyleCSS()}
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
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
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
            color: white;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 14px;
        }

        .live-preview-ai-widget-close {
            background: none;
            border: none;
            color: white;
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
    
    getLivePreviewPositionCSS() {
        switch (this.settings.position) {
            case 'bottom-right': return 'bottom: 20px; right: 20px;';
            case 'bottom-left': return 'bottom: 20px; left: 20px;';
            case 'top-right': return 'top: 20px; right: 20px;';
            case 'top-left': return 'top: 20px; left: 20px;';
            default: return 'bottom: 20px; right: 20px;';
        }
    }

    getLivePreviewContainerPositionCSS() {
        switch (this.settings.position) {
            case 'bottom-right': return 'bottom: 90px; right: 20px;';
            case 'bottom-left': return 'bottom: 90px; left: 20px;';
            case 'top-right': return 'top: 90px; right: 20px;';
            case 'top-left': return 'top: 90px; left: 20px;';
            default: return 'bottom: 90px; right: 20px;';
        }
    }
    
    getButtonStyleCSS() {
        const buttonStyle = this.buttonStyles[this.settings.buttonStyle] || this.buttonStyles['modern-chat'];
        
        switch (buttonStyle.shape) {
            case 'circle':
                return `
                    border-radius: 50%;
                    width: ${buttonStyle.size};
                    height: ${buttonStyle.size};
                `;
            case 'pill':
                return `
                    border-radius: 25px;
                    padding: 12px 20px;
                    white-space: nowrap;
                    height: auto;
                    width: auto;
                `;
            case 'rounded':
                return `
                    border-radius: 12px;
                    padding: 12px 16px;
                    white-space: nowrap;
                    height: auto;
                    width: auto;
                `;
            case 'bubble':
                return `
                    border-radius: 50% 50% 50% 10px;
                    width: ${buttonStyle.size};
                    height: ${buttonStyle.size};
                `;
            default:
                return `
                    border-radius: 50%;
                    width: 56px;
                    height: 56px;
                `;
        }
    }
    
    initializeLivePreviewWidget() {
        const button = document.getElementById('livePreviewWidgetButton');
        const container = document.getElementById('livePreviewWidgetContainer');
        const closeBtn = document.getElementById('livePreviewWidgetClose');
        const sendBtn = document.getElementById('livePreviewSendButton');
        const input = document.getElementById('livePreviewInputField');
        const messages = document.getElementById('livePreviewWidgetMessages');
        
        if (!button || !container) return;
        
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
            toggleBtn.className = 'btn btn-primary';
        } else {
            container.classList.add('open');
            button.classList.add('open');
            toggleBtn.textContent = 'Close Widget';
            toggleBtn.className = 'btn btn-secondary';
        }
    }
    
    // Code Generation
    generateWidget() {
        if (this.domains.length === 0) {
            this.showNotification('Please add at least one domain first', 'error');
            return;
        }

        const domainConfigs = this.domains.map(domain => {
            return `    // Configuration for ${domain.name}
    if (window.location.hostname === '${domain.name}' || window.location.hostname.endsWith('.${domain.name}')) {
        widgetToken = '${domain.token}';
    }`;
        }).join('\n\n');

        const allowedDomains = this.domains.map(d => `'${d.name}'`).join(', ');
        const selectedAgent = this.availableAgents.find(agent => agent.id === this.settings.selectedAgent);

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
        // Agent Assignment
        agentId: '${this.settings.selectedAgent}',
        agentName: '${selectedAgent ? selectedAgent.name : 'Default Agent'}',
        
        // Authentication (secure domain-specific token)
        apiToken: widgetToken,
        apiUrl: 'https://aiagent.net2phone.com',
        
        // Domain Security
        allowedDomains: [${allowedDomains}],
        
        // Spam Protection (enforced server-side)
        maxMessagesPerMinute: 10,
        maxMessagesPerHour: ${this.settings.maxMessages},
        maxMessageLength: 2000,
        minMessageInterval: 2000,
        blockSuspiciousContent: true,
        
        // Widget Appearance
        primaryColor: '${this.settings.primaryColor}',
        secondaryColor: '${this.settings.secondaryColor}',
        backgroundColor: '${this.settings.backgroundColor}',
        textColor: '${this.settings.textColor}',
        position: '${this.settings.position}',
        widgetStyle: '${this.settings.widgetStyle}',
        borderRadius: '16px',
        
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
        this.showNotification('Widget code generated successfully!', 'success');
    }
    
    updateCodeOutput(code = null) {
        const output = document.getElementById('codeOutput');
        
        if (this.domains.length === 0) {
            output.textContent = 'Add at least one domain to generate your widget code...';
        } else if (code) {
            output.textContent = code;
        }
    }
    
    copyCode() {
        const code = document.getElementById('codeOutput').textContent;
        
        if (code.includes('Add at least one domain')) {
            this.showNotification('Please generate the widget code first', 'error');
            return;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Code copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Please select the code and copy manually', 'error');
        });
    }
    
    // Navigation and UI
    highlightActiveNav() {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector('[onclick="showSection(\'widget-builder\')"]').classList.add('active');
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.copy-success').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = 'copy-success';
        notification.textContent = message;
        
        if (type === 'error') {
            notification.style.background = '#ff4757';
        } else if (type === 'success') {
            notification.style.background = '#00d67a';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Storage
    saveSettings() {
        localStorage.setItem('aiWidgetSettings', JSON.stringify(this.settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('aiWidgetSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.populateForm();
        }
        this.loadDomains();
    }
    
    saveDomains() {
        localStorage.setItem('aiWidgetDomains', JSON.stringify(this.domains));
    }
    
    loadDomains() {
        const saved = localStorage.getItem('aiWidgetDomains');
        if (saved) {
            this.domains = JSON.parse(saved);
        }
    }
    
    populateForm() {
        document.getElementById('primaryColor').value = this.settings.primaryColor.includes('rgba') ? '#667eea' : this.settings.primaryColor;
        document.getElementById('position').value = this.settings.position;
        document.getElementById('widgetTitle').value = this.settings.widgetTitle;
        document.getElementById('greeting').value = this.settings.greeting;
        document.getElementById('placeholder').value = this.settings.placeholder;
        document.getElementById('maxMessages').value = this.settings.maxMessages;
        
        // Update active theme
        if (this.settings.currentTheme && this.settings.currentTheme !== 'custom') {
            document.querySelector(`[data-theme="${this.settings.currentTheme}"]`)?.classList.add('active');
        }
    }
}

// Global Functions
function showSection(section) {
    console.log('Navigate to section:', section);
    // In a real app, this would handle navigation between different sections
}

function goBack() {
    console.log('Navigate back');
    // In a real app, this would handle navigation
}

function resetBuilder() {
    if (confirm('Are you sure you want to reset all settings?')) {
        localStorage.removeItem('aiWidgetSettings');
        localStorage.removeItem('aiWidgetDomains');
        location.reload();
    }
}

function showTab(tab) {
    widgetBuilder.showTab(tab);
}

function showOutputTab(tab) {
    widgetBuilder.showOutputTab(tab);
}

function updateAgentSelection() {
    widgetBuilder.updateAgentSelection();
}

function addDomain() {
    widgetBuilder.addDomain();
}

function applyTheme(theme) {
    widgetBuilder.applyTheme(theme);
}

function updateSettings() {
    widgetBuilder.updateSettings();
}

function generateWidget() {
    widgetBuilder.generateWidget();
}

function copyCode() {
    widgetBuilder.copyCode();
}

function toggleWidget() {
    widgetBuilder.toggleWidget();
}

// Initialize
let widgetBuilder;
document.addEventListener('DOMContentLoaded', function() {
    widgetBuilder = new IntegratedWidgetBuilder();
    
    // Handle Enter key in domain input
    const domainInput = document.getElementById('domainInput');
    if (domainInput) {
        domainInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addDomain();
            }
        });
    }
});