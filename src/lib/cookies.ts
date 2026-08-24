// Using localStorage instead of cookies for reliable persistence
// in iOS home screen (PWA) mode where cookies get cleared aggressively.
// Kept the same function names to avoid changing all call sites.

interface StoredValue {
  value: string;
  expiresAt: number;
}

function isStoredValue(raw: unknown): raw is StoredValue {
  return (
    typeof raw === "object" &&
    raw !== null &&
    typeof (raw as StoredValue).value === "string" &&
    typeof (raw as StoredValue).expiresAt === "number"
  );
}

export function getCookie(name: string): string | undefined {
  try {
    const raw = localStorage.getItem(name);
    if (raw === null) return undefined;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return raw; // plain value with no expiry (e.g. written before expiry support existed)
    }

    if (!isStoredValue(parsed)) return raw;

    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(name);
      return undefined;
    }
    return parsed.value;
  } catch {
    return undefined;
  }
}

export function setCookie(name: string, value: string, days: number): void {
  try {
    const stored: StoredValue = {
      value,
      expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(name, JSON.stringify(stored));
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
