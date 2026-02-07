'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import { ARCHETYPES, ARCHETYPE_LIST } from '@/lib/archetypes';

const FACTIONS = [
  { name: 'Shu Han', color: '#e05050', icon: '🔴', description: 'The righteous kingdom. Smart Money, Yield Farmers, and Diamond Hands.' },
  { name: 'Wei', color: '#4080f0', icon: '🔵', description: 'The strategic empire. Airdrop Farmers, Degen Traders, and Bots.' },
  { name: 'Wu', color: '#40d080', icon: '🟢', description: 'The maritime kingdom. NFT Flippers and Liquidity Providers.' },
  { name: 'Yellow Turbans', color: '#f0c040', icon: '🟡', description: 'The rebels. Exit Liquidity and chaos agents.' },
];

export default function GameFiPage() {
  const [selectedFaction, setSelectedFaction] = useState(null);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Nav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="parchment mb-8">
          <div className="parchment-title">⚔️ Three Kingdoms of the Chain ⚔️</div>
          <p className="text-center text-sm mb-4" style={{ color: 'var(--parchment-text)' }}>
            Every wallet belongs to a faction. Analyze wallets to earn legendary weapons and artifacts.
            Build your army, increase your power, and dominate the blockchain battlefield.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <div className="text-center px-4 py-2 rounded-lg" style={{ background: 'rgba(139,0,0,0.1)' }}>
              <div className="text-2xl">📜</div>
              <div className="text-xs font-bold" style={{ color: '#8b0000' }}>10 Archetypes</div>
            </div>
            <div className="text-center px-4 py-2 rounded-lg" style={{ background: 'rgba(139,0,0,0.1)' }}>
              <div className="text-2xl">⚔️</div>
              <div className="text-xs font-bold" style={{ color: '#8b0000' }}>4 Factions</div>
            </div>
            <div className="text-center px-4 py-2 rounded-lg" style={{ background: 'rgba(139,0,0,0.1)' }}>
              <div className="text-2xl">🏆</div>
              <div className="text-xs font-bold" style={{ color: '#8b0000' }}>On-Chain Rewards</div>
            </div>
          </div>
        </div>

        {/* Factions */}
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🏯 Factions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {FACTIONS.map((faction) => (
            <div
              key={faction.name}
              className={`card cursor-pointer ${selectedFaction === faction.name ? 'ring-2' : ''}`}
              style={{
                borderColor: selectedFaction === faction.name ? faction.color : undefined,
                ringColor: faction.color,
              }}
              onClick={() => setSelectedFaction(selectedFaction === faction.name ? null : faction.name)}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{faction.icon}</span>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: faction.color }}>{faction.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{faction.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {ARCHETYPE_LIST.filter((a) => a.faction === faction.name).map((a) => (
                  <span
                    key={a.id}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${a.color}20`, color: a.color }}
                  >
                    {a.icon} {a.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* All Archetypes & Rewards */}
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🗡️ Archetypes & Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARCHETYPE_LIST.filter((a) => !selectedFaction || a.faction === selectedFaction).map((archetype) => {
            const rarityNames = ['Common', 'Rare', 'Epic', 'Legendary'];
            const rarityClasses = ['rarity-common', 'rarity-rare', 'rarity-epic', 'rarity-legendary'];
            return (
              <div key={archetype.id} className={`card ${rarityClasses[archetype.gameReward.rarity]}`}>
                <div className="flex items-start gap-3">
                  <span className="text-4xl">{archetype.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold" style={{ color: archetype.color }}>{archetype.label}</h3>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      {archetype.cn} · {archetype.faction}
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {archetype.description}
                    </p>
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span className="text-2xl">{archetype.gameReward.icon}</span>
                      <div>
                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {archetype.gameReward.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {rarityNames[archetype.gameReward.rarity]} · Power: {archetype.gameReward.power}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
