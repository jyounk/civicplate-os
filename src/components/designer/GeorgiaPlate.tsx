type Props = {
  plateText: string
  countyName: string
  width: number
  height: number
}

export default function GeorgiaPlate({ plateText, countyName, width, height }: Props) {
  const W = width
  const H = height
  const displayText = plateText || 'ABC 1234'
  const displayCounty = countyName ? countyName.toUpperCase().replace('CITY OF ', '').replace(' COUNTY', '').replace('COUNTY OF ', '').trim() : 'NEWTON'
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} xmlns='http://www.w3.org/2000/svg' style={{ width: '100%', maxWidth: '540px', height: 'auto', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
      <defs>
        <linearGradient id='skyGrad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#c8e6f5' />
          <stop offset='100%' stopColor='#e8f4fd' />
        </linearGradient>
        <linearGradient id='hillGrad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#5a9e4a' />
          <stop offset='100%' stopColor='#3d7a2e' />
        </linearGradient>
        <linearGradient id='peachGrad' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#ffb347' />
          <stop offset='100%' stopColor='#e8832a' />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x={0} y={0} width={W} height={H} fill='#ffffff' rx={18} />

      {/* Sky */}
      <rect x={0} y={0} width={W} height={H * 0.55} fill='url(#skyGrad)' rx={18} />

      {/* Rolling hills */}
      <ellipse cx={W * 0.15} cy={H * 0.72} rx={W * 0.28} ry={H * 0.18} fill='url(#hillGrad)' />
      <ellipse cx={W * 0.88} cy={H * 0.75} rx={W * 0.22} ry={H * 0.15} fill='url(#hillGrad)' />
      <rect x={0} y={H * 0.72} width={W} height={H * 0.28} fill='#4a8a3a' />

      {/* White plate area overlay for text readability */}
      <rect x={W * 0.05} y={H * 0.08} width={W * 0.9} height={H * 0.84} fill='rgba(255,255,255,0.82)' rx={10} />

      {/* Border */}
      <rect x={8} y={8} width={W - 16} height={H - 16} fill='none' stroke='#888' strokeWidth={6} rx={16} />
      <rect x={18} y={18} width={W - 36} height={H - 36} fill='none' stroke='#aaa' strokeWidth={2} rx={12} />

      {/* Peach State script top left */}
      <text x={W * 0.08} y={H * 0.22} fontFamily='Georgia, serif' fontSize={H * 0.1} fill='#2d6a1f' fontStyle='italic' fontWeight='600'>Peach State</text>

      {/* GEORGIA bold top right */}
      <text x={W * 0.98} y={H * 0.22} fontFamily='Arial Black, Arial, sans-serif' fontSize={H * 0.14} fill='#cc2222' fontWeight='900' textAnchor='end' letterSpacing='2'>GEORGIA</text>

      {/* Peach left */}
      <circle cx={W * 0.1} cy={H * 0.68} r={H * 0.1} fill='url(#peachGrad)' />
      <ellipse cx={W * 0.1} cy={H * 0.58} rx={H * 0.015} ry={H * 0.04} fill='#5a9e4a' />
      <line x1={W * 0.1} y1={H * 0.62} x2={W * 0.13} y2={H * 0.57} stroke='#5a9e4a' strokeWidth={3} />

      {/* Peach right */}
      <circle cx={W * 0.9} cy={H * 0.68} r={H * 0.1} fill='url(#peachGrad)' />
      <ellipse cx={W * 0.9} cy={H * 0.58} rx={H * 0.015} ry={H * 0.04} fill='#5a9e4a' />
      <line x1={W * 0.9} y1={H * 0.62} x2={W * 0.93} y2={H * 0.57} stroke='#5a9e4a' strokeWidth={3} />

      {/* Main plate text */}
      <text x={W * 0.5} y={H * 0.56} fontFamily='Arial Black, Arial, sans-serif' fontSize={H * 0.28} fill='#111111' fontWeight='900' textAnchor='middle' dominantBaseline='middle' letterSpacing='4'>{displayText}</text>

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