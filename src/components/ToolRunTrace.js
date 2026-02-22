"use client";

import { useState, useEffect } from "react";

const STATUS_COLORS = {
  success: "var(--green)",
  fail: "var(--red)",
  skipped: "var(--text-muted)",
  running: "var(--amber)",
};

const STATUS_ICONS = {
  success: "✓",
  fail: "✗",
  skipped: "—",
  running: "⏳",
};

const SOURCE_LABELS = {
  etherscan: "Etherscan V2",
  rpc: "RPC Direct",
  mock: "Mock Data",
  computed: "Computed",
  cache: "Cache Hit",
  none: "No Data",
};

function StepRow({ step, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-l-2 ml-3 pl-4 pb-3 relative" style={{ borderColor: STATUS_COLORS[step.status] || "var(--border)" }}>
      {/* Dot on timeline */}
      <div
        className="absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-[--bg-card]"
        style={{ backgroundColor: STATUS_COLORS[step.status] || "var(--border)" }}
      />

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center gap-2 hover:bg-[--bg-elevated] rounded-lg px-2 py-1.5 transition-colors -ml-2"
      >
        <span className="text-xs font-mono" style={{ color: STATUS_COLORS[step.status] }}>
          {STATUS_ICONS[step.status]}
        </span>
        <span className="text-sm font-medium flex-1">{formatStepName(step.stepName)}</span>
        {step.dataSource && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[--bg-elevated] text-[--text-muted] font-mono">
            {SOURCE_LABELS[step.dataSource] || step.dataSource}
          </span>
        )}
        <span className="text-[10px] text-[--text-muted] font-mono">
          {step.durationMs > 0 ? `${step.durationMs}ms` : ""}
        </span>
        <span className="text-[10px] text-[--text-muted]">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="mt-1 ml-2 text-xs space-y-1 fade-in">
          {step.input && (
            <div className="bg-[--bg-elevated] rounded p-2">
              <span className="text-[--text-muted]">Input: </span>
              <span className="font-mono text-[--text-secondary]">{formatValue(step.input)}</span>
            </div>
          )}
          {step.output && (
            <div className="bg-[--bg-elevated] rounded p-2">
              <span className="text-[--text-muted]">Output: </span>
              <span className="font-mono text-[--text-secondary]">{formatValue(step.output)}</span>
            </div>
          )}
          {step.error && (
            <div className="bg-[rgba(239,68,68,0.1)] rounded p-2 text-[--red]">
              Error: {step.error}
            </div>
          )}
          {step.cacheHit && (
            <div className="text-[--amber]">Cache hit</div>
          )}
        </div>
      )}
    </div>
  );
}

function formatStepName(name) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(val) {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  try {
    const str = JSON.stringify(val);
    return str.length > 200 ? str.slice(0, 200) + "..." : str;
  } catch {
    return String(val);
  }
}

export default function ToolRunTrace({ toolRunLogId }) {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!toolRunLogId) return;
    setLoading(true);
    fetch(`/api/tool-runs/${toolRunLogId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.id) setRun(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [toolRunLogId]);

  if (!toolRunLogId) return null;

  return (
    <div className="bg-[--bg-card] border border-[--border] rounded-xl overflow-hidden mt-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-[--bg-elevated] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Data Trace</span>
          <span className="text-[10px] text-[--text-muted] uppercase tracking-[1.5px] font-mono">Proof of Work</span>
        </div>
        <div className="flex items-center gap-3">
          {run && (
            <>
              <span className="text-[10px] font-mono text-[--text-muted]">
                {run.steps?.length || 0} steps
              </span>
              <span className="text-[10px] font-mono text-[--text-muted]">
                {run.totalDurationMs}ms
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{
                  color: run.cacheHit ? "var(--amber)" : "var(--green)",
                  background: run.cacheHit ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                }}
              >
                {run.cacheHit ? "CACHED" : "LIVE"}
              </span>
            </>
          )}
          <span className="text-[--text-muted] text-xs">{collapsed ? "▸" : "▾"}</span>
        </div>
      </button>

      {!collapsed && (
        <div className="px-5 pb-4 border-t border-[--border]">
          {loading && (
            <div className="py-4 text-center text-[--text-muted] text-sm">Loading trace...</div>
          )}

          {!loading && !run && (
            <div className="py-4 text-center text-[--text-muted] text-sm">
              No trace data available for this run.
            </div>
          )}

          {run && (
            <div className="pt-3">
              {/* Run header */}
              <div className="flex items-center gap-4 mb-3 text-xs text-[--text-muted] font-mono">
                <span>ID: {run.id?.slice(0, 8)}</span>
                <span>Mode: {run.mode}</span>
                <span>Network: {run.network}</span>
                <span>Status: <span style={{ color: run.status === "completed" ? "var(--green)" : "var(--red)" }}>{run.status}</span></span>
              </div>

              {/* Steps timeline */}
              <div className="mt-2">
                {run.steps?.map((step, i) => (
                  <StepRow key={i} step={step} index={i} />
                ))}
              </div>

              {/* Tools used */}
              {run.toolsUsed?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[--border]">
                  <span className="text-[10px] text-[--text-muted] uppercase tracking-wider">Tools Used: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {run.toolsUsed.map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[--bg-elevated] rounded font-mono text-[--text-secondary]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
