// Vercel serverless function for AI visit options generation
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

    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

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
- "imageSearchTerm": descriptive search term for finding images. Use the actual place name plus descriptive words (e.g., "figlmuller restaurant vienna interior", "loos bar vienna art nouveau", "cafe central vienna elegant interior", "schonbrunn palace vienna baroque architecture"). Include the actual place name when possible, plus atmosphere words like "elegant", "romantic", "cozy", "vibrant", "sophisticated", "baroque", "imperial", etc.
- "description": brief description mentioning what makes this specific place special (1-2 sentences, max 100 characters)
- "content": detailed HTML content for the modal popup including:
  * An introduction paragraph about this SPECIFIC place
  * "What to See" or "What to Experience" section with bullet points about this specific location
  * "Best Time to Visit" section
  * "Tips" section with specific advice about this place
  * Use proper HTML tags: <h4>, <p>, <ul>, <li>, <strong>

Limit to 6-8 options maximum. Focus on Vienna attractions, activities, restaurants, bars, cafes, or experiences related to the query. Always use REAL, SPECIFIC place names.

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

CRITICAL REQUIREMENTS:
1. Titles MUST be concrete, specific names of REAL places in Vienna (restaurants, bars, cafes, attractions)
   - Examples: "Figlmüller", "Loos Bar", "Café Central", "Schönbrunn Palace", "Steirereck"
   - NEVER use generic titles like "A Restaurant" or "A Bar"
2. For imageSearchTerm: Use the actual place name + descriptive words
   - Examples: "figlmuller restaurant vienna", "loos bar vienna art nouveau", "cafe central vienna elegant"
   - Include atmosphere words: elegant, romantic, cozy, vibrant, sophisticated, baroque, imperial, etc.

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

    // Track used image URLs to prevent duplicates
    const usedImageUrls = new Set();
    
    // Function to get image URL from search term using Unsplash Search API
    const getImageUrl = async (searchTerm, title, usedUrls) => {
      if (!searchTerm) {
        searchTerm = 'vienna austria';
      }
      
      // Add "vienna" to search term for better results if not already present
      const fullSearchTerm = searchTerm.toLowerCase().includes('vienna') 
        ? searchTerm 
        : `${searchTerm} vienna`;
      
      try {
        // Use Unsplash Search API (requires access key)
        const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
        
        if (unsplashAccessKey) {
          // Fetch multiple results to have options if duplicates occur
          const encodedTerm = encodeURIComponent(fullSearchTerm);
          const apiUrl = `https://api.unsplash.com/search/photos?query=${encodedTerm}&per_page=10&orientation=landscape&client_id=${unsplashAccessKey}`;
          
          console.log(`Fetching Unsplash image for: ${fullSearchTerm}`);
          
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              // Find the first image that hasn't been used yet
              for (const photo of data.results) {
                const imageUrl = `${photo.urls.regular}?w=800&q=80&fit=crop`;
                if (!usedUrls.has(imageUrl)) {
                  usedUrls.add(imageUrl);
                  console.log(`Found image for "${title}": ${imageUrl}`);
                  // Return image URL and photographer attribution
                  return {
                    imageUrl: imageUrl,
                    attribution: {
                      photographer: photo.user.name,
                      username: photo.user.username,
                      profileUrl: `${photo.user.links.html}?utm_source=vienna-trip-website&utm_medium=referral`,
                      unsplashUrl: `https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral`
                    }
                  };
                }
              }
              
              // If all results are duplicates, use the first one anyway
              const photo = data.results[0];
              const imageUrl = `${photo.urls.regular}?w=800&q=80&fit=crop`;
              console.log(`Using first result for "${title}": ${imageUrl}`);
              return {
                imageUrl: imageUrl,
                attribution: {
                  photographer: photo.user.name,
                  username: photo.user.username,
                  profileUrl: `${photo.user.links.html}?utm_source=vienna-trip-website&utm_medium=referral`,
                  unsplashUrl: `https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral`
                }
              };
            } else {
              console.warn(`No Unsplash results for: ${fullSearchTerm}`);
            }
          } else {
            const errorText = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch (e) {
              errorData = { message: errorText };
            }
            
            // Check for common API key rejection errors
            if (response.status === 401 || response.status === 403) {
              console.warn(`Unsplash API key rejected (${response.status}): ${errorData.message || 'API key may need production approval. Using fallback.'}`);
            } else {
              console.error(`Unsplash API error: ${response.status} ${response.statusText}`, errorData);
            }
            // Fall through to use fallback
          }
        } else {
          console.warn('UNSPLASH_ACCESS_KEY not set, using fallback');
        }
        
        // Fallback: Use Unsplash Source API (deprecated but still works)
        const encodedTerm = encodeURIComponent(fullSearchTerm);
        return {
          imageUrl: `https://source.unsplash.com/800x600/?${encodedTerm}`,
          attribution: {
            photographer: 'Unsplash',
            username: 'unsplash',
            profileUrl: 'https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral',
            unsplashUrl: 'https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral'
          }
        };
        
      } catch (error) {
        console.error(`Error fetching image for "${searchTerm}":`, error.message);
        // Fallback to default
        return {
          imageUrl: 'https://source.unsplash.com/800x600/?vienna,austria',
          attribution: {
            photographer: 'Unsplash',
            username: 'unsplash',
            profileUrl: 'https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral',
            unsplashUrl: 'https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral'
          }
        };
      }
    };

    // Process options and add image URLs and attribution (async)
    // Process sequentially to track duplicates across all options
    const processedOptions = [];
    for (const option of options) {
      // Use imageSearchTerm if provided, otherwise use title or a default
      const searchTerm = option.imageSearchTerm || option.title || 'vienna';
      const title = option.title || searchTerm;
      const imageData = await getImageUrl(searchTerm, title, usedImageUrls);
      
      // Handle both old format (string) and new format (object)
      if (typeof imageData === 'string') {
        option.imageUrl = imageData;
        option.attribution = {
          photographer: 'Unsplash',
          username: 'unsplash',
          profileUrl: 'https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral',
          unsplashUrl: 'https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral'
        };
      } else {
        option.imageUrl = imageData.imageUrl;
        option.attribution = imageData.attribution;
      }
      
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
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

