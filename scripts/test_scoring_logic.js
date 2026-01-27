/**
 * Manual Verification Script for Scoring Logic
 * This script simulates the frontend's score calculation logic using actual data structures
 * returned by the updated API (mocked for testing purposes to avoid costs/delays).
 */

function calculateGlobalScore(data) {
    const companyPillars = [
        data.companyAnalysis?.detailedAnalysis?.marketPosition?.rating || 0,
        data.companyAnalysis?.detailedAnalysis?.businessModel?.rating || 0,
        data.companyAnalysis?.detailedAnalysis?.industryTrends?.rating || 0,
        data.companyAnalysis?.detailedAnalysis?.customerBase?.rating || 0,
        data.companyAnalysis?.detailedAnalysis?.growthStrategy?.rating || 0,
        data.companyAnalysis?.detailedAnalysis?.economicMoat?.rating || 0
    ].filter(r => r > 0)

    const otherModules = [
        data.financialHealth?.rating || 0,
        data.technicalAnalysis?.rating || 0,
        data.recentDevelopments?.rating || 0
    ].filter(r => r > 0)

    const allRatings = [...companyPillars, ...otherModules]

    if (allRatings.length === 0) return 0
    return Math.round((allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length) * 10)
}

// Test Case 1: Strong Company (high variance)
const strongCompany = {
    companyAnalysis: {
        detailedAnalysis: {
            marketPosition: { rating: 9 },
            businessModel: { rating: 8 },
            industryTrends: { rating: 7 },
            customerBase: { rating: 9 },
            growthStrategy: { rating: 8 },
            economicMoat: { rating: 9 }
        }
    },
    financialHealth: { rating: 9 },
    technicalAnalysis: { rating: 8 },
    recentDevelopments: { rating: 7 }
}

// Test Case 2: Struggling Company (low ratings)
const weakCompany = {
    companyAnalysis: {
        detailedAnalysis: {
            marketPosition: { rating: 3 },
            businessModel: { rating: 4 },
            industryTrends: { rating: 2 },
            customerBase: { rating: 5 },
            growthStrategy: { rating: 3 },
            economicMoat: { rating: 2 }
        }
    },
    financialHealth: { rating: 2 },
    technicalAnalysis: { rating: 4 },
    recentDevelopments: { rating: 3 }
}

const strongScore = calculateGlobalScore(strongCompany)
const weakScore = calculateGlobalScore(weakCompany)

console.log(`Strong Company Global Score: ${strongScore}/100`)
console.log(`Weak Company Global Score: ${weakScore}/100`)
console.log(`Variance: ${strongScore - weakScore} points`)

if (strongScore >= 80 && weakScore <= 40) {
    console.log("SUCCESS: Scoring logic shows significant variance!")
} else {
    console.log("WARNING: Variance might still be low.")
}
