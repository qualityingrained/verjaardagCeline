const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Weather API route
app.get('/api/weather', async (req, res) => {
  try {
    // Check for OPENWEATHER_API_KEY first, fallback to API_KEY
    const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.API_KEY;
    
    if (!API_KEY) {
      console.error('Weather API: OPENWEATHER_API_KEY or API_KEY not configured');
      return res.status(500).json({ 
        error: 'Weather API key not configured',
        message: 'Please set OPENWEATHER_API_KEY (or API_KEY) in your .env file'
      });
    }

    const { type, lat, lon } = req.query;
    const VIENNA_LAT = lat || 48.2082;
    const VIENNA_LON = lon || 16.3738;

    let url;
    
    if (type === 'forecast') {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${VIENNA_LAT}&lon=${VIENNA_LON}&appid=${API_KEY}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${VIENNA_LAT}&lon=${VIENNA_LON}&appid=${API_KEY}&units=metric`;
    }

    console.log(`Weather API: Fetching ${type || 'current'} weather for Vienna (${VIENNA_LAT}, ${VIENNA_LON})`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorData;
      } catch {
        errorMessage = errorData;
      }
      console.error(`Weather API error: ${response.status} - ${errorMessage}`);
      return res.status(response.status).json({ 
        error: 'Weather API error',
        message: errorMessage,
        status: response.status
      });
    }

    const data = await response.json();
    console.log('Weather API: Success');
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Weather API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// AI API route for chat/completion
app.post('/api/ai', async (req, res) => {
  try {
    const { OpenAI } = require('openai');
    const API_KEY = process.env.OPENAI_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in your .env file'
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
});

// AI API route for generating visit options
app.post('/api/ai/visit-options', async (req, res) => {
  try {
    const { OpenAI } = require('openai');
    const API_KEY = process.env.OPENAI_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in your .env file'
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
    const cacheFilePath = path.join(__dirname, 'ai-cache.json');
    
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

Each option in the "options" array must include:
- "id": unique identifier (lowercase, no spaces, e.g., "vienna-opera")
- "title": short title for the card (max 30 characters)
- "imageSearchTerm": an evocative, descriptive search term for color generation. For famous locations, use specific names (e.g., "vienna opera house", "schonbrunn palace vienna"). For less-known places or experiences, create vivid atmosphere descriptions that capture the mood and feeling (e.g., "elegant vienna restaurant candlelit dinner", "romantic vienna evening baroque architecture", "vienna coffee house cozy interior", "vienna street scene historic buildings"). Always focus on creating search terms with descriptive, mood-setting words like "elegant", "romantic", "cozy", "vibrant", "sophisticated", "charming", "beautiful", "stunning", "baroque", "imperial", "luxurious", etc.
- "icon": EXACT Lucide icon name in PascalCase format (e.g., "Utensils", "Coffee", "Wine", "Landmark", "Camera", "Music", "Palace", "Church", "Building", "Castle", "Theater", "ShoppingBag", "MapPin", "Sparkles", "Drumstick", "Cake", "Beer", "Cocktail", "Museum", "Monument", "Tower", "Bridge", "Park", "TreePine", "Flower", "Star", "Gem", "Crown", "Scroll", "BookOpen", "Music2", "Headphones", "Mic", "Video", "Image", "Palette", "Brush", "PenTool", "ShoppingCart", "Store", "Hotel", "Bed", "Plane", "Train", "Car", "Bike", "Footprints", "Compass", "Navigation", "Flag", "Award", "Trophy", "Gift", "Heart", "Diamond", "Zap", "Sun", "Moon", "Cloud", "Droplet", "Flame", "Leaf", "Mountain", "Waves", "Umbrella", "Sunrise", "Sunset"). Choose the icon that best represents the specific place or experience. CRITICAL: Each option MUST use a DIFFERENT icon - no duplicates allowed across all options in the response.
- "description": brief description for the card (1-2 sentences, max 100 characters)
- "content": detailed HTML content for the modal popup including:
  * An introduction paragraph
  * "What to See" section with bullet points
  * "Best Time to Visit" section
  * "Tips" section
  * Use proper HTML tags: <h4>, <p>, <ul>, <li>, <strong>

Limit to 6-8 options maximum. Focus on Vienna attractions, activities, restaurants, or experiences related to the query.

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
1. For imageSearchTerm: Use evocative, descriptive phrases for color generation
   - For famous locations: use specific names with descriptive atmosphere words ("vienna st stephens cathedral baroque architecture", "schonbrunn palace vienna imperial gardens")
   - For less-known places: create vivid atmosphere descriptions ("elegant vienna restaurant candlelit dinner", "romantic vienna cafe cozy interior", "vienna baroque architecture golden hour")
   - Include descriptive, mood-setting words: elegant, romantic, cozy, vibrant, sophisticated, charming, beautiful, stunning, baroque, imperial, luxurious, etc.
2. For icon: Choose a UNIQUE Lucide icon name (PascalCase) that best represents each specific place
   - Examples: "Utensils" for restaurants, "Coffee" for cafes, "Wine" or "Cocktail" for bars, "Palace" or "Landmark" for attractions
   - CRITICAL: Each option MUST have a DIFFERENT icon - verify no duplicates in your response
   - Browse available icons at https://lucide.dev/icons/ if needed`;

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
      message: error.message 
    });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve vienna.html
app.get('/vienna', (req, res) => {
  res.sendFile(path.join(__dirname, 'vienna.html'));
});

// API endpoint to get cached images for default visit options
app.get('/api/default-images', async (req, res) => {
  try {
    const cacheFilePath = path.join(__dirname, 'image-cache.json');
    let imageCache = {};
    
    try {
      const cacheData = await fs.readFile(cacheFilePath, 'utf8');
      imageCache = JSON.parse(cacheData);
    } catch (error) {
      // Cache file doesn't exist yet
      imageCache = {};
    }
    
    // Return images for default visit options
    const defaultImages = {};
    defaultVisitOptions.forEach(option => {
      if (imageCache[option.title]) {
        defaultImages[option.title] = imageCache[option.title];
      }
    });
    
    res.status(200).json(defaultImages);
  } catch (error) {
    console.error('Error fetching default images:', error);
    res.status(500).json({ error: 'Failed to fetch default images' });
  }
});

// Default visit options with their search terms
const defaultVisitOptions = [
  { title: "Schönbrunn Palace", searchTerm: "schonbrunn palace vienna baroque architecture" },
  { title: "St. Stephen's Cathedral", searchTerm: "vienna st stephens cathedral gothic architecture" },
  { title: "The Ringstrasse", searchTerm: "vienna ringstrasse boulevard architecture" },
  { title: "Hofburg Palace", searchTerm: "hofburg palace vienna imperial architecture" },
  { title: "Belvedere Palace", searchTerm: "belvedere palace vienna baroque gardens" },
  { title: "Vienna State Opera", searchTerm: "vienna state opera house neorenaissance architecture" },
  { title: "Prater Park", searchTerm: "vienna prater park ferris wheel" },
  { title: "Museum Quarter", searchTerm: "vienna museum quarter cultural complex" },
  { title: "Historic Cafés", searchTerm: "vienna coffee house elegant interior" },
  { title: "Naschmarkt", searchTerm: "vienna naschmarkt market vibrant colors" },
  { title: "Graben & Kohlmarkt", searchTerm: "vienna graben kohlmarkt luxury shopping street" },
  { title: "Danube Tower", searchTerm: "vienna danube tower observation deck panoramic" }
];

// Function to initialize default visit option images
// Image initialization removed - now using CSS gradients and icons instead
async function initializeDefaultImages() {
  // No longer needed - using CSS gradients and Lucide icons
  return;
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Main page: http://localhost:${PORT}/`);
  console.log(`🏛️  Vienna page: http://localhost:${PORT}/vienna`);
  console.log(`🌤️  Weather API: http://localhost:${PORT}/api/weather`);
  console.log(`🤖 AI Chat API: http://localhost:${PORT}/api/ai`);
  console.log(`🎯 Visit Options API: http://localhost:${PORT}/api/ai/visit-options`);
  console.log('\n⚠️  Make sure you have a .env file with:');
  console.log('   - OPENWEATHER_API_KEY=your_key_here');
  console.log('   - OPENAI_API_KEY=your_key_here (required for AI features)');
});

