# EcoTrack — Carbon Footprint Awareness Platform 🌿

A full-featured, AI-powered web application for tracking, understanding, and reducing your personal carbon footprint.

## Features

- 🧮 **Carbon Calculator** — 5-step wizard with India-specific emission factors
- 🤖 **AI Suggestions** — Powered by Google Gemini API (with smart fallback)
- 🏆 **Green Challenges** — Gamified eco-challenges with points, badges, and levels
- 📊 **Analytics Dashboard** — Pie, bar, and line charts with historical trends
- 🗺️ **Green Map** — EV stations, transport, recycling centers across India
- 💬 **EcoBot Chat** — AI assistant for sustainability questions

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Gemini API Key
Go to **Settings** in the app and enter your [Google Gemini API key](https://makersuite.google.com/app/apikey).

Or create a `.env.local` file:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add `NEXT_PUBLIC_GEMINI_API_KEY` in Vercel environment variables
4. Deploy!

### Manual Build
```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14** — React framework
- **Chart.js** — Analytics charts
- **Leaflet.js** — Interactive maps
- **Google Gemini AI** — AI suggestions and chat
- **OpenStreetMap** — Free map tiles (no API key needed)

## Emission Factors

All calculations use India-specific emission factors:
- Indian electricity grid: **0.82 kg CO₂/kWh**
- India average annual emissions: **1.9 tonnes CO₂/person**
- Sources: India GHG Platform, Ministry of Environment, IEA

## License

MIT License — Free to use and modify.
