import { useMemo } from 'react'
import { DollarSign, TrendingUp, Target, Calendar, AlertCircle, CheckCircle, Trash2, Edit } from 'lucide-react'
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  isWithinInterval
} from 'date-fns'
import { saveToLocalStorage } from '../utils/storage'

// Helper function to format dates as DD/MM/YYYY
const formatDateDDMMYYYY = (dateString) => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Reusable Progress Bar Component for consistency
const PremiumProgressBar = ({ label, current, min, max, icon: Icon }) => {
  const barScaleValue = max / 0.8
  const minPos = (min / barScaleValue) * 100
  const maxPos = 80 // Max is always at 80% by definition
  const currentPos = Math.min(Math.max((current / barScaleValue) * 100, 0.5), 100)

  const isMinAchieved = current >= min
  const isMaxAchieved = current >= max

  return (
    <div className="card bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700/50">
      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-5 w-5 text-blue-400" />}
          <span>{label} Premium Progress</span>
        </div>
        <div className="text-xs text-gray-400 font-normal">
          Target: ${min.toLocaleString(undefined, { maximumFractionDigits: 0 })} - ${max.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-blue-400">Current: ${current.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="text-gray-500 text-xs">
              {current > 0 ? `${((current / max) * 100).toFixed(0)}% of max` : '0%'}
            </span>
          </div>

          <div className="relative pt-6 pb-2">
            <div className="w-full bg-gray-700/50 rounded-full h-5 overflow-hidden border border-gray-600/30">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out relative shadow-lg ${isMaxAchieved ? 'bg-gradient-to-r from-green-500 via-emerald-400 to-cyan-400' :
                    isMinAchieved ? 'bg-gradient-to-r from-yellow-500 via-green-500 to-emerald-400' :
                      'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500'
                  }`}
                style={{ width: `${currentPos}%` }}
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-full"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              </div>
            </div>

            <div className="absolute top-4 h-9 w-0.5 bg-yellow-400/80 z-10" style={{ left: `${minPos}%` }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-yellow-400 font-bold">Min</span>
                <span className="text-[10px] text-gray-400 font-medium">${min.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="absolute top-4 h-9 w-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] z-10" style={{ left: `${maxPos}%` }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Max</span>
                <span className="text-[10px] text-gray-400 font-medium">${max.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {current > max && (
              <div className="absolute -right-1 top-4 h-9 flex items-center" style={{ left: `calc(${Math.min(currentPos, 100)}% + 4px)` }}>
                <div className="flex items-center space-x-1 animate-pulse">
                  <span className="text-[10px] font-bold text-cyan-400">+{((current / max - 1) * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-1">
            <span>0%</span>
            <span>125% of Max</span>
          </div>
        </div>

        {isMaxAchieved ? (
          <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-900/10 p-2 rounded-lg border border-emerald-500/20 text-xs">
            <CheckCircle className="h-4 w-4" />
            <span>Target exceeded! Outstanding performance! 🚀</span>
          </div>
        ) : isMinAchieved ? (
          <div className="flex items-center space-x-2 text-green-400 bg-green-900/10 p-2 rounded-lg border border-green-500/20 text-xs">
            <CheckCircle className="h-4 w-4" />
            <span>Minimum target achieved! 🎉</span>
          </div>
        ) : current > 0 && (
          <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-900/10 p-2 rounded-lg border border-yellow-500/20 text-xs">
            <AlertCircle className="h-4 w-4" />
            <span>Keep pushing to reach your {label.toLowerCase()} goal</span>
          </div>
        )}
      </div>
    </div>
  )
}

function Dashboard({ researchData, tradeData, setTradeData, settings }) {
  const handleDeleteTrade = (tradeId) => {
    if (!confirm('Are you sure you want to delete this trade?')) return

    const updatedTradeData = tradeData.filter(trade => trade.id !== tradeId)
    setTradeData(updatedTradeData)
    saveToLocalStorage('tradeData', updatedTradeData)
  }

  const handleEditTrade = () => {
    alert('To edit this trade, please go to the Trade Review tab where it will be loaded for editing.')
  }

  const handleConvertToExecuted = (trade) => {
    if (!confirm('Convert this planned trade to executed? This will update the execution date to today and count toward your weekly goals.')) return

    const executedTrade = {
      ...trade,
      executed: true,
      planned: false,
      status: 'executed',
      timestamp: new Date().toISOString(),
      executionDate: new Date().toISOString()
    }

    const updatedTradeData = tradeData.map(t =>
      t.id === trade.id ? executedTrade : t
    )
    setTradeData(updatedTradeData)
    saveToLocalStorage('tradeData', updatedTradeData)

    alert(`Trade for ${trade.symbol} converted to EXECUTED! Execution date set to ${formatDateDDMMYYYY(new Date().toISOString())}.`)
  }

  const dashboardStats = useMemo(() => {
    const now = new Date()

    // Intervals
    const week = { start: startOfWeek(now), end: endOfWeek(now) }
    const month = { start: startOfMonth(now), end: endOfMonth(now) }
    const year = { start: startOfYear(now), end: endOfYear(now) }

    // Filter executed trades
    const executedTrades = tradeData.filter(t => t.executed)

    // Calculate premiums
    const calculatePremium = (interval) => executedTrades
      .filter(t => isWithinInterval(new Date(t.timestamp), interval))
      .reduce((sum, t) => sum + (t.premium * t.quantity * 100), 0)

    const weeklyPremium = calculatePremium(week)
    const monthlyPremium = calculatePremium(month)
    const yearlyPremium = calculatePremium(year)

    // Targets
    const pSize = settings.portfolioSize || 1
    const monthlyTarget = { min: (pSize * 0.25) / 12, max: (pSize * 0.30) / 12 }
    const yearlyTarget = { min: pSize * 0.25, max: pSize * 0.30 }

    // Portfolio allocation
    const activeTrades = executedTrades.filter(t => !t.closed)
    const totalAllocated = activeTrades.reduce((sum, t) => sum + (t.premium * t.quantity * 100), 0)
    const allocationPercentage = (totalAllocated / pSize) * 100

    return {
      portfolioSize: pSize,
      weeklyPremium,
      monthlyPremium,
      yearlyPremium,
      weeklyTarget: settings.weeklyPremiumTarget,
      monthlyTarget,
      yearlyTarget,
      totalAllocated,
      allocationPercentage,
      activeTradesCount: activeTrades.length,
      recentResearch: researchData.slice(0, 5),
      highRiskTrades: executedTrades.filter(t => (t.riskMetrics?.allocationPercentage || 0) > settings.maxTradePercentage).length,
      totalResearch: researchData.length,
      totalTrades: tradeData.length
    }
  }, [researchData, tradeData, settings])

  const getAllocationColor = (percentage) => {
    if (percentage > settings.maxTradePercentage) return 'text-red-400'
    if (percentage > settings.maxTradePercentage * 0.8) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-primary-400" />
            <div>
              <p className="text-sm text-gray-400">Portfolio Size</p>
              <p className="text-2xl font-bold">${dashboardStats.portfolioSize.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card text-green-400 bg-green-900/5">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8" />
            <div>
              <p className="text-sm text-gray-400">Annual Return (Estimated)</p>
              <p className="text-2xl font-bold">~{((dashboardStats.yearlyPremium / dashboardStats.portfolioSize) * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-400">Based on YTD premium</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Allocated Capital</p>
              <p className={`text-2xl font-bold ${getAllocationColor(dashboardStats.allocationPercentage)}`}>
                ${dashboardStats.totalAllocated.toFixed(0)}
              </p>
              <p className="text-xs text-gray-400">
                {dashboardStats.allocationPercentage.toFixed(1)}% of portfolio
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Active Trades</p>
              <p className="text-2xl font-bold">{dashboardStats.activeTradesCount}</p>
              <p className="text-xs text-gray-400">
                {dashboardStats.totalTrades} total trades
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumProgressBar
          label="Weekly"
          current={dashboardStats.weeklyPremium}
          min={dashboardStats.weeklyTarget.min}
          max={dashboardStats.weeklyTarget.max}
          icon={Target}
        />
        <PremiumProgressBar
          label="Monthly"
          current={dashboardStats.monthlyPremium}
          min={dashboardStats.monthlyTarget.min}
          max={dashboardStats.monthlyTarget.max}
          icon={Calendar}
        />
        <PremiumProgressBar
          label="Yearly"
          current={dashboardStats.yearlyPremium}
          min={dashboardStats.yearlyTarget.min}
          max={dashboardStats.yearlyTarget.max}
          icon={TrendingUp}
        />
      </div>

      {/* Risk Alerts */}
      {dashboardStats.highRiskTrades > 0 && (
        <div className="card border-l-4 border-l-red-500">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-400">Risk Alert</h3>
              <p className="text-sm text-gray-300">
                {dashboardStats.highRiskTrades} trade{dashboardStats.highRiskTrades > 1 ? 's' : ''} exceed{dashboardStats.highRiskTrades > 1 ? '' : 's'} your {settings.maxTradePercentage}% allocation limit
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Research */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Research</h3>
          {dashboardStats.recentResearch.length > 0 ? (
            <div className="space-y-3">
              {dashboardStats.recentResearch.map((item, index) => {
                // Extract current price and target price from technical analysis
                const currentPrice = item.technicalAnalysis?.currentPrice ||
                  item.technicalAnalysis?.metrics?.find(m => m.label === 'Current Price')?.value
                const targetPrice = item.technicalAnalysis?.targetPrice ||
                  item.technicalAnalysis?.metrics?.find(m => m.label === 'Target Price')?.value

                // Calculate upside
                let upsidePercent = null
                if (currentPrice && targetPrice) {
                  const current = parseFloat(currentPrice.replace(/[$,]/g, ''))
                  const target = parseFloat(targetPrice.replace(/[$,]/g, ''))
                  if (!isNaN(current) && !isNaN(target) && current > 0) {
                    upsidePercent = ((target - current) / current * 100).toFixed(1)
                  }
                }

                return (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg">
                    {/* Single Row: Symbol, Price Boxes, Date, Rating */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                        <p className="font-semibold text-lg">{item.symbol}</p>
                        {currentPrice && (
                          <div className="bg-gray-800 rounded px-2 py-1 flex items-center space-x-1">
                            <span className="text-xs text-gray-400">Current:</span>
                            <span className="text-white font-medium">{currentPrice.startsWith('$') ? currentPrice : `$${currentPrice}`}</span>
                          </div>
                        )}
                        {targetPrice && (
                          <div className="bg-blue-900/40 border border-blue-700/50 rounded px-2 py-1 flex items-center space-x-1">
                            <span className="text-xs text-blue-300">Target:</span>
                            <span className="text-blue-400 font-medium">{targetPrice.startsWith('$') ? targetPrice : `$${targetPrice}`}</span>
                          </div>
                        )}
                        {upsidePercent !== null && (
                          <div className={`rounded px-2 py-1 font-medium text-sm ${parseFloat(upsidePercent) >= 0 ? 'bg-green-900/40 border border-green-700/50 text-green-400' : 'bg-red-900/40 border border-red-700/50 text-red-400'}`}>
                            {parseFloat(upsidePercent) >= 0 ? '+' : ''}{upsidePercent}%
                          </div>
                        )}
                        <span className="text-sm text-gray-400">
                          {formatDateDDMMYYYY(item.date)}
                        </span>
                      </div>
                      <div className={`text-lg font-bold ${item.overallRating >= 7 ? 'text-green-400' :
                        item.overallRating >= 5 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        {item.overallRating}/100
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400">No research data available</p>
          )}
        </div>

        {/* Recent Trades */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
          {tradeData.length > 0 ? (
            <div className="space-y-3">
              {tradeData.slice(0, 5).map((item, index) => (
                <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${item.status === 'executed' ? 'bg-green-900/20 border border-green-700/30' :
                  item.status === 'planned' ? 'bg-blue-900/20 border border-blue-700/30' :
                    'bg-gray-700'
                  }`}>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {item.symbol} {item.type?.toUpperCase() || item.tradeType?.toUpperCase()}
                      {item.status === 'executed' && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-green-600 text-green-100 rounded">
                          EXECUTED
                        </span>
                      )}
                      {item.status === 'planned' && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-600 text-blue-100 rounded">
                          PLANNED
                        </span>
                      )}
                      {!item.status && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-600 text-gray-300 rounded">
                          RESEARCH
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDateDDMMYYYY(item.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm">${item.premium} premium</p>
                      <p className={`text-xs ${item.rating >= 7 ? 'text-green-400' :
                        item.rating >= 5 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        Rating: {item.rating}/10
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === 'planned' && (
                        <>
                          <button
                            onClick={() => handleEditTrade(item)}
                            className="p-2 hover:bg-blue-900/50 rounded-lg transition-colors"
                            title="Edit planned trade (opens in Trade Review)"
                          >
                            <Edit className="h-3 w-3 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleConvertToExecuted(item)}
                            className="p-2 hover:bg-green-900/50 rounded-lg transition-colors"
                            title="Convert to executed trade"
                          >
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          </button>
                        </>
                      )}
                      {(item.status === 'planned' || item.status === 'executed') && (
                        <button
                          onClick={() => handleDeleteTrade(item.id)}
                          className="p-2 hover:bg-red-900/50 rounded-lg transition-colors"
                          title="Delete trade"
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No trade data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard