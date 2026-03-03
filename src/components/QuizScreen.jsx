import { useState, useEffect, useRef } from 'react'
import './QuizScreen.css'
import { submitAnswer, searchSongSuggestions, searchArtistSuggestions } from '../services/spotify'

function QuizScreen({ quizData, onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [yearGuess, setYearGuess] = useState('')
  const [nameGuess, setNameGuess] = useState('')
  const [artistGuess, setArtistGuess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [currentResult, setCurrentResult] = useState(null)
  const [allResults, setAllResults] = useState([])
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [songSuggestions, setSongSuggestions] = useState([])
  const [artistSuggestions, setArtistSuggestions] = useState([])
  const [showSongDropdown, setShowSongDropdown] = useState(false)
  const [showArtistDropdown, setShowArtistDropdown] = useState(false)
  const embedControllerRef = useRef(null)
  const songSearchTimeout = useRef(null)
  const artistSearchTimeout = useRef(null)
  const songInputRef = useRef(null)
  const artistInputRef = useRef(null)

  const currentSong = quizData.songs[currentIndex]
  const progress = ((currentIndex + 1) / quizData.songs.length) * 100

  // Initialize Spotify iframe API once on mount
  useEffect(() => {
    const initSpotifyEmbed = (IFrameAPI) => {
      const element = document.getElementById('embed-iframe')
      if (!element) return

      const options = {
        width: '0',
        height: '0',
        uri: `spotify:track:${quizData.songs[0].spotify_id}`
      }

      const callback = (EmbedController) => {
        embedControllerRef.current = EmbedController

        EmbedController.addListener('ready', () => {
          EmbedController.play()
        })

        EmbedController.addListener('playback_update', (e) => {
          setIsPlaying(!e.data.isPaused)
        })
      }

      IFrameAPI.createController(element, options, callback)
    }

    if (window.IFrameAPI) {
      initSpotifyEmbed(window.IFrameAPI)
    } else {
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        initSpotifyEmbed(IFrameAPI)
      }
    }

    return () => {
      if (embedControllerRef.current) {
        try {
          embedControllerRef.current.destroy()
        } catch (err) {
          console.warn('Error destroying controller:', err)
        }
        embedControllerRef.current = null
      }
      // Clear search timeouts
      if (songSearchTimeout.current) clearTimeout(songSearchTimeout.current)
      if (artistSearchTimeout.current) clearTimeout(artistSearchTimeout.current)
    }
  }, []) // Empty deps - only initialize once

  // Load new track when song changes
  useEffect(() => {
    if (embedControllerRef.current && currentIndex > 0) {
      embedControllerRef.current.loadUri(`spotify:track:${currentSong.spotify_id}`)
    }
  }, [currentIndex, currentSong.spotify_id])

  const togglePlayPause = () => {
    if (embedControllerRef.current) {
      embedControllerRef.current.togglePlay()
    } else {
    }
  }

  // Debounced search for song suggestions
  const handleNameChange = (e) => {
    const value = e.target.value
    setNameGuess(value)

    if (songSearchTimeout.current) {
      clearTimeout(songSearchTimeout.current)
    }

    if (value.length >= 2) {
      songSearchTimeout.current = setTimeout(async () => {
        try {
          const suggestions = await searchSongSuggestions(value)
          setSongSuggestions(suggestions)
          setShowSongDropdown(suggestions.length > 0)
        } catch (err) {
          console.warn('Error fetching song suggestions:', err)
        }
      }, 300)
    } else {
      setSongSuggestions([])
      setShowSongDropdown(false)
    }
  }

  const handleSongSelect = (suggestion) => {
    setNameGuess(suggestion)
    setShowSongDropdown(false)
    setSongSuggestions([])
  }

  // Debounced search for artist suggestions
  const handleArtistChange = (e) => {
    const value = e.target.value
    setArtistGuess(value)

    if (artistSearchTimeout.current) {
      clearTimeout(artistSearchTimeout.current)
    }

    if (value.length >= 2) {
      artistSearchTimeout.current = setTimeout(async () => {
        try {
          const suggestions = await searchArtistSuggestions(value)
          setArtistSuggestions(suggestions)
          setShowArtistDropdown(suggestions.length > 0)
        } catch (err) {
          console.warn('Error fetching artist suggestions:', err)
        }
      }, 300)
    } else {
      setArtistSuggestions([])
      setShowArtistDropdown(false)
    }
  }

  const handleArtistSelect = (suggestion) => {
    setArtistGuess(suggestion)
    setShowArtistDropdown(false)
    setArtistSuggestions([])
  }

  const handleSubmit = () => {
    if (!yearGuess) {
      alert('Please enter a year guess!')
      return
    }

    setLoading(true)

    try {
      const result = submitAnswer(
        yearGuess,
        nameGuess,
        artistGuess,
        currentSong
      )

      setCurrentResult(result)
      setShowResult(true)
      setScore(score + result.score)
      setAllResults([...allResults, result])
    } catch (err) {
      alert('Error submitting answer: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < quizData.songs.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setYearGuess('')
      setNameGuess('')
      setArtistGuess('')
      setShowResult(false)
      setCurrentResult(null)
      setIsPlaying(false)
      setSongSuggestions([])
      setArtistSuggestions([])
    } else {
      onComplete(allResults, score)
    }
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Menu
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        <span className="progress-text">
          Song {currentIndex + 1} of {quizData.songs.length}
        </span>
      </div>

      <div className="score-display">
        <h2>Score: {score}</h2>
      </div>

      <div className="song-card">
        <div className="spotify-player-container">
          <div id="embed-iframe"></div>
          {!showResult ? (
            <div className="player-controls">
              <p className="hint-text">🎵 Listen and guess!</p>
              <div className="play-button-wrapper">
                <button
                  className={`custom-play-button ${isPlaying ? 'playing' : ''}`}
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className="playback-hint">{isPlaying ? 'Playing...' : 'Paused'}</p>
            </div>
          ) : (
            <div className="player-revealed">
              <p style={{ textAlign: 'center', color: 'white', marginBottom: '1rem' }}>
                🎵 Now playing: {currentSong.name} - {currentSong.artist}
              </p>
            </div>
          )}
        </div>

        {!showResult ? (
          <div className="guess-form">
            <div className="input-group required">
              <label>Release Year *</label>
              <input
                type="number"
                placeholder="e.g., 1975"
                value={yearGuess}
                onChange={(e) => setYearGuess(e.target.value)}
                disabled={loading}
                min="1900"
                max="2024"
              />
            </div>

            <div className="input-group autocomplete-wrapper">
              <label>Song Name (optional - bonus points)</label>
              <input
                ref={songInputRef}
                type="text"
                placeholder="e.g., Bohemian Rhapsody"
                value={nameGuess}
                onChange={handleNameChange}
                onFocus={() => songSuggestions.length > 0 && setShowSongDropdown(true)}
                onBlur={() => setTimeout(() => setShowSongDropdown(false), 200)}
                disabled={loading}
                autoComplete="off"
              />
              {showSongDropdown && (
                <div className="autocomplete-dropdown">
                  {songSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="autocomplete-item"
                      onMouseDown={() => handleSongSelect(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group autocomplete-wrapper">
              <label>Artist (optional - bonus points)</label>
              <input
                ref={artistInputRef}
                type="text"
                placeholder="e.g., Queen"
                value={artistGuess}
                onChange={handleArtistChange}
                onFocus={() => artistSuggestions.length > 0 && setShowArtistDropdown(true)}
                onBlur={() => setTimeout(() => setShowArtistDropdown(false), 200)}
                disabled={loading}
                autoComplete="off"
              />
              {showArtistDropdown && (
                <div className="autocomplete-dropdown">
                  {artistSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="autocomplete-item"
                      onMouseDown={() => handleArtistSelect(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading || !yearGuess}
            >
              {loading ? 'Submitting...' : 'Submit Answer ✓'}
            </button>
          </div>
        ) : (
          <div className="result-display">
            <h3 className="score-earned">+{currentResult.score} points!</h3>

            <div className="correct-answers">
              <div className={`answer-item ${currentResult.correct_flags.year ? 'correct' : 'incorrect'}`}>
                <span className="label">Year:</span>
                <span className="value">
                  {yearGuess} → {currentResult.correct.year}
                  {currentResult.correct_flags.year && ' ✓'}
                </span>
              </div>

              {nameGuess && (
                <div className={`answer-item ${currentResult.correct_flags.name ? 'correct' : 'incorrect'}`}>
                  <span className="label">Name:</span>
                  <span className="value">
                    {nameGuess} → {currentResult.correct.name}
                    {currentResult.correct_flags.name && ' ✓'}
                  </span>
                </div>
              )}

              {artistGuess && (
                <div className={`answer-item ${currentResult.correct_flags.artist ? 'correct' : 'incorrect'}`}>
                  <span className="label">Artist:</span>
                  <span className="value">
                    {artistGuess} → {currentResult.correct.artist}
                    {currentResult.correct_flags.artist && ' ✓'}
                  </span>
                </div>
              )}

              {!nameGuess && (
                <div className="answer-item">
                  <span className="label">Name:</span>
                  <span className="value">{currentResult.correct.name}</span>
                </div>
              )}

              {!artistGuess && (
                <div className="answer-item">
                  <span className="label">Artist:</span>
                  <span className="value">{currentResult.correct.artist}</span>
                </div>
              )}
            </div>

            <button className="next-btn" onClick={handleNext}>
              {currentIndex < quizData.songs.length - 1 ? 'Next Song →' : 'View Results 🏆'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizScreen
