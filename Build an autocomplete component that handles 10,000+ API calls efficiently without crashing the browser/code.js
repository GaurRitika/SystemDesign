import React, { useState, useRef, useEffect, useCallback } from "react";

/*
  AutocompleteComponent.jsx
  - React functional component (single-file) that shows a production-minded autocomplete
  - Techniques used: debounce, request cancellation (AbortController), LRU cache, result limiting,
    simple virtualization (windowing), keyboard accessibility, graceful error handling.

  Usage:
    <Autocomplete fetchSuggestions={yourFetchFn} placeholder="Search..." />

  The component expects a `fetchSuggestions(query, { signal, page })` that returns a Promise
  resolving to { items: Array<{id, label}>, hasMore: boolean } (for pagination). A default
  mocked fetch is included for demo.
*/

// Simple LRU cache limited by size
class LRUCache {
  constructor(limit = 500) {
    this.limit = limit;
    this.map = new Map();
  }
  get(key) {
    const v = this.map.get(key);
    if (v === undefined) return undefined;
    // recent use -> move to end
    this.map.delete(key);
    this.map.set(key, v);
    return v;
  }
  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.limit) {
      // remove oldest
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
  }
}

// debounce hook
function useDebounce(callback, delay) {
  const timer = useRef(null);
  const cbRef = useRef(callback);
  useEffect(() => (cbRef.current = callback), [callback]);
  return useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cbRef.current(...args), delay);
  }, [delay]);
}

// Default mock fetch: simulates server search from 100k items
async function defaultFetchSuggestions(query, { signal, page = 0, pageSize = 50 } = {}) {
  if (!query) return { items: [], hasMore: false };
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 120 + Math.random() * 150));
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  // Simulate huge dataset; generate pseudo results based on query
  const totalMatches = 2000; // pretend server would return total count
  const start = page * pageSize;
  const items = [];
  for (let i = 0; i < pageSize && start + i < totalMatches; i++) {
    items.push({ id: `${query}-${start + i}`, label: `${query} suggestion ${start + i}` });
  }
  return { items, hasMore: (start + pageSize) < totalMatches };
}

export default function Autocomplete({
  fetchSuggestions = defaultFetchSuggestions,
  placeholder = "Search...",
  maxResults = 200, // total items to hold in UI
  dropdownHeight = 300,
  pageSize = 50,
  debounceMs = 250,
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const cacheRef = useRef(new LRUCache(1000));
  const abortRef = useRef(null);
  const pageRef = useRef(0);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  // virtualization window sizes
  const ITEM_HEIGHT = 36;
  const visibleCount = Math.ceil(dropdownHeight / ITEM_HEIGHT) + 4;
  const [scrollTop, setScrollTop] = useState(0);

  // Cancel previous request helper
  function cancelPrevious() {
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (e) {}
      abortRef.current = null;
    }
  }

  const doFetch = useCallback(async (q, { reset = true } = {}) => {
    if (!q) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    const cached = cacheRef.current.get(q);
    if (cached) {
      setItems(cached.slice(0, maxResults));
      setLoading(false);
      setError(null);
      return;
    }

    cancelPrevious();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    pageRef.current = 0;
    let accumulated = [];

    try {
      // Fetch pages sequentially until we have enough or server says stop
      while (accumulated.length < Math.min(maxResults, pageSize * 4)) {
        const page = pageRef.current;
        const res = await fetchSuggestions(q, { signal: controller.signal, page, pageSize });
        accumulated = accumulated.concat(res.items || []);
        pageRef.current += 1;
        if (!res.hasMore) break;
        // small short-circuit: if API is fast and returns a lot, stop after a few pages
        if (pageRef.current >= 4) break;
      }
      // dedupe by id
      const seen = new Set();
      const unique = accumulated.filter(it => {
        if (seen.has(it.id)) return false; seen.add(it.id); return true;
      });

      cacheRef.current.set(q, unique);
      setItems(unique.slice(0, maxResults));
      setLoading(false);
      setError(null);
      setIsOpen(true);
    } catch (err) {
      if (err?.name === 'AbortError') return; // expected
      console.error(err);
      setError('Failed to load');
      setLoading(false);
    } finally {
      abortRef.current = null;
    }
  }, [fetchSuggestions, maxResults, pageSize]);

  const debouncedFetch = useDebounce((q) => doFetch(q, { reset: true }), debounceMs);

  // handle input changes
  function onChange(e) {
    const v = e.target.value;
    setQuery(v);
    setHighlightIndex(-1);
    if (!v) {
      cancelPrevious();
      setItems([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }
    debouncedFetch(v);
  }

  // keyboard navigation
  function onKeyDown(e) {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, items.length - 1));
      ensureHighlightedVisible(highlightIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
      ensureHighlightedVisible(highlightIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[highlightIndex]) onSelect(items[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  function onSelect(item) {
    setQuery(item.label);
    setIsOpen(false);
    // caller can listen to selection via a ref/callback; for interview demo, we console.log
    console.log('selected', item);
  }

  // Ensure the highlighted item is visible (simple)
  function ensureHighlightedVisible(index) {
    if (!listRef.current || index < 0) return;
    const scroll = listRef.current.scrollTop;
    const topVisible = Math.floor(scroll / ITEM_HEIGHT);
    const bottomVisible = topVisible + visibleCount - 1;
    if (index < topVisible) listRef.current.scrollTop = index * ITEM_HEIGHT;
    else if (index > bottomVisible) listRef.current.scrollTop = (index - visibleCount + 1) * ITEM_HEIGHT;
  }

  // click outside to close
  useEffect(() => {
    function onDoc(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // virtualization: compute window
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 2);
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const topPadding = startIndex * ITEM_HEIGHT;
  const bottomPadding = Math.max(0, (items.length - endIndex) * ITEM_HEIGHT);

  function onScrollList(e) {
    setScrollTop(e.target.scrollTop);
  }

  return (
    <div className="ac-root" ref={containerRef} style={{ width: 360 }}>
      <label className="ac-label">Search</label>
      <input
        type="text"
        value={query}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => { if (items.length) setIsOpen(true); }}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="ac-list"
        aria-activedescendant={highlightIndex >= 0 ? `ac-item-${highlightIndex}` : undefined}
        className="ac-input"
      />

      {isOpen && (
        <div className="ac-dropdown" role="listbox" id="ac-list" style={{ maxHeight: dropdownHeight }}>
          {loading && <div className="ac-status">Loading…</div>}
          {error && <div className="ac-status ac-error">{error}</div>}
          {!loading && !error && items.length === 0 && <div className="ac-empty">No results</div>}

          <div ref={listRef} className="ac-list" onScroll={onScrollList} style={{ height: Math.min(dropdownHeight, items.length * ITEM_HEIGHT), overflowY: 'auto' }}>
            <div style={{ height: topPadding }} />
            {items.slice(startIndex, endIndex).map((item, idx) => {
              const realIndex = startIndex + idx;
              const highlighted = realIndex === highlightIndex;
              return (
                <div
                  key={item.id}
                  id={`ac-item-${realIndex}`}
                  role="option"
                  aria-selected={highlighted}
                  className={`ac-item ${highlighted ? 'highlight' : ''}`}
                  onMouseDown={(ev) => { ev.preventDefault(); onSelect(item); }}
                  onMouseEnter={() => setHighlightIndex(realIndex)}
                  style={{ height: ITEM_HEIGHT, lineHeight: `${ITEM_HEIGHT}px` }}
                >
                  {item.label}
                </div>
              );
            })}
            <div style={{ height: bottomPadding }} />
          </div>

        </div>
      )}

      <style>{`
        .ac-root { font-family: system-ui, Arial; position: relative; }
        .ac-label { display:block; margin-bottom:6px; color:#333; font-size:13px }
        .ac-input { width:100%; padding:10px 12px; border-radius:8px; border:1px solid #ddd; box-sizing:border-box }
        .ac-dropdown { position:absolute; left:0; right:0; top:76px; background:white; border:1px solid #e6e6e6; box-shadow:0 6px 18px rgba(0,0,0,0.08); border-radius:8px; z-index:999 }
        .ac-status { padding:10px; font-size:13px }
        .ac-error { color:crimson }
        .ac-empty { padding:10px; color:#666 }
        .ac-list { will-change: transform; }
        .ac-item { padding:0 12px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .ac-item.highlight { background: linear-gradient(90deg, #f3f0ff, #efeaff); }
      `}</style>
    </div>
  );
}
