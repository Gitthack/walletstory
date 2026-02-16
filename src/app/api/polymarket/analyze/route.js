// Polymarket Smart Money API
// 查询 Polymarket 钱包地址的交易历史和胜率

const POLYMARKET_API = "https://clob.polymarket.com";
const API_KEY = process.env.ARKHAM_API_KEY || process.env.POLYMARKET_API_KEY;

// Get wallet positions from Polymarket
async function getWalletPositions(walletAddress) {
  try {
    const response = await fetch(
      `https://data-api.polymarket.com/positions?user=${walletAddress}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching positions:", error);
    return null;
  }
}

// Get position history with outcomes
async function getPositionHistory(walletAddress) {
  try {
    const response = await fetch(
      `https://data-api.polymarket.com/positions?user=${walletAddress}&closed=true`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching history:", error);
    return null;
  }
}

// Get market details
async function getMarketDetails(tokenId) {
  try {
    const response = await fetch(
      `${POLYMARKET_API}/markets?token_id=${tokenId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching market:", error);
    return null;
  }
}

// Calculate win rate from positions
function calculateStats(positions) {
  if (!positions || positions.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfit: 0,
    };
  }

  let winningTrades = 0;
  let losingTrades = 0;
  let totalProfit = 0;
  let totalLoss = 0;

  for (const pos of positions) {
    const pnl = parseFloat(pos.pnl || 0);
    if (pnl > 0) {
      winningTrades++;
      totalProfit += pnl;
    } else if (pnl < 0) {
      losingTrades++;
      totalLoss += Math.abs(pnl);
    }
  }

  const totalTrades = winningTrades + losingTrades;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const netProfit = totalProfit - totalLoss;

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate: Math.round(winRate * 10) / 10,
    totalProfit: Math.round(totalProfit * 100) / 100,
    totalLoss: Math.round(totalLoss * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
  };
}

// Categorize wallet based on trading patterns
function categorizeWallet(positions, stats) {
  const categories = [];
  
  if (stats.totalTrades === 0) {
    return { category: "New Wallet", icon: "🆕", description: "No trading history found" };
  }
  
  // Check for smart money patterns
  if (stats.winRate >= 60 && stats.totalTrades >= 10) {
    categories.push("Smart Money");
  }
  
  if (stats.netProfit > 1000) {
    categories.push("Profitable Whale");
  }
  
  if (stats.totalTrades >= 50) {
    categories.push("Active Trader");
  }
  
  // Check for specific patterns
  const recentTrades = positions.slice(0, 10);
  const avgSize = recentTrades.reduce((sum, p) => sum + (p.size || 0), 0) / recentTrades.length;
  
  if (avgSize > 1000) {
    categories.push("Large Position");
  }
  
  // Check for degen behavior
  if (stats.winRate < 40 && stats.totalTrades > 20) {
    categories.push("Degen");
  }
  
  if (categories.length === 0) {
    categories.push("Regular Trader");
  }
  
  return {
    category: categories[0],
    tags: categories,
    icon: getCategoryIcon(categories[0]),
  };
}

function getCategoryIcon(category) {
  const icons = {
    "Smart Money": "🧠",
    "Profitable Whale": "🐋",
    "Active Trader": "📈",
    "Large Position": "💎",
    "Degen": "🎰",
    "Regular Trader": "👤",
    "New Wallet": "🆕",
  };
  return icons[category] || "👤";
}

// Main handler
export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet")?.toLowerCase();
  
  if (!wallet) {
    return Response.json(
      { error: "Missing wallet address" },
      { status: 400 }
    );
  }
  
  // Validate Ethereum address
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return Response.json(
      { error: "Invalid Ethereum address format" },
      { status: 400 }
    );
  }
  
  try {
    // Fetch all position data
    const [positions, history] = await Promise.all([
      getWalletPositions(wallet),
      getPositionHistory(wallet),
    ]);
    
    const allPositions = [
      ...(positions || []),
      ...(history || []),
    ];
    
    // Calculate stats
    const stats = calculateStats(allPositions);
    
    // Categorize wallet
    const { category, tags, icon } = categorizeWallet(allPositions, stats);
    
    // Get recent trades for display
    const recentTrades = allPositions.slice(0, 20).map((pos) => ({
      market: pos.title || pos.marketQuestion || "Unknown Market",
      outcome: pos.outcome || "pending",
      size: pos.size || 0,
      pnl: pos.pnl || 0,
      closedAt: pos.closedAt || null,
      tokenId: pos.tokenId || null,
    }));
    
    // Return comprehensive response
    return Response.json({
      walletAddress: wallet,
      analyzed: new Date().toISOString(),
      stats,
      category: {
        name: category,
        icon,
        tags,
      },
      recentTrades,
      isSmartMoney: category === "Smart Money" || category === "Profitable Whale",
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: "Failed to analyze wallet", details: error.message },
      { status: 500 }
    );
  }
}