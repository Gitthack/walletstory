"use client";

import Link from "next/link";
import { ARCHETYPES } from "@/lib/archetypes";

function truncateAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export function ArchetypeBadge({ archetype, size = "md" }) {
  const info = ARCHETYPES[archetype];
  if (!info) return null;
  const sm = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold whitespace-nowrap ${
        sm ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[13px]"
      }`}
      style={{
        background: `color-mix(in srgb, ${info.color} 14%, transparent)`,
        color: info.color,
      }}
    >
      <span>{info.icon}</span>
      <span>{archetype}</span>
    </span>
  );
}

export function ConfidenceBar({ value }) {
  const color = value > 80 ? "#10B981" : value > 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative bg-[--bg-elevated] rounded-md h-[22px] overflow-hidden min-w-[120px]">
      <div
        className="h-full rounded-md transition-[width] duration-1000 ease-out"
        style={{ width: `${value}%`, background: color }}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold">
        {value}%
      </span>
    </div>
  );
}

export default function WalletCard({ data, compact = false }) {
  return (
    <Link
      href={`/wallet?address=${encodeURIComponent(data.address)}`}
      className={`block bg-[--bg-card] border border-[--border] rounded-xl cursor-pointer transition-all hover:border-[--accent] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(200,162,255,0.06)] ${
        compact ? "p-3.5" : "p-5"
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="font-mono text-sm font-semibold">
          {truncateAddress(data.address)}
        </span>
        <span className="bg-[--accent-dim] text-[--accent] px-2.5 py-0.5 rounded-md font-mono text-[13px] font-bold">
          {data.score}
        </span>
      </div>

      <div className="mb-3">
        <ArchetypeBadge archetype={data.archetype} size={compact ? "sm" : "md"} />
      </div>

      {!compact && data.story && (
        <p className="text-[--text-secondary] text-[13px] leading-relaxed line-clamp-3 mb-3">
          {data.story}
        </p>
      )}

      <div className="flex gap-4 text-[12px] text-[--text-muted] font-mono mt-auto">
        <span className="text-[--green] font-semibold">{data.stats?.pnl}</span>
        <span>{(data.stats?.totalTx || 0).toLocaleString()} txns</span>
        <span>{data.stats?.totalValue}</span>
      </div>
    </Link>
  );
}
