import React, { useState, useEffect } from 'react';
import { Sun, Moon, TrendingUp, Search, Settings, BarChart3 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CompanyResearch from './components/CompanyResearch';
import TradeReview from './components/TradeReview';
import SettingsPanel from './components/SettingsPanel';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('light-mode', savedTheme === 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light-mode', newTheme === 'light');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'research', label: 'Research', icon: Search },
    { id: 'review', label: 'Trade Review', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'research':
        return <CompanyResearch />;
      case 'review':
        return <TradeReview />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className="gradient-header p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Options Trading AI</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-gray-900" />}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App;