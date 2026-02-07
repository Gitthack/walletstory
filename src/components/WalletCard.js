'use client';

import Link from 'next/link';

export function ArchetypeBadge({ archetype, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        background: `${archetype.color}20`,
        color: archetype.color,
        border: `1px solid ${archetype.color}40`,
      }}
    >
      <span>{archetype.icon}</span>
      <span>{archetype.label}</span>
    </span>
  );
}

export function ConfidenceBar({ score, label = 'Confidence Score' }) {
  const color = score >= 80 ? 'var(--accent-green)' : score >= 50 ? 'var(--accent-gold)' : 'var(--accent-red)';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-sm font-bold mono" style={{ color }}>{score}/100</span>
      </div>
      <div className="score-bar">
        <div
          className="score-bar-fill"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
    </div>
  );
}

export function WalletCard({ address, archetype, score, story, label }) {
  const displayAddress = address ? `${address.slice(0, 10)}...${address.slice(-8)}` : '';

  return (
    <Link href={`/wallet?address=${address}`}>
      <div className="card cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div>
            {label && (
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--accent-gold)' }}>{label}</div>
            )}
            <div className="mono text-sm" style={{ color: 'var(--text-secondary)' }}>{displayAddress}</div>
          </div>
          <ArchetypeBadge archetype={archetype} size="sm" />
        </div>
        <ConfidenceBar score={score} />
        {story && (
          <p className="mt-3 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {story}
          </p>
        )}
      </div>
    </Link>
  );
}
