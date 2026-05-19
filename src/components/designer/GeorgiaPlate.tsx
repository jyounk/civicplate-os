type Scene = 'peach' | 'mountain' | 'coast'

type Props = {
  plateText: string
  countyName: string
  width: number
  height: number
  scene?: Scene
  noShadow?: boolean
  hideText?: boolean
}

export default function GeorgiaPlate({
  plateText,
  countyName,
  width,
  height,
  scene = 'peach',
  noShadow = false,
  hideText = false,
}: Props) {
  const W = width
  const H = height
  const displayText = plateText || 'ABC 1234'
  const displayCounty = countyName
    ? countyName.toUpperCase().replace('CITY OF ', '').replace(' COUNTY', '').replace('COUNTY OF ', '').trim()
    : 'NEWTON'

  // Scene-suffixed gradient IDs prevent conflicts when multiple plates render on the same page.
  // Two plates with the same scene will define duplicate-but-identical gradient defs — harmless.
  const gp = 'skyGrad-p'
  const gph = 'hillGrad-p'
  const gpe = 'peachGrad-p'
  const gm = 'skyGrad-m'
  const gc = 'oceanGrad-c'

  return (
    <svg
      viewBox={'0 0 ' + W + ' ' + H}
      xmlns='http://www.w3.org/2000/svg'
      style={{
        width: '100%',
        maxWidth: '540px',
        height: 'auto',
        borderRadius: noShadow ? '6px' : '12px',
        boxShadow: noShadow ? 'none' : '0 8px 32px rgba(0,0,0,0.18)',
        display: 'block',
      }}
    >
      <defs>
        {scene === 'peach' && (
          <>
            <linearGradient id={gp} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#c8e6f5' />
              <stop offset='100%' stopColor='#e8f4fd' />
            </linearGradient>
            <linearGradient id={gph} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#5a9e4a' />
              <stop offset='100%' stopColor='#3d7a2e' />
            </linearGradient>
            <linearGradient id={gpe} x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0%' stopColor='#ffb347' />
              <stop offset='100%' stopColor='#e8832a' />
            </linearGradient>
          </>
        )}
        {scene === 'mountain' && (
          <linearGradient id={gm} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#c8e6f5' />
            <stop offset='100%' stopColor='#ddf0f8' />
          </linearGradient>
        )}
        {scene === 'coast' && (
          <linearGradient id={gc} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#1a6b8a' />
            <stop offset='100%' stopColor='#0d4a61' />
          </linearGradient>
        )}
      </defs>

      {/* White base */}
      <rect x={0} y={0} width={W} height={H} fill='#ffffff' rx={18} />

      {/* ── PEACH SCENE (default) ── */}
      {scene === 'peach' && (
        <>
          <rect x={0} y={0} width={W} height={H * 0.55} fill={'url(#' + gp + ')'} rx={18} />
          <ellipse cx={W * 0.15} cy={H * 0.72} rx={W * 0.28} ry={H * 0.18} fill={'url(#' + gph + ')'} />
          <ellipse cx={W * 0.88} cy={H * 0.75} rx={W * 0.22} ry={H * 0.15} fill={'url(#' + gph + ')'} />
          <rect x={0} y={H * 0.72} width={W} height={H * 0.28} fill='#4a8a3a' />
        </>
      )}

      {/* ── MOUNTAIN SCENE ── */}
      {scene === 'mountain' && (
        <>
          {/* Sky */}
          <rect x={0} y={0} width={W} height={H * 0.65} fill={'url(#' + gm + ')'} rx={18} />
          {/* Back mountain — darkest, widest */}
          <polygon
            points={`${W * 0.5},${H * 0.08} ${W * 0.04},${H * 0.65} ${W * 0.96},${H * 0.65}`}
            fill='#9e9e9e'
          />
          {/* Left flanking mountain — medium */}
          <polygon
            points={`${W * 0.22},${H * 0.22} ${W * 0},${H * 0.65} ${W * 0.48},${H * 0.65}`}
            fill='#bdbdbd'
          />
          {/* Right flanking mountain — medium */}
          <polygon
            points={`${W * 0.78},${H * 0.22} ${W * 0.52},${H * 0.65} ${W * 1},${H * 0.65}`}
            fill='#bdbdbd'
          />
          {/* Snow / peak highlight on central mountain */}
          <polygon
            points={`${W * 0.5},${H * 0.08} ${W * 0.44},${H * 0.26} ${W * 0.56},${H * 0.26}`}
            fill='#d4d4d4'
          />
          {/* Green base */}
          <rect x={0} y={H * 0.65} width={W} height={H * 0.35} fill='#4a8a3a' />
        </>
      )}

      {/* ── COAST SCENE ── */}
      {scene === 'coast' && (
        <>
          {/* Sky */}
          <rect x={0} y={0} width={W} height={H * 0.55} fill='#e8f4fd' rx={18} />
          {/* Ocean */}
          <rect x={0} y={H * 0.55} width={W} height={H * 0.45} fill={'url(#' + gc + ')'} />
          {/* Waves */}
          <path
            d={`M 0,${H * 0.52} C ${W * 0.25},${H * 0.47} ${W * 0.75},${H * 0.55} ${W},${H * 0.52}`}
            fill='none' stroke='#5bbcde' strokeWidth={H * 0.018} strokeLinecap='round' opacity='0.6'
          />
          <path
            d={`M 0,${H * 0.57} C ${W * 0.25},${H * 0.52} ${W * 0.75},${H * 0.6} ${W},${H * 0.57}`}
            fill='none' stroke='#7fcce6' strokeWidth={H * 0.014} strokeLinecap='round' opacity='0.4'
          />
          {/* Left palm trunk */}
          <path
            d={`M ${W * 0.12},${H * 0.72} Q ${W * 0.09},${H * 0.55} ${W * 0.14},${H * 0.36}`}
            stroke='#795548' strokeWidth={W * 0.022} fill='none' strokeLinecap='round'
          />
          {/* Left palm fronds */}
          <path d={`M ${W * 0.14},${H * 0.36} Q ${W * 0.02},${H * 0.27} ${W * 0},${H * 0.31}`}
            stroke='#388e3c' strokeWidth={W * 0.018} fill='none' strokeLinecap='round' />
          <path d={`M ${W * 0.14},${H * 0.36} Q ${W * 0.26},${H * 0.27} ${W * 0.28},${H * 0.31}`}
            stroke='#388e3c' strokeWidth={W * 0.018} fill='none' strokeLinecap='round' />
          <path d={`M ${W * 0.14},${H * 0.36} Q ${W * 0.12},${H * 0.2} ${W * 0.08},${H * 0.22}`}
            stroke='#4caf50' strokeWidth={W * 0.016} fill='none' strokeLinecap='round' />
          <path d={`M ${W * 0.14},${H * 0.36} Q ${W * 0.16},${H * 0.2} ${W * 0.21},${H * 0.22}`}
            stroke='#4caf50' strokeWidth={W * 0.016} fill='none' strokeLinecap='round' />
          {/* Right palm trunk (smaller) */}
          <path
            d={`M ${W * 0.88},${H * 0.72} Q ${W * 0.91},${H * 0.59} ${W * 0.86},${H * 0.44}`}
            stroke='#795548' strokeWidth={W * 0.016} fill='none' strokeLinecap='round'
          />
          {/* Right palm fronds */}
          <path d={`M ${W * 0.86},${H * 0.44} Q ${W * 0.76},${H * 0.37} ${W * 0.74},${H * 0.41}`}
            stroke='#388e3c' strokeWidth={W * 0.013} fill='none' strokeLinecap='round' />
          <path d={`M ${W * 0.86},${H * 0.44} Q ${W * 0.96},${H * 0.37} ${W * 0.98},${H * 0.41}`}
            stroke='#388e3c' strokeWidth={W * 0.013} fill='none' strokeLinecap='round' />
          <path d={`M ${W * 0.86},${H * 0.44} Q ${W * 0.84},${H * 0.32} ${W * 0.81},${H * 0.34}`}
            stroke='#4caf50' strokeWidth={W * 0.012} fill='none' strokeLinecap='round' />
          <path d={`M ${W * 0.86},${H * 0.44} Q ${W * 0.88},${H * 0.32} ${W * 0.91},${H * 0.34}`}
            stroke='#4caf50' strokeWidth={W * 0.012} fill='none' strokeLinecap='round' />
        </>
      )}

      {/* White semi-transparent overlay for text readability */}
      <rect x={W * 0.05} y={H * 0.08} width={W * 0.9} height={H * 0.84} fill='rgba(255,255,255,0.82)' rx={10} />

      {/* Outer and inner border */}
      <rect x={8} y={8} width={W - 16} height={H - 16} fill='none' stroke='#888' strokeWidth={6} rx={16} />
      <rect x={18} y={18} width={W - 36} height={H - 36} fill='none' stroke='#aaa' strokeWidth={2} rx={12} />

      {/* "Peach State" script */}
      <text x={W * 0.08} y={H * 0.22} fontFamily='Georgia, serif' fontSize={H * 0.1} fill='#2d6a1f' fontStyle='italic' fontWeight='600'>Peach State</text>

      {/* GEORGIA */}
      <text x={W * 0.98} y={H * 0.22} fontFamily='Arial Black, Arial, sans-serif' fontSize={H * 0.14} fill='#cc2222' fontWeight='900' textAnchor='end' letterSpacing='2'>GEORGIA</text>

      {/* Peach fruits — peach scene only */}
      {scene === 'peach' && (
        <>
          <circle cx={W * 0.1} cy={H * 0.68} r={H * 0.1} fill={'url(#' + gpe + ')'} />
          <ellipse cx={W * 0.1} cy={H * 0.58} rx={H * 0.015} ry={H * 0.04} fill='#5a9e4a' />
          <line x1={W * 0.1} y1={H * 0.62} x2={W * 0.13} y2={H * 0.57} stroke='#5a9e4a' strokeWidth={3} />
          <circle cx={W * 0.9} cy={H * 0.68} r={H * 0.1} fill={'url(#' + gpe + ')'} />
          <ellipse cx={W * 0.9} cy={H * 0.58} rx={H * 0.015} ry={H * 0.04} fill='#5a9e4a' />
          <line x1={W * 0.9} y1={H * 0.62} x2={W * 0.93} y2={H * 0.57} stroke='#5a9e4a' strokeWidth={3} />
        </>
      )}

      {/* Main plate text */}
      {!hideText && (
        <text
          x={W * 0.5} y={H * 0.56}
          fontFamily='Arial Black, Arial, sans-serif'
          fontSize={H * 0.28}
          fill='#111111'
          fontWeight='900'
          textAnchor='middle'
          dominantBaseline='middle'
          letterSpacing='4'
        >
          {displayText}
        </text>
      )}

      {/* County banner */}
      <rect x={W * 0.2} y={H * 0.78} width={W * 0.6} height={H * 0.14} fill='#1a3a6b' rx={4} />
      <text x={W * 0.5} y={H * 0.855} fontFamily='Arial, sans-serif' fontSize={H * 0.08} fill='#ffffff' fontWeight='700' textAnchor='middle' dominantBaseline='middle' letterSpacing='3'>{displayCounty}</text>

      {/* Bolt holes */}
      <circle cx={W * 0.06} cy={H * 0.5} r={10} fill='#cccccc' />
      <circle cx={W * 0.06} cy={H * 0.5} r={5} fill='#999999' />
      <circle cx={W * 0.94} cy={H * 0.5} r={10} fill='#cccccc' />
      <circle cx={W * 0.94} cy={H * 0.5} r={5} fill='#999999' />
    </svg>
  )
}
