import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const { message, companyData, chatHistory } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // Build context from company data
    let systemPrompt = `You are a helpful financial analyst assistant specializing in equity research and options trading strategies. You provide clear, actionable insights based on company analysis data.`

    if (companyData) {
      systemPrompt += `

You are discussing ${companyData.symbol}. Here is the analysis data you have access to:

Company: ${companyData.symbol}
Overall Rating: ${companyData.overallRating}/100

Company Analysis:
${companyData.companyAnalysis?.analysis || 'Not available'}

${companyData.companyAnalysis?.detailedAnalysis ? `
Detailed Analysis Sections:
- Market Position (${companyData.companyAnalysis.detailedAnalysis.marketPosition?.rating}/10): ${companyData.companyAnalysis.detailedAnalysis.marketPosition?.content || 'N/A'}
- Business Model (${companyData.companyAnalysis.detailedAnalysis.businessModel?.rating}/10): ${companyData.companyAnalysis.detailedAnalysis.businessModel?.content || 'N/A'}
- Industry Trends (${companyData.companyAnalysis.detailedAnalysis.industryTrends?.rating}/10): ${companyData.companyAnalysis.detailedAnalysis.industryTrends?.content || 'N/A'}
- Customer Base (${companyData.companyAnalysis.detailedAnalysis.customerBase?.rating}/10): ${companyData.companyAnalysis.detailedAnalysis.customerBase?.content || 'N/A'}
- Growth Strategy (${companyData.companyAnalysis.detailedAnalysis.growthStrategy?.rating}/10): ${companyData.companyAnalysis.detailedAnalysis.growthStrategy?.content || 'N/A'}
- Economic Moat (${companyData.companyAnalysis.detailedAnalysis.economicMoat?.rating}/10): ${companyData.companyAnalysis.detailedAnalysis.economicMoat?.content || 'N/A'}
` : ''}

Financial Health:
${companyData.financialHealth?.analysis || 'Not available'}

Technical Analysis:
${companyData.technicalAnalysis?.analysis || 'Not available'}

Options Data:
${companyData.optionsData?.analysis || 'Not available'}

Recent Developments:
${companyData.recentDevelopments?.analysis || 'Not available'}

Use this information to answer questions about ${companyData.symbol}. Be specific, reference the analysis data when relevant, and provide actionable insights for options trading strategies when appropriate. Keep responses concise but informative.`
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    })

    // Transform chat history to Gemini format (user/model)
    const history = []
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        // Map 'assistant' role to 'model' for Gemini
        const role = msg.role === 'assistant' ? 'model' : msg.role
        // Gemini doesn't support system messages in history (handled via systemInstruction)
        if (role !== 'system') {
          history.push({
            role: role,
            parts: [{ text: msg.content }]
          })
        }
      })
    }

    const chat = model.startChat({
      history: history
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return res.status(200).json({
      response: text,
      model: 'gemini-2.5-flash'
    })
  } catch (error) {
    console.error('Chat error:', error.message)
    return res.status(500).json({
      error: 'Failed to generate response',
      details: error.message
    })
  }
}
