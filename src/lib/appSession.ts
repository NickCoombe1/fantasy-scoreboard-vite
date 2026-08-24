// Counts router navigations for this page load. Wired up once in main.tsx via
// router.subscribe("onBeforeLoad", recordNavigation), before any route
// component renders — this is immune to the async delay of lazy-loaded route
// chunks, unlike a flag set from a component's mount effect (which would race
// against however long a given route's .lazy.tsx chunk takes to load).
// document.referrer doesn't work here either, since it's fixed at the initial
// navigation and never updates for client-side route changes. Note:
// "onResolved" would read better but isn't actually emitted by the installed
// router-core version despite being in its type defs — verified against
// node_modules source before relying on it.
let navigationCount = 0;

export function recordNavigation(): void {
  navigationCount++;
}

// True only for the very first navigation resolved in this page load (i.e. a
// fresh visit — bookmark, PWA home-screen icon, browser refresh). False for
// any navigation after that, including ones that return to a previously
// visited route within the same in-app session.
export function isFirstNavigation(): boolean {
  return navigationCount <= 1;
}
