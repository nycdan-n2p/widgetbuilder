import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check,
  Copy,
  MessageSquare,
  Settings,
  Bot,
  BookOpen,
  Wrench,
  Phone,
  MessageCircle,
  Palette,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';

function App(): JSX.Element {
  // Widget settings state
  const [widgetSettings, setWidgetSettings] = useState({
    widgetName: 'My AI Widget',
    selectedAgent: 'boss-support',
    primaryColor: '#667eea',
    secondaryColor: '#f3f4f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    widgetTitle: 'AI Assistant',
    greeting: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    buttonStyle: 'modern-chat',
    hostingOption: 'hosted',
    currentTheme: 'light'
  });

  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const colors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a',
    '#ffecd2', '#fcb69f', '#a8edea', '#d299c2', '#89f7fe'
  ];

  const availableAgents = [
    { id: 'boss-support', name: 'Boss Support', description: 'Expert support for IDT Boss Money Transfer' },
    { id: 'boss-sales', name: 'Boss Sales', description: 'Sales specialist for Boss Money services' },
    { id: 'net2phone-support', name: 'Net2Phone Support', description: 'Technical support for Net2Phone services' },
    { id: 'general-assistant', name: 'General Assistant', description: 'Multi-purpose AI assistant' }
  ];

  const buttonStyles = {
    'modern-chat': { name: 'Modern Chat', icon: '💬', shape: 'circle' },
    'help-question': { name: 'Help & Questions', icon: '❓', shape: 'pill' },
    'support-headset': { name: 'Live Support', icon: '🎧', shape: 'rounded' },
    'chat-with-us': { name: 'Chat With Us', icon: '💬', shape: 'pill' }
  };

  const updateSetting = (key: string, value: any) => {
    setWidgetSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const themePresets = {
    light: {
      primaryColor: '#4F46E5',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      secondaryColor: '#F3F4F6'
    },
    dark: {
      primaryColor: '#6366F1',
      backgroundColor: '#1F2937',
      textColor: '#F9FAFB',
      secondaryColor: '#374151'
    }
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    const preset = themePresets[theme];
    setWidgetSettings(prev => ({
      ...prev,
      currentTheme: theme,
      ...preset
    }));
  };

  const generateWidget = () => {
    const widgetCode = `<!-- Net2Phone AI Widget -->
<div id="net2phone-widget-${Date.now()}"></div>
<script>
  (function() {
    const widget = {
      apiKey: 'your-api-key',
      agent: '${widgetSettings.selectedAgent}',
      title: '${widgetSettings.widgetTitle}',
      greeting: '${widgetSettings.greeting}',
      placeholder: '${widgetSettings.placeholder}',
      primaryColor: '${widgetSettings.primaryColor}',
      backgroundColor: '${widgetSettings.backgroundColor}',
      textColor: '${widgetSettings.textColor}',
      buttonStyle: '${widgetSettings.buttonStyle}',
      theme: '${widgetSettings.currentTheme}'
    };
    
    // Load Net2Phone AI Widget
    const script = document.createElement('script');
    script.src = 'https://widget.net2phone.ai/v1/widget.js';
    script.setAttribute('data-config', JSON.stringify(widget));
    document.head.appendChild(script);
  })();
</script>`;
    
    setGeneratedCode(widgetCode);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const downloadWidget = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widgetSettings.widgetName.replace(/\s+/g, '-').toLowerCase()}-widget.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderWidgetPreview = () => {
    const buttonStyle = buttonStyles[widgetSettings.buttonStyle as keyof typeof buttonStyles];
    const isCircle = buttonStyle?.shape === 'circle';
    const isPill = buttonStyle?.shape === 'pill';
    
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Widget Chat Window (if open) */}
        {showPreview && (
          <div 
            className="mb-4 w-80 h-96 rounded-lg shadow-2xl border border-gray-300 overflow-hidden"
            style={{ backgroundColor: widgetSettings.backgroundColor }}
          >
            {/* Chat Header */}
            <div 
              className="p-4 border-b flex items-center justify-between"
              style={{ 
                backgroundColor: widgetSettings.primaryColor,
                color: widgetSettings.currentTheme === 'light' ? '#ffffff' : widgetSettings.textColor 
              }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="font-medium">{widgetSettings.widgetTitle}</span>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
              >
                ×
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="p-4 flex-1 flex flex-col justify-end">
              <div className="mb-4">
                <div 
                  className="inline-block p-3 rounded-lg text-sm"
                  style={{ 
                    backgroundColor: widgetSettings.primaryColor,
                    color: '#ffffff'
                  }}
                >
                  {widgetSettings.greeting}
                </div>
              </div>
              
              {/* Input Area */}
              <div className="border-t pt-3">
                <input
                  type="text"
                  placeholder={widgetSettings.placeholder}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ 
                    borderColor: widgetSettings.primaryColor,
                    color: widgetSettings.textColor
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Widget Button */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`shadow-lg hover:scale-110 transition-all flex items-center justify-center font-medium text-white ${
            isCircle ? 'w-14 h-14 rounded-full' : 
            isPill ? 'px-4 py-3 rounded-full' : 
            'px-4 py-3 rounded-lg'
          }`}
          style={{ backgroundColor: widgetSettings.primaryColor }}
          title="Preview Widget"
        >
          {buttonStyle?.icon && <span className="mr-2">{buttonStyle.icon}</span>}
          {!isCircle && buttonStyle?.name}
        </button>
      </div>
    );
  };

  const renderThemeSection = () => (
    <div className="mb-8">
      <h3 className="text-white text-lg font-medium mb-4">Theme</h3>
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => applyTheme('light')}
          className={`relative p-4 bg-gray-700 rounded-lg cursor-pointer border-2 transition-all hover:bg-gray-600 ${widgetSettings.currentTheme === 'light' ? 'border-blue-400' : 'border-transparent'}`}
        >
          {widgetSettings.currentTheme === 'light' && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
          <div className="bg-gray-200 rounded-lg p-3 mb-2">
            <div 
              className="text-white text-xs px-2 py-1 rounded-full inline-flex items-center space-x-1"
              style={{ backgroundColor: themePresets.light.primaryColor }}
            >
              <span>👋</span>
              <span>Hey 👋 May I help you?</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm">Light Theme</p>
          <p className="text-gray-500 text-xs mt-1">White background, dark text</p>
        </div>
        
        <div 
          onClick={() => applyTheme('dark')}
          className={`relative p-4 bg-gray-700 rounded-lg cursor-pointer border-2 transition-all hover:bg-gray-600 ${widgetSettings.currentTheme === 'dark' ? 'border-blue-400' : 'border-transparent'}`}
        >
          {widgetSettings.currentTheme === 'dark' && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
          <div className="bg-gray-800 rounded-lg p-3 mb-2">
            <div 
              className="text-white text-xs px-2 py-1 rounded-full inline-flex items-center space-x-1"
              style={{ backgroundColor: themePresets.dark.primaryColor }}
            >
              <span>👋</span>
              <span>Hey 👋 May I help you?</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm">Dark Theme</p>
          <p className="text-gray-500 text-xs mt-1">Dark background, light text</p>
        </div>
      </div>
    </div>
  );

  const renderMainColors = () => (
    <div className="mb-8">
      <h3 className="text-white text-lg font-medium mb-4">Main Colors</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => updateSetting('primaryColor', color)}
            className={`w-10 h-10 rounded-full border-2 ${widgetSettings.primaryColor === color ? 'border-blue-400' : 'border-gray-600'} relative hover:scale-110 transition-transform`}
            style={{ backgroundColor: color }}
          >
            {widgetSettings.primaryColor === color && (
              <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-md" />
            )}
          </button>
        ))}
        
        {/* Custom Color Picker */}
        <div className="relative">
          <input
            type="color"
            value={widgetSettings.primaryColor}
            onChange={(e) => updateSetting('primaryColor', e.target.value)}
            className="w-10 h-10 rounded-full border-2 border-gray-600 cursor-pointer bg-transparent"
            title="Choose custom color"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
            <Palette className="w-2 h-2 text-gray-300" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-300 text-sm mb-2">Primary color</p>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={widgetSettings.primaryColor}
              onChange={(e) => updateSetting('primaryColor', e.target.value)}
              className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
              title="Pick primary color"
            />
            <input
              type="text"
              value={widgetSettings.primaryColor}
              onChange={(e) => updateSetting('primaryColor', e.target.value)}
              className="text-white text-sm font-mono bg-gray-700 px-2 py-1 rounded border border-gray-600 focus:border-blue-400 focus:outline-none flex-1"
              placeholder="#667eea"
            />
          </div>
        </div>
        
        <div>
          <p className="text-gray-300 text-sm mb-2">Background color</p>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={widgetSettings.backgroundColor}
              onChange={(e) => updateSetting('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
              title="Pick background color"
            />
            <input
              type="text"
              value={widgetSettings.backgroundColor}
              onChange={(e) => updateSetting('backgroundColor', e.target.value)}
              className="text-white text-sm font-mono bg-gray-700 px-2 py-1 rounded border border-gray-600 focus:border-blue-400 focus:outline-none flex-1"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderButtonStyle = () => (
    <div className="mb-8">
      <h3 className="text-white text-lg font-medium mb-4">Button Style</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(buttonStyles).map(([key, style]) => (
          <button
            key={key}
            onClick={() => updateSetting('buttonStyle', key)}
            className={`p-4 rounded-lg border-2 ${widgetSettings.buttonStyle === key ? 'border-blue-400 bg-blue-900 bg-opacity-20' : 'border-gray-600 bg-gray-700'} hover:bg-gray-600 transition-colors text-left`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{style.icon}</span>
              <span className="text-white font-medium">{style.name}</span>
            </div>
            <p className="text-gray-400 text-sm">Shape: {style.shape}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGenerateCode = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-medium">Generate Widget Code</h3>
        <div className="flex space-x-2">
          <button 
            onClick={generateWidget}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate</span>
          </button>
          {generatedCode && (
            <>
              <button 
                onClick={copyCode}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button 
                onClick={downloadWidget}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </>
          )}
        </div>
      </div>
      {generatedCode ? (
        <div className="bg-gray-800 rounded-lg p-4 relative max-h-64 overflow-auto">
          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{generatedCode}</pre>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400">Click "Generate" to create your widget code</p>
        </div>
      )}
    </div>
  );

  const renderDeleteWidget = () => (
    <div>
      <h3 className="text-white text-lg font-medium mb-4">Delete Widget</h3>
      <button 
        onClick={() => {
          if (confirm('Are you sure you want to delete this widget configuration?')) {
            // Reset to default settings
            setWidgetSettings({
              widgetName: 'My AI Widget',
              selectedAgent: 'boss-support',
              primaryColor: '#667eea',
              secondaryColor: '#f3f4f6',
              backgroundColor: '#ffffff',
              textColor: '#1f2937',
              widgetTitle: 'AI Assistant',
              greeting: 'Hi! How can I help you today?',
              placeholder: 'Type your message...',
              buttonStyle: 'modern-chat',
              hostingOption: 'hosted',
              currentTheme: 'light'
            });
            setGeneratedCode('');
          }
        }}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Delete Configuration
      </button>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Sidebar Navigation */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">net2phone AI</span>
          </div>
        </div>

        {/* Virtual Agents Dropdown */}
        <div className="p-4 border-b border-gray-700">
          <div className="bg-gray-700 rounded-lg px-3 py-2 flex items-center justify-between text-white text-sm cursor-pointer">
            <span>Virtual Agents</span>
            <ArrowLeft className="w-4 h-4 rotate-90" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          <div className="mb-4">
            <div className="flex items-center space-x-2 px-3 py-2 text-gray-400 text-sm">
              <BookOpen className="w-4 h-4" />
              <span>Knowledge Bases</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 text-gray-400 text-sm">
              <Wrench className="w-4 h-4" />
              <span>Tools</span>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center space-x-2 px-3 py-2 text-gray-400 text-sm">
              <Phone className="w-4 h-4" />
              <span>Phone Numbers</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-2 text-gray-400 text-sm">
            <MessageCircle className="w-4 h-4" />
            <span>Conversation History</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-2 text-white bg-gray-700 rounded-lg text-sm">
            <Palette className="w-4 h-4" />
            <span>Widget Builder</span>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-blue-800 px-6 py-3 text-center">
          <div className="flex items-center justify-center space-x-2 text-white">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Widget Builder</span>
          </div>
          <p className="text-blue-200 text-sm">The widget functions as a preview in edit mode.</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center space-x-4 mb-8">
              <button className="text-gray-400 hover:text-white flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h1 className="text-white text-xl font-medium">Create new Widget</h1>
              <button className="ml-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">
                Edit
              </button>
            </div>

            {/* Name Field */}
            <div className="mb-8">
              <label className="block text-gray-300 text-sm mb-2">Widget Name</label>
              <input
                type="text"
                value={widgetSettings.widgetName}
                onChange={(e) => updateSetting('widgetName', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter a name for your widget"
              />
            </div>

            {/* Virtual Agent Selection */}
            <div className="mb-8">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Virtual Agent</h3>
                  <span className="text-blue-400 text-sm">
                    {availableAgents.find(a => a.id === widgetSettings.selectedAgent)?.name || 'None selected'}
                  </span>
                </div>
                <select
                  value={widgetSettings.selectedAgent}
                  onChange={(e) => updateSetting('selectedAgent', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  {availableAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Widget Configurations */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-medium">Widget Configurations</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Widget Title</label>
                  <input
                    type="text"
                    value={widgetSettings.widgetTitle}
                    onChange={(e) => updateSetting('widgetTitle', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    placeholder="AI Assistant"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Placeholder Text</label>
                  <input
                    type="text"
                    value={widgetSettings.placeholder}
                    onChange={(e) => updateSetting('placeholder', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    placeholder="Type your message..."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Greeting message</label>
                  <textarea
                    value={widgetSettings.greeting}
                    onChange={(e) => updateSetting('greeting', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400 h-24 resize-none"
                    placeholder="Hi! How can I help you today?"
                  />
                </div>
              </div>
            </div>

            {/* Theme and Styling Section */}
            <div className="mb-8">
              <h2 className="text-white text-xl font-semibold mb-6">Theme and Styling</h2>
              {renderThemeSection()}
              {renderMainColors()}
              {renderButtonStyle()}
            </div>

            {/* Hosting Options */}
            <div className="mb-8">
              <h2 className="text-white text-lg font-medium mb-4">Hosting Options</h2>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => updateSetting('hostingOption', 'hosted')}
                  className={`p-6 rounded-lg cursor-pointer border-2 transition-all ${widgetSettings.hostingOption === 'hosted' ? 'border-blue-400 bg-blue-900 bg-opacity-30' : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}`}
                >
                  <h3 className="text-white font-medium mb-2">net2phone Hosted</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Widget loads from our servers. Automatic updates, fast maintenance, and better performance.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-green-600 text-white rounded">Auto-updates</span>
                    <span className="px-2 py-1 bg-blue-600 text-white rounded">CDN delivery</span>
                    <span className="px-2 py-1 bg-purple-600 text-white rounded">Zero maintenance</span>
                  </div>
                </div>
                
                <div 
                  onClick={() => updateSetting('hostingOption', 'self-hosted')}
                  className={`p-6 rounded-lg cursor-pointer border-2 transition-all ${widgetSettings.hostingOption === 'self-hosted' ? 'border-blue-400 bg-blue-900 bg-opacity-30' : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}`}
                >
                  <h3 className="text-white font-medium mb-2">Self-Hosted</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Download widget.js and host it on your own servers. Full control but requires manual updates.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-yellow-600 text-white rounded">Manual updates</span>
                    <span className="px-2 py-1 bg-gray-600 text-white rounded">Custom hosting</span>
                    <span className="px-2 py-1 bg-blue-600 text-white rounded">Full control</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Code and Delete Widget */}
            <div className="space-y-8">
              {renderGenerateCode()}
              {renderDeleteWidget()}
            </div>
          </div>
        </div>
      </div>

      {/* Live Widget Preview */}
      {renderWidgetPreview()}
    </div>
  );
}

export default App;