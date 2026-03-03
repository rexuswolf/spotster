import { useEffect } from 'react'

function SpotifyTest() {
  useEffect(() => {
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById('embed-iframe')

      // Test 1: Podcast episode (from docs - should work)
      const podcastOptions = {
        width: '100%',
        height: '160',
        uri: 'spotify:episode:7makk4oTQel546B0PZlDM5'
      }

      const podcastCallback = (EmbedController) => {
        console.log('Podcast embed controller ready:', EmbedController)

        // Add test buttons
        document.getElementById('test-podcast').addEventListener('click', () => {
          console.log('Testing podcast togglePlay()')
          EmbedController.togglePlay()
        })

        // Test with a track after 3 seconds
        document.getElementById('test-track').addEventListener('click', () => {
          console.log('Loading track...')
          // Using a popular track (Bohemian Rhapsody)
          EmbedController.loadUri('spotify:track:3z8h0TU7ReDPLIbEnYhWZb')
        })
      }

      IFrameAPI.createController(element, podcastOptions, podcastCallback)
    }
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Spotify iframe API Test</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button
          id="test-podcast"
          style={{
            padding: '0.8rem 1rem',
            marginRight: '0.5rem',
            background: '#1db954',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Toggle Play (Podcast)
        </button>

        <button
          id="test-track"
          style={{
            padding: '0.8rem 1rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Load Track (Bohemian Rhapsody)
        </button>
      </div>

      <div id="embed-iframe"></div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>First button tests togglePlay() with the podcast from docs (should work)</li>
          <li>Second button tries to load a music track (may or may not work)</li>
          <li>Check browser console for logs</li>
        </ol>
      </div>
    </div>
  )
}

export default SpotifyTest
