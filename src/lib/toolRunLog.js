// Tool Run Log — records every step of a wallet analysis
// Persisted as JSON files in data/tool-runs/
// Each run gets a unique ID, each step is logged with timing + status

import { randomUUID } from "crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const LOG_DIR = join(process.cwd(), "data", "tool-runs");

// Ensure dir exists
try { mkdirSync(LOG_DIR, { recursive: true }); } catch {}

// In-memory index for fast lookup (last 500 runs)
const runIndex = new Map();
const MAX_INDEX = 500;

export function createToolRun(address, mode, network) {
  const id = randomUUID();
  const run = {
    id,
    address,
    mode,       // "realtime" | "snapshot"
    network,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "running",  // "running" | "completed" | "failed"
    steps: [],
    toolsUsed: [],      // tool IDs used in this run
    totalDurationMs: 0,
    cacheHit: false,
  };
  runIndex.set(id, run);
  // Evict oldest if over limit
  if (runIndex.size > MAX_INDEX) {
    const oldest = runIndex.keys().next().value;
    runIndex.delete(oldest);
  }
  return run;
}

export function addStep(run, stepName, input) {
  const step = {
    index: run.steps.length,
    stepName,
    toolId: null,       // set if a marketplace tool is used
    input: summarize(input),
    output: null,
    status: "running",  // "running" | "success" | "fail" | "skipped"
    error: null,
    dataSource: null,   // "etherscan" | "rpc" | "cache" | "mock"
    cacheHit: false,
    startedAt: new Date().toISOString(),
    completedAt: null,
    durationMs: 0,
  };
  run.steps.push(step);
  return step;
}

export function completeStep(step, output, dataSource, extra = {}) {
  step.output = summarize(output);
  step.status = "success";
  step.dataSource = dataSource;
  step.completedAt = new Date().toISOString();
  step.durationMs = new Date(step.completedAt) - new Date(step.startedAt);
  step.cacheHit = extra.cacheHit || false;
  if (extra.toolId) step.toolId = extra.toolId;
}

export function failStep(step, error) {
  step.status = "fail";
  step.error = typeof error === "string" ? error : (error?.message || "Unknown error");
  step.completedAt = new Date().toISOString();
  step.durationMs = new Date(step.completedAt) - new Date(step.startedAt);
}

export function skipStep(step, reason) {
  step.status = "skipped";
  step.error = reason;
  step.completedAt = new Date().toISOString();
  step.durationMs = 0;
}

export function completeRun(run, status = "completed") {
  run.status = status;
  run.completedAt = new Date().toISOString();
  run.totalDurationMs = new Date(run.completedAt) - new Date(run.startedAt);
  // Persist to file
  persistRun(run);
  return run;
}

export function markCacheHit(run) {
  run.cacheHit = true;
  const step = addStep(run, "cache-lookup", { address: run.address });
  completeStep(step, { hit: true }, "cache", { cacheHit: true });
}

export function getToolRun(id) {
  // Check memory first
  if (runIndex.has(id)) return runIndex.get(id);
  // Try file
  const filePath = join(LOG_DIR, `${id}.json`);
  if (existsSync(filePath)) {
    try {
      const data = JSON.parse(readFileSync(filePath, "utf8"));
      runIndex.set(id, data);
      return data;
    } catch { return null; }
  }
  return null;
}

// ─── INTERNAL ───────────────────────────────────────────────────────────────

function persistRun(run) {
  try {
    const filePath = join(LOG_DIR, `${run.id}.json`);
    writeFileSync(filePath, JSON.stringify(run, null, 2));
  } catch (e) {
    console.error("Failed to persist tool run:", e.message);
  }
}

function summarize(data) {
  if (data === null || data === undefined) return null;
  if (typeof data === "string") return data.length > 500 ? data.slice(0, 500) + "..." : data;
  if (typeof data === "number" || typeof data === "boolean") return data;
  if (Array.isArray(data)) {
    return { _type: "array", length: data.length, sample: data.slice(0, 3) };
  }
  if (typeof data === "object") {
    const keys = Object.keys(data);
    const summary = {};
    for (const k of keys.slice(0, 15)) {
      const v = data[k];
      if (Array.isArray(v)) summary[k] = `[Array(${v.length})]`;
      else if (typeof v === "object" && v !== null) summary[k] = "{...}";
      else if (typeof v === "string" && v.length > 100) summary[k] = v.slice(0, 100) + "...";
      else summary[k] = v;
    }
    if (keys.length > 15) summary._truncated = `${keys.length - 15} more keys`;
    return summary;
  }
  return String(data);
}
