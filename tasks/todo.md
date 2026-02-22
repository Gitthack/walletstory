# WalletStory Major Upgrade — Implementation Plan

## Current State Diagnosis

**What works:**
- Address → mock/live features → classification → template story → score → on-chain submit → reward claim → leaderboard
- Etherscan V2 API integration (recently migrated)
- 10 archetypes, data-driven narrative engine, game profile tracking
- BSC Testnet smart contract (WalletStoryRegistry)

**Critical gaps for these 3 requirements:**
1. **No tool/step tracking** — analysis is one opaque function call, no visibility into what ran
2. **No persistence** — in-memory db.js loses everything on restart
3. **No marketplace** — no page, no API, no data model
4. **Cache never expires** — no TTL, no LRU
5. **No provider abstraction** — hardcoded Etherscan, no RPC-direct fallback
6. **No streaming/realtime UX** — single fetch, no progress indicators

---

## Architecture (text diagram)

```
User → SearchBar → /api/analyze (NEW)
                       │
                       ├── ToolOrchestrator (NEW: src/lib/toolOrchestrator.js)
                       │     ├── Step 1: fetchBalance       (tool: "balance-fetcher")
                       │     ├── Step 2: fetchTransactions   (tool: "tx-fetcher")
                       │     ├── Step 3: fetchTokenTransfers (tool: "token-fetcher")
                       │     ├── Step 4: fetchNFTTransfers   (tool: "nft-fetcher")
                       │     ├── Step 5: extractFeatures     (tool: "feature-extractor")
                       │     ├── Step 6: classifyWallet      (tool: "classifier")
                       │     ├── Step 7: generateStory       (tool: "story-generator")
                       │     ├── Step 8: calculateScore      (tool: "scorer")
                       │     └── Each step → ToolRunLog entry
                       │
                       ├── ToolRunLog (NEW: src/lib/toolRunLog.js)
                       │     └── JSON file storage in data/tool-runs/
                       │
                       ├── ChainProvider (NEW: src/lib/chainProvider.js)
                       │     ├── RPC direct (default, no key needed)
                       │     ├── Etherscan V2 (if key set)
                       │     └── Configurable per-network
                       │
                       └── LRU Cache (NEW: src/lib/cache.js)
                             └── 5-min TTL, 200 entries max

/api/tool-runs/:id (NEW) → fetch persisted log
/api/marketplace/* (NEW) → tool listings CRUD
/marketplace (NEW page)
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Create `src/lib/cache.js` — LRU cache with TTL
- [ ] Create `src/lib/chainProvider.js` — RPC + Etherscan provider abstraction
- [ ] Create `src/lib/toolRunLog.js` — Tool run logging + JSON file persistence
- [ ] Create `src/lib/toolOrchestrator.js` — Step-by-step analysis with logging

### Phase 2: Requirement A — Real-time Chain Data → Real Story
- [ ] Create `src/app/api/analyze/route.js` — New unified analysis endpoint
- [ ] Refactor `src/lib/onchain.js` — Use chainProvider, expose individual step functions
- [ ] Update `src/lib/stories.js` — Accept signals array, reference specific tx hashes
- [ ] Keep `/api/wallet` working (backward compat, delegates to new engine)
- [ ] Update `src/app/wallet/page.js` — Show streaming progress, cache hit indicator

### Phase 3: Requirement B — Tool Run Log
- [ ] Create `src/app/api/tool-runs/[id]/route.js` — Fetch persisted logs
- [ ] Add "Data Trace" section to `/wallet` page — Timeline of steps
- [ ] Wire toolRunLogId into analysisHash preimage for on-chain verifiability
- [ ] Create `src/components/ToolRunTrace.js` — Timeline UI component

### Phase 4: Requirement C — Tool Marketplace
- [ ] Create `src/lib/marketplace.js` — Marketplace data store + logic
- [ ] Create `src/app/api/marketplace/tools/route.js` — Tool directory
- [ ] Create `src/app/api/marketplace/listings/route.js` — CRUD listings
- [ ] Create `src/app/api/marketplace/purchase/route.js` — Purchase flow
- [ ] Create `src/app/marketplace/page.js` — Marketplace UI
- [ ] Wire tool selection into analysis flow (wallet page tool picker)

### Phase 5: Integration & Polish
- [ ] Update `.env.example` with new variables
- [ ] Update `src/components/Nav.js` — Add marketplace link
- [ ] Ensure backward compat: existing /api/wallet still works
- [ ] Build succeeds with no errors
- [ ] Self-test: 3 verification scenarios

---

## Key Design Decisions

1. **Persistence: JSON files, not SQLite/Prisma**
   - Reason: repo has zero DB deps, adding Prisma/SQLite is heavy for MVP
   - Trade-off: not query-efficient, but fine for <10K logs
   - Upgrade path: swap `toolRunLog.js` internals to SQLite later

2. **Provider: RPC-first, Etherscan-optional**
   - BSC Testnet RPC is free and unlimited
   - Etherscan V2 as enhancement when key is set
   - No WebSocket (unstable for BSC Testnet RPCs)

3. **Marketplace: Off-chain with signature verification**
   - Listings stored in-memory + JSON file (same pattern as tool logs)
   - Purchase: wallet signature + off-chain record
   - Upgrade path: deploy ERC20 mock + escrow contract later

4. **analysisHash includes toolRunLogId**
   - `keccak256(JSON.stringify({...analysis, toolRunLogId}))` as preimage
   - UI shows verification method
   - No contract changes needed

---

## Files to Create (NEW)
- `src/lib/cache.js`
- `src/lib/chainProvider.js`
- `src/lib/toolRunLog.js`
- `src/lib/toolOrchestrator.js`
- `src/lib/marketplace.js`
- `src/app/api/analyze/route.js`
- `src/app/api/tool-runs/[id]/route.js`
- `src/app/api/marketplace/tools/route.js`
- `src/app/api/marketplace/listings/route.js`
- `src/app/api/marketplace/purchase/route.js`
- `src/app/marketplace/page.js`
- `src/components/ToolRunTrace.js`
- `src/components/ToolSelector.js`
- `data/tool-runs/.gitkeep`
- `data/marketplace/.gitkeep`

## Files to Modify
- `src/lib/onchain.js` — Refactor to use chainProvider
- `src/lib/stories.js` — Accept signals, reference tx hashes
- `src/lib/db.js` — Add cache TTL support
- `src/app/api/wallet/route.js` — Delegate to orchestrator
- `src/app/wallet/page.js` — Add tool trace UI, streaming, tool selector
- `src/components/Nav.js` — Add marketplace link
- `.env.example` — New env vars
- `package.json` — No new deps needed (all vanilla)

## Files NOT Changed
- `contracts/WalletStoryRegistry.sol` — No contract changes
- `src/lib/archetypes.js` — Classification logic unchanged
- `src/lib/gamedata.js` — Game data unchanged
- `src/lib/web3.js` — Contract interaction unchanged (except analysisHash preimage)
- `src/app/gamefi/page.js` — Unchanged
- All other components not listed above

---

## Self-Test Plan
1. `npm run dev` → search `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` → verify story + tool trace + signals
2. Visit `/marketplace` → create listing → purchase listing → verify state
3. Search same address within 5 min → verify cache hit shown in UI + tool trace shows "cache"
