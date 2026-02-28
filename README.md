# Brewify 🍹🎧

> **Drinks pair with music. Music pairs with drinks.**

Brewify is a web app that finds the perfect musical pairing for your drink — or the perfect drink for your music. Built with SvelteKit, Tailwind CSS v4, Spotify Web API, TheCocktailDB, and Claude AI.

---

## Features

### Mode 1: Drink → Playlist
- Enter any drink (free text): "iced oat milk latte", "a glass of malbec", "cold brew"
- Claude analyzes the drink's vibe and energy
- Spotify API searches for matching tracks and assembles a 20–25 track playlist
- Playlist gets a creative name (e.g. "Malbec Midnight") and is saved to your Spotify library

### Mode 2: Music → Drink
- Enter an artist name, album, or Spotify playlist URL
- Claude reads the musical vibe and suggests 3 cocktail pairings
- TheCocktailDB API fetches real recipes — drink image, ingredients with measurements, numbered instructions
- Filter results by alcoholic / non-alcoholic
- Automatic retry if a suggested cocktail isn't found (up to 3 attempts)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [SvelteKit 2](https://kit.svelte.dev) + [Svelte 5](https://svelte.dev) (runes) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Language | TypeScript |
| AI | [Anthropic Claude API](https://anthropic.com) (`claude-sonnet-4-6`) |
| Music | [Spotify Web API](https://developer.spotify.com/documentation/web-api) |
| Cocktails | [TheCocktailDB](https://www.thecocktaildb.com/api.php) (no key required) |
| Deployment | [Vercel](https://vercel.com) via `@sveltejs/adapter-vercel` |

---

## Setup

### Prerequisites
- Node.js 18+
- A [Spotify Developer](https://developer.spotify.com/dashboard) account
- An [Anthropic API](https://console.anthropic.com) key

### 1. Clone the repo
```bash
git clone https://github.com/sarahmorrisokeefe/brewify.git
cd brewify
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5173/api/auth/callback
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Configure Spotify OAuth

In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):
1. Create a new app (or use an existing one)
2. Add `http://localhost:5173/api/auth/callback` to the **Redirect URIs**
3. Copy your **Client ID** and **Client Secret** to `.env`

### 5. Run locally
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deployment (Vercel)

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option B: GitHub Integration
1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Set environment variables in Vercel project settings:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REDIRECT_URI` → `https://your-app.vercel.app/api/auth/callback`
   - `ANTHROPIC_API_KEY`
4. **Important:** Update your Spotify app's Redirect URIs to include the production URL

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `SPOTIFY_REDIRECT_URI` | OAuth callback URL (must match Spotify app settings) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

---

## Project Structure

```
src/
├── app.html                    # HTML template
├── app.css                     # Global styles + Tailwind v4
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   └── components/
│       ├── DrinkMode.svelte    # Mode 1: drink input + playlist form
│       ├── MusicMode.svelte    # Mode 2: music input + cocktail filters
│       ├── PlaylistResult.svelte  # Spotify playlist display
│       └── CocktailCard.svelte    # Cocktail recipe card
└── routes/
    ├── +layout.server.ts       # Auth state loader
    ├── +layout.svelte          # App shell (nav, footer)
    ├── +page.svelte            # Main page (mode selector)
    └── api/
        ├── auth/
        │   ├── spotify/        # OAuth initiation → Spotify
        │   └── callback/       # OAuth callback handler
        ├── logout/             # Clear session cookies
        ├── drink-to-playlist/  # Claude + Spotify → playlist
        └── music-to-drink/     # Claude + CocktailDB → recipes
```

---

## How It Works

### Authentication
- Spotify OAuth 2.0 authorization code flow
- Tokens stored in secure `httpOnly` cookies
- Automatic token refresh before expiry

### Drink → Playlist
1. User enters drink description
2. Server calls Claude (`claude-sonnet-4-6`) for vibe analysis → returns playlist name, mood descriptors, and search terms
3. Server queries Spotify Search API with 3–5 mood-based search queries
4. Results are deduplicated, shuffled, and capped at 25 tracks
5. A private playlist is created in the user's Spotify library

### Music → Drink
1. User enters artist/album/Spotify playlist URL
2. If a Spotify URL is provided and user is logged in, the server fetches real track data to give Claude richer context
3. Claude suggests 3 cocktail names
4. Each name is looked up in TheCocktailDB
5. If a name isn't found, Claude is asked for an alternate (up to 3 retries)
6. Recipe cards are returned with image, ingredients, and step-by-step instructions

---

## Notes

- TheCocktailDB free tier is used — no API key required
- Playlists are created as **private** by default
- The app is stateless — no user data is stored beyond the active session cookies
