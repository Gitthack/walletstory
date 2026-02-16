// Smart Search - Auto-detects SOL/ETH addresses and fetches Polymarket data

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Wallet, TrendingUp, AlertCircle } from "lucide-react";

export default function SmartSearchBar({ size = "lg" }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detected, setDetected] = useState(null);
  const [polymarketData, setPolymarketData] = useState(null);
  const router = useRouter();

  // Detect address type
  const detectAddress = useCallback((value) => {
    const addr = value.trim();
    
    // ETH address (0x... 42 chars)
    if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      return { type: "ETH", valid: true };
    }
    
    // SOL address (base58, 32-44 chars)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) {
      return { type: "SOL", valid: true };
    }
    
    // Check if it's aENS or .sol domain
    if (addr.endsWith(".eth") || addr.endsWith(".sol")) {
      return { type: "DOMAIN", valid: true };
    }
    
    return { type: null, valid: false };
  }, []);

  // Fetch Polymarket data for ETH wallet
  const fetchPolymarketData = async (address) => {
    try {
      const response = await fetch(`/api/polymarket/analyze?wallet=${address}`);
      if (response.ok) {
        const data = await response.json();
        setPolymarketData(data);
        return data;
      }
    } catch (err) {
      console.error("Polymarket fetch error:", err);
    }
    return null;
  };

  const handleChange = async (e) => {
    const value = e.target.value;
    setInput(value);
    setError(null);
    setPolymarketData(null);
    
    if (value.trim().length >= 40) {
      const detection = detectAddress(value);
      setDetected(detection);
      
      // Auto-fetch Polymarket data for ETH addresses
      if (detection.type === "ETH" && detection.valid) {
        setLoading(true);
        await fetchPolymarketData(value.trim());
        setLoading(false);
      }
    } else {
      setDetected(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addr = input.trim();
    if (!addr) return;

    const detection = detectAddress(addr);
    
    if (!detection.valid) {
      setError("Invalid wallet address format");
      return;
    }

    setLoading(true);

    try {
      if (detection.type === "ETH") {
        // Go to wallet page for ETH
        router.push(`/wallet?address=${encodeURIComponent(addr)}`);
      } else if (detection.type === "SOL") {
        // For SOL, show a message (future: integrate with Solana data)
        setError("Solana support coming soon! Try an ETH address for now.");
      } else if (detection.type === "DOMAIN") {
        // Resolve domain
        setError("Domain resolution coming soon!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLg = size === "lg";

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-0 bg-[--bg-card] border border-[--border] rounded-2xl transition-colors focus-within:border-[--accent] ${
            isLg ? "p-1.5" : "p-1"
          } ${error ? "border-red-500" : ""}`}
        >
          <span className="pl-4 pr-2 text-[--text-muted] text-xl">⌕</span>
          <input
            type="text"
            value={input}
            onChange={handleChange}
            placeholder="Enter ETH/SOL address or ENS"
            spellCheck={false}
            autoComplete="off"
            className={`flex-1 bg-transparent border-none outline-none font-mono text-[--text-primary] placeholder:text-[--text-muted] placeholder:font-body min-w-0 ${
              isLg ? "text-sm py-3 px-2" : "text-xs py-2 px-2"
            }`}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`bg-[--accent] text-[--bg-primary] border-none rounded-xl font-semibold font-body cursor-pointer transition-all whitespace-nowrap hover:brightness-110 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-default ${
              isLg ? "px-6 py-2.5 text-sm" : "px-4 py-2 text-xs"
            }`}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-[--bg-primary]/30 border-t-[--bg-primary] rounded-full animate-spin" />
            ) : (
              "Analyze"
            )}
          </button>
        </div>
      </form>

      {/* Detection & Error Display */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Address Type Detected */}
      {detected && detected.valid && !error && (
        <div className="flex items-center gap-2 mt-2 text-sm">
          {detected.type === "ETH" && (
            <span className="flex items-center gap-1.5 text-[--accent]">
              <Wallet size={14} />
              Ethereum Address Detected
            </span>
          )}
          {detected.type === "SOL" && (
            <span className="flex items-center gap-1.5 text-purple-400">
              <Wallet size={14} />
              Solana Address Detected
            </span>
          )}
        </div>
      )}

      {/* Polymarket Data Preview */}
      {polymarketData && (
        <div className="mt-3 p-4 bg-[--bg-card] border border-[--border] rounded-xl fade-in">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[--accent]" />
            <span className="font-semibold text-sm">Polymarket Smart Money Data</span>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
              polymarketData.isSmartMoney 
                ? "bg-green-500/20 text-green-400" 
                : "bg-[--bg-elevated] text-[--text-muted]"
            }`}>
              {polymarketData.category.icon} {polymarketData.category.name}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-[--green]">{polymarketData.stats.winRate}%</p>
              <p className="text-xs text-[--text-muted]">Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{polymarketData.stats.totalTrades}</p>
              <p className="text-xs text-[--text-muted]">Total Trades</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${polymarketData.stats.netProfit >= 0 ? "text-[--green]" : "text-red-400"}`}>
                ${polymarketData.stats.netProfit}
              </p>
              <p className="text-xs text-[--text-muted]">Net Profit</p>
            </div>
          </div>

          {/* Win/Loss Progress */}
          <div className="mt-3">
            <div className="h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[--green]" 
                style={{ width: `${polymarketData.stats.winRate}%` }} 
              />
              <div 
                className="h-full bg-red-500" 
                style={{ width: `${100 - polymarketData.stats.winRate}%` }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {detected?.type === "SOL" && (
        <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <p className="text-xs text-purple-300">
            💡 Solana support is coming soon! For now, try searching for an Ethereum address to see on-chain and Polymarket data.
          </p>
        </div>
      )}
    </div>
  );
}