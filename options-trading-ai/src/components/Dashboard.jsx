import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target } from 'lucide-react';

function Dashboard() {
  const [portfolio, setPortfolio] = useState({
    capital: 71000,
    allocated: 0,
    weeklyPremium: 0,
    trades: []
  });

  useEffect(() => {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const allocationPercentage = (portfolio.allocated / portfolio.capital) * 100;
  const weeklyTarget = { min: 340, max: 410 };
  const weeklyProgress = (portfolio.weeklyPremium / weeklyTarget.max) * 100;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="gradient-card rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Capital</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolio.capital)}</p>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-pink-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Allocated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolio.allocated)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{allocationPercentage.toFixed(1)}% of capital</p>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Premium</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolio.weeklyPremium)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Target: {formatCurrency(weeklyTarget.min)} - {formatCurrency(weeklyTarget.max)}</p>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-lg p-6 shadow-lg">
          <div className="flex items-center">
            <AlertTriangle className={`w-8 h-8 ${allocationPercentage > 50 ? 'text-red-500' : 'text-green-500'}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Status</p>
              <p className={`text-2xl font-bold ${allocationPercentage > 50 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {allocationPercentage > 50 ? 'High' : 'Low'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Max 50% allocation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Premium Progress */}
      <div className="gradient-card rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Premium Progress</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-pink-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{formatCurrency(portfolio.weeklyPremium)}</span>
          <span>{formatCurrency(weeklyTarget.max)}</span>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="gradient-card rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Trades</h3>
        {portfolio.trades.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No trades recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {portfolio.trades.slice(-5).reverse().map((trade, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{trade.symbol}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{trade.type} - {trade.strike}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${trade.premium > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {trade.premium > 0 ? '+' : ''}{formatCurrency(trade.premium)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{trade.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;