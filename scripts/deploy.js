const hre = require("hardhat");
async function main() {
  console.log("Deploying WalletStoryRegistry to BSC Testnet...");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "tBNB");
  const Factory = await hre.ethers.getContractFactory("WalletStoryRegistry");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const tx = contract.deploymentTransaction();
  console.log("");
  console.log("=".repeat(50));
  console.log("SUCCESS!");
  console.log("=".repeat(50));
  console.log("Contract:", address);
  console.log("TX Hash: ", tx.hash);
  console.log("BSCScan: ", "https://testnet.bscscan.com/address/" + address);
  console.log("TX Link: ", "https://testnet.bscscan.com/tx/" + tx.hash);
  console.log("=".repeat(50));
  console.log("");
  console.log("NEXT: Add this to .env.local:");
  console.log("NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
