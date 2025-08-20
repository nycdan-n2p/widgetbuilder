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
  Palette
} from 'lucide-react';

function App(): JSX.Element {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [selectedColor, setSelectedColor] = useState<string>('#2372E8');
  const [iconColor] = useState<string>('#FFFFFF');
  const [selectedButtonStyle, setSelectedButtonStyle] = useState<string>('message');
  const [widgetName, setWidgetName] = useState<string>('');
  const [widgetTitle, setWidgetTitle] = useState<string>('');
  const [placeholderText, setPlaceholderText] = useState<string>('');
  const [greetingMessage, setGreetingMessage] = useState<string>('');
  const [selectedHosting, setSelectedHosting] = useState<'net2phone' | 'self'>('net2phone');
  const [generatedCode] = useState<string>('uhciuashcuiashviuashviuahviuashyjiabsjvhjkabshjvbashkxhasbvkjhasbvkjhsbznvcyjbsvjkbnz...');

  const colors = [
    '#000000', '#6366F1', '#2372E8', '#06B6D4', '#10B981', 
    '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#8B5CF6'
  ];

  const renderThemeSection = () => (
    <div className="mb-8">
      <h3 className="text-white text-lg font-medium mb-4">Theme</h3>
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => setSelectedTheme('light')}
          className={`relative p-4 bg-gray-700 rounded-lg cursor-pointer border-2 ${selectedTheme === 'light' ? 'border-blue-400' : 'border-transparent'}`}
        >
          {selectedTheme === 'light' && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
          <div className="bg-gray-200 rounded-lg p-3 mb-2">
            <div className="bg-black text-white text-xs px-2 py-1 rounded-full inline-flex items-center space-x-1">
              <span>👋</span>
              <span>Hey 👋 May I help you?</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm">Light Theme</p>
        </div>
        
        <div 
          onClick={() => setSelectedTheme('dark')}
          className={`relative p-4 bg-gray-700 rounded-lg cursor-pointer border-2 ${selectedTheme === 'dark' ? 'border-blue-400' : 'border-transparent'}`}
        >
          {selectedTheme === 'dark' && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
          <div className="bg-gray-500 rounded-lg p-3 mb-2">
            <div className="bg-white text-black text-xs px-2 py-1 rounded-full inline-flex items-center space-x-1">
              <span>👋</span>
              <span>Hey 👋 May I help you?</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm">Dark Theme</p>
        </div>
      </div>
    </div>
  );

  const renderMainColors = () => (
    <div className="mb-8">
      <h3 className="text-white text-lg font-medium mb-4">Main Colors</h3>
      <div className="flex space-x-2 mb-4">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-blue-400' : 'border-gray-600'} relative`}
            style={{ backgroundColor: color }}
          >
            {selectedColor === color && (
              <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
            )}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-300 text-sm mb-2">Bubble color</p>
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded" 
              style={{ backgroundColor: selectedColor }}
            ></div>
            <span className="text-white text-sm font-mono">{selectedColor}</span>
          </div>
        </div>
        
        <div>
          <p className="text-gray-300 text-sm mb-2">Icon color</p>
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded bg-white"
            ></div>
            <span className="text-white text-sm font-mono">{iconColor}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderButtonStyle = () => (
    <div className="mb-8">
      <h3 className="text-white text-lg font-medium mb-4">Button Style</h3>
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedButtonStyle('help')}
          className={`p-3 rounded-lg border-2 ${selectedButtonStyle === 'help' ? 'border-blue-400' : 'border-gray-600'} bg-gray-700 flex flex-col items-center space-y-1`}
        >
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">?</span>
          </div>
          {selectedButtonStyle === 'help' && (
            <Check className="w-3 h-3 text-blue-400" />
          )}
        </button>
        
        <button
          onClick={() => setSelectedButtonStyle('message')}
          className={`p-3 rounded-lg border-2 ${selectedButtonStyle === 'message' ? 'border-blue-400' : 'border-gray-600'} bg-gray-700 flex flex-col items-center space-y-1 relative`}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedColor }}>
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          {selectedButtonStyle === 'message' && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
              <Check className="w-2 h-2 text-white" />
            </div>
          )}
        </button>
        
        <button
          onClick={() => setSelectedButtonStyle('help2')}
          className={`p-3 rounded-lg border-2 ${selectedButtonStyle === 'help2' ? 'border-blue-400' : 'border-gray-600'} bg-gray-700 flex flex-col items-center space-y-1`}
        >
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">?</span>
          </div>
          {selectedButtonStyle === 'help2' && (
            <Check className="w-3 h-3 text-blue-400" />
          )}
        </button>
        
        <button
          onClick={() => setSelectedButtonStyle('message2')}
          className={`p-3 rounded-lg border-2 ${selectedButtonStyle === 'message2' ? 'border-blue-400' : 'border-gray-600'} bg-gray-700 flex flex-col items-center space-y-1`}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedColor }}>
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          {selectedButtonStyle === 'message2' && (
            <Check className="w-3 h-3 text-blue-400" />
          )}
        </button>
      </div>
    </div>
  );

  const renderGenerateCode = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-medium">Generate a Code</h3>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">
          Generate
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 relative">
        <p className="text-gray-300 text-sm font-mono break-all">{generatedCode}</p>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <span className="text-sm">show more</span>
        </button>
        <button className="absolute bottom-2 right-2 p-2 text-gray-400 hover:text-white">
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderDeleteWidget = () => (
    <div>
      <h3 className="text-white text-lg font-medium mb-4">Delete Widget</h3>
      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
        Delete
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
              <label className="block text-gray-300 text-sm mb-2">Name</label>
              <input
                type="text"
                value={widgetName}
                onChange={(e) => setWidgetName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Virtual Agent and Domain */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">Virtual Agent</h3>
                  <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded">Assign</button>
                </div>
                <p className="text-gray-400 text-sm">There is no Virtual Agent assigned to this widget.</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">Domain</h3>
                  <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded">Assign</button>
                </div>
                <p className="text-gray-400 text-sm">There is no authorized domain assigned to this widget.</p>
              </div>
            </div>

            {/* Widget Configurations */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-medium">Widget Configurations</h2>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Edit</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Widget Title</label>
                  <input
                    type="text"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Placeholder Text</label>
                  <input
                    type="text"
                    value={placeholderText}
                    onChange={(e) => setPlaceholderText(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Greeting message</label>
                  <input
                    type="text"
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
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
                  onClick={() => setSelectedHosting('net2phone')}
                  className={`p-6 rounded-lg cursor-pointer border-2 ${selectedHosting === 'net2phone' ? 'border-blue-400 bg-blue-900 bg-opacity-30' : 'border-gray-600 bg-gray-800'}`}
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
                  onClick={() => setSelectedHosting('self')}
                  className={`p-6 rounded-lg cursor-pointer border-2 ${selectedHosting === 'self' ? 'border-blue-400 bg-gray-800' : 'border-gray-600 bg-gray-800'}`}
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
    </div>
  );
}

export default App;