"use client";

import { useState, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";
import { connectWallet } from "@/lib/web3";

const CATEGORIES = [
  { id: "all", label: "All Tools" },
  { id: "data", label: "Data Fetchers" },
  { id: "analysis", label: "Analysis" },
  { id: "generation", label: "Generation" },
];

function ToolCard({ tool, onPurchase, purchased }) {
  return (
    <div className="bg-[--bg-card] border border-[--border] rounded-xl p-5 hover:border-[--accent] transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tool.icon}</span>
          <div>
            <h3 className="text-sm font-semibold group-hover:text-[--accent] transition-colors">{tool.name}</h3>
            <span className="text-[10px] text-[--text-muted] font-mono">{tool.author}</span>
          </div>
        </div>
        {tool.builtin ? (
          <span className="text-[10px] px-2 py-0.5 bg-[rgba(16,185,129,0.1)] text-[--green] rounded-full font-medium">
            FREE
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 bg-[--accent-dim] text-[--accent] rounded-full font-mono font-medium">
            {tool.price > 0 ? `${tool.price} tBNB` : "FREE"}
          </span>
        )}
      </div>

      <p className="text-xs text-[--text-secondary] leading-relaxed mb-3">{tool.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] px-1.5 py-0.5 bg-[--bg-elevated] rounded text-[--text-muted] font-mono uppercase">
          {tool.category}
        </span>

        {tool.builtin ? (
          <span className="text-[10px] text-[--green] font-medium">Included</span>
        ) : purchased ? (
          <span className="text-[10px] text-[--green] font-medium">Owned</span>
        ) : (
          <button
            onClick={() => onPurchase(tool)}
            className="text-[10px] px-3 py-1 bg-[--accent] text-[--bg-primary] rounded-lg font-semibold hover:brightness-110 transition-all"
          >
            Get Tool
          </button>
        )}
      </div>
    </div>
  );
}

function CreateToolModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "analysis",
    price: 0,
    icon: "🔧",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
      <div className="bg-[--bg-card] border border-[--border] rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">List a New Tool</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-[--text-muted] uppercase tracking-wider block mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[--bg-elevated] border border-[--border] rounded-lg px-3 py-2 text-sm focus:border-[--accent] outline-none"
              placeholder="My Analysis Tool"
            />
          </div>
          <div>
            <label className="text-xs text-[--text-muted] uppercase tracking-wider block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[--bg-elevated] border border-[--border] rounded-lg px-3 py-2 text-sm focus:border-[--accent] outline-none h-20 resize-none"
              placeholder="What does this tool do?"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-[--text-muted] uppercase tracking-wider block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[--bg-elevated] border border-[--border] rounded-lg px-3 py-2 text-sm focus:border-[--accent] outline-none"
              >
                <option value="data">Data</option>
                <option value="analysis">Analysis</option>
                <option value="generation">Generation</option>
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs text-[--text-muted] uppercase tracking-wider block mb-1">Icon</label>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full bg-[--bg-elevated] border border-[--border] rounded-lg px-3 py-2 text-sm text-center focus:border-[--accent] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[--border] rounded-lg text-sm font-medium hover:bg-[--bg-elevated] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onSubmit(form); onClose(); }}
            disabled={!form.name}
            className="flex-1 py-2.5 bg-[--accent] text-[--bg-primary] rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
          >
            List Tool
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [tools, setTools] = useState([]);
  const [category, setCategory] = useState("all");
  const [walletAddress, setWalletAddress] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [stats, setStats] = useState({ total: 0, builtin: 0, community: 0 });

  const handleConnect = useCallback(async () => {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum?.selectedAddress) handleConnect();
  }, [handleConnect]);

  useEffect(() => {
    fetch("/api/marketplace/tools")
      .then((r) => r.json())
      .then((data) => {
        setTools(data.tools || []);
        setStats({ total: data.total, builtin: data.builtin, community: data.community });
      })
      .catch(() => {});
  }, []);

  const filtered = category === "all" ? tools : tools.filter((t) => t.category === category);
  const purchasedIds = new Set(purchases.map((p) => p.toolId));

  const handlePurchase = async (tool) => {
    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: tool.listingId || tool.id, buyerAddress: walletAddress || "anonymous" }),
      });
      const data = await res.json();
      if (data.success || data.purchase) {
        setPurchases([...purchases, data.purchase]);
      }
    } catch {}
  };

  const handleCreate = async (form) => {
    try {
      const res = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, author: walletAddress ? walletAddress.slice(0, 10) : "Anonymous", authorAddress: walletAddress }),
      });
      const data = await res.json();
      if (data.listing) {
        setTools([...tools, { ...data.listing, builtin: false }]);
        setStats((s) => ({ ...s, total: s.total + 1, community: s.community + 1 }));
      }
    } catch {}
  };

  return (
    <div className="min-h-screen">
      <Nav walletAddress={walletAddress} onConnect={handleConnect} />

      <main className="max-w-[960px] mx-auto px-5 pb-20">
        {/* Header */}
        <div className="pt-10 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tight">Tool Marketplace</h1>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-[--accent] text-[--bg-primary] rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
            >
              + List a Tool
            </button>
          </div>
          <p className="text-[--text-secondary] text-sm">
            Extend wallet analysis with community-built tools. {stats.builtin} built-in, {stats.community} community tools available.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === cat.id ? "bg-[--accent-dim] text-[--accent]" : "text-[--text-secondary] hover:bg-[--bg-elevated]"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onPurchase={handlePurchase}
              purchased={purchasedIds.has(tool.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[--text-muted] text-sm">
            No tools in this category yet. Be the first to list one!
          </div>
        )}

        {showCreate && <CreateToolModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
      </main>
    </div>
  );
}
