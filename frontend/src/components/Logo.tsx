/* MediBrief Logo — Blue/Green Gradient Shield */
export const MediBriefLogo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00C6FF" />
        <stop offset="100%" stopColor="#0072FF" />
      </linearGradient>
    </defs>
    {/* Shield */}
    <path
      d="M50 4L14 18v28c0 22 15.6 42.5 36 48 20.4-5.5 36-26 36-48V18L50 4z"
      fill="url(#shieldGrad)"
    />
    {/* Cross */}
    <rect x="43" y="26" width="14" height="38" rx="3" fill="white" opacity="0.95" />
    <rect x="31" y="38" width="38" height="14" rx="3" fill="white" opacity="0.95" />
    {/* ECG Line overlay */}
    <polyline
      points="24,50 33,50 38,38 43,62 48,44 53,56 57,50 76,50"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.55"
      fill="none"
    />
  </svg>
);

export const MediBriefWordmark = ({ size = 36 }: { size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.25 }}>
    <MediBriefLogo size={size} />
    <span style={{
      fontSize: size * 0.58,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1,
      background: 'linear-gradient(90deg, #0072FF 0%, #22c55e 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>
      MediBrief
    </span>
  </div>
);
