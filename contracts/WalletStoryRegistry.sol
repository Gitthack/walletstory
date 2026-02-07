// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract WalletStoryRegistry {
    enum Archetype { SmartMoney, EarlyAirdropFarmer, DeFiYieldFarmer, NFTFlipper, LongTermHolder, DegenTrader, LiquidityProvider, FreshWallet, ExitLiquidity, BotLikeBehavior }
    struct Analysis { bytes32 analysisHash; uint8 score; Archetype archetype; address analyzer; uint64 timestamp; bool exists; }
    struct GameReward { string rewardName; uint8 rarity; uint8 power; uint64 claimedAt; }
    mapping(bytes32 => Analysis) public analyses;
    mapping(address => GameReward[]) public rewards;
    mapping(address => mapping(uint256 => uint8)) public dailySearches;
    uint256 public totalAnalyses;
    uint256 public totalRewardsClaimed;
    bytes32[] public leaderboardKeys;
    uint8 public constant DAILY_CAP = 10;
    uint8 public constant MAX_LEADERBOARD = 50;
    event WalletAnalyzed(address indexed analyzer, bytes32 indexed walletKey, uint8 score, uint8 archetypeId, bytes32 analysisHash, uint256 timestamp);
    event RewardClaimed(address indexed user, string rewardName, uint8 rarity, uint8 power, uint256 timestamp);
    function submitAnalysis(bytes32 walletKey, bytes32 analysisHash, uint8 score, uint8 archetypeId) external {
        require(score <= 100, "Score 0-100");
        require(archetypeId <= 9, "Invalid archetype");
        uint256 today = block.timestamp / 1 days;
        require(dailySearches[msg.sender][today] < DAILY_CAP, "Daily cap");
        dailySearches[msg.sender][today]++;
        analyses[walletKey] = Analysis(analysisHash, score, Archetype(archetypeId), msg.sender, uint64(block.timestamp), true);
        totalAnalyses++;
        if (leaderboardKeys.length < MAX_LEADERBOARD) { leaderboardKeys.push(walletKey); }
        emit WalletAnalyzed(msg.sender, walletKey, score, archetypeId, analysisHash, block.timestamp);
    }
    function claimReward(string calldata rewardName, uint8 rarity, uint8 power) external {
        require(rarity <= 3 && power <= 100);
        rewards[msg.sender].push(GameReward(rewardName, rarity, power, uint64(block.timestamp)));
        totalRewardsClaimed++;
        emit RewardClaimed(msg.sender, rewardName, rarity, power, block.timestamp);
    }
    function getAnalysis(bytes32 walletKey) external view returns (bytes32, uint8, uint8, address, uint64, bool) {
        Analysis memory a = analyses[walletKey];
        return (a.analysisHash, a.score, uint8(a.archetype), a.analyzer, a.timestamp, a.exists);
    }
    function getRewards(address user) external view returns (GameReward[] memory) { return rewards[user]; }
    function getRewardCount(address user) external view returns (uint256) { return rewards[user].length; }
    function getDailySearchCount(address user) external view returns (uint8) { return dailySearches[user][block.timestamp / 1 days]; }
    function getLeaderboardLength() external view returns (uint256) { return leaderboardKeys.length; }
}
