/**
 * NYCP App Icon
 * "NYC" in white, "P" in amber — P stands out as "Parent"
 */
export default function AppIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NYCP — NYC Parent Advocate"
    >
      <rect width="36" height="36" rx="8" fill="#1e3a8a" />
      {/* Subtle top sheen */}
      <rect width="36" height="18" rx="8" fill="white" fillOpacity="0.07" />
      {/* Line 1: NY */}
      <text
        x="18"
        y="16"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontWeight="900"
        fontSize="14"
        letterSpacing="-0.5"
        fill="#ffffff"
      >
        NY
      </text>
      {/* Line 2: C (white) + P (amber) */}
      <text
        x="18"
        y="29"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontWeight="900"
        fontSize="14"
        letterSpacing="-0.5"
      >
        <tspan fill="#ffffff">C</tspan>
        <tspan fill="#fbbf24">P</tspan>
      </text>
    </svg>
  );
}
