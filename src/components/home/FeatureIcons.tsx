/** Simple line icons, 24px grid, 1.5px stroke, black. */
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const icons = {
  log: (
    <svg {...base}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </svg>
  ),
  progress: (
    <svg {...base}>
      <path d="M3.5 20.5h17" />
      <path d="M4 16l5-5 3.5 3.5L20 7" />
      <path d="M15.5 7H20v4.5" />
    </svg>
  ),
  friends: (
    <svg {...base}>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M3.5 19.5c.6-3.1 2.8-5 5.5-5s4.9 1.9 5.5 5" />
      <circle cx="16.75" cy="9.5" r="2.5" />
      <path d="M16 14.6c2.3-.2 4 1.3 4.5 4" />
    </svg>
  ),
  gym: (
    <svg {...base}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  ),
  badges: (
    <svg {...base}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.6 13.3L7.5 21l4.5-2.4 4.5 2.4-1.1-7.7" />
      <path d="M12 6.5l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z" />
    </svg>
  ),
  home: (
    <svg {...base}>
      <path d="M3.5 11L12 4l8.5 7" />
      <path d="M5.5 9.5v10h13v-10" />
      <path d="M9 15h6M9.5 13.5v3M14.5 13.5v3" />
    </svg>
  ),
  share: (
    <svg {...base}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M12 15V8.5M9.25 11.25L12 8.5l2.75 2.75" />
    </svg>
  ),
};
