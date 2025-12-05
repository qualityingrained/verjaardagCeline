// Vercel serverless function for weather API
// This keeps the API key secure on the server side

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Try multiple environment variable names for compatibility
    const API_KEY =
      process.env.OPENWEATHER_API_KEY ||
      process.env.OPEN_WEATHER_API_KEY ||
      process.env.WEATHER_API_KEY;

    // Debug logging (only in development)
    if (process.env.NODE_ENV === "development" || !API_KEY) {
      console.log("Environment check:", {
        hasOpenWeatherKey: !!process.env.OPENWEATHER_API_KEY,
        hasOpenWeatherKeyAlt: !!process.env.OPEN_WEATHER_API_KEY,
        hasWeatherKey: !!process.env.WEATHER_API_KEY,
        allEnvKeys: Object.keys(process.env).filter(
          (k) => k.includes("WEATHER") || k.includes("API")
        ),
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        error: "Weather API key not configured",
        message:
          "Please set OPENWEATHER_API_KEY in your Vercel environment variables",
        debug:
          process.env.NODE_ENV === "development"
            ? "Check Vercel dashboard > Settings > Environment Variables"
            : undefined,
      });
    }

    const { type, lat, lon } = req.query;
    const VIENNA_LAT = lat || 48.2082;
    const VIENNA_LON = lon || 16.3738;

    let url;

    if (type === "forecast") {
      // Get 5-day forecast
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${VIENNA_LAT}&lon=${VIENNA_LON}&appid=${API_KEY}&units=metric`;
    } else {
      // Get current weather
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${VIENNA_LAT}&lon=${VIENNA_LON}&appid=${API_KEY}&units=metric`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({
        error: "Weather API error",
        details: errorData,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Weather API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
