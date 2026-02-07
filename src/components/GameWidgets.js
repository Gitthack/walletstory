'use client';

import { useState, useEffect } from 'react';

const RARITY_NAMES = ['Common', 'Rare', 'Epic', 'Legendary'];
const RARITY_CLASSES = ['rarity-common', 'rarity-rare', 'rarity-epic', 'rarity-legendary'];
const RARITY_COLORS = ['#888', 'var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-gold)'];

export function RewardPopup({ reward, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!reward) return null;

  const rarityName = RARITY_NAMES[reward.rarity] || 'Common';
  const rarityClass = RARITY_CLASSES[reward.rarity] || RARITY_CLASSES[0];
  const rarityColor = RARITY_COLORS[reward.rarity] || RARITY_COLORS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}
      onClick={onClose}
    >
      <div
        className={`parchment ${rarityClass} animate-reward-pop max-w-sm mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="parchment-title">⚔️ Reward Obtained! ⚔️</div>
        <div className="text-center">
          <div className="text-6xl mb-4">{reward.icon || '🎁'}</div>
          <div className="text-xl font-bold mb-2" style={{ color: 'var(--parchment-text)' }}>
            {reward.name}
          </div>
          <div className="text-sm font-semibold mb-3" style={{ color: rarityColor }}>
            ★ {rarityName} ★
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm" style={{ color: 'var(--parchment-text)' }}>Power:</span>
            <span className="text-lg font-bold mono" style={{ color: '#8b0000' }}>{reward.power}</span>
          </div>
          {reward.faction && (
            <div className="text-xs font-medium" style={{ color: '#666' }}>
              Faction: {reward.faction}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg text-sm font-bold"
          style={{ background: '#8b0000', color: '#f5e6c8' }}
        >
          Accept Reward
        </button>
      </div>
    </div>
  );
}
