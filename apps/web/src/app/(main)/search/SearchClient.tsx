'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { SearchResultsView } from '@/components/SearchResultsView';
import { apiFetch } from '@/lib/api';
import { addRecentSearch, getRecentSearches, removeRecentSearch } from '@/lib/recentSearch';
import {
  emptySearchResults,
  hasSearchResults,
  normalizeSearchResponse,
  type SearchResults,
} from '@/lib/search';

interface SearchClientProps {
  initialQ: string;
  initialType: string;
}

export default function SearchClient({ initialQ, initialType }: SearchClientProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQ);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [results, setResults] = useState<SearchResults>(emptySearchResults());
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const lastSearch = useRef({ q: initialQ, type: initialType });

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const runSearch = useCallback(async (q: string, type: string) => {
    const term = q.trim();
    if (!term && !type) {
      setResults(emptySearchResults());
      setSearched(false);
      setError(null);
      return;
    }

    lastSearch.current = { q, type };
    setLoading(true);
    setSearched(true);
    setError(null);

    const params = new URLSearchParams();
    if (term) params.set('q', term);
    if (type) params.set('type', type);

    const path = term ? `/search?${params}` : `/explore?${type ? `type=${type}` : ''}`;
    const res = await apiFetch<SearchResults | SearchResults['contents']>(path);

    if (!res.success) {
      setError(res.error?.message || 'خطا در جستجو');
      setResults(emptySearchResults());
      setLoading(false);
      return;
    }

    setResults(normalizeSearchResponse(res.data));
    if (term.length >= 2) {
      setRecentSearches(addRecentSearch(term));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialQ || initialType) {
      void runSearch(initialQ, initialType);
    }
  }, [initialQ, initialType, runSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2 || typeFilter) {
        void runSearch(query, typeFilter);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, typeFilter, runSearch]);

  useEffect(() => {
    const focusSearch = () => inputRef.current?.focus();
    window.addEventListener('castaminofen:focus-search', focusSearch);
    return () => window.removeEventListener('castaminofen:focus-search', focusSearch);
  }, []);

  const handleRetry = () => {
    const { q, type } = lastSearch.current;
    void runSearch(q, type);
  };

  return (
    <>
      <h1 className="section-title">جستجو</h1>
      <p className="search-hint">برای جستجوی سریع کلید <kbd>/</kbd> را بزنید</p>
      <div className="search-bar">
        <div className="search-input-wrap">
          <input
            ref={inputRef}
            className="form-input search-input"
            placeholder="عنوان، سازنده، اپیزود..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="جستجو"
          />
          {query ? (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery('')}
              aria-label="پاک کردن جستجو"
            >
              ×
            </button>
          ) : null}
        </div>
        <select
          className="form-input search-type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="نوع محتوا"
        >
          <option value="">همه انواع</option>
          <option value="PODCAST">پادکست</option>
          <option value="AUDIOBOOK">کتاب صوتی</option>
          <option value="VIDEO">ویدیو</option>
        </select>
      </div>

      {error ? <ErrorBanner message={error} onRetry={handleRetry} /> : null}

      {!query && recentSearches.length > 0 && !loading && (
        <div className="recent-searches">
          <div className="section-row">
            <h2 className="section-heading">جستجوهای اخیر</h2>
          </div>
          <div className="recent-chips">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                className="recent-chip"
                onClick={() => setQuery(term)}
              >
                {term}
                <span
                  className="recent-chip-remove"
                  role="button"
                  tabIndex={0}
                  aria-label={`حذف ${term}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecentSearches(removeRecentSearch(term));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      setRecentSearches(removeRecentSearch(term));
                    }
                  }}
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="search-status">در حال جستجو...</p>}

      {!loading && searched && !hasSearchResults(results) && !error && (
        <EmptyState
          title="نتیجه‌ای پیدا نشد"
          description="عبارت دیگری امتحان کنید یا فیلتر نوع را تغییر دهید."
        />
      )}

      {!loading && hasSearchResults(results) ? <SearchResultsView results={results} /> : null}
    </>
  );
}
