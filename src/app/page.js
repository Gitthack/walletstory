export const dynamic = "force-dynamic";
export const revalidate = 0;

"use client";

import { useState, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";
import SearchBar from "@/components/SearchBar";
import WalletCard from "@/components/WalletCard";
import { ArchetypeBadge } from "@/components/WalletCard";
import { ContractLink } from "@/components/TxStatus";
import { SAMPLE_STORIES, DAILY_HEADLINES } from "@/data/samples";
import { connectWallet, getGlobalStats, getContractExplorerUrl } from "@/lib/web3";
import BuildStamp from "@/components/BuildStamp";

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [headlines] = useState(DAILY_HEADLINES);
  const [featured] = useState(SAMPLE_STORIES);
  const [globalStats, setGlobalStats] = useState({ totalAnalyses: 0, totalRewards: 0 });

  useEffect(() => {
    getGlobalStats().then(setGlobalStats).catch(() => {});
    // Auto-reconnect if already connected
    if (typeof window !== "undefined" && window.ethereum?.selectedAddress) {
      handleConnect();
    }
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      const { signer: s, address } = await connectWallet();
      setWalletAddress(address);
      setSigner(s);
    } catch (err) {
      alert(err.message);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Nav walletAddress={walletAddress} onConnect={handleConnect} />

      <main className="max-w-[960px] mx-auto px-5 pb-20">
        {/* Hero */}
        <div className="text-center pt-16 pb-10 fade-in">
          <h1 className="text-[42px] font-bold tracking-tight leading-[1.1] mb-3">
            Every wallet<br />has a <span className="text-[--accent]">story</span>
          </h1>
          <p className="text-[--text-secondary] text-base max-w-[500px] mx-auto mb-3 leading-relaxed">
            Turn raw on-chain activity into clear narratives, player archetypes,
            and daily intelligence. Results stored on BSC Testnet.
          </p>

          {/* On-chain stats */}
          <div className="flex justify-center gap-6 mb-8 text-xs font-mono">
            <span className="text-[--text-muted]">
              <span className="text-[--accent] font-bold">{globalStats.totalAnalyses}</span> analyses on-chain
            </span>
            <span className="text-[--text-muted]">
              <span className="text-[--accent] font-bold">{globalStats.totalRewards}</span> rewards claimed
            </span>
            <ContractLink />
          </div>

          <SearchBar size="lg" />

          {!walletAddress && (
            <p className="text-[--text-muted] text-xs mt-4">
              Connect MetaMask to BSC Testnet to store analyses on-chain.{" "}
              <a href="https://www.bnbchain.org/en/testnet-faucet" target="_blank" rel="noopener noreferrer" className="text-[--accent] underline">
                Get free tBNB →
              </a>
            </p>
          )}
        </div>

        {/* Headlines */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Today&apos;s Headlines</h2>
          <span className="text-[--green] text-xs font-medium animate-pulse">● LIVE</span>
        </div>

        <div className="flex flex-col gap-0.5 mb-2">
          {headlines.map((h, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[--bg-card] rounded-lg transition-colors hover:bg-[--bg-elevated] fade-in-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
              <span className="font-mono text-[--accent] font-bold text-[13px] min-w-[24px]">#{i + 1}</span>
              <span className="flex-1 text-sm font-medium">{h.title}</span>
              <ArchetypeBadge archetype={h.type} size="sm" />
              <span className="text-[--text-muted] text-xs whitespace-nowrap">{h.time}</span>
            </div>
          ))}
        </div>

        {/* Featured */}
        <h2 className="text-xl font-semibold tracking-tight mt-10 mb-4">Featured Stories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featured.slice(0, 6).map((s, i) => (
            <div key={i} className="fade-in-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}>
              <WalletCard data={s} />
            </div>
          ))}
        </div>
      </main>
      <BuildStamp />
    </div>
  );
}
