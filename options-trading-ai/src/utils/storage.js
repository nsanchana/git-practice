// Local storage utilities for portfolio and settings management

// Portfolio management
export const getPortfolio = () => {
  const portfolio = localStorage.getItem('portfolio');
  return portfolio ? JSON.parse(portfolio) : {
    capital: 71000,
    allocated: 0,
    weeklyPremium: 0,
    trades: []
  };
};

export const savePortfolio = (portfolio) => {
  localStorage.setItem('portfolio', JSON.stringify(portfolio));
};

export const addTrade = (trade) => {
  const portfolio = getPortfolio();
  portfolio.trades.push({
    ...trade,
    date: new Date().toISOString().split('T')[0]
  });
  portfolio.weeklyPremium += trade.premium;
  savePortfolio(portfolio);
  return portfolio;
};

export const resetWeeklyPremium = () => {
  const portfolio = getPortfolio();
  portfolio.weeklyPremium = 0;
  savePortfolio(portfolio);
  return portfolio;
};

// Settings management
export const getSettings = () => {
  const settings = localStorage.getItem('settings');
  return settings ? JSON.parse(settings) : {
    capital: 71000,
    maxAllocation: 50,
    weeklyPremiumMin: 340,
    weeklyPremiumMax: 410,
    maxCashSecuredDays: 30,
    maxCoveredCallDays: 5
  };
};

export const saveSettings = (settings) => {
  localStorage.setItem('settings', JSON.stringify(settings));
};

// CSV export functionality
export const exportTradesToCSV = () => {
  const portfolio = getPortfolio();
  if (portfolio.trades.length === 0) {
    return null;
  }

  const headers = ['Date', 'Symbol', 'Type', 'Strike', 'Premium', 'Expiry'];
  const csvContent = [
    headers.join(','),
    ...portfolio.trades.map(trade =>
      [
        trade.date,
        trade.symbol,
        trade.type,
        trade.strike,
        trade.premium.toFixed(2),
        trade.expiry || ''
      ].join(',')
    )
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent, filename = 'trades.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Theme management
export const getTheme = () => {
  return localStorage.getItem('theme') || 'dark';
};

export const saveTheme = (theme) => {
  localStorage.setItem('theme', theme);
};

// Auto-refresh functionality
export const setAutoRefresh = (callback, intervalMinutes = 10) => {
  const intervalId = setInterval(callback, intervalMinutes * 60 * 1000);
  return intervalId;
};

export const clearAutoRefresh = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};