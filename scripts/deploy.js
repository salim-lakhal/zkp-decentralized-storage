const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("Groth16Verifier deployed to:", verifierAddr);

  // AccessNFT needs the FileRegistry as its owner, but FileRegistry needs
  // the AccessNFT address at construction. We deploy AccessNFT with the
  // deployer as temporary owner, then transfer ownership after FileRegistry
  // is deployed.
  //
  // However, our AccessNFT constructor sets owner = registry directly via
  // Ownable(registry). So we need a two-phase approach: deploy a temporary
  // placeholder, then redeploy with the real address. Instead, we predict
  // the FileRegistry address using the deployer nonce.

  const deployerNonce = await hre.ethers.provider.getTransactionCount(deployer.address);
  // AccessNFT deploy will use nonce `deployerNonce`, FileRegistry will use `deployerNonce + 1`
  const futureRegistryAddr = hre.ethers.getCreateAddress({
    from: deployer.address,
    nonce: deployerNonce + 1,
  });

  const AccessNFT = await hre.ethers.getContractFactory("AccessNFT");
  const accessNFT = await AccessNFT.deploy(futureRegistryAddr);
  await accessNFT.waitForDeployment();
  const accessNFTAddr = await accessNFT.getAddress();
  console.log("AccessNFT deployed to:", accessNFTAddr);

  const FileRegistry = await hre.ethers.getContractFactory("FileRegistry");
  const fileRegistry = await FileRegistry.deploy(verifierAddr, accessNFTAddr);
  await fileRegistry.waitForDeployment();
  const registryAddr = await fileRegistry.getAddress();
  console.log("FileRegistry deployed to:", registryAddr);

  if (registryAddr.toLowerCase() !== futureRegistryAddr.toLowerCase()) {
    console.error("WARNING: predicted registry address mismatch, AccessNFT owner is incorrect");
    process.exit(1);
  }

  console.log("\nDeployment complete:");
  console.log("  Groth16Verifier:", verifierAddr);
  console.log("  AccessNFT:      ", accessNFTAddr);
  console.log("  FileRegistry:   ", registryAddr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
