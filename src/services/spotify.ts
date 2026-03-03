/**
 * Spotify API Service - Frontend Only
 * All logic runs in the browser
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyImage {
  url: string
  height: number
  width: number
}

interface SpotifyArtist {
  id: string
  name: string
  uri: string
}

interface SpotifyAlbum {
  id: string
  name: string
  release_date: string
  images: SpotifyImage[]
}

interface SpotifyTrack {
  id: string
  name: string
  uri: string
  preview_url: string | null
  artists: SpotifyArtist[]
  album: SpotifyAlbum
}

interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyTrack[]
  }
}

export interface ProcessedSong {
  name: string
  artist: string
  year: string
  spotify_id: string
  spotify_uri: string
  album_image: string | null
  release_date: string
  preview_url: string | null
}

export interface QuizData {
  quiz_id: string
  songs: ProcessedSong[]
  total: number
}

export interface QuizOptions {
  genres?: string[]
  yearStart?: number
  yearEnd?: number
}

export interface AnswerResult {
  score: number
  correct: {
    year: string
    name: string
    artist: string
  }
  correct_flags: {
    year: boolean
    name: boolean
    artist: boolean
  }
}

// ============================================================================
// SpotifyClient Class
// ============================================================================

class SpotifyClient {
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  /**
   * Get Spotify access token (with caching)
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured')
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data: SpotifyTokenResponse = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

    return this.accessToken
  }

  /**
   * Clean song name by removing remaster/remix/live suffixes
   */
  private cleanSongName(name: string): string {
    const patterns = [
      /\s*-\s*remaster(?:ed)?.*$/i,
      /\s*-\s*remix.*$/i,
      /\s*-\s*live.*$/i,
      /\s*-\s*demo.*$/i,
      /\s*-\s*acoustic.*$/i,
      /\s*-\s*\d{4}\s*remaster.*$/i,
      /\s*\(remaster(?:ed)?\).*$/i
    ]

    let cleaned = name
    for (const pattern of patterns) {
      cleaned = cleaned.replace(pattern, '')
    }
    return cleaned.trim()
  }

  /**
   * Process Spotify track data into our format
   */
  private processTrack(track: SpotifyTrack): ProcessedSong | null {
    const releaseDate = track.album.release_date
    const year = releaseDate ? releaseDate.split('-')[0] : null

    if (!year) return null

    return {
      name: this.cleanSongName(track.name),
      artist: track.artists.map((a) => a.name).join(', '),
      year,
      spotify_id: track.id,
      spotify_uri: track.uri,
      album_image: track.album.images[0]?.url || null,
      release_date: releaseDate,
      preview_url: track.preview_url
    }
  }

  /**
   * Search for tracks on Spotify
   */
  private async searchSong(query: string): Promise<SpotifySearchResponse> {
    const token = await this.getAccessToken()

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get audio features for a track (includes tempo/BPM)
   */
  async getTrackTempo(trackId: string): Promise<number> {
    const token = await this.getAccessToken()

    const response = await fetch(
      `https://api.spotify.com/v1/audio-features/${trackId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get audio features: ${response.statusText}`)
    }

    const data = await response.json()
    return data.tempo || 120 // Default to 120 BPM if not available
  }

  /**
   * Search for song name suggestions
   */
  async searchSongSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return []

    const data = await this.searchSong(query)

    if (!data.tracks?.items) return []

    // Get unique song names with artist
    const suggestions = data.tracks.items
      .map(track => {
        const songName = this.cleanSongName(track.name)
        const artistName = track.artists.map(a => a.name).join(', ')
        return `${songName} - ${artistName}`
      })
      .filter((name, index, self) => self.indexOf(name) === index)
      .slice(0, 10)

    return suggestions
  }

  /**
   * Search for artist name suggestions
   */
  async searchArtistSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return []

    const token = await this.getAccessToken()

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!response.ok) return []

    const data = await response.json()

    if (!data.artists?.items) return []

    return data.artists.items.map((artist: { name: string }) => artist.name)
  }

  /**
   * Generate a random quiz with songs from specified genres and years
   */
  private async generateRandomQuiz(
    count: number,
    options: QuizOptions
  ): Promise<ProcessedSong[]> {
    const songs: ProcessedSong[] = []
    const genres = options.genres || ['pop', 'rock']
    const yearStart = options.yearStart || 1970
    const yearEnd = options.yearEnd || 2024

    const requestsNeeded = Math.min(5, Math.ceil(count / 5))

    for (let i = 0; i < requestsNeeded; i++) {
      const year = yearStart + Math.floor(Math.random() * (yearEnd - yearStart + 1))
      const genre = genres[Math.floor(Math.random() * genres.length)]

      const query = `year:${year} genre:${genre}`
      const data = await this.searchSong(query)

      if (data.tracks?.items) {
        for (const track of data.tracks.items) {
          if (songs.length >= count) break

          const processed = this.processTrack(track)
          if (processed && !songs.find((s) => s.spotify_id === processed.spotify_id)) {
            songs.push(processed)
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    return songs
  }

  /**
   * Generate a custom quiz from specific song names
   */
  private async generateCustomQuiz(songNames: string[]): Promise<ProcessedSong[]> {
    const songs: ProcessedSong[] = []

    for (const songName of songNames) {
      const data = await this.searchSong(songName)

      if (data.tracks?.items) {
        const normalizedSearch = songName.toLowerCase().replace(/[^a-z0-9]/g, '')

        const matchingTracks = data.tracks.items.filter((t) => {
          const normalizedTrack = t.name.toLowerCase().replace(/[^a-z0-9]/g, '')
          return (
            normalizedTrack.includes(normalizedSearch) ||
            normalizedSearch.includes(normalizedTrack)
          )
        })

        const originals = matchingTracks.filter((t) => {
          const name = t.name.toLowerCase() + t.album.name.toLowerCase()
          return !name.includes('remaster') && !name.includes('remix')
        })

        const tracks = originals.length > 0 ? originals : matchingTracks
        if (tracks.length > 0) {
          tracks.sort((a, b) => a.album.release_date.localeCompare(b.album.release_date))
          const processed = this.processTrack(tracks[0])
          if (processed) songs.push(processed)
        }
      }
    }

    return songs
  }

  /**
   * Start a quiz - random or custom
   */
  async startQuiz(
    mode: 'random' | 'custom',
    countOrSongs: number | string[],
    options: QuizOptions = {}
  ): Promise<QuizData> {
    let songs: ProcessedSong[]

    if (mode === 'random' && typeof countOrSongs === 'number') {
      songs = await this.generateRandomQuiz(countOrSongs, options)
    } else if (mode === 'custom' && Array.isArray(countOrSongs)) {
      songs = await this.generateCustomQuiz(countOrSongs)
    } else {
      throw new Error('Invalid quiz configuration')
    }

    return {
      quiz_id: Math.random().toString(36).substring(2, 11),
      songs,
      total: songs.length
    }
  }

  /**
   * Submit an answer and calculate score
   */
  submitAnswer(
    yearGuess: string,
    nameGuess: string,
    artistGuess: string,
    correctSong: ProcessedSong
  ): AnswerResult {
    let score = 0
    const flags = { year: false, name: false, artist: false }

    // Year scoring
    if (yearGuess) {
      const yearDiff = Math.abs(parseInt(yearGuess) - parseInt(correctSong.year))
      if (yearDiff === 0) {
        score += 100
        flags.year = true
      } else if (yearDiff === 1) {
        score += 75
      } else if (yearDiff <= 3) {
        score += 50
      } else if (yearDiff <= 5) {
        score += 25
      }
    }

    // Name scoring
    if (nameGuess) {
      const nameLower = nameGuess.toLowerCase()
      const correctNameLower = correctSong.name.toLowerCase()
      if (nameLower === correctNameLower) {
        score += 50
        flags.name = true
      } else if (
        nameLower.includes(correctNameLower) ||
        correctNameLower.includes(nameLower)
      ) {
        score += 25
      }
    }

    // Artist scoring
    if (artistGuess) {
      const artistLower = artistGuess.toLowerCase()
      const correctArtistLower = correctSong.artist.toLowerCase()
      if (artistLower === correctArtistLower) {
        score += 50
        flags.artist = true
      } else if (
        artistLower.includes(correctArtistLower) ||
        correctArtistLower.includes(artistLower)
      ) {
        score += 25
      }
    }

    return {
      score,
      correct: {
        year: correctSong.year,
        name: correctSong.name,
        artist: correctSong.artist
      },
      correct_flags: flags
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

const spotifyClient = new SpotifyClient()

export const startQuiz = spotifyClient.startQuiz.bind(spotifyClient)
export const submitAnswer = spotifyClient.submitAnswer.bind(spotifyClient)
export const searchSongSuggestions = spotifyClient.searchSongSuggestions.bind(spotifyClient)
export const searchArtistSuggestions = spotifyClient.searchArtistSuggestions.bind(spotifyClient)

export default spotifyClient
