/**
 * Generate deterministic mock features from an address hash.
 * In production, this would call real blockchain APIs (Etherscan, Moralis, etc.)
 */
export function generateMockFeatures(address) {
  if (!address) return null;
  const hash = address.toLowerCase().replace('0x', '');
  const b = (i) => parseInt(hash.slice(i * 2, i * 2 + 2) || '80', 16);

  return {
    address,
    transactionCount: 10 + b(0) * 20,
    uniqueInteractions: 3 + (b(1) % 50),
    avgTxValue: parseFloat((b(2) * 0.05).toFixed(4)),
    maxTxValue: parseFloat((b(3) * 0.5).toFixed(4)),
    totalGasSpent: parseFloat((b(4) * 0.001).toFixed(6)),
    firstTxTimestamp: Date.now() - b(5) * 86400000 * 5,
    lastTxTimestamp: Date.now() - b(6) * 3600000,
    defiInteractions: b(7) % 40,
    nftTransfers: b(8) % 30,
    tokenSwaps: b(9) * 3,
    bridgeTransactions: b(10) % 20,
    lendingOperations: b(11) % 25,
    stakingEvents: b(12) % 15,
    contractCreations: b(13) % 5,
    failedTransactions: b(14) % 10,
    uniqueTokensHeld: 5 + (b(15) % 50),
    chainActivity: {
      ethereum: b(16) > 128,
      bsc: b(17) > 80,
      polygon: b(18) > 100,
      arbitrum: b(19) > 120,
    },
  };
}
