import './ResultsScreen.css'

function ResultsScreen({ results, totalScore, onPlayAgain }) {
  const maxScore = results.length * 200 // 100 for year + 50 for name + 50 for artist
  const percentage = Math.round((totalScore / maxScore) * 100)

  const getRank = (percentage) => {
    if (percentage >= 90) return { emoji: '🏆', title: 'Music Master', color: '#FFD700' }
    if (percentage >= 75) return { emoji: '🎵', title: 'Melody Maestro', color: '#C0C0C0' }
    if (percentage >= 60) return { emoji: '🎸', title: 'Rock Star', color: '#CD7F32' }
    if (percentage >= 40) return { emoji: '🎤', title: 'Karaoke King', color: '#8B4513' }
    return { emoji: '🎧', title: 'Music Fan', color: '#696969' }
  }

  const rank = getRank(percentage)

  return (
    <div className="results-screen">
      <div className="final-score">
        <h2 style={{ color: rank.color }}>
          {rank.emoji} {rank.title}
        </h2>
        <div className="score-big">{totalScore}</div>
        <div className="score-detail">
          out of {maxScore} possible points ({percentage}%)
        </div>
      </div>

      <div className="results-summary">
        <h3>Song Breakdown</h3>
        <div className="results-list">
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <div className="result-header">
                <span className="result-number">Song {index + 1}</span>
                <span className="result-score">+{result.score} pts</span>
              </div>
              <div className="result-details">
                <div className="result-song-info">
                  <strong>{result.correct.name}</strong>
                  <span className="by">by</span>
                  <span>{result.correct.artist}</span>
                  <span className="year">({result.correct.year})</span>
                </div>
                <div className="result-checks">
                  {result.correct_flags.year && <span className="check">✓ Year</span>}
                  {result.correct_flags.name && <span className="check">✓ Name</span>}
                  {result.correct_flags.artist && <span className="check">✓ Artist</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="play-again-btn" onClick={onPlayAgain}>
        Play Again 🎮
      </button>
    </div>
  )
}

export default ResultsScreen
