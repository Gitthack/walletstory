'use client';

export function TxStatus({ status, txHash, error }) {
  if (status === 'idle') return null;

  const styles = {
    pending: { bg: 'rgba(240,192,64,0.1)', border: 'var(--accent-gold)', color: 'var(--accent-gold)', icon: '⏳' },
    confirming: { bg: 'rgba(64,128,240,0.1)', border: 'var(--accent-blue)', color: 'var(--accent-blue)', icon: '🔄' },
    success: { bg: 'rgba(64,208,128,0.1)', border: 'var(--accent-green)', color: 'var(--accent-green)', icon: '✅' },
    error: { bg: 'rgba(224,80,80,0.1)', border: 'var(--accent-red)', color: 'var(--accent-red)', icon: '❌' },
  };

  const s = styles[status] || styles.pending;

  return (
    <div
      className="rounded-lg p-3 flex items-center gap-3 animate-fade-in"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <span className="text-xl">{s.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold" style={{ color: s.color }}>
          {status === 'pending' && 'Waiting for wallet confirmation...'}
          {status === 'confirming' && 'Transaction submitted. Confirming on BSC Testnet...'}
          {status === 'success' && 'Transaction confirmed!'}
          {status === 'error' && (error || 'Transaction failed.')}
        </div>
        {txHash && (
          <a
            href={`https://testnet.bscscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-xs underline mt-1 inline-block"
            style={{ color: s.color }}
          >
            {txHash.slice(0, 12)}...{txHash.slice(-8)}
          </a>
        )}
      </div>
    </div>
  );
}

export function OnChainBadge({ onChain }) {
  if (!onChain) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(64,208,128,0.15)', color: 'var(--accent-green)', border: '1px solid rgba(64,208,128,0.3)' }}>
      ⛓️ On-Chain
    </span>
  );
}

export function ContractLink() {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!addr) return null;
  return (
    <a
      href={`https://testnet.bscscan.com/address/${addr}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs underline"
      style={{ color: 'var(--accent-blue)' }}
    >
      📋 View Contract on BSCScan
    </a>
  );
}
