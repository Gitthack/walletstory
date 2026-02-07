// scripts/deploy.js
// Deploy WalletStoryRegistry to BSC Testnet
//
// Usage:
//   npx hardhat run scripts/deploy.js --network bscTestnet

const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying WalletStoryRegistry to BSC Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "tBNB\n");

  // Deploy
  const Factory = await hre.ethers.getContractFactory("WalletStoryRegistry");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ WalletStoryRegistry deployed to:", address);
  console.log("   BSCScan: https://testnet.bscscan.com/address/" + address);

  // Wait for confirmations before verifying
  console.log("\n⏳ Waiting for block confirmations...");
  const tx = contract.deploymentTransaction();
  await tx.wait(3);

  // Verify on BSCScan
  try {
    console.log("\n🔍 Verifying on BSCScan...");
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on BSCScan!");
  } catch (e) {
    if (e.message.includes("Already Verified")) {
      console.log("Contract already verified.");
    } else {
      console.log("Verification failed (you can verify manually later):", e.message);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:        BSC Testnet (chainId 97)");
  console.log("Contract:       WalletStoryRegistry");
  console.log("Address:        " + address);
  console.log("TX Hash:        " + tx.hash);
  console.log("BSCScan:        https://testnet.bscscan.com/address/" + address);
  console.log("TX BSCScan:     https://testnet.bscscan.com/tx/" + tx.hash);
  console.log("=".repeat(60));
  console.log("\n📋 Add to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
