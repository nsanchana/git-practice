import { useMemo } from 'react'
import { DollarSign, TrendingUp, Target, Calendar, AlertCircle, CheckCircle, Trash2, Edit, RefreshCw } from 'lucide-react'
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  isWithinInterval
} from 'date-fns'
import { saveToLocalStorage } from '../utils/storage'
import { scrapeCompanyData } from '../services/webScraping'
import { useState } from 'react'

// Helper function to format dates as DD/MM/YYYY
const formatDateDDMMYYYY = (dateString) => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Reusable Progress Bar Component with Premium Aesthetic
const PremiumProgressBar = ({ label, current, min, max, icon: Icon }) => {
  const barScaleValue = max / 0.8
  const minPos = (min / barScaleValue) * 100
  const maxPos = 80
  const currentPos = Math.min(Math.max((current / barScaleValue) * 100, 0.5), 100)

  const isMinAchieved = current >= min
  const isMaxAchieved = current >= max

  // Dynamic colors for the glow effect
  const glowColor = isMaxAchieved ? 'rgba(16, 185, 129, 0.3)' : isMinAchieved ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.15)'

  return (
    <div className="glass-card group relative overflow-hidden">
      {/* Background glow pulse */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-all duration-700 group-hover:blur-[60px]"
        style={{ backgroundColor: glowColor }}
      ></div>

      <h3 className="text-lg font-bold mb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl border border-gray-700/50 bg-gray-900/50 ${isMaxAchieved ? 'text-emerald-400' : 'text-blue-400'}`}>
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{label} Earnings</span>
        </div>
        <div className="text-sm tracking-wider text-emerald-400 font-black uppercase bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
          Goal: ${max.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </h3>

      <div className="space-y-6 relative z-10">
        <div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Current Earnings</p>
              <span className="text-3xl font-black text-white">${current.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold ${isMinAchieved ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {((current / max) * 100).toFixed(0)}%
              </span>
              <p className="text-[10px] text-gray-500 font-bold uppercase">of target</p>
            </div>
          </div>

          <div className="relative pt-6 pb-4">
            {/* Main Bar Track */}
            <div className="w-full bg-gray-900/80 rounded-full h-4 overflow-hidden border border-gray-700/30">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isMaxAchieved ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500' :
                  isMinAchieved ? 'bg-gradient-to-r from-yellow-500 via-emerald-500 to-emerald-400' :
                    'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500'
                  }`}
                style={{ width: `${currentPos}%`, boxShadow: `0 0 20px ${glowColor}` }}
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 rounded-t-full"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              </div>
            </div>

            {/* Threshold Markers - Refined Design */}
            <div className="absolute top-4 h-10 w-[1px] bg-yellow-400/30 z-10" style={{ left: `${minPos}%` }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className={`w-1.5 h-1.5 rounded-full mb-1 transition-all ${isMinAchieved ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' : 'bg-gray-600'}`}></div>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">${min.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="absolute top-4 h-10 w-[1px] bg-emerald-400/30 z-10" style={{ left: `${maxPos}%` }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className={`w-1.5 h-1.5 rounded-full mb-1 transition-all ${isMaxAchieved ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-gray-600'}`}></div>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">${max.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {current > max && (
              <div className="absolute -right-2 top-4 h-10 flex items-center" style={{ left: `calc(${Math.min(currentPos, 100)}% + 8px)` }}>
                <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20 animate-pulse">
                  +{((current / max - 1) * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {isMaxAchieved ? (
          <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-900/20 p-2.5 rounded-xl border border-emerald-500/20 text-xs font-medium animate-float">
            <CheckCircle className="h-4 w-4" />
            <span>Target exceeded! Incredible performance! 🚀</span>
          </div>
        ) : isMinAchieved ? (
          <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 p-2.5 rounded-xl border border-green-500/20 text-xs font-medium">
            <CheckCircle className="h-4 w-4" />
            <span>Minimum floor target achieved! 🎉</span>
          </div>
        ) : current > 0 && (
          <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-900/10 p-2.5 rounded-xl border border-yellow-500/20 text-xs font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Keep going to reach your {label.toLowerCase()} goal</span>
          </div>
        )}
      </div>
    </div>
  )
}

const Dashboard = ({ researchData, setResearchData, tradeData, setTradeData, settings }) => {
  const [rerunningId, setRerunningId] = useState(null)

  const handleDeleteTrade = (tradeId) => {
    if (!confirm('Are you sure you want to delete this trade?')) return

    const updatedTradeData = tradeData.filter(trade => trade.id !== tradeId)
    setTradeData(updatedTradeData)
    saveToLocalStorage('tradeData', updatedTradeData)
  }

  const handleEditTrade = () => {
    alert('To edit this trade, please go to the Trade Review tab where it will be loaded for editing.')
  }

  const handleDeleteResearch = (index) => {
    const itemToDelete = researchData[index]
    if (window.confirm(`Delete research for ${itemToDelete.symbol}?`)) {
      const updatedResearchData = researchData.filter((_, i) => i !== index)
      setResearchData(updatedResearchData)
      saveToLocalStorage('researchData', updatedResearchData)
    }
  }

  const handleRerunResearch = async (oldSymbol, index) => {
    setRerunningId(index)

    try {
      const sections = [
        'companyAnalysis',
        'financialHealth',
        'technicalAnalysis',
        'recentDevelopments'
      ]

      const results = {}

      for (const section of sections) {
        console.log(`Scraping ${section} for ${oldSymbol}...`)
        const sectionData = await scrapeCompanyData(oldSymbol, section)
        results[section] = sectionData
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Calculate overall rating
      const sectionRatings = [
        results.companyAnalysis?.rating || 0,
        results.financialHealth?.rating || 0,
        results.technicalAnalysis?.rating || 0,
        results.recentDevelopments?.rating || 0
      ].filter(rating => rating > 0)

      const overallRating = sectionRatings.length > 0
        ? Math.round(sectionRatings.reduce((sum, rating) => sum + rating, 0) / sectionRatings.length)
        : 0

      const updatedEntry = {
        symbol: oldSymbol,
        date: new Date().toISOString(),
        ...results,
        overallRating,
        lastRefresh: new Date().toISOString(),
        saved: true
      }

      // Update in place (or move to top? usually move to top)
      // Moving to top seems better for "Recent"
      const filteredData = researchData.filter((_, i) => i !== index)
      const updatedResearchData = [updatedEntry, ...filteredData]

      setResearchData(updatedResearchData)
      saveToLocalStorage('researchData', updatedResearchData)

      alert(`Successfully refreshed research for ${oldSymbol}!`)
    } catch (err) {
      console.error('Rerun error:', err)
      alert(`Failed to refresh research: ${err.message}`)
    } finally {
      setRerunningId(null)
    }
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

    // Portfolio allocation - Sum of Strike Price * 100 for active Cash Secured Puts
    const activeTrades = executedTrades.filter(t => !t.closed)
    const totalAllocated = activeTrades
      .filter(t => t.tradeType === 'cashSecuredPut') // Only count CSPs
      .reduce((sum, t) => sum + (t.strikePrice * t.quantity * 100), 0)
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
        <div className="stat-card-primary">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Portfolio Size</p>
              <p className="text-2xl font-black text-white">${dashboardStats.portfolioSize.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="stat-card-success">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Est. Annual Return</p>
              <p className="text-2xl font-black text-white">~{((dashboardStats.yearlyPremium / dashboardStats.portfolioSize) * 100).toFixed(1)}%</p>
              <p className="text-[10px] text-gray-500">Based on YTD premium</p>
            </div>
          </div>
        </div>

        <div className="stat-card-primary border-purple-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Allocated Capital</p>
              <p className={`text-2xl font-black ${getAllocationColor(dashboardStats.allocationPercentage)}`}>
                ${dashboardStats.totalAllocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-gray-500">{dashboardStats.allocationPercentage.toFixed(1)}% of portfolio</p>
            </div>
          </div>
        </div>

        <div className="stat-card-warning">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl">
              <Calendar className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Active Trades</p>
              <p className="text-2xl font-black text-white">{dashboardStats.activeTradesCount}</p>
              <p className="text-[10px] text-gray-500">{dashboardStats.totalTrades} total trades</p>
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
        <div className="glass-card border-l-4 border-l-red-500 bg-gradient-to-br from-red-500/5 to-transparent animate-slide-in-up">
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
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-4">Recent Research</h3>
          {dashboardStats.recentResearch.length > 0 ? (
            <div className="space-y-3">
              {dashboardStats.recentResearch.map((item, index) => {
                // Extract current price and target price from technical analysis
                let currentPrice = item.technicalAnalysis?.currentPrice ||
                  item.technicalAnalysis?.metrics?.find(m => m.label === 'Current Price')?.value
                let targetPrice = item.technicalAnalysis?.targetPrice ||
                  item.technicalAnalysis?.metrics?.find(m => m.label === 'Target Price')?.value

                // Sanitize prices (remove trailing commas/spaces)
                if (currentPrice) currentPrice = currentPrice.replace(/,\s*$/, '').trim()
                if (targetPrice) targetPrice = targetPrice.replace(/,\s*$/, '').trim()

                // Calculate upside
                let upsidePercent = null
                if (currentPrice && targetPrice) {
                  const current = parseFloat(currentPrice.replace(/[$,]/g, ''))
                  const target = parseFloat(targetPrice.replace(/[$,]/g, ''))
                  if (!isNaN(current) && !isNaN(target) && current > 0) {
                    upsidePercent = ((target - current) / current * 100).toFixed(1)
                  }
                }

                const isRerunning = rerunningId === index

                return (
                  <div key={index} className="glass-item p-5 hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-white/10 group relative overflow-hidden">
                    {/* Background Glow Effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>

                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center space-x-4">
                        {/* Gradient Initials Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/20">
                          <div className="w-full h-full rounded-2xl bg-gray-900/90 backdrop-blur-xl flex items-center justify-center">
                            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                              {item.symbol.slice(0, 2)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-2xl font-black tracking-tight text-white mb-0.5">{item.symbol}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Research Report</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{formatDateDDMMYYYY(item.date)}</span>
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRerunResearch(item.symbol, index); }}
                              disabled={isRerunning}
                              className={`p-1.5 rounded-lg transition-all ${isRerunning ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-blue-500/20 text-gray-400 hover:text-blue-400'}`}
                              title="Rerun research"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${isRerunning ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteResearch(index); }}
                              className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"
                              title="Delete research"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className={`px-3 py-1 rounded-lg border ${item.overallRating >= 70 ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' :
                          item.overallRating >= 50 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]' :
                            'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                          }`}>
                          <span className="text-[10px] font-black uppercase tracking-widest mr-2 opacity-70">Rating:</span>
                          <span className="text-sm font-bold">{item.overallRating}/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                      {/* Current Price Box */}
                      <div className="bg-[#0f172a]/80 rounded-xl p-3 border border-white/5 shadow-inner">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current</div>
                        <div className="text-xl font-bold text-white">
                          {currentPrice ? (currentPrice.startsWith('$') ? currentPrice : `$${currentPrice}`) : 'N/A'}
                        </div>
                      </div>

                      {/* Target Price Box */}
                      <div className="bg-[#1e293b]/50 rounded-xl p-3 border border-blue-500/10 shadow-inner group-hover:border-blue-500/20 transition-colors">
                        <div className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest mb-1">Target</div>
                        <div className="text-xl font-bold text-blue-100">
                          {targetPrice ? (targetPrice.startsWith('$') ? targetPrice : `$${targetPrice}`) : 'N/A'}
                        </div>
                      </div>

                      {/* Potential Box */}
                      <div className={`rounded-xl p-3 border shadow-inner transition-colors ${parseFloat(upsidePercent) >= 0
                        ? 'bg-green-900/10 border-green-500/10 group-hover:border-green-500/20'
                        : 'bg-red-900/10 border-red-500/10 group-hover:border-red-500/20'
                        }`}>
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${parseFloat(upsidePercent) >= 0 ? 'text-green-400/70' : 'text-red-400/70'
                          }`}>Potential</div>
                        <div className={`text-xl font-bold ${parseFloat(upsidePercent) >= 0 ? 'text-green-100' : 'text-red-100'
                          }`}>
                          {upsidePercent !== null ? (
                            <>
                              {parseFloat(upsidePercent) >= 0 ? '+' : ''}{upsidePercent}%
                            </>
                          ) : 'N/A'}
                        </div>
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
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
          {tradeData.length > 0 ? (
            <div className="space-y-3">
              {tradeData.slice(0, 5).map((item, index) => (
                <div key={index} className={`glass-item flex justify-between items-center ${item.status === 'executed' ? 'border-green-500/30 bg-green-900/10' :
                  item.status === 'planned' ? 'border-blue-500/30 bg-blue-900/10' :
                    ''
                  }`}>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {item.symbol} {item.type?.toUpperCase() || item.tradeType?.toUpperCase()}
                      {item.status === 'executed' && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                          EXECUTED
                        </span>
                      )}
                      {item.status === 'planned' && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                          PLANNED
                        </span>
                      )}
                      {!item.status && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded">
                          RESEARCH
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDateDDMMYYYY(item.timestamp)}
                    </p>
                    <div className="flex items-center space-x-3 mt-1 text-xs font-medium">
                      <span className="text-gray-300">
                        Current: <span className="text-white">${(item.currentMarketPrice || item.stockPrice)?.toFixed(2) || 'N/A'}</span>
                      </span>
                      <span className="text-gray-600">|</span>
                      <span className="text-gray-300">
                        Strike: <span className="text-white">${item.strikePrice?.toFixed(2) || 'N/A'}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white shadow-black drop-shadow-sm">${item.premium} premium</p>
                      <p className={`text-xs font-bold ${item.rating >= 7 ? 'text-green-400' :
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
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors border border-transparent hover:border-blue-500/30"
                            title="Edit planned trade (opens in Trade Review)"
                          >
                            <Edit className="h-3 w-3 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleConvertToExecuted(item)}
                            className="p-2 hover:bg-green-500/20 rounded-lg transition-colors border border-transparent hover:border-green-500/30"
                            title="Convert to executed trade"
                          >
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          </button>
                        </>
                      )}
                      {(item.status === 'planned' || item.status === 'executed') && (
                        <button
                          onClick={() => handleDeleteTrade(item.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
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