import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('AI Error: GEMINI_API_KEY is missing in environment variables')
      return NextResponse.json(
        { error: 'Gemini API Key is not configured' },
        { status: 500 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Initialize Gemini model inside handler to ensure API key is fresh
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })

    console.log(`[SERVER AI] Generating content for type: ${context?.type || 'unknown'} | Subject: ${context?.perihal || 'N/A'}`)

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
        throw new Error('Gemini returned an empty response')
    }

    return NextResponse.json({
      text: text.trim(),
      context
    })
  } catch (error: any) {
    console.error('SERVER AI Generation Error:', error)
    
    // Check for specific Gemini errors (like safety, blockages, etc)
    const errorMessage = error.message || 'Unknown AI error'
    const status = errorMessage.includes('403') ? 403 : 500

    return NextResponse.json(
      { error: 'Gagal menghasilkan konten AI', details: errorMessage },
      { status }
    )
  }
}
