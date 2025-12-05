// Vercel serverless function for AI chat
const { OpenAI } = require('openai');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.OPENAI_API_KEY;
    
    if (!API_KEY) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in your Vercel environment variables'
      });
    }

    const openai = new OpenAI({
      apiKey: API_KEY,
    });

    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required' 
      });
    }

    // Build the system message with context about Vienna trip
    const systemMessage = context || `You are a helpful assistant providing information about Vienna, Austria. 
    The user is planning a trip to Vienna from April 24-27, 2026. 
    Provide helpful, accurate, and engaging information about Vienna's attractions, culture, food, and travel tips.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return res.status(200).json({
      response: completion.choices[0].message.content
    });
    
  } catch (error) {
    console.error('AI API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

