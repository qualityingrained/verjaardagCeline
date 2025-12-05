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
                  return imageUrl;
                }
              }
              
              // If all results are duplicates, use the first one anyway
              const photo = data.results[0];
              const imageUrl = `${photo.urls.regular}?w=800&q=80&fit=crop`;
              console.log(`Using first result for "${title}": ${imageUrl}`);
              return imageUrl;
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
        return `https://source.unsplash.com/800x600/?${encodedTerm}`;
        
      } catch (error) {
        console.error(`Error fetching image for "${searchTerm}":`, error.message);
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
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

