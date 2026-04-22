/**
 * NYCP App Icon
 *
 * Letter colors match the NYC Public Schools brand identity:
 *   N — green  #4B9A2A
 *   Y — orange #F0821E
 *   C — blue   #4E8CC4
 *   P — navy   #1B2D6C  (deep navy = "Public Schools" identity)
 *
 * Font: Nunito Black (900) — closest freely-available match to the
 * rounded chunky display face used in the NYC logo.
 * Loaded globally via next/font (--font-nunito CSS variable).
 */
export default function AppIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NYCP — NYC Schools Parent Advocate"
    >
      {/* White background with subtle border — matches NYC brand white canvas */}
      <rect width="36" height="36" rx="8" fill="white" />
      <rect width="36" height="36" rx="8" fill="none" stroke="#D1D5DB" strokeWidth="0.75" />

      {/* Line 1: N (green) · Y (orange) */}
      <text
        x="18"
        y="15.5"
        textAnchor="middle"
        fontFamily="var(--font-nunito), 'Nunito', system-ui, sans-serif"
        fontWeight="900"
        fontSize="14.5"
        letterSpacing="-0.8"
      >
        <tspan fill="#4B9A2A">N</tspan>
        <tspan fill="#F0821E">Y</tspan>
      </text>

      {/* Line 2: C (blue) · P (navy) */}
      <text
        x="18"
        y="29.5"
        textAnchor="middle"
        fontFamily="var(--font-nunito), 'Nunito', system-ui, sans-serif"
        fontWeight="900"
        fontSize="14.5"
        letterSpacing="-0.8"
      >
        <tspan fill="#4E8CC4">C</tspan>
        <tspan fill="#1B2D6C">P</tspan>
      </text>
    </svg>
  );
}
