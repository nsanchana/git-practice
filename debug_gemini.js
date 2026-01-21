import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

async function testGeminiAnalysis() {
    const apiKey = process.env.GEMINI_API_KEY
    console.log('Testing with API Key present:', !!apiKey)

    const modelsToTry = [
        'gemini-3-pro',
        'gemini-3-flash',
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-1.5-pro', // Just in case search was slightly off
        'gemini-1.5-flash'
    ]

    for (const modelName of modelsToTry) {
        console.log(`\n---------------------------------`)
        console.log(`Testing Model: ${modelName}`)
        console.log(`---------------------------------`)
        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            })

            const prompt = `Return this JSON: {"status": "works", "model": "${modelName}"}`

            console.log('Calling Gemini API...')
            const result = await model.generateContent(prompt)
            const response = await result.response
            console.log('Success! Response:', response.text())
            return // Exit on first success
        } catch (error) {
            console.error(`Failed with ${modelName}:`, error.message)
        }
    }
}

testGeminiAnalysis()
