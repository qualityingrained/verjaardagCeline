# Vienna Trip Website

A beautiful, interactive website for planning a trip to Vienna, featuring weather integration and AI-powered assistance.

## Features

- 🎨 Dynamic, scroll-driven Vienna showcase page
- 🧩 Interactive crypto puzzle landing page
- 🌤️ Live weather integration with forecast for trip dates
- 🤖 AI-powered travel assistant
- 📱 Fully responsive design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```
OPENWEATHER_API_KEY=your_openweather_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

**Get API Keys:**

- **OpenWeatherMap**: Free at https://openweathermap.org/api
- **OpenAI**: Get at https://platform.openai.com/api-keys (required for AI features)
- **Unsplash**: Free at https://unsplash.com/developers (optional, for better image quality - falls back to Source API if not set)

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

- Main page (puzzle): http://localhost:3000/
- Vienna page: http://localhost:3000/vienna

## Project Structure

```
Webpage/
├── index.html          # Crypto puzzle landing page
├── vienna.html         # Vienna trip showcase page
├── script.js           # Main JavaScript
├── styles.css          # Vienna page styles
├── crypto-script.js    # Puzzle logic
├── crypto-styles.css   # Puzzle styles
├── server.js           # Express server with API routes
├── api/
│   └── weather.js      # Vercel serverless function (for production)
└── images/             # Image assets
```

## API Routes

### Weather API

- `GET /api/weather?type=forecast&lat=48.2082&lon=16.3738`
- Returns current weather or forecast data

### AI API

- `POST /api/ai`
- Body: `{ "prompt": "your question", "context": "optional context" }`
- Returns AI-generated response

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `OPENWEATHER_API_KEY`
   - `OPENAI_API_KEY` (optional)
4. Deploy!

The `api/weather.js` serverless function will handle API routes in production.

## Development

- **Local Dev**: `npm run dev` (uses Express server)
- **Production**: Deploys to Vercel with serverless functions

## Notes

- Weather shows current + next 3 days when >14 days from trip
- Weather switches to trip forecast (April 24-27, 2026) when within 14 days
- AI features require OpenAI API key (optional)
