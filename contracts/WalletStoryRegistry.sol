// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WalletStoryRegistry
 * @notice On-chain registry for wallet analysis results.
 *         Each analyzed wallet gets a permanent record:
 *         - analysisHash  (keccak256 of the full story JSON)
 *         - score          (0–100 quality score)
 *         - archetypeId    (0–9 mapping to archetype enum)
 *         - analyzer       (who submitted the analysis)
 *         - timestamp
 *
 *         Also tracks GameFi reward claims per user.
 *
 * @dev    Deployed to BSC Testnet (chainId 97).
 *         No ownership restrictions — anyone can submit analyses.
 */
contract WalletStoryRegistry {

    // ─── ENUMS ───────────────────────────────────────────────
    enum Archetype {
        SmartMoney,          // 0
        EarlyAirdropFarmer,  // 1
        DeFiYieldFarmer,     // 2
        NFTFlipper,          // 3
        LongTermHolder,      // 4
        DegenTrader,         // 5
        LiquidityProvider,   // 6
        FreshWallet,         // 7
        ExitLiquidity,       // 8
        BotLikeBehavior      // 9
    }

    // ─── STRUCTS ─────────────────────────────────────────────
    struct Analysis {
        bytes32  analysisHash;   // keccak256 of story JSON
        uint8    score;          // 0–100
        Archetype archetype;
        address  analyzer;       // who submitted
        uint64   timestamp;
        bool     exists;
    }

    struct GameReward {
        string   rewardName;
        uint8    rarity;         // 0=common, 1=rare, 2=epic, 3=legendary
        uint8    power;
        uint64   claimedAt;
    }

    // ─── STATE ───────────────────────────────────────────────
    // wallet address (lowercase string) => Analysis
    mapping(bytes32 => Analysis) public analyses;

    // analyzer => list of rewards
    mapping(address => GameReward[]) public rewards;

    // analyzer => daily search count tracking
    mapping(address => mapping(uint256 => uint8)) public dailySearches;

    // Global counters
    uint256 public totalAnalyses;
    uint256 public totalRewardsClaimed;

    // Leaderboard: top scored wallet keys (simplified — stores last 50)
    bytes32[] public leaderboardKeys;

    // Constants
    uint8 public constant DAILY_CAP = 10;
    uint8 public constant MAX_LEADERBOARD = 50;

    // ─── EVENTS ──────────────────────────────────────────────
    event WalletAnalyzed(
        address indexed analyzer,
        bytes32 indexed walletKey,
        uint8   score,
        uint8   archetypeId,
        bytes32 analysisHash,
        uint256 timestamp
    );

    event RewardClaimed(
        address indexed user,
        string  rewardName,
        uint8   rarity,
        uint8   power,
        uint256 timestamp
    );

    // ─── CORE FUNCTIONS ──────────────────────────────────────

    /**
     * @notice Submit a wallet analysis on-chain
     * @param walletKey     keccak256(lowercase wallet address string)
     * @param analysisHash  keccak256 of the full analysis JSON
     * @param score         Quality score 0–100
     * @param archetypeId   Archetype enum index 0–9
     */
    function submitAnalysis(
        bytes32 walletKey,
        bytes32 analysisHash,
        uint8   score,
        uint8   archetypeId
    ) external {
        require(score <= 100, "Score must be 0-100");
        require(archetypeId <= 9, "Invalid archetype");

        // Check daily cap
        uint256 today = block.timestamp / 1 days;
        require(dailySearches[msg.sender][today] < DAILY_CAP, "Daily search cap reached");
        dailySearches[msg.sender][today]++;

        // Store analysis (overwrites if already exists)
        analyses[walletKey] = Analysis({
            analysisHash: analysisHash,
            score: score,
            archetype: Archetype(archetypeId),
            analyzer: msg.sender,
            timestamp: uint64(block.timestamp),
            exists: true
        });

        totalAnalyses++;

        // Add to leaderboard
        if (leaderboardKeys.length < MAX_LEADERBOARD) {
            leaderboardKeys.push(walletKey);
        } else {
            // Replace lowest score
            uint256 lowestIdx = 0;
            uint8 lowestScore = 255;
            for (uint256 i = 0; i < leaderboardKeys.length; i++) {
                uint8 s = analyses[leaderboardKeys[i]].score;
                if (s < lowestScore) {
                    lowestScore = s;
                    lowestIdx = i;
                }
            }
            if (score > lowestScore) {
                leaderboardKeys[lowestIdx] = walletKey;
            }
        }

        emit WalletAnalyzed(
            msg.sender,
            walletKey,
            score,
            archetypeId,
            analysisHash,
            block.timestamp
        );
    }

    /**
     * @notice Claim a GameFi reward after analyzing a wallet
     * @param rewardName  Name of the reward
     * @param rarity      0=common, 1=rare, 2=epic, 3=legendary
     * @param power       Power rating 0–100
     */
    function claimReward(
        string calldata rewardName,
        uint8 rarity,
        uint8 power
    ) external {
        require(rarity <= 3, "Invalid rarity");
        require(power <= 100, "Invalid power");

        rewards[msg.sender].push(GameReward({
            rewardName: rewardName,
            rarity: rarity,
            power: power,
            claimedAt: uint64(block.timestamp)
        }));

        totalRewardsClaimed++;

        emit RewardClaimed(
            msg.sender,
            rewardName,
            rarity,
            power,
            block.timestamp
        );
    }

    // ─── VIEW FUNCTIONS ──────────────────────────────────────

    function getAnalysis(bytes32 walletKey) external view returns (
        bytes32 analysisHash,
        uint8   score,
        uint8   archetypeId,
        address analyzer,
        uint64  timestamp,
        bool    exists
    ) {
        Analysis memory a = analyses[walletKey];
        return (a.analysisHash, a.score, uint8(a.archetype), a.analyzer, a.timestamp, a.exists);
    }

    function getRewards(address user) external view returns (GameReward[] memory) {
        return rewards[user];
    }

    function getRewardCount(address user) external view returns (uint256) {
        return rewards[user].length;
    }

    function getDailySearchCount(address user) external view returns (uint8) {
        uint256 today = block.timestamp / 1 days;
        return dailySearches[user][today];
    }

    function getLeaderboardLength() external view returns (uint256) {
        return leaderboardKeys.length;
    }

    function getLeaderboardEntry(uint256 index) external view returns (
        bytes32 walletKey,
        uint8   score,
        uint8   archetypeId,
        address analyzer,
        uint64  timestamp
    ) {
        require(index < leaderboardKeys.length, "Index out of bounds");
        bytes32 key = leaderboardKeys[index];
        Analysis memory a = analyses[key];
        return (key, a.score, uint8(a.archetype), a.analyzer, a.timestamp);
    }
}
