const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistration1155 contract", function () {
  let land, admin, seller, buyer, other;

  /* --------------------------------------------------------------------- */
  /*                               SET-UP                                  */
  /* --------------------------------------------------------------------- */
  beforeEach(async function () {
    [admin, seller, buyer, other] = await ethers.getSigners();

    const Land = await ethers.getContractFactory("LandRegistration1155");
    land = await Land.deploy("ipfs://metadata/{id}.json");
    await land.waitForDeployment();                    // ethers-v6 helper

    /* ── bootstrap roles ── */
    await land.connect(admin).grantSellerRole(seller.address);
    await land.connect(admin).grantBuyerRole(buyer.address);
    // Removed grantRegulatorRole since it doesn't exist in updated contract
  });

  /* --------------------------------------------------------------------- */
  /*                     💠  BASIC LAND REGISTRATION 💠                     */
  /* --------------------------------------------------------------------- */
  it("registers a new land parcel", async function () {
    await expect(
      land
        .connect(seller)
        .registerLand("123 Elm St", 500, 12_345, "Elm House")
    ).to.emit(land, "LandRegistered");

    /* whole-property token ⇒ seller balance must be 1 */
    expect(await land.balanceOf(seller.address, 1n)).to.equal(1n);
  });

  it("prevents duplicate registrations", async function () {
    await land
      .connect(seller)
      .registerLand("123 Elm St", 500, 12_345, "Elm House");

    await expect(
      land
        .connect(seller)
        .registerLand("123 Elm St", 500, 12_345, "Elm House")
    ).to.be.revertedWith("property already registered");
  });

  /* --------------------------------------------------------------------- */
  /*                   💠  WHOLE-PROPERTY SALE FLOW 💠                      */
  /* --------------------------------------------------------------------- */
  it("lists and buys un-shared land", async function () {
    await land
      .connect(seller)
      .registerLand("123 Elm St", 500, 12_345, "Elm House");

    const ONE_ETH = ethers.parseEther("1");

    await land.connect(seller).listWhole(1n, ONE_ETH);

    await expect(() =>
      land.connect(buyer).buyWhole(1n, { value: ONE_ETH })
    ).to.changeEtherBalances([buyer, seller], [-ONE_ETH, ONE_ETH]);

    /* buyer must now own the whole parcel (balance = 1) */
    expect(await land.balanceOf(buyer.address, 1n)).to.equal(1n);

    const [, currentOwner] = await land
      .connect(admin)  // Changed from regulator to admin
      .getLandDetails(1n);

    expect(currentOwner).to.equal(buyer.address);
  });

  /* --------------------------------------------------------------------- */
  /*               💠  FRACTIONAL OWNERSHIP  (SHARES) 💠                    */
  /* --------------------------------------------------------------------- */
  it("fractionalises a parcel and sells shares", async function () {
    /* 1️⃣  register the land */
    await land
      .connect(seller)
      .registerLand("456 Oak St", 750, 67_890, "Oak Villa");

    /* 2️⃣  convert to 100 shares @ 0.1 ETH each */
    const SHARE_PRICE = ethers.parseEther("0.1");
    await land.connect(seller).fractionalise(1n, 100n, SHARE_PRICE);

    /* 3️⃣  buyer purchases 10 shares */
    await expect(() =>
      land
        .connect(buyer)
        .buyShares(1n, 10n, { value: SHARE_PRICE * 10n })
    ).to.changeEtherBalances(
      [buyer, seller],
      [-SHARE_PRICE * 10n, SHARE_PRICE * 10n]
    );

    /* 4️⃣  buyer now owns 10 % of the property */
    const pct = await land.ownershipPercentage(buyer.address, 1n);
    expect(pct).to.equal(10);
  });

  /* --------------------------------------------------------------------- */
  /*                  💠  DATA-ACCESS PERMISSIONS 💠                         */
  /* --------------------------------------------------------------------- */
  it("allows admin to fetch land details", async function () {  // Updated test name
    await land
      .connect(seller)
      .registerLand("123 Elm St", 500, 12_345, "Elm House");

    const [info] = await land.connect(admin).getLandDetails(1n);  // Changed from regulator to admin

    expect(info.propertyAddress).to.equal("123 Elm St");
    expect(info.propertyName).to.equal("Elm House");
  });

  it("reverts for an unauthorized caller", async function () {
    await land
      .connect(seller)
      .registerLand("123 Elm St", 500, 12_345, "Elm House");

    await expect(
      land.connect(other).getLandDetails(1n)
    ).to.be.revertedWith("not authorized");
  });

  it("reverts when querying non-existent land", async function () {
    await expect(
      land.connect(admin).getLandDetails(99n)  // Changed from regulator to admin
    ).to.be.revertedWith("land does not exist");
  });

  /* --------------------------------------------------------------------- */
  /*                     💠  FRAUD DETECTION TESTS 💠                       */
  /* --------------------------------------------------------------------- */
  describe("Volume-Based Fraud Detection", function () {
    beforeEach(async function () {
      // Register a property for testing
      await land
        .connect(seller)
        .registerLand("123 Fraud St", 500, 12_345, "Test House");
      
      const ONE_ETH = ethers.parseEther("1");
      await land.connect(seller).listWhole(1n, ONE_ETH);
    });

    it("tracks transaction count between buyer-seller pairs", async function () {
      const ONE_ETH = ethers.parseEther("1");
      
      // Initial count should be 0
      expect(await land.getTransactionCount(buyer.address, seller.address)).to.equal(0);
      
      // After one transaction, count should be 1
      await land.connect(buyer).buyWhole(1n, { value: ONE_ETH });
      expect(await land.getTransactionCount(buyer.address, seller.address)).to.equal(1);
    });

    it("emits SuspiciousActivity event when approaching fraud threshold", async function () {
      const ONE_ETH = ethers.parseEther("1");
      
      // Create multiple properties and transactions to reach threshold
      for (let i = 2; i <= 9; i++) {
        await land.connect(seller).registerLand(`${i} Fraud St`, 500, 12_345, `House ${i}`);
        await land.connect(seller).listWhole(i, ONE_ETH);
        await land.connect(buyer).buyWhole(i, { value: ONE_ETH });
      }
      
      // The 9th transaction should emit SuspiciousActivity (threshold - 1)
      await land.connect(seller).registerLand("10 Fraud St", 500, 12_345, "House 10");
      await land.connect(seller).listWhole(10n, ONE_ETH);
      
      await expect(
        land.connect(buyer).buyWhole(10n, { value: ONE_ETH })
      ).to.emit(land, "SuspiciousActivity")
       .withArgs(buyer.address, seller.address, 9, 10n);
    });

    it("flags pair and emits PairFlagged event at fraud threshold", async function () {
      const ONE_ETH = ethers.parseEther("1");
      
      // Create multiple transactions to reach the threshold (10)
      for (let i = 2; i <= 10; i++) {
        await land.connect(seller).registerLand(`${i} Fraud St`, 500, 12_345, `House ${i}`);
        await land.connect(seller).listWhole(i, ONE_ETH);
        await land.connect(buyer).buyWhole(i, { value: ONE_ETH });
      }
      
      // The 10th transaction should flag the pair
      await land.connect(seller).registerLand("11 Fraud St", 500, 12_345, "House 11");
      await land.connect(seller).listWhole(11n, ONE_ETH);
      
      await expect(
        land.connect(buyer).buyWhole(11n, { value: ONE_ETH })
      ).to.emit(land, "PairFlagged")
       .withArgs(buyer.address, seller.address, 10);
       
      // Pair should now be flagged
      expect(await land.isPairFlagged(buyer.address, seller.address)).to.be.true;
    });

    it("blocks transactions from flagged pairs", async function () {
      const ONE_ETH = ethers.parseEther("1");
      
      // Manually flag the pair using admin
      await land.connect(admin).setFlaggedPair(buyer.address, seller.address, true);  // Changed from regulator to admin
      
      // Transaction should be blocked
      await expect(
        land.connect(buyer).buyWhole(1n, { value: ONE_ETH })
      ).to.be.revertedWith("Transaction blocked: flagged pair");
    });

    it("allows admin to manually flag/unflag pairs", async function () {  // Updated test name
      // Initially not flagged
      expect(await land.isPairFlagged(buyer.address, seller.address)).to.be.false;
      
      // Admin flags the pair
      await expect(
        land.connect(admin).setFlaggedPair(buyer.address, seller.address, true)  // Changed from regulator to admin
      ).to.emit(land, "PairFlagged");
      
      expect(await land.isPairFlagged(buyer.address, seller.address)).to.be.true;
      
      // Admin unflags the pair
      await land.connect(admin).setFlaggedPair(buyer.address, seller.address, false);  // Changed from regulator to admin
      expect(await land.isPairFlagged(buyer.address, seller.address)).to.be.false;
    });

    it("allows admin to view transaction history", async function () {  // Updated test name
      const ONE_ETH = ethers.parseEther("1");
      
      // Make a few transactions
      await land.connect(buyer).buyWhole(1n, { value: ONE_ETH });
      
      await land.connect(seller).registerLand("2 Fraud St", 500, 12_345, "House 2");
      await land.connect(seller).listWhole(2n, ONE_ETH);
      await land.connect(buyer).buyWhole(2n, { value: ONE_ETH });
      
      // Admin should be able to view history
      const history = await land.connect(admin).getTransactionHistory(buyer.address, seller.address);  // Changed from regulator to admin
      expect(history).to.have.lengthOf(2);
      expect(history[0]).to.equal(1n);
      expect(history[1]).to.equal(2n);
    });

    it("prevents non-admin from viewing transaction history", async function () {  // Updated test name
      await expect(
        land.connect(other).getTransactionHistory(buyer.address, seller.address)
      ).to.be.revertedWithCustomError(land, "AccessControlUnauthorizedAccount");
    });

    it("tracks fraud detection in share transactions", async function () {
      // Register and fractionalize a property
      await land.connect(seller).registerLand("Share St", 500, 12_345, "Share House");
      const SHARE_PRICE = ethers.parseEther("0.1");
      await land.connect(seller).fractionalise(2n, 100n, SHARE_PRICE);
      
      // Initial count should be 0
      expect(await land.getTransactionCount(buyer.address, seller.address)).to.equal(0);
      
      // Buy shares - should increment count
      await land.connect(buyer).buyShares(2n, 10n, { value: SHARE_PRICE * 10n });
      expect(await land.getTransactionCount(buyer.address, seller.address)).to.equal(1);
    });

    it("tracks fraud detection in secondary share transfers", async function () {
      // Setup fractional property
      await land.connect(seller).registerLand("Transfer St", 500, 12_345, "Transfer House");
      const SHARE_PRICE = ethers.parseEther("0.1");
      await land.connect(seller).fractionalise(2n, 100n, SHARE_PRICE);
      
      // Buyer purchases shares
      await land.connect(buyer).buyShares(2n, 10n, { value: SHARE_PRICE * 10n });
      
      // Transfer shares to another user - should track fraud detection
      const initialCount = await land.getTransactionCount(buyer.address, other.address);
      await land.connect(buyer).transferShares(other.address, 2n, 5n);
      
      const newCount = await land.getTransactionCount(buyer.address, other.address);
      expect(newCount).to.equal(initialCount + 1n);
    });

    // NEW: Test admin's regulatory powers
    it("allows admin to delist properties", async function () {
      const ONE_ETH = ethers.parseEther("1");
      
      // Property owner delists normally
      await land.connect(seller).delistWhole(1n);
      
      // List again for admin test
      await land.connect(seller).listWhole(1n, ONE_ETH);
      
      // Admin can also delist (regulatory power)
      await expect(
        land.connect(admin).delistWhole(1n)
      ).to.emit(land, "WholeDelisted");
    });
  });
});
