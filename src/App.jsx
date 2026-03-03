import { useState } from 'react'
import './App.css'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'
import SpotifyTest from './components/SpotifyTest'

function App() {
  const [gameState, setGameState] = useState('start') // 'start', 'playing', 'results', 'test'
  const [quizData, setQuizData] = useState(null)
  const [results, setResults] = useState([])
  const [totalScore, setTotalScore] = useState(0)

  const handleStartQuiz = (data) => {
    setQuizData(data)
    setResults([])
    setTotalScore(0)
    setGameState('playing')
  }

  const handleQuizComplete = (finalResults, score) => {
    setResults(finalResults)
    setTotalScore(score)
    setGameState('results')
  }

  const handlePlayAgain = () => {
    setGameState('start')
    setQuizData(null)
    setResults([])
    setTotalScore(0)
  }

  return (
    <div className="App">
      <header>
        <h1>🎵 Spotster Quiz</h1>
        <p>Test your music knowledge!</p>
        {gameState !== 'test' && (
          <button
            onClick={() => setGameState('test')}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            🧪 Test Spotify API
          </button>
        )}
        {gameState === 'test' && (
          <button
            onClick={() => setGameState('start')}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            ← Back to Quiz
          </button>
        )}
      </header>

      <main>
        {gameState === 'start' && <StartScreen onStart={handleStartQuiz} />}
        {gameState === 'playing' && (
          <QuizScreen quizData={quizData} onComplete={handleQuizComplete} />
        )}
        {gameState === 'results' && (
          <ResultsScreen
            results={results}
            totalScore={totalScore}
            onPlayAgain={handlePlayAgain}
          />
        )}
        {gameState === 'test' && <SpotifyTest />}
      </main>
    </div>
  )
}

export default App
