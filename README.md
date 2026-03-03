# 🎵 Spotster Quiz - Frontend Only!

Everything runs in your browser. No backend needed!

## Quick Start

```bash
npm run dev
```

Open **http://localhost:5173/** and play!

## First Time Setup

```bash
npm install
npm run dev
```

That's it! 🎮

## How It Works

- All Spotify API calls happen directly from your browser
- Game logic and scoring run locally
- Songs play through Spotify's embedded player

## Features

✅ Random songs from different decades
✅ Custom playlist mode
✅ Spotify embedded player (full tracks!)
✅ Smart scoring system
✅ Clean song names (removes "Remastered")
✅ Beautiful UI with blurred player overlay
✅ All client-side!

## Troubleshooting

**Songs not loading:**
- Check browser console for errors
- Make sure `.env` has valid Spotify credentials

**CORS errors:**
- Spotify's API should allow credential-based auth from browsers
- If you see CORS errors, it means Spotify blocked the request

**Player not working:**
- Make sure you're logged into Spotify (on web or desktop app)
- Some songs may be region-restricted
- Try different songs or random mode

Enjoy! 🎵
