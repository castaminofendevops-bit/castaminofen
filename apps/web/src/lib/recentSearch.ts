const STORAGE_KEY = 'castaminofen_recent_searches';
const MAX_ITEMS = 8;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function write(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // ignore quota errors
  }
}

export function getRecentSearches(): string[] {
  return read();
}

export function addRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (trimmed.length < 2) return read();
  const next = [trimmed, ...read().filter((item) => item !== trimmed)].slice(0, MAX_ITEMS);
  write(next);
  return next;
}

export function removeRecentSearch(term: string): string[] {
  const next = read().filter((item) => item !== term);
  write(next);
  return next;
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
