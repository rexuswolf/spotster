# 🎵 Spotster Quiz - Frontend Only

A complete music quiz game built entirely in React - no backend needed!

## Features

- 🎮 Two game modes: Random songs or custom playlist
- 🎵 30-second Spotify preview clips
- 🏆 Smart scoring for year, name, and artist guesses
- ✨ Beautiful UI with progress tracking
- 🚀 Single-page app - super easy to run!

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Spotify Credentials

The `.env` file already exists with your credentials. If you need to change them:

```bash
# Edit .env file
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
```

### 3. Run the App

```bash
npm run dev
```

Open **http://localhost:5173/** in your browser!

## How It Works

- Uses Spotify Web API directly from the browser
- Client Credentials flow for authentication
- All game logic runs in the frontend
- No backend server needed!

## Security Note

⚠️ **For Personal Use Only**

This app includes Spotify credentials in the frontend code (via environment variables). This is fine for:
- Personal projects
- Local development
- Learning/demos

For production apps, you should:
- Use a backend to protect credentials
- Implement proper OAuth flow
- Never expose client secrets in frontend code

## Game Modes

### Random Songs
- Get 5-20 random popular songs from Spotify
- Songs from different decades and genres
- Great for varied challenges

### Custom Playlist
- Enter song names (one per line)
- Quiz yourself on specific songs
- Use the sample `../songs_input.txt` file for ideas

## Scoring

- **Year:** 100 pts (exact) | 75 pts (±1) | 50 pts (±3) | 25 pts (±5)
- **Name:** 50 pts (exact) | 25 pts (partial) - BONUS
- **Artist:** 50 pts (exact) | 25 pts (partial) - BONUS

Max: **200 points per song**

## Troubleshooting

**Songs not loading:**
- Check your Spotify credentials in `.env`
- Make sure the credentials are valid
- Try random mode first

**No preview available:**
- Not all Spotify songs have 30-second previews
- The app automatically filters songs without previews
- Try different songs or random mode

**Build errors:**
- Delete `node_modules` and run `npm install` again
- Make sure you're using a recent version of Node.js (v16+)

## Development

Built with:
- React + Vite
- Spotify Web API
- CSS with gradients and animations

## Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

Enjoy the quiz! 🎵🎮
