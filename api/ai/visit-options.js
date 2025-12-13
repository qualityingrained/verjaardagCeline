// Vercel serverless function for AI visit options generation
const { OpenAI } = require('openai');
const fs = require('fs').promises;
const path = require('path');

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

    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    // Normalize query for cache key (lowercase, trim)
    const normalizedQuery = query.toLowerCase().trim();
    const cacheFilePath = path.join(process.cwd(), 'ai-cache.json');
    
    // Try to load cache
    let aiCache = {};
    try {
      const cacheData = await fs.readFile(cacheFilePath, 'utf8');
      aiCache = JSON.parse(cacheData);
    } catch (error) {
      // Cache file doesn't exist yet, start with empty cache
      aiCache = {};
    }
    
    // Check if we have a cached result for this query
    if (aiCache[normalizedQuery]) {
      console.log(`Cache hit for query: "${query}"`);
      return res.status(200).json({
        options: aiCache[normalizedQuery],
        cached: true
      });
    }
    
    console.log(`Cache miss for query: "${query}", calling AI...`);

    const systemPrompt = `You are a travel assistant for Vienna, Austria. Generate visit options based on user queries.

CRITICAL: Return ONLY valid JSON object with an "options" array property. No additional text, markdown, or code blocks.

IMPORTANT RULES FOR TITLES:
- Titles MUST be concrete, specific names of actual places in Vienna
- For restaurants: Use actual restaurant names like "Figlmüller", "Plachutta", "Café Central", "Steirereck", "Mraz & Sohn"
- For bars: Use actual bar names like "Loos Bar", "Sky Bar", "Volksgarten", "Das Loft"
- For cafes: Use actual cafe names like "Café Sacher", "Café Demel", "Café Hawelka", "Café Landtmann"
- For attractions: Use actual names like "Schönbrunn Palace", "St. Stephen's Cathedral", "Belvedere Palace"
- NEVER use generic titles like "A Restaurant", "A Bar", "A Cafe" - always use specific, real place names
- If you don't know a specific name, research and provide a real, well-known establishment in Vienna

Each option in the "options" array must include:
- "id": unique identifier (lowercase, no spaces, e.g., "figlmuller-restaurant")
- "title": CONCRETE, SPECIFIC name of an actual place in Vienna (e.g., "Figlmüller", "Loos Bar", "Café Central") - NOT generic descriptions
- "imageSearchTerm": descriptive search term for color generation. Use the actual place name plus descriptive words (e.g., "figlmuller restaurant vienna interior", "loos bar vienna art nouveau", "cafe central vienna elegant interior", "schonbrunn palace vienna baroque architecture"). Include the actual place name when possible, plus atmosphere words like "elegant", "romantic", "cozy", "vibrant", "sophisticated", "baroque", "imperial", etc.
- "icon": EXACT Lucide icon name in PascalCase format (e.g., "Utensils", "Coffee", "Wine", "Landmark", "Camera", "Music", "Palace", "Church", "Building", "Castle", "Theater", "ShoppingBag", "MapPin", "Sparkles", "Drumstick", "Cake", "Beer", "Cocktail", "Museum", "Monument", "Tower", "Bridge", "Park", "TreePine", "Flower", "Star", "Gem", "Crown", "Scroll", "BookOpen", "Music2", "Headphones", "Mic", "Video", "Image", "Palette", "Brush", "PenTool", "ShoppingCart", "Store", "Hotel", "Bed", "Plane", "Train", "Car", "Bike", "Footprints", "Compass", "Navigation", "Flag", "Award", "Trophy", "Gift", "Heart", "Diamond", "Zap", "Sun", "Moon", "Cloud", "Droplet", "Flame", "Leaf", "Mountain", "Waves", "Umbrella", "Sunrise", "Sunset"). Choose the icon that best represents the specific place or experience. CRITICAL: Each option MUST use a DIFFERENT icon - no duplicates allowed across all options in the response.
- "description": brief description mentioning what makes this specific place special (1-2 sentences, max 100 characters)
- "content": detailed HTML content for the modal popup including:
  * An introduction paragraph about this SPECIFIC place
  * "What to See" or "What to Experience" section with bullet points about this specific location
  * "Best Time to Visit" section
  * "Tips" section with specific advice about this place
  * Use proper HTML tags: <h4>, <p>, <ul>, <li>, <strong>

Limit to 6-8 options maximum. Focus on Vienna attractions, activities, restaurants, bars, cafes, or experiences related to the query. Always use REAL, SPECIFIC place names.

IMPORTANT: We use Lucide Icons (https://lucide.dev). Return the exact icon name in PascalCase. Ensure every option has a UNIQUE icon - check your response to avoid duplicates.

Example JSON format:
{
  "options": [
    {
      "id": "example-1",
      "title": "Example Title",
      "imageSearchTerm": "vienna opera house exterior",
      "icon": "Theater",
      "description": "Brief description here",
      "content": "<h4>Introduction</h4><p>Detailed intro...</p><h4>What to See</h4><ul><li><strong>Item:</strong> Description</li></ul><h4>Best Time to Visit</h4><p>When to go...</p><h4>Tips</h4><p>Helpful tips...</p>"
    }
  ]
}`;

    const userPrompt = `Generate visit options for Vienna based on this query: "${query}"

Return a JSON object with an "options" array containing 6-8 options. 

CRITICAL REQUIREMENTS:
1. Titles MUST be concrete, specific names of REAL places in Vienna (restaurants, bars, cafes, attractions)
   - Examples: "Figlmüller", "Loos Bar", "Café Central", "Schönbrunn Palace", "Steirereck"
   - NEVER use generic titles like "A Restaurant" or "A Bar"
2. For imageSearchTerm: Use the actual place name + descriptive words
   - Examples: "figlmuller restaurant vienna", "loos bar vienna art nouveau", "cafe central vienna elegant"
   - Include atmosphere words: elegant, romantic, cozy, vibrant, sophisticated, baroque, imperial, etc.
3. For icon: Choose a UNIQUE Lucide icon name (PascalCase) that best represents each specific place
   - Examples: "Utensils" for restaurants, "Coffee" for cafes, "Wine" or "Cocktail" for bars, "Palace" or "Landmark" for attractions
   - CRITICAL: Each option MUST have a DIFFERENT icon - verify no duplicates in your response
   - Browse available icons at https://lucide.dev/icons/ if needed

Focus on well-known, real establishments and attractions in Vienna. Research actual names if needed.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    let responseContent = completion.choices[0].message.content.trim();
    
    // Clean up any markdown code blocks
    responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(responseContent);
    } catch (e) {
      console.error('Failed to parse AI response:', responseContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Extract options array
    let options = parsed.options || parsed.data || [];
    
    if (!Array.isArray(options) || options.length === 0) {
      throw new Error('Invalid response format: expected options array');
    }

    // Process options - ensure icon is present, keep imageSearchTerm for color generation
    const processedOptions = [];
    for (const option of options) {
      // Ensure icon is present, default to MapPin if missing
      if (!option.icon) {
        option.icon = 'MapPin';
      }
      
      // Keep imageSearchTerm for client-side color generation
      // No need to fetch images anymore
      
      processedOptions.push(option);
    }
    
    options = processedOptions;

    // Save to cache
    try {
      aiCache[normalizedQuery] = options;
      await fs.writeFile(cacheFilePath, JSON.stringify(aiCache, null, 2), 'utf8');
      console.log(`Cached result for query: "${query}"`);
    } catch (error) {
      // Cache write failed (e.g., on Vercel), but continue with response
      console.warn('Failed to save AI cache:', error.message);
    }

    return res.status(200).json({
      options: options,
      cached: false
    });
    
  } catch (error) {
    console.error('AI Visit Options API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

