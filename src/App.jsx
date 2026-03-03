import { useState } from 'react'
import './App.css'
import Logo from './components/Logo'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'

function App() {
  const [gameState, setGameState] = useState('start') // 'start', 'playing', 'results'
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

  const handleBackToMenu = () => {
    setGameState('start')
    setQuizData(null)
    setResults([])
    setTotalScore(0)
  }

  return (
    <div className="App">
      <header>
        <div className="logo-container">
          <Logo size={80} />
        </div>
        <h1>Spotster Quiz</h1>
        <p>Test your music knowledge!</p>
      </header>

      <main>
        {gameState === 'start' && <StartScreen onStart={handleStartQuiz} />}
        {gameState === 'playing' && (
          <QuizScreen
            quizData={quizData}
            onComplete={handleQuizComplete}
            onBack={handleBackToMenu}
          />
        )}
        {gameState === 'results' && (
          <ResultsScreen
            results={results}
            totalScore={totalScore}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>
    </div>
  )
}

export default App
