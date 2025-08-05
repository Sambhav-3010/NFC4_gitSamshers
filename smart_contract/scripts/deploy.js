// scripts/deployLandRegistration1155.js
// Usage:
// npx hardhat run scripts/deployLandRegistration1155.js           (local node)
// npx hardhat run scripts/deployLandRegistration1155.js --network sepolia

const hre = require("hardhat");

async function main() {
  /* ────────────────────────── 1. signers ────────────────────────── */
  const [deployer, seller, buyer, regulator] = await hre.ethers.getSigners();

  console.log("Deployer  (admin):", deployer.address);
  console.log("Sample Seller   :", seller.address);
  console.log("Sample Buyer    :", buyer.address);
  console.log("Sample Regulator:", regulator.address);

  /* ───────────────────────── 2. deployment ──────────────────────── */
  const Land1155 = await hre.ethers.getContractFactory("LandRegistration1155");

  // Pass a default metadata URI for ERC-1155 (can be blank "")
  const land = await Land1155.deploy("ipfs://metadata/{id}.json");
  await land.waitForDeployment();

  console.log("\n✅  LandRegistration1155 deployed at:", await land.getAddress());

  /* ─────────────── 3. optional role boot-strapping ─────────────── */
  // Deployer already has DEFAULT_ADMIN_ROLE & REGULATOR_ROLE

  await (await land.grantSellerRole(seller.address)).wait();
  await (await land.grantBuyerRole(buyer.address)).wait();
  await (await land.grantRegulatorRole(regulator.address)).wait();

  console.log("\n🎉  Initial roles granted:");
  console.log("   • Seller   →", seller.address);
  console.log("   • Buyer    →", buyer.address);
  console.log("   • Regulator→", regulator.address);

  /* ───────────────── 4. fraud detection info ─────────────── */
  console.log("\n🔍  Fraud Detection Features:");
  
  // Display fraud threshold
  const fraudThreshold = await land.FRAUD_THRESHOLD();
  console.log("   • Volume Fraud Threshold:", fraudThreshold.toString(), "transactions");
  
  // Check initial transaction count (should be 0)
  const initialCount = await land.getTransactionCount(buyer.address, seller.address);
  console.log("   • Initial transaction count (buyer↔seller):", initialCount.toString());
  
  // Check if pair is flagged (should be false)
  const isFlagged = await land.isPairFlagged(buyer.address, seller.address);
  console.log("   • Pair flagged status:", isFlagged);

  /* ─────────────── 5. setup event listeners ─────────────── */
  console.log("\n👂  Setting up fraud detection event listeners...");
  
  // Listen for suspicious activity
  land.on("SuspiciousActivity", (buyer, seller, count, landId, event) => {
    console.log(`🚨 SUSPICIOUS ACTIVITY DETECTED:`);
    console.log(`   Buyer: ${buyer}`);
    console.log(`   Seller: ${seller}`);
    console.log(`   Transaction Count: ${count}`);
    console.log(`   Land ID: ${landId}`);
    console.log(`   Block: ${event.blockNumber}`);
  });

  // Listen for flagged pairs
  land.on("PairFlagged", (buyer, seller, totalTransactions, event) => {
    console.log(`🚩 PAIR FLAGGED FOR FRAUD:`);
    console.log(`   Buyer: ${buyer}`);
    console.log(`   Seller: ${seller}`);
    console.log(`   Total Transactions: ${totalTransactions}`);
    console.log(`   Block: ${event.blockNumber}`);
  });

  console.log("✅  Event listeners active!");

  /* ────────────── 6. example transaction for testing ──────────── */
  if (process.env.DEMO_TRANSACTIONS === "true") {
    console.log("\n🧪  Running demo transactions...");
    
    try {
      // Register a test property
      const tx1 = await land.connect(seller).registerLand(
        "123 Demo Street",
        1000,
        12345,
        "Demo Property"
      );
      await tx1.wait();
      console.log("   ✓ Demo property registered (Land ID: 1)");

      // List the property
      const price = hre.ethers.parseEther("1.0");
      const tx2 = await land.connect(seller).listWhole(1, price);
      await tx2.wait();
      console.log("   ✓ Property listed for 1 ETH");

      // Make a purchase to test fraud detection
      const tx3 = await land.connect(buyer).buyWhole(1, { value: price });
      await tx3.wait();
      console.log("   ✓ Property purchased by buyer");

      // Check transaction count after purchase
      const newCount = await land.getTransactionCount(buyer.address, seller.address);
      console.log("   • Transaction count after purchase:", newCount.toString());

      console.log("\n📝  To test fraud detection:");
      console.log("   • Run multiple buyWhole/sellWhole cycles between same pair");
      console.log("   • Fraud detection triggers after", fraudThreshold.toString(), "transactions");
      
    } catch (error) {
      console.log("   ⚠️  Demo transactions failed (this is normal on testnets)");
      console.log("   Error:", error.message);
    }
  }

  /* ────────────── 7. fraud detection summary ──────────── */
  console.log("\n🛡️  Fraud Detection Summary:");
  console.log("   📊 Volume-Based Detection:");
  console.log("      • Tracks total transactions between pairs");
  console.log("      • Flags after", fraudThreshold.toString(), "transactions");
  console.log("      • Prevents wash trading through high volume");
  
  console.log("   🔧 Regulator Controls:");
  console.log("      • Manual flagging/unflagging of pairs");
  console.log("      • Transaction history viewing");
  console.log("      • Comprehensive oversight tools");

  console.log("\n🎯  Deployment complete! Contract features:");
  console.log("   • Land registration & trading ✓");
  console.log("   • Fractional ownership ✓");
  console.log("   • Role-based access control ✓");
  console.log("   • Volume-based fraud detection ✓");
  console.log("   • Transaction monitoring ✓");
  console.log("   • Regulatory oversight ✓");
}

/* ────────────────────────── run script ─────────────────────────── */
main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
