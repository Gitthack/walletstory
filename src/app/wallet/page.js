'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Nav from '@/components/Nav';
import SearchBar from '@/components/SearchBar';
import { ArchetypeBadge, ConfidenceBar } from '@/components/WalletCard';
import { TxStatus, OnChainBadge, ContractLink } from '@/components/TxStatus';
import { RewardPopup } from '@/components/GameWidgets';
import { connectWallet, submitAnalysisOnChain, claimRewardOnChain } from '@/lib/web3';

function WalletContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get('address');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayedStory, setDisplayedStory] = useState('');
  const [txStatus, setTxStatus] = useState({ status: 'idle', txHash: null, error: null });
  const [rewardPopup, setRewardPopup] = useState(null);
  const [onChainData, setOnChainData] = useState(null);
  const typewriterRef = useRef(null);

  // Fetch wallet data
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    setData(null);
    setDisplayedStory('');
    setOnChainData(null);

    fetch(`/api/wallet?address=${address}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.error) throw new Error(result.error);
        setData(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [address]);

  // Typewriter effect
  useEffect(() => {
    if (!data?.story) return;
    let i = 0;
    setDisplayedStory('');
    const interval = setInterval(() => {
      if (i < data.story.length) {
        setDisplayedStory(data.story.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    typewriterRef.current = interval;
    return () => clearInterval(interval);
  }, [data?.story]);

  // Submit analysis on-chain
  async function handleSubmitOnChain() {
    if (!data) return;
    try {
      setTxStatus({ status: 'pending', txHash: null, error: null });
      const wallet = await connectWallet();
      setTxStatus({ status: 'confirming', txHash: null, error: null });
      const result = await submitAnalysisOnChain(
        wallet.signer,
        data.address,
        data.score,
        data.archetype.id
      );
      setTxStatus({ status: 'success', txHash: result.txHash, error: null });
      setOnChainData(result);
    } catch (err) {
      setTxStatus({ status: 'error', txHash: null, error: err.message });
    }
  }

  // Claim reward on-chain
  async function handleClaimReward() {
    if (!data?.archetype?.gameReward) return;
    const reward = data.archetype.gameReward;
    try {
      setTxStatus({ status: 'pending', txHash: null, error: null });
      const wallet = await connectWallet();
      setTxStatus({ status: 'confirming', txHash: null, error: null });
      const result = await claimRewardOnChain(wallet.signer, reward.name, reward.rarity, reward.power);
      setTxStatus({ status: 'success', txHash: result.txHash, error: null });
      setRewardPopup({ ...reward, icon: reward.icon, faction: data.archetype.faction });
    } catch (err) {
      setTxStatus({ status: 'error', txHash: null, error: err.message });
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Nav />
        <div className="max-w-4xl mx-auto px-4 pt-20 text-center">
          <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Analyze a Wallet</h1>
          <SearchBar />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Nav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <SearchBar />

        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">🔍</div>
            <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Analyzing wallet...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">❌</div>
            <div className="text-lg" style={{ color: 'var(--accent-red)' }}>{error}</div>
          </div>
        )}

        {data && (
          <div className="mt-8 space-y-6 animate-slide-up">
            {/* Header */}
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="mono text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Wallet Address</div>
                  <div className="mono text-lg font-semibold break-all" style={{ color: 'var(--text-primary)' }}>
                    {data.address}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArchetypeBadge archetype={data.archetype} size="lg" />
                  <OnChainBadge onChain={!!onChainData} />
                </div>
              </div>
              <ConfidenceBar score={data.score} />
              {data.archetype.cn && (
                <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  三国称号: {data.archetype.cn} · Faction: {data.archetype.faction}
                </div>
              )}
            </div>

            {/* Story */}
            <div className="card">
              <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--accent-gold)' }}>📖 Wallet Story</h2>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)', minHeight: '3rem' }}>
                {displayedStory}
                <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: 'var(--accent-gold)' }} />
              </p>
            </div>

            {/* Stats Grid */}
            {data.stats && (
              <div className="card">
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>📊 Wallet Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Transactions', value: data.stats.txCount, icon: '📝' },
                    { label: 'Volume', value: data.stats.totalVolume, icon: '💰' },
                    { label: 'First Seen', value: data.stats.firstSeen, icon: '📅' },
                    { label: 'Active Chains', value: data.stats.activeChains, icon: '🔗' },
                    { label: 'Risk Level', value: data.stats.riskLevel, icon: '⚠️' },
                    { label: 'Profitability', value: data.stats.profitability, icon: '📈' },
                    { label: 'DEX Swaps', value: data.stats.dexSwaps, icon: '🔄' },
                    { label: 'NFT Trades', value: data.stats.nftTrades, icon: '🎨' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{stat.icon} {stat.label}</div>
                      <div className="text-sm font-bold mono" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* On-Chain Actions */}
            <div className="card">
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>⛓️ On-Chain Actions</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                <button onClick={handleSubmitOnChain} className="btn-primary text-sm">
                  📝 Submit Analysis to BSC
                </button>
                <button onClick={handleClaimReward} className="btn-secondary text-sm">
                  🎁 Claim GameFi Reward
                </button>
              </div>
              <TxStatus {...txStatus} />
              <div className="mt-3">
                <ContractLink />
              </div>
            </div>

            {/* Game Reward Preview */}
            {data.archetype.gameReward && (
              <div className="parchment">
                <div className="parchment-title">⚔️ Three Kingdoms Reward ⚔️</div>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{data.archetype.gameReward.icon}</span>
                  <div>
                    <div className="text-lg font-bold">{data.archetype.gameReward.name}</div>
                    <div className="text-sm">
                      Rarity: {['Common', 'Rare', 'Epic', 'Legendary'][data.archetype.gameReward.rarity]} ·
                      Power: {data.archetype.gameReward.power} ·
                      Faction: {data.archetype.faction}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {rewardPopup && <RewardPopup reward={rewardPopup} onClose={() => setRewardPopup(null)} />}
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-xl" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    }>
      <WalletContent />
    </Suspense>
  );
}
