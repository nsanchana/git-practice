import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  const diagnostics = {
    hasApiKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyPrefix: apiKey ? apiKey.substring(0, 15) + '...' : 'not set'
  }

  if (!apiKey) {
    return res.status(200).json({
      success: false,
      error: 'No API key',
      diagnostics
    })
  }

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey
    })

    console.log('Testing Anthropic API call...')

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Say "Hello, the API is working!" in exactly those words.' }]
    })

    console.log('Anthropic API call successful')

    return res.status(200).json({
      success: true,
      response: message.content[0].text,
      model: message.model,
      diagnostics
    })
  } catch (error) {
    console.error('Anthropic API error:', error.message)
    console.error('Error details:', error)

    return res.status(200).json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      diagnostics
    })
  }
}
