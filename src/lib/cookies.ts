// Using localStorage instead of cookies for reliable persistence
// in iOS home screen (PWA) mode where cookies get cleared aggressively.
// Kept the same function names to avoid changing all call sites.

export function getCookie(name: string): string | undefined {
  try {
    return localStorage.getItem(name) ?? undefined;
  } catch {
    return undefined;
  }
}

export function setCookie(name: string, value: string, _days: number): void {
  try {
    localStorage.setItem(name, value);
  } catch {
    // Storage full or unavailable
  }
}

export function deleteCookie(name: string): void {
  try {
    localStorage.removeItem(name);
  } catch {
    // Storage unavailable
  }
}
