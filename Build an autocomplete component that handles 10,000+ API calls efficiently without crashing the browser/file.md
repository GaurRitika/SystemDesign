# Key ideas used

* **Debouncing** (default 250ms): avoid firing on every keystroke.
* **Request cancellation** with `AbortController`: prevents race conditions and wasted work when a more recent query arrives.
* **LRU cache**: stores previous query results (configurable size) so repeat queries return instantly and reduce API traffic.
* **Result limiting & early paging**: only request a few pages (configurable) and stop once we have enough items; prevents trying to fetch thousands of items at once.
* **Simple virtualization (windowing)**: only render the visible slice of the suggestions list to keep DOM nodes small and rendering fast.
* **Graceful defaults and error handling**: shows loading state, empty state and handles aborts vs real errors.
* **Keyboard + ARIA accessibility**: arrow keys, enter, escape and basic ARIA attributes.
* **Extensible fetch hook**: the component accepts a `fetchSuggestions(query, { signal, page })` prop so you can plug any server API (including server-side paging).
* **Memory management & limits**: configurable `maxResults`, cache size; avoids storing enormous arrays client-side.

# Trade-offs and points to put forward

* I **do not** fetch all 10,000 results into the browser. That would blow memory and UI. Instead we fetch a limited number of pages (e.g. first 2–4 pages) and present a small, sensible number to the user (e.g. up to 200), asking the server to do heavy lifting (filtering/ranking).
* For extremely high throughput/low-latency needs, consider:

  * **Server-side indexing** (Elasticsearch/Algolia/Typesense) to serve suggestions quickly.
  * **Incremental (prefix) search on the server** so only relevant matches are returned.
  * **Rate-limiting or token-bucket** on client if user is programmatically triggering many queries.
  * **Web Worker** for local filtering/processing if you must handle heavy client-side computation.
* For offline or fuzzy matching, combine small server response + client fuzzy-filtering (but do fuzzy in worker to avoid main-thread jank).
* For real-time analytics on usage, monitor request latency, error rate, and cache hit ratio.

# How to use it

* Open the canvas file to copy the component.
* Pass your real API fetch function: `fetchSuggestions(query, { signal, page, pageSize })` returning `{ items: [{id,label}], hasMore }`.
* Tune `debounceMs`, `maxResults`, `pageSize`, and cache limit to fit your product constraints.


