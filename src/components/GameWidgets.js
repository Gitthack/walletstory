"use client";

import { RARITY_COLORS, FACTIONS, getRankTitle, RANK_TITLES } from "@/lib/gamedata";

export function FactionBanner({ faction = "neutral" }) {
  const f = FACTIONS[faction] || FACTIONS.neutral;
  return (
    <div className="tk-parchment tk-border rounded-xl p-6 text-center" style={{ borderColor: f.color }}>
      <div className="tk-title text-5xl mb-2 relative z-10" style={{ color: f.color }}>{f.name}</div>
      <div className="tk-text text-lg font-semibold mb-1 relative z-10">{f.fullName}</div>
      <div className="tk-text text-sm opacity-70 relative z-10">{f.motto}</div>
      {f.lord !== "\u2014" && (
        <div className="mt-3 tk-text text-xs opacity-50 relative z-10">Lord: {f.lord}</div>
      )}
    </div>
  );
}

export function RankProgress({ totalSearches }) {
  const title = getRankTitle(totalSearches);
  const currentRank = RANK_TITLES.filter((r) => totalSearches >= r.min);
  const current = currentRank[currentRank.length - 1];
  const nextRank = RANK_TITLES.find((r) => r.min > totalSearches);
  const progress = nextRank ? ((totalSearches - current.min) / (nextRank.min - current.min)) * 100 : 100;

  return (
    <div className="tk-parchment tk-border rounded-xl p-5">
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div>
          <div className="tk-text text-xs opacity-50 uppercase tracking-wider">Rank</div>
          <div className="tk-title text-xl">{title}</div>
        </div>
        <div className="text-right">
          <div className="tk-text text-xs opacity-50">Searches</div>
          <div className="tk-title text-2xl">{totalSearches}</div>
        </div>
      </div>
      <div className="relative z-10">
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(139,115,64,0.2)" }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%`, background: "linear-gradient(90deg, #C4A96A, #F59E0B)" }} />
        </div>
        {nextRank && (
          <div className="flex justify-between mt-1">
            <span className="tk-text text-[10px] opacity-50">{current.title}</span>
            <span className="tk-text text-[10px] opacity-50">{nextRank.title} ({nextRank.min})</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ResourceBar({ resources = {} }) {
  const items = [
    { key: "gold", label: "Gold", icon: "\uD83E\uDE99", color: "#F59E0B" },
    { key: "food", label: "Food", icon: "\uD83C\uDF5A", color: "#10B981" },
    { key: "wood", label: "Wood", icon: "\uD83E\uDEB5", color: "#92400E" },
    { key: "iron", label: "Iron", icon: "\u2699\uFE0F", color: "#6B7280" },
  ];

  return (
    <div className="tk-parchment tk-border rounded-xl p-4">
      <div className="tk-text text-xs font-semibold uppercase tracking-wider mb-3 opacity-50 relative z-10">Resources</div>
      <div className="grid grid-cols-4 gap-3 relative z-10">
        {items.map((item) => (
          <div key={item.key} className="text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="tk-title text-lg" style={{ color: item.color }}>{resources[item.key] || 0}</div>
            <div className="tk-text text-[10px] opacity-60">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InventoryGrid({ inventory = [] }) {
  if (inventory.length === 0) {
    return (
      <div className="tk-parchment tk-border rounded-xl p-8 text-center">
        <div className="tk-title text-xl mb-2 relative z-10">Empty</div>
        <p className="tk-text text-sm opacity-60 relative z-10">
          Search wallets to earn rewards. Each archetype determines your prize.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {inventory.map((item, i) => (
        <div key={i} className={`tk-parchment rounded-lg p-4 text-center border-2 rarity-${item.rarity} transition-transform hover:-translate-y-1`}>
          <div className="text-3xl mb-2 relative z-10">{item.icon}</div>
          <div className="tk-title text-sm relative z-10">{item.name}</div>
          <div className="flex justify-center gap-2 mt-2 relative z-10">
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded" style={{ color: RARITY_COLORS[item.rarity], background: `color-mix(in srgb, ${RARITY_COLORS[item.rarity]} 15%, transparent)` }}>
              {item.rarity}
            </span>
            <span className="tk-text text-[10px] opacity-50 capitalize">{item.type}</span>
          </div>
          {item.power && <div className="mt-1 tk-text text-[10px] opacity-40 relative z-10">Power {item.power}</div>}
        </div>
      ))}
    </div>
  );
}

export function RewardPopup({ reward, onClose }) {
  if (!reward) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`tk-parchment tk-border rounded-2xl p-8 text-center max-w-xs mx-4 rarity-${reward.rarity} fade-in-up`} onClick={(e) => e.stopPropagation()}>
        <div className="tk-text text-xs uppercase tracking-widest opacity-50 mb-3 relative z-10">Reward Obtained</div>
        <div className="text-6xl mb-4 relative z-10">{reward.icon}</div>
        <div className="tk-title text-2xl mb-1 relative z-10">{reward.name}</div>
        <div className="flex justify-center gap-2 mb-4 relative z-10">
          <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full" style={{ color: RARITY_COLORS[reward.rarity], background: `color-mix(in srgb, ${RARITY_COLORS[reward.rarity]} 15%, transparent)` }}>
            {reward.rarity}
          </span>
        </div>
        {reward.power && <div className="tk-text text-sm opacity-60 mb-4 relative z-10">Power: {reward.power}</div>}
        <button onClick={onClose} className="tk-text text-sm font-semibold px-6 py-2 rounded-lg relative z-10" style={{ background: "rgba(139,115,64,0.2)", border: "1px solid rgba(139,115,64,0.3)" }}>
          Collect
        </button>
      </div>
    </div>
  );
}
