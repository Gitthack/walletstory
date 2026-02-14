export const dynamic = "force-dynamic";
export const revalidate = 0;

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import SearchBar from "@/components/SearchBar";
import { ArchetypeBadge, ConfidenceBar } from "@/components/WalletCard";
import { TxStatus, OnChainBadge } from "@/components/TxStatus";
import { RewardPopup } from "@/components/GameWidgets";
import { ARCHETYPES } from "@/lib/archetypes";
import { connectWallet, submitAnalysisOnChain, claimRewardOnChain, getAnalysisFromChain } from "@/lib/web3";
import BuildStamp from "@/components/BuildStamp";

function Typewriter({ text }) {
  const [d, setD] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setD(""); setDone(false); let i = 0;
    const iv = setInterval(() => { if (i < text.length) { setD(text.slice(0, i + 1)); i++; } else { setDone(true); clearInterval(iv); } }, 12);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{d}{!done && <span className="text-[--accent] animate-[blink_0.8s_infinite]">{"\u258C"}</span>}</span>;
}

function WalletDetailContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [txStatus, setTxStatus] = useState("idle");
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);
  const [rewardTxStatus, setRewardTxStatus] = useState("idle");
  const [rewardTxHash, setRewardTxHash] = useState(null);
  const [reward, setReward] = useState(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [onChainData, setOnChainData] = useState(null);

  const handleConnect = useCallback(async () => {
    try {
      const { signer: s, address: addr } = await connectWallet();
      setWalletAddress(addr);
      setSigner(s);
      return s;
    } catch (err) {
      alert(err.message);
      return null;
    }
  }, []);

  // Auto-reconnect
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum?.selectedAddress) handleConnect();
  }, [handleConnect]);

  // Fetch wallet analysis
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    setTxStatus("idle");
    setTxHash(null);
    setRewardClaimed(false);

    // Check if already on-chain
    getAnalysisFromChain(address).then(setOnChainData).catch(() => {});

    fetch(`/api/wallet?address=${encodeURIComponent(address)}`)
      .then((r) => { if (!r.ok) throw new Error("Analysis failed"); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [address]);

  // Submit analysis on-chain
  const submitOnChain = async () => {
    let s = signer;
    if (!s) { s = await handleConnect(); if (!s) return; }

    setTxStatus("pending");
    setTxError(null);
    try {
      const result = await submitAnalysisOnChain(s, data.address, data, data.score, data.archetype);
      setTxHash(result.txHash);
      setTxStatus("confirmed");
      setOnChainData({ exists: true });
    } catch (err) {
      setTxStatus("error");
      setTxError(err.reason || err.message || "Transaction failed");
    }
  };

  // Claim reward on-chain
  const handleClaimReward = async () => {
    if (!data || rewardClaimed) return;
    const info = ARCHETYPES[data.archetype];
    if (!info) return;

    let s = signer;
    if (!s) { s = await handleConnect(); if (!s) return; }

    setRewardTxStatus("pending");
    try {
      const r = info.gameReward || { name: "Troop", rarity: "common", power: 25 };
      const result = await claimRewardOnChain(s, r.name, r.rarity || "common", r.power || 25);
      setRewardTxHash(result.txHash);
      setRewardTxStatus("confirmed");
      setRewardClaimed(true);
      setReward(r);
    } catch (err) {
      setRewardTxStatus("error");
    }
  };

  if (!address) return <div className="text-center py-20"><h2 className="text-xl font-semibold mb-4">Search for a wallet</h2><SearchBar size="lg" /></div>;
  if (loading) return <div className="text-center py-20 fade-in"><div className="inline-block w-8 h-8 border-2 border-[--text-muted] border-t-[--accent] rounded-full animate-spin mb-4" /><p className="text-[--text-secondary]">Analyzing {address.slice(0, 10)}...</p></div>;
  if (error) return <div className="text-center py-20"><p className="text-[--red] mb-4">{error}</p><SearchBar size="lg" /></div>;
  if (!data) return null;

  const info = ARCHETYPES[data.archetype];

  return (
    <div className="fade-in">
      <Link href="/" className="inline-block text-[--text-secondary] text-sm hover:text-[--text-primary] transition-colors py-2 mb-4">&larr; Back</Link>

      {/* Header */}
      <div className="flex justify-between items-start gap-5 flex-wrap mb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-mono text-base font-semibold break-all">{data.address}</h2>
            {(onChainData?.exists || txHash) && <OnChainBadge txHash={txHash} />}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <ArchetypeBadge archetype={data.archetype} />
            {data.secondaryTraits?.map((t) => <ArchetypeBadge key={t} archetype={t} size="sm" />)}
          </div>
        </div>
        <div className="text-right min-w-[140px]">
          <span className="text-[11px] text-[--text-muted] uppercase tracking-wider block mb-1.5">Confidence</span>
          <ConfidenceBar value={data.confidence} />
        </div>
      </div>

      {/* Story */}
      <div className="bg-[--bg-card] border border-[--border] rounded-xl p-6 mb-6 border-l-[3px] border-l-[--accent]">
        <div className="text-[10px] text-[--text-muted] uppercase tracking-[2px] mb-3 font-semibold">Wallet Story</div>
        <p className="text-[15px] leading-[1.7] text-[--text-secondary]"><Typewriter text={data.story} /></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {[
          ["Total Transactions", (data.stats?.totalTx || 0).toLocaleString()],
          ["Total Value", data.stats?.totalValue],
          ["PnL", data.stats?.pnl, data.stats?.pnl?.startsWith("+") ? { color: "var(--green)" } : { color: "var(--red)" }],
          ["Holding Period", data.stats?.holdingPeriod],
          ["First Seen", data.stats?.firstSeen],
          ["Balance", data.stats?.balance],
        ].map(([label, value, style], i) => (
          <div key={i} className="bg-[--bg-card] border border-[--border] rounded-lg p-4">
            <div className="text-[11px] text-[--text-muted] uppercase tracking-wider mb-1.5">{label}</div>
            <div className="font-mono text-base font-bold" style={style || {}}>{value || "—"}</div>
          </div>
        ))}
      </div>

      {/* Chains & Protocols */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold mb-2.5">Chains</h3>
        <div className="flex flex-wrap gap-1.5">{data.stats?.chains?.map((c) => <span key={c} className="bg-[--bg-elevated] border border-[--border] px-3 py-1 rounded-md text-xs text-[--text-secondary] font-mono">{c}</span>)}</div>
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-semibold mb-2.5">Top Protocols</h3>
        <div className="flex flex-wrap gap-1.5">{data.stats?.topProtocols?.map((p) => <span key={p} className="bg-[--bg-elevated] border border-[--border] px-3 py-1 rounded-md text-xs text-[--text-secondary] font-mono">{p}</span>)}</div>
      </div>

      {/* On-Chain Submit Button */}
      {!txHash && !onChainData?.exists && (
        <button
          onClick={submitOnChain}
          disabled={txStatus === "pending"}
          className="w-full py-3.5 bg-[rgba(245,158,11,0.15)] text-[--amber] border border-[rgba(245,158,11,0.25)] rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-[rgba(245,158,11,0.2)] disabled:opacity-50 mt-2 font-mono"
        >
          {txStatus === "pending" ? "⏳ Submitting..." : "⛓️ Store Analysis On-Chain (BSC Testnet)"}
        </button>
      )}
      <TxStatus status={txStatus} txHash={txHash} error={txError} />

      {/* GameFi Reward */}
      {!rewardClaimed && info && (
        <button onClick={handleClaimReward} disabled={rewardTxStatus === "pending"} className="w-full py-4 bg-gradient-to-r from-[--accent] to-sky-300 text-[--bg-primary] border-none rounded-xl text-base font-bold cursor-pointer transition-all hover:scale-[1.01] hover:brightness-110 mt-3 disabled:opacity-50">
          {rewardTxStatus === "pending" ? "⏳ Claiming..." : `${info.gameReward?.icon || "🎁"} Claim Reward: ${info.gameReward?.name || "Item"}`}
        </button>
      )}
      {rewardClaimed && info && (
        <div className="text-center py-4 bg-[rgba(16,185,129,0.1)] text-[--green] rounded-xl font-semibold border border-[rgba(16,185,129,0.2)] mt-3">
          ✓ Claimed on-chain: {info.gameReward?.icon} {info.gameReward?.name}
          {rewardTxHash && (
            <a href={`https://testnet.bscscan.com/tx/${rewardTxHash}`} target="_blank" rel="noopener noreferrer" className="block text-xs underline opacity-70 mt-1">View on BSCScan →</a>
          )}
        </div>
      )}

      <RewardPopup reward={reward} onClose={() => setReward(null)} />
    </div>
  );
}

export default function WalletPage() {
  const [wa, setWa] = useState(null);
  const handleConnect = async () => { try { const { address } = await connectWallet(); setWa(address); } catch {} };
  useEffect(() => { if (typeof window !== "undefined" && window.ethereum?.selectedAddress) handleConnect(); }, []);

  return (
    <div className="min-h-screen">
      <Nav walletAddress={wa} onConnect={handleConnect} />
      <main className="max-w-[960px] mx-auto px-5 pb-20">
        <Suspense fallback={<div className="text-center py-20 text-[--text-muted]">Loading...</div>}>
          <WalletDetailContent />
        </Suspense>
      </main>
      <BuildStamp />
    </div>
  );
}
