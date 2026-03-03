function Logo({ size = 64 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Outer circle background */}
      <circle cx="50" cy="50" r="48" fill="#282828" />

      {/* Vinyl record */}
      <circle cx="50" cy="50" r="44" fill="#121212" />
      <circle cx="50" cy="50" r="40" fill="#191414" />

      {/* Vinyl grooves */}
      <circle cx="50" cy="50" r="36" stroke="#282828" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="32" stroke="#282828" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="28" stroke="#282828" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="24" stroke="#282828" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="20" stroke="#282828" strokeWidth="1" fill="none" />

      {/* Center label */}
      <circle cx="50" cy="50" r="14" fill="#1DB954" />
      <circle cx="50" cy="50" r="4" fill="#191414" />

      {/* Tonearm pivot (top right) */}
      <circle cx="75" cy="25" r="5" fill="#535353" />
      <circle cx="75" cy="25" r="2.5" fill="#1DB954" />

      {/* Tonearm */}
      <line x1="75" y1="25" x2="58" y2="42" stroke="#535353" strokeWidth="3" strokeLinecap="round" />
      <line x1="75" y1="25" x2="58" y2="42" stroke="#B3B3B3" strokeWidth="2" strokeLinecap="round" />

      {/* Headshell */}
      <circle cx="58" cy="42" r="3" fill="#535353" />
      <circle cx="58" cy="42" r="1.5" fill="#1DB954" />

      {/* Stylus touching the record */}
      <line x1="58" y1="42" x2="54" y2="46" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" />
      <circle cx="54" cy="46" r="1.5" fill="#1DB954" />

      {/* Subtle highlight on vinyl */}
      <path
        d="M 35 30 Q 40 25, 45 28"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
        opacity="0.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Logo
