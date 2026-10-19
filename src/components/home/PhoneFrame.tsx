/**
 * A drawn iPhone (16 Pro proportions): titanium edge, black bezel, Dynamic Island, side buttons,
 * status bar and home indicator. Everything scales with the frame's width, so set the width
 * (or height) from outside and the details follow.
 *
 * Screen geometry, in iPhone points: 393 x 852 screen, 54pt status bar on top, 34pt home indicator
 * at the bottom. `children` fill the whole screen; wrap each app screenshot in <PhoneScreen>.
 */
export function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative aspect-[433/892] [container-type:inline-size] ${className}`}
      style={{ filter: "drop-shadow(0 40px 60px rgba(10,10,10,0.22)) drop-shadow(0 8px 16px rgba(10,10,10,0.12))" }}
    >
      {/* Side buttons: action + volume on the left, power on the right. */}
      <span aria-hidden className="absolute top-[17%] -left-[0.9cqw] h-[3.6%] w-[1.2cqw] rounded-l-[1cqw] bg-[#3a3a3c]" />
      <span aria-hidden className="absolute top-[24%] -left-[0.9cqw] h-[7%] w-[1.2cqw] rounded-l-[1cqw] bg-[#3a3a3c]" />
      <span aria-hidden className="absolute top-[32.5%] -left-[0.9cqw] h-[7%] w-[1.2cqw] rounded-l-[1cqw] bg-[#3a3a3c]" />
      <span aria-hidden className="absolute top-[27%] -right-[0.9cqw] h-[11%] w-[1.2cqw] rounded-r-[1cqw] bg-[#3a3a3c]" />

      {/* Titanium edge with a soft highlight. */}
      <div
        className="absolute inset-0 rounded-[15.5cqw] p-[1.1cqw]"
        style={{ background: "linear-gradient(145deg, #6e6e73 0%, #2c2c2e 22%, #1c1c1e 50%, #3a3a3c 78%, #8e8e93 100%)" }}
      >
        {/* Black bezel */}
        <div className="h-full w-full rounded-[14.4cqw] bg-[#050505] p-[3.4cqw]">
          {/* Screen: 393 x 852 */}
          <div className="relative h-full w-full overflow-hidden rounded-[11.6cqw] bg-[#0a0a0a] [isolation:isolate]">
            {/* Status bar (54pt of 852) */}
            <div className="absolute inset-x-0 top-0 z-20 flex h-[6.34%] items-center justify-between px-[8.5cqw] pt-[1.2cqw] text-white">
              <span className="text-[3.95cqw] font-semibold tracking-[-0.01em] tabular-nums">9:41</span>
              <StatusIcons />

            </div>
            {/* Dynamic Island */}
            <div aria-hidden className="absolute top-[1.3%] left-1/2 z-30 h-[4.3%] w-[31%] -translate-x-1/2 rounded-full bg-black" />

            {/* Screen content. Use <PhoneScreen> to place an app screenshot between the status bar
                and the home indicator. */}
            <div className="absolute inset-0 overflow-hidden">{children}</div>

            {/* Home indicator (34pt band) */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 z-20 flex h-[3.99%] items-center justify-center">
              <span className="h-[1.3cqw] w-[35%] rounded-full bg-white/85" />
            </div>

            {/* Faint glass sheen across the screen. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-40"
              style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 32%)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The iOS status bar glyphs: cellular bars, Wi-Fi fan and battery. Apple doesn't ship these for
 * the web (they're SF Symbols / system UI), so they're drawn here at iOS proportions. Sizes are in
 * cqw of the frame, where 1pt on a 393pt-wide screen is about 0.2316cqw.
 */
function StatusIcons() {
  return (
    <span aria-hidden className="flex items-center gap-[1.35cqw]">
      {/* Cellular: 17 x 11pt, four rising bars */}
      <svg viewBox="0 0 17 11" fill="currentColor" style={{ width: "3.94cqw", height: "2.55cqw" }}>
        <rect x="0" y="7" width="3" height="4" rx="1" />
        <rect x="4.67" y="4.67" width="3" height="6.33" rx="1" />
        <rect x="9.33" y="2.33" width="3" height="8.67" rx="1" />
        <rect x="14" y="0" width="3" height="11" rx="1" />
      </svg>
      {/* Wi-Fi: 16 x 11.5pt, a dot and two bands fanning out from one point */}
      <svg viewBox="-0.4 -0.4 16.8 12.3" fill="currentColor" stroke="currentColor" strokeWidth="0.7" strokeLinejoin="round" style={{ width: "3.7cqw", height: "2.7cqw" }}>
        <path d="M8 11.5 L5.5 8.91 A3.6 3.6 0 0 1 10.5 8.91 Z" />
        <path d="M2.72 6.04 A7.6 7.6 0 0 1 13.28 6.04 L11.61 7.76 A5.2 5.2 0 0 0 4.39 7.76 Z" />
        <path d="M0.01 3.23 A11.5 11.5 0 0 1 15.99 3.23 L14.39 4.89 A9.2 9.2 0 0 0 1.61 4.89 Z" />
      </svg>
      {/* Battery: 27 x 13pt, translucent outline, full white charge, small cap */}
      <svg viewBox="0 0 27.5 13" style={{ width: "6.35cqw", height: "3cqw" }}>
        <rect x="0.5" y="0.5" width="24" height="12" rx="3.8" fill="none" stroke="currentColor" strokeOpacity="0.35" />
        <rect x="2" y="2" width="21" height="9" rx="2.4" fill="currentColor" />
        <path d="M25.9 4.4 a1.6 1.6 0 0 1 1.6 1.6 v1 a1.6 1.6 0 0 1 -1.6 1.6 Z" fill="currentColor" fillOpacity="0.4" />
      </svg>
    </span>
  );
}

/**
 * One app screen: the screenshot sits between the status bar and the home indicator (393 x 764pt),
 * and `topColor` fills the status bar band so it matches the app's own header, as on a real phone.
 */
export function PhoneScreen({ topColor = "#0a0a0a", children }: { topColor?: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 bg-[#0a0a0a]">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[6.34%]" style={{ background: topColor }} />
      <div className="absolute inset-x-0 top-[6.34%] bottom-[3.99%] overflow-hidden">{children}</div>
    </div>
  );
}
