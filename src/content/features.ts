/**
 * The app tour on the home page: one stop per feature, each with a real app screen.
 *
 * Screens live in /public/app-screens. They are captures of the real Kanvas app (dark mode) at
 * iPhone size: 1179 x 2292 px (393 x 764 pt at 3x), i.e. the full screen minus the status bar
 * and home indicator, which the phone frame draws itself. Demo data: John Appleseed.
 * Copy rule: no em dashes.
 */
export type Feature = {
  title: string;
  body: string;
  screen: string;
  screenAlt: string;
  /** Colour of the app's header, used behind the phone's status bar. */
  topColor: string;
};

export const FEATURES: Feature[] = [
  {
    title: "Log every session.",
    body: "Your martial art, time, gym, notes, and photos. Remember what you worked on, not just that you showed up.",
    screen: "/app-screens/log.webp",
    topColor: "#0f0f0f",
    screenAlt: "The Log session screen in the Kanvas app, filled in with a 90 minute BJJ session at Northside Combat Club and notes about knee cut passes.",
  },
  {
    title: "Follow your teammates.",
    body: "See who’s training, cheer them on, and keep each other coming back.",
    screen: "/app-screens/feed.webp",
    topColor: "#0a0a0a",
    screenAlt: "The Kanvas home feed showing John Appleseed's evening open mat with a training photo, liked by teammates Marcus and Andre.",
  },
  {
    title: "See your progress.",
    body: "Your hours by week and your trends over months, so you can see how far you’ve come.",
    screen: "/app-screens/progress.webp",
    topColor: "#0f0f0f",
    screenAlt: "John Appleseed's Kanvas profile with 35 sessions and a chart of 330 training minutes this week.",
  },
  {
    title: "Join your gym.",
    body: "Find yours on Kanvas and connect with everyone you train with.",
    screen: "/app-screens/gym.webp",
    topColor: "#0f0f0f",
    screenAlt: "The Northside Combat Club gym page in Kanvas with 6 members, 1 coach, and the head coach listed.",
  },
];
