import { useState } from 'react'
import './StartScreen.css'
import { startQuiz } from '../services/spotify'

function StartScreen({ onStart }) {
  const [mode, setMode] = useState('random')
  const [count, setCount] = useState(5)
  const [customSongs, setCustomSongs] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedGenres, setSelectedGenres] = useState(['pop', 'rock'])
  const [yearStart, setYearStart] = useState(1970)
  const [yearEnd, setYearEnd] = useState(2024)

  const availableGenres = [
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' },
    { value: 'hip-hop', label: 'Hip Hop' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'indie', label: 'Indie' },
    { value: 'country', label: 'Country' },
    { value: 'r-n-b', label: 'R&B' },
    { value: 'metal', label: 'Metal' },
    { value: 'alternative', label: 'Alternative' }
  ]

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter(g => g !== genre))
      }
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const handleStart = async () => {
    setLoading(true)
    setError('')

    try {
      let quizData

      if (mode === 'random') {
        quizData = await startQuiz('random', count, {
          genres: selectedGenres,
          yearStart,
          yearEnd
        })
      } else {
        const songNames = customSongs
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0)

        if (songNames.length === 0) {
          setError('Please enter at least one song')
          setLoading(false)
          return
        }

        quizData = await startQuiz('custom', songNames)
      }

      if (!quizData.songs || quizData.songs.length === 0) {
        setError('No songs found. Try different settings or custom mode.')
        setLoading(false)
        return
      }

      onStart(quizData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="start-screen">
      <div className="mode-selector">
        <h2>Choose Game Mode</h2>
        <div className="mode-buttons">
          <button
            className={`mode-btn ${mode === 'random' ? 'active' : ''}`}
            onClick={() => setMode('random')}
          >
            🎲 Random Songs
          </button>
          <button
            className={`mode-btn ${mode === 'custom' ? 'active' : ''}`}
            onClick={() => setMode('custom')}
          >
            📝 Custom Playlist
          </button>
        </div>
      </div>

      {mode === 'random' && (
        <div className="options">
          <label>
            Number of songs:
            <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
            />
          </label>

          <div className="genre-selector">
            <label>Select Genres (at least 1):</label>
            <div className="genre-chips">
              {availableGenres.map(genre => (
                <button
                  key={genre.value}
                  className={`genre-chip ${selectedGenres.includes(genre.value) ? 'selected' : ''}`}
                  onClick={() => toggleGenre(genre.value)}
                  type="button"
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>

          <div className="year-range">
            <label>Year Range:</label>
            <div className="year-inputs">
              <div className="year-input-group">
                <span>From:</span>
                <input
                  type="number"
                  min="1950"
                  max={yearEnd}
                  value={yearStart}
                  onChange={(e) => setYearStart(parseInt(e.target.value))}
                />
              </div>
              <div className="year-input-group">
                <span>To:</span>
                <input
                  type="number"
                  min={yearStart}
                  max="2024"
                  value={yearEnd}
                  onChange={(e) => setYearEnd(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'custom' && (
        <div className="options">
          <label>
            Enter song names (one per line):
            <textarea
              rows="10"
              placeholder="Bohemian Rhapsody&#10;Stairway to Heaven&#10;Imagine"
              value={customSongs}
              onChange={(e) => setCustomSongs(e.target.value)}
            />
          </label>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <button className="start-btn" onClick={handleStart} disabled={loading}>
        {loading ? 'Loading...' : 'Start Quiz 🎮'}
      </button>

      <div className="instructions">
        <h3>How to Play:</h3>
        <ul>
          <li>🎵 Listen to a 30-second preview of each song</li>
          <li>📅 Guess the release year (required)</li>
          <li>🎤 Optionally guess the song name and artist for bonus points</li>
          <li>🏆 Closer guesses earn more points!</li>
        </ul>
        <div className="scoring">
          <h4>Scoring:</h4>
          <p><strong>Year:</strong> 100 pts (exact) | 75 pts (±1 year) | 50 pts (±3 years) | 25 pts (±5 years)</p>
          <p><strong>Name:</strong> 50 pts (exact) | 25 pts (partial)</p>
          <p><strong>Artist:</strong> 50 pts (exact) | 25 pts (partial)</p>
        </div>
      </div>
    </div>
  )
}

export default StartScreen
