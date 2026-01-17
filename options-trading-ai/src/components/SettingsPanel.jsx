import React, { useState, useEffect } from 'react';
import { Save, Sun, Moon } from 'lucide-react';

function SettingsPanel() {
  const [settings, setSettings] = useState({
    capital: 71000,
    maxAllocation: 50,
    weeklyPremiumMin: 340,
    weeklyPremiumMax: 410,
    maxCashSecuredDays: 30,
    maxCoveredCallDays: 5
  });

  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    // Update portfolio capital
    const portfolio = JSON.parse(localStorage.getItem('portfolio') || '{}');
    portfolio.capital = settings.capital;
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    alert('Settings saved successfully!');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light-mode', newTheme === 'light');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Theme Toggle */}
      <div className="gradient-card rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme Settings</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            <span className="text-gray-900 dark:text-white font-medium">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="gradient-button text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>

      {/* Portfolio Settings */}
      <div className="gradient-card rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Starting Capital
            </label>
            <input
              type="number"
              value={settings.capital}
              onChange={(e) => setSettings({...settings, capital: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current: {formatCurrency(settings.capital)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Allocation (%)
            </label>
            <input
              type="number"
              value={settings.maxAllocation}
              onChange={(e) => setSettings({...settings, maxAllocation: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended: 50% or less</p>
          </div>
        </div>
      </div>

      {/* Premium Goals */}
      <div className="gradient-card rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Premium Goals</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Target
            </label>
            <input
              type="number"
              value={settings.weeklyPremiumMin}
              onChange={(e) => setSettings({...settings, weeklyPremiumMin: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Target
            </label>
            <input
              type="number"
              value={settings.weeklyPremiumMax}
              onChange={(e) => setSettings({...settings, weeklyPremiumMax: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Target Range: {formatCurrency(settings.weeklyPremiumMin)} - {formatCurrency(settings.weeklyPremiumMax)}
        </p>
      </div>

      {/* Trading Rules */}
      <div className="gradient-card rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conservative Trading Rules</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Cash-Secured Put Days
            </label>
            <input
              type="number"
              value={settings.maxCashSecuredDays}
              onChange={(e) => setSettings({...settings, maxCashSecuredDays: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended: 30 days</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Covered Call Days
            </label>
            <input
              type="number"
              value={settings.maxCoveredCallDays}
              onChange={(e) => setSettings({...settings, maxCoveredCallDays: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended: 5 days</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          className="gradient-button text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}

export default SettingsPanel;