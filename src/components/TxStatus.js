"use client";

export function TxStatus({ status, txHash, error }) {
  if (!status || status === "idle") return null;

  return (
    <div className={`rounded-lg px-4 py-3 text-sm font-mono mt-3 ${
      status === "pending" ? "bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[--amber]" :
      status === "confirmed" ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[--green]" :
      "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[--red]"
    }`}>
      {status === "pending" && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-[--amber]/30 border-t-[--amber] rounded-full animate-spin" />
          <span>Writing to BSC Testnet...</span>
        </div>
      )}
      {status === "confirmed" && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span>✅ Confirmed on-chain!</span>
          </div>
          {txHash && (
            <a
              href={`https://testnet.bscscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline opacity-70 hover:opacity-100"
            >
              View on BSCScan →
            </a>
          )}
        </div>
      )}
      {status === "error" && (
        <div>❌ {error || "Transaction failed"}</div>
      )}
    </div>
  );
}

export function OnChainBadge({ txHash }) {
  if (!txHash) return null;
  return (
    <a
      href={`https://testnet.bscscan.com/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-[rgba(245,158,11,0.1)] text-[--amber] border border-[rgba(245,158,11,0.15)] hover:brightness-125 transition-all"
    >
      ⛓️ On-chain
    </a>
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
      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[--text-muted] hover:text-[--text-secondary] transition-colors"
    >
      📜 Contract: {addr.slice(0, 6)}…{addr.slice(-4)} · BSC Testnet
    </a>
  );
}
