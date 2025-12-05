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

    const systemPrompt = `You are a travel assistant for Vienna, Austria. Generate visit options based on user queries.

CRITICAL: Return ONLY valid JSON object with an "options" array property. No additional text, markdown, or code blocks.

Each option in the "options" array must include:
- "id": unique identifier (lowercase, no spaces, e.g., "vienna-opera")
- "title": short title for the card (max 30 characters)
- "imageSearchTerm": an evocative, descriptive search term for finding beautiful images. For famous locations, use specific names (e.g., "vienna opera house", "schonbrunn palace vienna"). For less-known places or experiences, create vivid atmosphere descriptions that capture the mood and feeling (e.g., "elegant vienna restaurant candlelit dinner", "romantic vienna evening baroque architecture", "vienna coffee house cozy interior", "vienna street scene historic buildings"). Always focus on creating search terms that will return attractive, evocative images that suggest the experience and atmosphere, even if not the exact location. Use descriptive, mood-setting words like "elegant", "romantic", "cozy", "vibrant", "sophisticated", "charming", "beautiful", "stunning", "baroque", "imperial", "luxurious", etc.
- "description": brief description for the card (1-2 sentences, max 100 characters)
- "content": detailed HTML content for the modal popup including:
  * An introduction paragraph
  * "What to See" section with bullet points
  * "Best Time to Visit" section
  * "Tips" section
  * Use proper HTML tags: <h4>, <p>, <ul>, <li>, <strong>

Limit to 6-8 options maximum. Focus on Vienna attractions, activities, restaurants, or experiences related to the query.

DO NOT include imageUrl in your response. Only provide imageSearchTerm. The system will automatically fetch real images based on the search term.

Example JSON format:
{
  "options": [
    {
      "id": "example-1",
      "title": "Example Title",
      "imageSearchTerm": "vienna opera house exterior",
      "description": "Brief description here",
      "content": "<h4>Introduction</h4><p>Detailed intro...</p><h4>What to See</h4><ul><li><strong>Item:</strong> Description</li></ul><h4>Best Time to Visit</h4><p>When to go...</p><h4>Tips</h4><p>Helpful tips...</p>"
    }
  ]
}`;

    const userPrompt = `Generate visit options for Vienna based on this query: "${query}"

Return a JSON object with an "options" array containing 6-8 options. 

For each option, provide an "imageSearchTerm" that is an evocative, descriptive phrase designed to find beautiful, mood-setting images. 

Guidelines:
1. For famous locations: use specific names with descriptive atmosphere words ("vienna st stephens cathedral baroque architecture", "schonbrunn palace vienna imperial gardens")
2. For less-known places or experiences: create vivid atmosphere descriptions ("elegant vienna restaurant candlelit dinner", "romantic vienna cafe cozy interior", "vienna baroque architecture golden hour", "vienna street market vibrant colors", "vienna nightlife elegant bar", "vienna wine bar sophisticated atmosphere")

Always include descriptive, mood-setting words (elegant, romantic, cozy, vibrant, sophisticated, charming, beautiful, stunning, baroque, imperial, luxurious, intimate, lively, serene, grand, majestic, candlelit, golden hour, etc.) to ensure the search returns attractive, evocative images that capture the feeling and atmosphere of the experience, even if not the exact location. The system will automatically fetch real images based on these search terms.`;

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

    // Image cache file path
    const cacheFilePath = path.join(__dirname, 'image-cache.json');
    
    // Load image cache from file
    let imageCache = {};
    try {
      const cacheData = await fs.readFile(cacheFilePath, 'utf8');
      imageCache = JSON.parse(cacheData);
    } catch (error) {
      // Cache file doesn't exist yet, start with empty cache
      imageCache = {};
    }
    
    // Function to test if an image URL is still valid
    const testImageUrl = async (imageUrl) => {
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        return false;
      }
    };
    
    // Function to save cache to file
    const saveCache = async () => {
      try {
        await fs.writeFile(cacheFilePath, JSON.stringify(imageCache, null, 2), 'utf8');
      } catch (error) {
        console.warn('Failed to save image cache:', error.message);
      }
    };
    
    // Track used image URLs to prevent duplicates
    const usedImageUrls = new Set();
    
    // Function to get image URL from search term using Unsplash Search API
    // Checks cache first, validates cached images, and fetches new ones if needed
    const getImageUrl = async (searchTerm, title, usedUrls) => {
      if (!searchTerm) {
        searchTerm = 'vienna austria';
      }
      
      // Check cache first using title as key
      const cacheKey = title || searchTerm;
      if (imageCache[cacheKey]) {
        const cachedUrl = imageCache[cacheKey];
        // Test if cached image still works
        const isValid = await testImageUrl(cachedUrl);
        if (isValid && !usedUrls.has(cachedUrl)) {
          usedUrls.add(cachedUrl);
          return cachedUrl;
        } else {
          // Cached image is broken or duplicate, remove from cache
          delete imageCache[cacheKey];
          await saveCache();
        }
      }
      
      // Add "vienna" to search term for better results if not already present
      const fullSearchTerm = searchTerm.toLowerCase().includes('vienna') 
        ? searchTerm 
        : `${searchTerm} vienna`;
      
      try {
        // Use Unsplash Search API (requires access key)
        const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
        
        if (unsplashAccessKey) {
          // Fetch multiple results (still 1 API call) to have options if duplicates occur
          const encodedTerm = encodeURIComponent(fullSearchTerm);
          const apiUrl = `https://api.unsplash.com/search/photos?query=${encodedTerm}&per_page=10&orientation=landscape&client_id=${unsplashAccessKey}`;
          
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              // Find the first image that hasn't been used yet
              for (const photo of data.results) {
                const imageUrl = `${photo.urls.regular}?w=800&q=80&fit=crop`;
                if (!usedUrls.has(imageUrl)) {
                  usedUrls.add(imageUrl);
                  // Save to cache
                  imageCache[cacheKey] = imageUrl;
                  await saveCache();
                  return imageUrl;
                }
              }
              
              // If all results are duplicates, use the first one anyway (better than no image)
              const photo = data.results[0];
              const imageUrl = `${photo.urls.regular}?w=800&q=80&fit=crop`;
              // Save to cache even if duplicate (for future use)
              imageCache[cacheKey] = imageUrl;
              await saveCache();
              return imageUrl;
            }
          } else {
            console.warn(`Unsplash API error: ${response.status} ${response.statusText}`);
          }
        } else {
          console.warn('UNSPLASH_ACCESS_KEY not set, using fallback');
        }
        
        // Fallback: Use Unsplash Source API (deprecated but still works)
        const encodedTerm = encodeURIComponent(fullSearchTerm);
        return `https://source.unsplash.com/800x600/?${encodedTerm}`;
        
      } catch (error) {
        console.warn(`Error fetching image for "${searchTerm}":`, error.message);
        // Fallback to default
        return 'https://source.unsplash.com/800x600/?vienna,austria';
      }
    };

    // Process options and add image URLs (async)
    // Process sequentially to track duplicates across all options
    const processedOptions = [];
    for (const option of options) {
      // Use imageSearchTerm if provided, otherwise use title or a default
      const searchTerm = option.imageSearchTerm || option.title || 'vienna';
      const title = option.title || searchTerm;
      option.imageUrl = await getImageUrl(searchTerm, title, usedImageUrls);
      
      // Remove imageSearchTerm from final output (we only need imageUrl)
      delete option.imageSearchTerm;
      
      processedOptions.push(option);
    }
    
    options = processedOptions;

    return res.status(200).json({
      options: options
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
async function initializeDefaultImages() {
  const cacheFilePath = path.join(__dirname, 'image-cache.json');
  
  // Load existing cache
  let imageCache = {};
  try {
    const cacheData = await fs.readFile(cacheFilePath, 'utf8');
    imageCache = JSON.parse(cacheData);
  } catch (error) {
    imageCache = {};
  }
  
  // Test if an image URL is still valid
  const testImageUrl = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };
  
  // Save cache to file
  const saveCache = async () => {
    try {
      await fs.writeFile(cacheFilePath, JSON.stringify(imageCache, null, 2), 'utf8');
    } catch (error) {
      console.warn('Failed to save image cache:', error.message);
    }
  };
  
  // Fetch image for a visit option
  const fetchImageForOption = async (title, searchTerm) => {
    // Check if already in cache and valid
    if (imageCache[title]) {
      const isValid = await testImageUrl(imageCache[title]);
      if (isValid) {
        console.log(`✓ Cached image valid for: ${title}`);
        return;
      } else {
        console.log(`✗ Cached image invalid, fetching new: ${title}`);
        delete imageCache[title];
      }
    }
    
    // Fetch new image
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!unsplashAccessKey) {
      console.log(`⚠ Skipping ${title} - UNSPLASH_ACCESS_KEY not set`);
      return;
    }
    
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const apiUrl = `https://api.unsplash.com/search/photos?query=${encodedTerm}&per_page=1&orientation=landscape&client_id=${unsplashAccessKey}`;
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const photo = data.results[0];
          const imageUrl = `${photo.urls.regular}?w=800&q=80&fit=crop`;
          imageCache[title] = imageUrl;
          console.log(`✓ Fetched image for: ${title}`);
        } else {
          console.log(`⚠ No results for: ${title}`);
        }
      } else {
        console.log(`⚠ API error for ${title}: ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠ Error fetching image for ${title}:`, error.message);
    }
  };
  
  // Fetch images for all default options
  console.log('\n🖼️  Initializing default visit option images...');
  for (const option of defaultVisitOptions) {
    await fetchImageForOption(option.title, option.searchTerm);
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Save updated cache
  await saveCache();
  console.log('✓ Default images initialization complete\n');
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
  console.log('   - UNSPLASH_ACCESS_KEY=your_key_here (optional, for better image quality)');
  console.log('\n📸 Get Unsplash Access Key: https://unsplash.com/developers');
  
  // Initialize default images on server start
  initializeDefaultImages().catch(err => {
    console.error('Error initializing default images:', err);
  });
});

