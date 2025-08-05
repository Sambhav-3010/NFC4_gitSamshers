// scripts/deployLandRegistration1155.js
// Usage:
// npx hardhat run scripts/deployLandRegistration1155.js           (local node)
// npx hardhat run scripts/deployLandRegistration1155.js --network sepolia

const hre = require("hardhat");

async function main() {
  /* ────────────────────────── 1. signers ────────────────────────── */
  const [deployer, seller, buyer, other] = await hre.ethers.getSigners();

  console.log("Deployer  (admin):", deployer.address);
  console.log("Sample Seller   :", seller.address);
  console.log("Sample Buyer    :", buyer.address);
  console.log("Sample Other    :", other.address);

  /* ───────────────────────── 2. deployment ──────────────────────── */
  const Land1155 = await hre.ethers.getContractFactory("LandRegistration1155");

  // Pass a default metadata URI for ERC-1155 (can be blank "")
  const land = await Land1155.deploy("ipfs://metadata/{id}.json");
  await land.waitForDeployment();

  console.log("\n✅  LandRegistration1155 deployed at:", await land.getAddress());

  /* ─────────────── 3. Auto-role system testing ─────────────── */
  console.log("\n🤖  Testing Auto-Role System...");
  
  // Check if users have auto roles initially (should be false)
  const sellerHasAutoRoles = await land.hasAutoRoles(seller.address);
  const buyerHasAutoRoles = await land.hasAutoRoles(buyer.address);
  console.log("   • Seller has auto roles initially:", sellerHasAutoRoles);
  console.log("   • Buyer has auto roles initially:", buyerHasAutoRoles);

  // Test explicit auto-role requesting
  await (await land.connect(seller).requestAutoRoles()).wait();
  await (await land.connect(buyer).requestAutoRoles()).wait();
  
  console.log("\n🎉  Auto-roles granted:");
  console.log("   • Seller   →", seller.address, "(auto-granted BUYER + SELLER roles)");
  console.log("   • Buyer    →", buyer.address, "(auto-granted BUYER + SELLER roles)");
  console.log("   • Admin    →", deployer.address, "(DEFAULT_ADMIN_ROLE + regulatory functions only)");

  // Verify roles were granted correctly
  const [sellerIsBuyer, sellerIsSeller, sellerIsAdmin] = await land.getUserRoles(seller.address);
  const [buyerIsBuyer, buyerIsSellerToo, buyerIsAdmin] = await land.getUserRoles(buyer.address);
  const [adminIsBuyer, adminIsSeller, adminIsAdmin] = await land.getUserRoles(deployer.address);

  console.log("\n✅  Role verification:");
  console.log("   • Seller roles: Buyer=" + sellerIsBuyer + ", Seller=" + sellerIsSeller + ", Admin=" + sellerIsAdmin);
  console.log("   • Buyer roles: Buyer=" + buyerIsBuyer + ", Seller=" + buyerIsSellerToo + ", Admin=" + buyerIsAdmin);
  console.log("   • Admin roles: Buyer=" + adminIsBuyer + ", Seller=" + adminIsSeller + ", Admin=" + adminIsAdmin);

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
  console.log("\n👂  Setting up event listeners...");
  
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

  // Listen for auto-role grants
  land.on("AutoRolesGranted", (user, event) => {
    console.log(`🎭 AUTO-ROLES GRANTED:`);
    console.log(`   User: ${user}`);
    console.log(`   Block: ${event.blockNumber}`);
  });

  console.log("✅  Event listeners active!");

  /* ────────────── 6. example transaction for testing ──────────── */
  if (process.env.DEMO_TRANSACTIONS === "true") {
    console.log("\n🧪  Running demo transactions...");
    
    try {
      // Test auto-role granting with actual transactions
      console.log("\n🔄  Testing auto-role functionality with transactions...");
      
      // 'other' user will get auto-roles when they first interact
      const hasAutoRolesBefore = await land.hasAutoRoles(other.address);
      console.log("   • Other user has auto roles before transaction:", hasAutoRolesBefore);

      // Register a test property (seller already has roles)
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

      // Test auto-role granting with 'other' user
      const tx4 = await land.connect(other).registerLand(
        "456 Auto Street",
        750,
        54321,
        "Auto Role Property"
      );
      await tx4.wait();
      console.log("   ✓ Other user registered property (auto-roles should be granted)");

      // Check if 'other' user got auto-roles
      const hasAutoRolesAfter = await land.hasAutoRoles(other.address);
      const [otherIsBuyer, otherIsSeller, otherIsAdmin] = await land.getUserRoles(other.address);
      console.log("   • Other user has auto roles after transaction:", hasAutoRolesAfter);
      console.log("   • Other user roles: Buyer=" + otherIsBuyer + ", Seller=" + otherIsSeller + ", Admin=" + otherIsAdmin);

      // Check transaction count after purchase
      const newCount = await land.getTransactionCount(buyer.address, seller.address);
      console.log("   • Transaction count after purchase:", newCount.toString());

      // Test admin regulatory functions
      console.log("\n🔧  Testing admin regulatory functions...");
      
      // Admin can view transaction history
      const history = await land.connect(deployer).getTransactionHistory(buyer.address, seller.address);
      console.log("   • Transaction history length:", history.length);
      
      // Admin can manually flag pairs (for testing)
      await land.connect(deployer).setFlaggedPair(other.address, seller.address, true);
      console.log("   ✓ Admin manually flagged test pair");
      
      // Check if pair is flagged
      const testFlagged = await land.isPairFlagged(other.address, seller.address);
      console.log("   • Test pair flagged status:", testFlagged);

      console.log("\n📝  To test fraud detection:");
      console.log("   • Run multiple buyWhole/sellWhole cycles between same pair");
      console.log("   • Fraud detection triggers after", fraudThreshold.toString(), "transactions");
      console.log("   • Auto-roles are granted on first interaction with any function");
      
    } catch (error) {
      console.log("   ⚠️  Demo transactions failed (this is normal on testnets)");
      console.log("   Error:", error.message);
    }
  }

  /* ────────────── 7. updated system summary ──────────── */
  console.log("\n🛡️  Enhanced System Summary:");
  console.log("   📊 Volume-Based Fraud Detection:");
  console.log("      • Tracks total transactions between pairs");
  console.log("      • Flags after", fraudThreshold.toString(), "transactions");
  console.log("      • Prevents wash trading through high volume");
  
  console.log("   🤖 Fully Automated Role System:");
  console.log("      • Users automatically get BUYER + SELLER roles");
  console.log("      • Triggered on first contract interaction");
  console.log("      • No admin approval needed - completely automated");
  console.log("      • One-time grant per address");
  console.log("      • No manual role management by admin");
  
  console.log("   🔧 Admin Controls (Limited to Regulatory Functions):");
  console.log("      • Manual flagging/unflagging of pairs");
  console.log("      • Transaction history viewing");
  console.log("      • Fraud detection oversight");
  console.log("      • Emergency property delisting");

  console.log("\n🎯  Deployment complete! Contract features:");
  console.log("   • Land registration & trading ✓");
  console.log("   • Fractional ownership ✓");
  console.log("   • Fully automated role granting ✓");
  console.log("   • Volume-based fraud detection ✓");
  console.log("   • Transaction monitoring ✓");
  console.log("   • Admin regulatory oversight (no role management) ✓");

  console.log("\n📋  Final Role Structure:");
  console.log("   • Admin (DEFAULT_ADMIN_ROLE): Fraud detection & emergency controls only");
  console.log("   • Regular Users: Auto-granted BUYER + SELLER roles on first interaction");
  console.log("   • Zero waiting time - immediate platform access");
  console.log("   • No manual role management - fully decentralized user onboarding");

  console.log("\n🚀  Ready for users! Completely automated trading permissions.");
  console.log("   • Users get instant access upon first interaction");
  console.log("   • Admin cannot control user role assignment");
  console.log("   • Truly decentralized user onboarding experience");
}

/* ────────────────────────── run script ─────────────────────────── */
main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
