import * as storage from '@/lib/storage';

const STORAGE_KEY = 'recent_searches_v1';
const MAX_ITEMS = 8;

async function read(): Promise<string[]> {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

async function write(items: string[]): Promise<void> {
  await storage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export async function getRecentSearches(): Promise<string[]> {
  return read();
}

export async function addRecentSearch(term: string): Promise<string[]> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return read();
  const current = await read();
  const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, MAX_ITEMS);
  await write(next);
  return next;
}

export async function removeRecentSearch(term: string): Promise<string[]> {
  const next = (await read()).filter((item) => item !== term);
  await write(next);
  return next;
}

export async function clearRecentSearches(): Promise<void> {
  await storage.removeItem(STORAGE_KEY);
}
