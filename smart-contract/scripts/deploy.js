const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying SecureChainFlow smart contract...");

  const SecureChainFlow = await hre.ethers.getContractFactory("SecureChainFlow");
  const contract = await SecureChainFlow.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`SecureChainFlow deployed successfully to: ${contractAddress}`);

  // Prepare artifact exports
  const contractArtifact = await hre.artifacts.readArtifact("SecureChainFlow");
  
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
    abi: contractArtifact.abi
  };

  // Paths to sync contract info
  const backendPath = path.join(__dirname, "../../backend/contractInfo.json");
  const frontendPath = path.join(__dirname, "../../frontend/src/contractInfo.json");

  try {
    fs.writeFileSync(backendPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Saved deployment info to Backend: ${backendPath}`);
  } catch (err) {
    console.warn("Could not save to backend directory:", err.message);
  }

  try {
    fs.writeFileSync(frontendPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Saved deployment info to Frontend: ${frontendPath}`);
  } catch (err) {
    console.warn("Could not save to frontend directory:", err.message);
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
