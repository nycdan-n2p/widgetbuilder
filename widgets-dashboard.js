// Widgets Dashboard - Management Interface
class WidgetsDashboard {
    constructor() {
        this.widgets = [];
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
        
        this.init();
    }
    
    init() {
        this.loadWidgets();
        this.renderWidgets();
        this.updateCount();
    }
    
    loadWidgets() {
        try {
            const saved = localStorage.getItem('aiWidgetSavedWidgets');
            if (saved) {
                this.widgets = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading widgets:', error);
            this.widgets = [];
        }
    }
    
    renderWidgets() {
        const grid = document.getElementById('widgetsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (this.widgets.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        grid.innerHTML = this.widgets.map(widget => this.createWidgetCard(widget)).join('');
    }
    
    createWidgetCard(widget) {
        const agent = this.availableAgents.find(a => a.id === widget.selectedAgent);
        const domainsCount = widget.domains ? widget.domains.length : 0;
        const updatedDate = widget.updatedAt ? new Date(widget.updatedAt) : new Date(widget.createdAt);
        const timeAgo = this.formatTimeAgo(updatedDate);
        
        return `
            <div class="widget-card" onclick="editWidget('${widget.widgetId}')">
                <div class="widget-header">
                    <div class="widget-info">
                        <div class="widget-name">${widget.widgetName || 'Unnamed Widget'}</div>
                        <div class="widget-description">${widget.widgetTitle || 'AI Assistant'}</div>
                    </div>
                    <div class="widget-actions" onclick="event.stopPropagation()">
                        <button class="widget-action" onclick="showWidgetInfo('${widget.widgetId}')" title="Widget Info">
                            ℹ️
                        </button>
                        <button class="widget-action" onclick="cloneWidget('${widget.widgetId}')" title="Clone Widget">
                            📋
                        </button>
                        <button class="widget-action" onclick="deleteWidget('${widget.widgetId}')" title="Delete Widget">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="widget-stats">
                    <div class="stat-item">
                        <div class="stat-number">${domainsCount}</div>
                        <div class="stat-label">Domains</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${widget.maxMessages || 50}</div>
                        <div class="stat-label">Max/Hour</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.getThemeDisplayName(widget.currentTheme)}</div>
                        <div class="stat-label">Theme</div>
                    </div>
                </div>
                
                <div class="widget-details">
                    <div class="widget-agent">
                        <div class="agent-avatar">${agent ? agent.avatar : '🤖'}</div>
                        <div class="agent-name">${agent ? agent.name : 'Unknown Agent'}</div>
                    </div>
                    <div class="widget-updated">${timeAgo}</div>
                </div>
            </div>
        `;
    }
    
    getThemeDisplayName(theme) {
        const themeNames = {
            'default': 'Default',
            'dark': 'Dark',
            'ocean': 'Ocean',
            'sunset': 'Sunset',
            'forest': 'Forest',
            'purple': 'Purple',
            'glassmorphic': 'Glass',
            'minimal': 'Minimal',
            'custom': 'Custom'
        };
        return themeNames[theme] || 'Default';
    }
    
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }
    
    updateCount() {
        const count = this.widgets.length;
        const countElement = document.getElementById('widgetsCount');
        countElement.textContent = `${count} Widget${count !== 1 ? 's' : ''}`;
    }
    
    editWidget(widgetId) {
        // Redirect to builder with widget ID parameter
        window.location.href = `integrated-builder.html?widget=${widgetId}`;
    }
    
    cloneWidget(widgetId) {
        const widget = this.widgets.find(w => w.widgetId === widgetId);
        if (!widget) {
            this.showNotification('Widget not found', 'error');
            return;
        }
        
        // Create new widget ID
        const newWidgetId = this.generateWidgetId();
        
        // Clone the widget
        const clonedWidget = {
            ...widget,
            widgetId: newWidgetId,
            widgetName: `${widget.widgetName} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to widgets array
        this.widgets.push(clonedWidget);
        
        // Save to localStorage
        localStorage.setItem('aiWidgetSavedWidgets', JSON.stringify(this.widgets));
        
        // Re-render
        this.renderWidgets();
        this.updateCount();
        
        this.showNotification(`Widget cloned as "${clonedWidget.widgetName}"`, 'success');
    }
    
    deleteWidget(widgetId) {
        const widget = this.widgets.find(w => w.widgetId === widgetId);
        if (!widget) {
            this.showNotification('Widget not found', 'error');
            return;
        }
        
        if (confirm(`Delete widget "${widget.widgetName}"? This action cannot be undone.`)) {
            // Remove from widgets array
            this.widgets = this.widgets.filter(w => w.widgetId !== widgetId);
            
            // Save to localStorage
            localStorage.setItem('aiWidgetSavedWidgets', JSON.stringify(this.widgets));
            
            // Re-render
            this.renderWidgets();
            this.updateCount();
            
            this.showNotification(`Widget "${widget.widgetName}" deleted`, 'success');
        }
    }
    
    generateWidgetId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `widget_${timestamp}_${random}`;
    }
    
    refreshWidgets() {
        this.loadWidgets();
        this.renderWidgets();
        this.updateCount();
        this.showNotification('Widgets refreshed', 'success');
    }
    
    showWidgetInfo(widgetId) {
        const widget = this.widgets.find(w => w.widgetId === widgetId);
        if (!widget) {
            this.showNotification('Widget not found', 'error');
            return;
        }
        
        const agent = this.availableAgents.find(a => a.id === widget.selectedAgent);
        const createdDate = new Date(widget.createdAt).toLocaleString();
        const updatedDate = widget.updatedAt ? new Date(widget.updatedAt).toLocaleString() : 'Never';
        const domainsCount = widget.domains ? widget.domains.length : 0;
        const domainsList = widget.domains ? widget.domains.map(d => d.name).join(', ') : 'None';
        
        // Create modal content
        const modalContent = `
            <div class="widget-info-modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Widget Information</h3>
                    <button class="modal-close" onclick="closeWidgetInfo()">×</button>
                </div>
                <div class="modal-content">
                    <div class="info-group">
                        <label>Widget Name:</label>
                        <span>${widget.widgetName}</span>
                    </div>
                    <div class="info-group">
                        <label>Widget ID (UID):</label>
                        <span class="widget-uid" onclick="copyToClipboard('${widget.widgetId}')">
                            ${widget.widgetId} 
                            <button class="copy-btn" title="Copy UID">📋</button>
                        </span>
                    </div>
                    <div class="info-group">
                        <label>Assigned Agent:</label>
                        <span>${agent ? agent.name : 'Unknown'} ${agent ? agent.avatar : ''}</span>
                    </div>
                    <div class="info-group">
                        <label>Domains (${domainsCount}):</label>
                        <span>${domainsList}</span>
                    </div>
                    <div class="info-group">
                        <label>Theme:</label>
                        <span>${this.getThemeDisplayName(widget.currentTheme)}</span>
                    </div>
                    <div class="info-group">
                        <label>Button Style:</label>
                        <span>${widget.buttonStyle || 'modern-chat'}</span>
                    </div>
                    <div class="info-group">
                        <label>Hosting:</label>
                        <span>${widget.hostingOption === 'self-hosted' ? 'Self-Hosted' : 'Net2Phone Hosted'}</span>
                    </div>
                    <div class="info-group">
                        <label>Max Messages/Hour:</label>
                        <span>${widget.maxMessages || 50}</span>
                    </div>
                    <div class="info-group">
                        <label>Created:</label>
                        <span>${createdDate}</span>
                    </div>
                    <div class="info-group">
                        <label>Last Updated:</label>
                        <span>${updatedDate}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.id = 'widgetInfoModal';
        modalBackdrop.className = 'modal-backdrop';
        modalBackdrop.innerHTML = modalContent;
        modalBackdrop.onclick = () => this.closeWidgetInfo();
        
        document.body.appendChild(modalBackdrop);
    }
    
    closeWidgetInfo() {
        const modal = document.getElementById('widgetInfoModal');
        if (modal) {
            modal.remove();
        }
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Widget UID copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Widget UID copied to clipboard!', 'success');
        });
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'error') {
            notification.style.background = '#ff4757';
            notification.style.color = 'white';
        } else if (type === 'success') {
            notification.style.background = '#00d67a';
            notification.style.color = 'white';
        } else {
            notification.style.background = '#4a9eff';
            notification.style.color = 'white';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global Functions
function showSection(section) {
    console.log('Navigate to section:', section);
    // In a real app, this would handle navigation between different sections
}

function editWidget(widgetId) {
    dashboard.editWidget(widgetId);
}

function cloneWidget(widgetId) {
    dashboard.cloneWidget(widgetId);
}

function deleteWidget(widgetId) {
    dashboard.deleteWidget(widgetId);
}

function refreshWidgets() {
    dashboard.refreshWidgets();
}

function showWidgetInfo(widgetId) {
    dashboard.showWidgetInfo(widgetId);
}

function closeWidgetInfo() {
    dashboard.closeWidgetInfo();
}

function copyToClipboard(text) {
    dashboard.copyToClipboard(text);
}

// Initialize Dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new WidgetsDashboard();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);