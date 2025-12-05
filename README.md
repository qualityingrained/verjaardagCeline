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
3. **Add environment variables in Vercel dashboard:**
   - Go to your project in Vercel Dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add the following variables:
     - `OPENWEATHER_API_KEY` - Your OpenWeatherMap API key
     - `OPENAI_API_KEY` - Your OpenAI API key (optional, for AI features)
     - `UNSPLASH_ACCESS_KEY` - Your Unsplash access key (optional, for better images - requires production approval for serverless functions)
   - **Important**: Make sure to add them for the correct environment:
     - **Production** - for your live site
     - **Preview** - for preview deployments
     - **Development** - for local development (if using Vercel CLI)
4. **Redeploy after adding environment variables:**
   - After adding/updating environment variables, you MUST redeploy
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Select **Redeploy**
   - Or trigger a new deployment by pushing a commit

**Troubleshooting API Keys:**

- If API keys aren't working, verify they're set correctly in Vercel dashboard
- Check that you've redeployed after adding the variables
- Variable names are case-sensitive: `OPENWEATHER_API_KEY` (all caps)
- The API route will log debug info in development mode if keys are missing

**Unsplash API Production Approval:**

- Unsplash API keys start in "Demo" mode (50 requests/hour)
- For production use with serverless functions, you need to apply for production status
- Apply at: https://unsplash.com/developers (your app dashboard)
- Requirements:
  - Use image URLs from `photo.urls` properties (we do this ✅)
  - Trigger downloads when users select images (optional for this use case)
  - Display proper attribution (handled by Unsplash)
- While waiting for approval, the app will automatically fall back to Unsplash Source API
- Production approval increases rate limit to 5,000 requests/hour

The `api/weather.js` serverless function will handle API routes in production.

## Development

- **Local Dev**: `npm run dev` (uses Express server)
- **Production**: Deploys to Vercel with serverless functions

## Notes

- Weather shows current + next 3 days when >14 days from trip
- Weather switches to trip forecast (April 24-27, 2026) when within 14 days
- AI features require OpenAI API key (optional)
