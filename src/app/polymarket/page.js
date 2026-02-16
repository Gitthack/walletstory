// PolymarketSmartMoneyPage - Smart Money Analysis Component

"use client";

import { useState, useCallback } from "react";
import Nav from "@/components/Nav";
import { Search } from "lucide-react";

export default function PolymarketSmartMoneyPage() {
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeWallet = useCallback(async () => {
    if (!wallet) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`/api/polymarket/analyze?wallet=${wallet}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  return (
    <div className="min-h-screen">
      <Nav />
      
      <main className="max-w-[960px] mx-auto px-5 pb-20">
        {/* Header */}
        <div className="pt-16 pb-10 text-center">
          <h1 className="text-[42px] font-bold tracking-tight leading-[1.1] mb-3">
            Polymarket
            <br />
            <span className="text-[--accent]">Smart Money</span> Analysis
          </h1>
          <p className="text-[--text-secondary] text-base max-w-[500px] mx-auto mb-6">
            Track wallet performance, analyze win rates, and identify smart money traders on Polymarket.
          </p>
          
          {/* Search */}
          <div className="max-w-[500px] mx-auto relative">
            <input
              type="text"
              placeholder="Enter Polymarket wallet address (0x...)"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyzeWallet()}
              className="w-full px-5 py-4 pr-14 bg-[--bg-card] border border-[--border] rounded-xl text-[--text-primary] placeholder-[--text-muted] focus:outline-none focus:border-[--accent] transition-colors"
            />
            <button
              onClick={analyzeWallet}
              disabled={loading || !wallet}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[--accent] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#ff4444]/10 border border-[#ff4444]/30 rounded-xl p-4 mb-6">
            <p className="text-[#ff4444] text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[--accent] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[--text-secondary]">Analyzing wallet...</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard
                label="Win Rate"
                value={`${result.stats.winRate}%`}
                icon="📊"
                color={result.stats.winRate >= 60 ? "green" : result.stats.winRate >= 40 ? "yellow" : "red"}
              />
              <StatCard
                label="Total Trades"
                value={result.stats.totalTrades}
                icon="📈"
              />
              <StatCard
                label="Net Profit"
                value={`$${result.stats.netProfit}`}
                icon="💰"
                color={result.stats.netProfit >= 0 ? "green" : "red"}
              />
              <StatCard
                label="Category"
                value={result.category.name}
                icon={result.category.icon}
              />
            </div>

            {/* Category Badge */}
            <div className="text-center mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 bg-[--bg-card] border border-[--border] rounded-full text-sm ${result.isSmartMoney ? "text-[--green]" : "text-[--text-secondary]"}`}>
                {result.category.icon} {result.category.name}
                {result.isSmartMoney && " ✓"}
              </span>
            </div>

            {/* Performance Breakdown */}
            <div className="bg-[--bg-card] border border-[--border] rounded-xl p-5 mb-6">
              <h3 className="font-semibold mb-4">Performance Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[--green]">{result.stats.winningTrades}</p>
                  <p className="text-xs text-[--text-muted]">Winning Trades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[--red]">{result.stats.losingTrades}</p>
                  <p className="text-xs text-[--text-muted]">Losing Trades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{result.stats.totalTrades}</p>
                  <p className="text-xs text-[--text-muted]">Total Trades</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-[--bg-elevated] rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-[--green]" 
                    style={{ width: `${result.stats.winRate}%` }} 
                  />
                  <div 
                    className="h-full bg-[--red]" 
                    style={{ width: `${100 - result.stats.winRate}%` }} 
                  />
                </div>
                <div className="flex justify-between text-xs text-[--text-muted] mt-1">
                  <span>Win {result.stats.winRate}%</span>
                  <span>Loss {100 - result.stats.winRate}%</span>
                </div>
              </div>
            </div>

            {/* Profit/Loss */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4">
                <p className="text-xs text-[--text-muted] mb-1">Total Profit</p>
                <p className="text-xl font-bold text-[--green]">+${result.stats.totalProfit}</p>
              </div>
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4">
                <p className="text-xs text-[--text-muted] mb-1">Total Loss</p>
                <p className="text-xl font-bold text-[--red]">-${result.stats.totalLoss}</p>
              </div>
            </div>

            {/* Recent Trades */}
            {result.recentTrades.length > 0 && (
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-5">
                <h3 className="font-semibold mb-4">Recent Trades</h3>
                <div className="flex flex-col gap-2">
                  {result.recentTrades.slice(0, 10).map((trade, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-3 px-3 py-2 bg-[--bg-elevated] rounded-lg"
                    >
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        trade.outcome === "Yes" 
                          ? "bg-[--green]/20 text-[--green]" 
                          : trade.outcome === "No"
                          ? "bg-[--red]/20 text-[--red]"
                          : "bg-[--yellow]/20 text-[--yellow]"
                      }`}>
                        {trade.outcome === "Yes" ? "YES" : trade.outcome === "No" ? "NO" : "PENDING"}
                      </span>
                      <span className="flex-1 text-sm truncate">{trade.market}</span>
                      <span className={`text-xs font-medium ${
                        trade.pnl > 0 ? "text-[--green]" : trade.pnl < 0 ? "text-[--red]" : "text-[--text-muted]"
                      }`}>
                        {trade.pnl > 0 ? "+" : ""}${trade.pnl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {!result && !loading && (
          <div className="bg-[--bg-card] border border-[--border] rounded-xl p-5 mt-8">
            <h3 className="font-semibold mb-3">💡 How to Find Smart Money</h3>
            <ul className="text-sm text-[--text-secondary] space-y-2">
              <li>• Look for wallets with 60%+ win rate</li>
              <li>• Track consistent profit over 100+ trades</li>
              <li>• Copy successful traders' positions</li>
              <li>• Avoid "degen" wallets with high loss rates</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    green: "text-[--green]",
    yellow: "text-[--yellow]",
    red: "text-[--red]",
  };
  
  return (
    <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4">
      <p className="text-xs text-[--text-muted] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClasses[color] || ""}`}>
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </p>
    </div>
  );
}