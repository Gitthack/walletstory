// LRU cache with TTL — used for wallet analysis results
// Default: 200 entries max, 5-minute TTL

const DEFAULT_MAX = 200;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

class LRUCache {
  constructor(maxSize = DEFAULT_MAX, ttlMs = DEFAULT_TTL_MS) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.cache = new Map(); // key → { value, expiresAt }
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return { hit: false, value: null };
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return { hit: false, value: null, expired: true };
    }
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return { hit: true, value: entry.value, age: Date.now() - entry.createdAt };
  }

  set(key, value) {
    // Delete first to move to end if exists
    this.cache.delete(key);
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  has(key) {
    return this.get(key).hit;
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }

  stats() {
    let alive = 0;
    let expired = 0;
    const now = Date.now();
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) expired++;
      else alive++;
    }
    return { alive, expired, total: this.cache.size, maxSize: this.maxSize, ttlMs: this.ttlMs };
  }
}

// Singleton analysis cache
export const analysisCache = new LRUCache(200, DEFAULT_TTL_MS);
