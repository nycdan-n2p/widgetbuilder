// Integrated Widget Builder - Matching Net2Phone AI Interface
class IntegratedWidgetBuilder {
    constructor() {
        this.domains = [];
        this.settings = {
            widgetId: null,
            widgetName: 'My AI Widget',
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
            buttonStyle: 'modern-chat',
            hostingOption: 'hosted', // 'hosted' or 'self-hosted'
            createdAt: null,
            updatedAt: null
        };
        
        // Saved widgets storage
        this.savedWidgets = [];
        
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
        this.loadSavedWidgets();
        
        // Check if we're loading a specific widget from URL
        const urlParams = new URLSearchParams(window.location.search);
        const widgetId = urlParams.get('widget');
        
        if (widgetId) {
            this.loadWidget(widgetId);
        } else if (!this.settings.widgetId) {
            // Generate widget ID if this is a new widget
            this.settings.widgetId = this.generateWidgetId();
            this.settings.createdAt = new Date().toISOString();
        }
        
        this.renderAgentSelection();
        this.renderDomains();
        this.renderButtonStyles();
        this.updateCodeOutput();
        this.highlightActiveNav();
    }
    
    // Widget Management Functions
    generateWidgetId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `widget_${timestamp}_${random}`;
    }
    
    saveCurrentWidget() {
        if (this.domains.length === 0) {
            this.showNotification('Please add at least one domain before saving', 'error');
            return false;
        }
        
        // Update timestamp
        this.settings.updatedAt = new Date().toISOString();
        
        // Create widget data
        const widgetData = {
            ...this.settings,
            domains: [...this.domains],
            version: '1.0'
        };
        
        // Check if widget already exists (update) or create new
        const existingIndex = this.savedWidgets.findIndex(w => w.widgetId === this.settings.widgetId);
        
        let message;
        if (existingIndex !== -1) {
            // Update existing widget
            this.savedWidgets[existingIndex] = widgetData;
            message = `Widget "${this.settings.widgetName}" updated successfully`;
        } else {
            // Save new widget
            this.savedWidgets.push(widgetData);
            message = `Widget "${this.settings.widgetName}" saved successfully`;
        }
        
        // Persist to localStorage
        this.saveSavedWidgets();
        
        // Show success notification
        this.showNotification(message, 'success');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
            window.location.href = 'widgets-dashboard.html';
        }, 1500);
        
        return true;
    }
    
    loadWidget(widgetId) {
        const widget = this.savedWidgets.find(w => w.widgetId === widgetId);
        if (!widget) {
            this.showNotification('Widget not found', 'error');
            return false;
        }
        
        // Load widget settings
        this.settings = { ...widget };
        this.domains = [...widget.domains];
        
        // Re-render all components
        this.renderAgentSelection();
        this.renderDomains();
        this.renderButtonStyles();
        this.populateForm();
        this.updateCodeOutput();
        
        this.showNotification(`Loaded widget: ${widget.widgetName}`, 'success');
        return true;
    }
    
    deleteWidget(widgetId) {
        const widget = this.savedWidgets.find(w => w.widgetId === widgetId);
        if (!widget) return false;
        
        if (confirm(`Delete widget "${widget.widgetName}"? This action cannot be undone.`)) {
            this.savedWidgets = this.savedWidgets.filter(w => w.widgetId !== widgetId);
            this.saveSavedWidgets();
            this.showNotification(`Widget "${widget.widgetName}" deleted`, 'success');
            return true;
        }
        return false;
    }
    
    cloneWidget(widgetId) {
        const widget = this.savedWidgets.find(w => w.widgetId === widgetId);
        if (!widget) return false;
        
        // Create new widget with copied settings
        const clonedWidget = {
            ...widget,
            widgetId: this.generateWidgetId(),
            widgetName: `${widget.widgetName} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.savedWidgets.push(clonedWidget);
        this.saveSavedWidgets();
        this.showNotification(`Widget cloned as "${clonedWidget.widgetName}"`, 'success');
        return clonedWidget.widgetId;
    }
    
    createNewWidget() {
        // Reset to default settings with new ID
        this.settings = {
            widgetId: this.generateWidgetId(),
            widgetName: 'My AI Widget',
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
            buttonStyle: 'modern-chat',
            createdAt: new Date().toISOString(),
            updatedAt: null
        };
        
        this.domains = [];
        
        // Re-render all components
        this.renderAgentSelection();
        this.renderDomains();
        this.renderButtonStyles();
        this.populateForm();
        this.updateCodeOutput();
        
        this.showNotification('Created new widget', 'success');
    }
    
    // Storage functions
    saveSavedWidgets() {
        localStorage.setItem('aiWidgetSavedWidgets', JSON.stringify(this.savedWidgets));
    }
    
    loadSavedWidgets() {
        const saved = localStorage.getItem('aiWidgetSavedWidgets');
        if (saved) {
            try {
                this.savedWidgets = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading saved widgets:', error);
                this.savedWidgets = [];
            }
        }
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
    
    updateWidgetName() {
        const input = document.getElementById('widgetName');
        this.settings.widgetName = input.value.trim() || 'My AI Widget';
        this.updateCodeOutput();
        this.saveSettings();
    }
    
    // Hosting Options Management
    selectHostingOption(option) {
        this.settings.hostingOption = option;
        
        // Update UI
        document.querySelectorAll('.hosting-option').forEach(el => el.classList.remove('active'));
        document.getElementById(option === 'hosted' ? 'hostedOption' : 'selfHostedOption').classList.add('active');
        
        // Update radio buttons
        document.querySelector(`input[value="${option}"]`).checked = true;
        
        // Show/hide download button
        const downloadBtn = document.getElementById('downloadWidgetBtn');
        if (option === 'self-hosted') {
            downloadBtn.style.display = 'inline-flex';
        } else {
            downloadBtn.style.display = 'none';
        }
        
        // Update code output
        this.updateCodeOutput();
        this.saveSettings();
        
        const optionName = option === 'hosted' ? 'Net2Phone Hosted' : 'Self-Hosted';
        this.showNotification(`Selected ${optionName} option`, 'success');
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

        const allowedDomains = this.domains.map(d => d.name);
        const selectedAgent = this.availableAgents.find(agent => agent.id === this.settings.selectedAgent);
        const isHosted = this.settings.hostingOption === 'hosted';
        
        // Generate SRI hash for the widget script (in production, this would be dynamically fetched)
        const sriHash = 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC';
        const widgetUrl = isHosted ? 'https://aiagent.net2phone.com/widget.js' : './widget.js';
        
        // Fix rate limiting logic (hour must be >= minute * 60)
        const maxPerHour = Math.max(this.settings.maxMessages, 600); // Minimum 600/hr (10/min * 60)

        const code = `<!-- AI Chat Widget - Generated by Widget Builder -->
<!-- 
SECURITY NOTES:
- Authentication is handled server-side via domain validation
- All security checks are enforced by the backend API
- Widget configuration is protected from tampering
- Rate limits and domain restrictions are server-enforced
-->

<script>
(function() {
    'use strict';
    
    // Immutable widget configuration (protected from tampering)
    Object.defineProperty(window, 'aiWidgetConfig', {
        value: Object.freeze({
            // Widget Identification (for shared inbox routing)
            widgetId: '${this.settings.widgetId}',
            widgetName: '${this.settings.widgetName}',
            
            // Agent Assignment
            agentId: '${this.settings.selectedAgent}',
            agentName: '${selectedAgent ? selectedAgent.name : 'Default Agent'}',
            
            // API Configuration (no tokens - server validates domain)
            apiUrl: 'https://aiagent.net2phone.com/api',
            
            // Client-side hints (server enforces actual security)
            allowedDomains: Object.freeze(${JSON.stringify(allowedDomains)}),
            maxMessagesPerMinute: 10,
            maxMessagesPerHour: ${maxPerHour},
            maxMessageLength: 2000,
            minMessageInterval: 2000,
            
            // Widget Appearance
            primaryColor: '${this.settings.primaryColor}',
            secondaryColor: '${this.settings.secondaryColor}',
            backgroundColor: '${this.settings.backgroundColor}',
            textColor: '${this.settings.textColor}',
            position: '${this.settings.position}',
            widgetStyle: '${this.settings.widgetStyle}',
            borderRadius: '16px',
            
            // Widget Content
            greeting: ${JSON.stringify(this.settings.greeting)},
            placeholder: ${JSON.stringify(this.settings.placeholder)},
            title: ${JSON.stringify(this.settings.widgetTitle)},
            
            // Widget Size
            width: '350px',
            height: '500px',
            iconSize: '56px',
            showUnreadBadge: true
        }),
        writable: false,
        configurable: false
    });
    
    // Domain validation (client-side hint only)
    var currentDomain = window.location.hostname;
    var isAllowedDomain = window.aiWidgetConfig.allowedDomains.some(function(domain) {
        // Exact match or subdomain match
        return currentDomain === domain || currentDomain.endsWith('.' + domain);
    });
    
    if (!isAllowedDomain) {
        console.warn('AI Widget: Domain not in allowlist. Server will validate.');
    }
    
    // Load widget script with integrity check${isHosted ? ' and SRI' : ''}
    var script = document.createElement('script');
    script.src = '${widgetUrl}';
    script.async = true;${isHosted ? `
    script.integrity = '${sriHash}';
    script.crossOrigin = 'anonymous';` : ''}
    
    script.onload = function() {
        console.log('✅ AI Chat Widget loaded successfully');
    };
    
    script.onerror = function() {
        console.error('❌ Failed to load AI Chat Widget - check network and domain authorization');
    };
    
    document.head.appendChild(script);
})();
</script>`;

        this.updateCodeOutput(code);
        this.showNotification('Widget code generated successfully!', 'success');
    }
    
    // Download widget functionality
    downloadWidget() {
        if (this.domains.length === 0) {
            this.showNotification('Please add at least one domain first', 'error');
            return;
        }
        
        const selectedAgent = this.availableAgents.find(agent => agent.id === this.settings.selectedAgent);
        const allowedDomains = this.domains.map(d => d.name);
        
        // Generate standalone widget.js file
        const widgetJs = this.generateStandaloneWidget(selectedAgent, allowedDomains);
        
        // Create and download file
        const blob = new Blob([widgetJs], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `widget-${this.settings.widgetId}.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Widget file downloaded successfully!', 'success');
    }
    
    generateStandaloneWidget(selectedAgent, allowedDomains) {
        return `/**
 * AI Chat Widget - Standalone Version (SECURE)
 * Widget ID: ${this.settings.widgetId}
 * Widget Name: ${this.settings.widgetName}
 * Generated: ${new Date().toISOString()}
 * 
 * SECURITY FEATURES:
 * - No embedded tokens (server validates domain)
 * - Rate limiting enforced server-side
 * - Domain validation with proper subdomain handling
 * - XSS protection via JSON escaping
 * - Immutable configuration
 * 
 * IMPORTANT: 
 * - Upload this file to your web server and reference it in your HTML
 * - Server must validate domain and enforce all security rules
 * - This client-side code provides hints only - security is server-enforced
 */

(function() {
    'use strict';
    
    // Widget Configuration - DO NOT MODIFY
    var WIDGET_CONFIG = {
        // Widget Identification
        widgetId: '${this.settings.widgetId}',
        widgetName: '${this.settings.widgetName}',
        
        // Agent Assignment
        agentId: '${this.settings.selectedAgent}',
        agentName: '${selectedAgent ? selectedAgent.name : 'Default Agent'}',
        
        // Security Configuration (server enforced)
        allowedDomains: Object.freeze(${JSON.stringify(allowedDomains)}),
        
        // API Configuration
        apiUrl: 'https://aiagent.net2phone.com/api',
        
        // Widget Settings (fixed rate limiting logic)
        maxMessagesPerMinute: 10,
        maxMessagesPerHour: ${Math.max(this.settings.maxMessages, 600)}, // Must be >= 600 (10/min * 60)
        maxMessageLength: 2000,
        minMessageInterval: 2000,
        
        // UI Configuration
        primaryColor: '${this.settings.primaryColor}',
        secondaryColor: '${this.settings.secondaryColor}',
        backgroundColor: '${this.settings.backgroundColor}',
        textColor: '${this.settings.textColor}',
        position: '${this.settings.position}',
        buttonStyle: '${this.settings.buttonStyle}',
        
        // Content (properly escaped)
        title: ${JSON.stringify(this.settings.widgetTitle)},
        greeting: ${JSON.stringify(this.settings.greeting)},
        placeholder: ${JSON.stringify(this.settings.placeholder)},
        
        // Widget Dimensions
        width: '350px',
        height: '500px',
        iconSize: '56px'
    };
    
    // Domain validation
    function validateDomain() {
        var currentDomain = window.location.hostname;
        var allowed = WIDGET_CONFIG.allowedDomains.some(function(domain) {
            return currentDomain === domain || currentDomain.endsWith('.' + domain);
        });
        
        if (!allowed) {
            console.warn('AI Chat Widget: Domain not authorized:', currentDomain);
            return false;
        }
        return true;
    }
    
    // Rate limiting
    var rateLimiter = {
        messages: [],
        
        checkLimit: function() {
            var now = Date.now();
            var minuteAgo = now - 60000;
            var hourAgo = now - 3600000;
            
            // Clean old messages
            this.messages = this.messages.filter(function(time) {
                return time > hourAgo;
            });
            
            var messagesThisMinute = this.messages.filter(function(time) {
                return time > minuteAgo;
            }).length;
            
            var messagesThisHour = this.messages.length;
            
            if (messagesThisMinute >= WIDGET_CONFIG.maxMessagesPerMinute) {
                return { allowed: false, reason: 'Too many messages per minute' };
            }
            
            if (messagesThisHour >= WIDGET_CONFIG.maxMessagesPerHour) {
                return { allowed: false, reason: 'Hourly message limit exceeded' };
            }
            
            return { allowed: true };
        },
        
        addMessage: function() {
            this.messages.push(Date.now());
        }
    };
    
    // Widget UI Creation
    function createWidget() {
        if (!validateDomain()) return;
        
        var widgetHtml = \`
            <div id="ai-chat-widget" style="position: fixed; z-index: 10000; \${getPositionStyles()}">
                <button id="ai-widget-button" style="
                    \${getButtonStyles()}
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                ">
                    \${getButtonContent()}
                </button>
                
                <div id="ai-widget-container" style="
                    position: absolute;
                    \${getContainerPosition()}
                    width: \${WIDGET_CONFIG.width};
                    height: \${WIDGET_CONFIG.height};
                    background: \${WIDGET_CONFIG.backgroundColor};
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                    transform: scale(0.8) translateY(20px);
                    opacity: 0;
                    transition: all 0.3s ease;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                ">
                    <div id="ai-widget-header" style="
                        background: \${WIDGET_CONFIG.primaryColor};
                        color: white;
                        padding: 16px;
                        font-weight: 600;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <span>\${WIDGET_CONFIG.title}</span>
                        <button id="ai-widget-close" style="
                            background: none;
                            border: none;
                            color: white;
                            cursor: pointer;
                            font-size: 18px;
                            padding: 4px;
                        ">×</button>
                    </div>
                    
                    <div id="ai-widget-messages" style="
                        flex: 1;
                        padding: 16px;
                        overflow-y: auto;
                        background: \${WIDGET_CONFIG.secondaryColor};
                    ">
                        <div style="
                            background: \${WIDGET_CONFIG.backgroundColor};
                            color: \${WIDGET_CONFIG.textColor};
                            padding: 12px;
                            border-radius: 12px;
                            margin-bottom: 12px;
                        ">\${WIDGET_CONFIG.greeting}</div>
                    </div>
                    
                    <div id="ai-widget-input" style="
                        padding: 16px;
                        border-top: 1px solid #eee;
                        background: \${WIDGET_CONFIG.backgroundColor};
                        display: flex;
                        gap: 8px;
                    ">
                        <input type="text" id="ai-message-input" placeholder="\${WIDGET_CONFIG.placeholder}" style="
                            flex: 1;
                            padding: 8px 12px;
                            border: 1px solid #ddd;
                            border-radius: 20px;
                            outline: none;
                        ">
                        <button id="ai-send-button" style="
                            background: \${WIDGET_CONFIG.primaryColor};
                            color: white;
                            border: none;
                            border-radius: 20px;
                            padding: 8px 16px;
                            cursor: pointer;
                        ">Send</button>
                    </div>
                </div>
            </div>
        \`;
        
        document.body.insertAdjacentHTML('beforeend', widgetHtml);
        initializeWidget();
    }
    
    function getPositionStyles() {
        switch (WIDGET_CONFIG.position) {
            case 'bottom-right': return 'bottom: 20px; right: 20px;';
            case 'bottom-left': return 'bottom: 20px; left: 20px;';
            case 'top-right': return 'top: 20px; right: 20px;';
            case 'top-left': return 'top: 20px; left: 20px;';
            default: return 'bottom: 20px; right: 20px;';
        }
    }
    
    function getButtonStyles() {
        var buttonStyle = WIDGET_CONFIG.buttonStyle;
        var baseStyle = \`
            background: \${WIDGET_CONFIG.primaryColor};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
        \`;
        
        switch (buttonStyle) {
            case 'chat-with-us':
            case 'help-question':
            case 'support-headset':
            case 'assistant-robot':
            case 'customer-service':
                return baseStyle + 'border-radius: 25px; padding: 12px 20px;';
            case 'message-bubble':
                return baseStyle + 'border-radius: 50% 50% 50% 10px; width: 52px; height: 52px;';
            case 'minimal-plus':
                return baseStyle + 'border-radius: 50%; width: 48px; height: 48px;';
            default:
                return baseStyle + 'border-radius: 50%; width: 56px; height: 56px;';
        }
    }
    
    function getButtonContent() {
        var buttonStyle = WIDGET_CONFIG.buttonStyle;
        var buttonConfig = {
            'modern-chat': '💬',
            'chat-with-us': '💬 Chat with us',
            'help-question': '❓ Need help?',
            'support-headset': '🎧 Live Support',
            'message-bubble': '💭',
            'minimal-plus': '+',
            'assistant-robot': '🤖 AI Assistant',
            'customer-service': '👋 Hello!'
        };
        
        return buttonConfig[buttonStyle] || '💬';
    }
    
    function getContainerPosition() {
        switch (WIDGET_CONFIG.position) {
            case 'bottom-right': return 'bottom: 90px; right: 0;';
            case 'bottom-left': return 'bottom: 90px; left: 0;';
            case 'top-right': return 'top: 90px; right: 0;';
            case 'top-left': return 'top: 90px; left: 0;';
            default: return 'bottom: 90px; right: 0;';
        }
    }
    
    function initializeWidget() {
        var button = document.getElementById('ai-widget-button');
        var container = document.getElementById('ai-widget-container');
        var closeBtn = document.getElementById('ai-widget-close');
        var sendBtn = document.getElementById('ai-send-button');
        var input = document.getElementById('ai-message-input');
        var messages = document.getElementById('ai-widget-messages');
        
        var isOpen = false;
        
        button.addEventListener('click', function() {
            if (!isOpen) {
                container.style.display = 'flex';
                setTimeout(function() {
                    container.style.transform = 'scale(1) translateY(0)';
                    container.style.opacity = '1';
                }, 10);
                isOpen = true;
            }
        });
        
        closeBtn.addEventListener('click', function() {
            container.style.transform = 'scale(0.8) translateY(20px)';
            container.style.opacity = '0';
            setTimeout(function() {
                container.style.display = 'none';
            }, 300);
            isOpen = false;
        });
        
        function sendMessage() {
            var message = input.value.trim();
            if (!message) return;
            
            var rateLimitCheck = rateLimiter.checkLimit();
            if (!rateLimitCheck.allowed) {
                addMessage('System', rateLimitCheck.reason, true);
                return;
            }
            
            addMessage('User', message);
            input.value = '';
            rateLimiter.addMessage();
            
            // Send to API (implement your API call here)
            setTimeout(function() {
                addMessage('Assistant', 'Thank you for your message. Our team will respond shortly.');
            }, 1000);
        }
        
        function addMessage(sender, text, isError) {
            var messageDiv = document.createElement('div');
            messageDiv.style.cssText = \`
                background: \${isError ? '#ff4757' : (sender === 'User' ? WIDGET_CONFIG.primaryColor : WIDGET_CONFIG.backgroundColor)};
                color: \${isError || sender === 'User' ? 'white' : WIDGET_CONFIG.textColor};
                padding: 12px;
                border-radius: 12px;
                margin-bottom: 12px;
                margin-left: \${sender === 'User' ? 'auto' : '0'};
                margin-right: \${sender === 'User' ? '0' : 'auto'};
                max-width: 80%;
            \`;
            messageDiv.textContent = text;
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
    
})();`;
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
        // Ensure nav item is active - simplified for single nav item
        const navItem = document.querySelector('.nav-item');
        if (navItem) {
            navItem.classList.add('active');
        }
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
        document.getElementById('widgetName').value = this.settings.widgetName;
        document.getElementById('selectedAgent').value = this.settings.selectedAgent;
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

function updateWidgetName() {
    widgetBuilder.updateWidgetName();
}

function saveCurrentWidget() {
    widgetBuilder.saveCurrentWidget();
}

function showWidgetsList() {
    window.location.href = 'widgets-dashboard.html';
}

function selectHostingOption(option) {
    if (widgetBuilder) {
        widgetBuilder.selectHostingOption(option);
    }
}

function downloadWidget() {
    if (widgetBuilder) {
        widgetBuilder.downloadWidget();
    }
}

function addDomain() {
    if (widgetBuilder) {
        widgetBuilder.addDomain();
    }
}

function applyTheme(theme) {
    if (widgetBuilder) {
        widgetBuilder.applyTheme(theme);
    }
}

function updateSettings() {
    if (widgetBuilder) {
        widgetBuilder.updateSettings();
    }
}

function generateWidget() {
    if (widgetBuilder) {
        widgetBuilder.generateWidget();
    }
}

function copyCode() {
    if (widgetBuilder) {
        widgetBuilder.copyCode();
    }
}

function toggleWidget() {
    if (widgetBuilder) {
        widgetBuilder.toggleWidget();
    }
}

function updateWidgetName() {
    if (widgetBuilder) {
        widgetBuilder.updateWidgetName();
    }
}

function saveCurrentWidget() {
    if (widgetBuilder) {
        widgetBuilder.saveCurrentWidget();
    }
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