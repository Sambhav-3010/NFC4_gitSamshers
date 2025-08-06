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

    /* ── UPDATED: No manual role granting needed due to auto-roles ── */
    // Users will get auto-roles when they first interact with the contract
    // Admin can no longer manually grant roles - fully automated system
  });

  /* --------------------------------------------------------------------- */
  /*                     💠  AUTO-ROLE SYSTEM TESTS 💠                      */
  /* --------------------------------------------------------------------- */
  describe("Auto-Role System", function () {
    it("grants roles automatically on first interaction", async function () {
      // Initially, user should not have auto roles
      expect(await land.hasAutoRoles(seller.address)).to.be.false;
      
      // Register land (first interaction) - should auto-grant roles
      await expect(
        land.connect(seller).registerLand("123 Auto St", 500, 12345, "Auto House")
      ).to.emit(land, "AutoRolesGranted").withArgs(seller.address);
      
      // User should now have auto roles
      expect(await land.hasAutoRoles(seller.address)).to.be.true;
      
      // Verify user has both buyer and seller roles
      const [isBuyer, isSeller, isAdmin] = await land.getUserRoles(seller.address);
      expect(isBuyer).to.be.true;
      expect(isSeller).to.be.true;
      expect(isAdmin).to.be.false;
    });

    it("allows explicit role requesting", async function () {
      // Initially, user should not have roles
      const [initialBuyer, initialSeller] = await land.getUserRoles(buyer.address);
      expect(initialBuyer).to.be.false;
      expect(initialSeller).to.be.false;
      
      // Explicitly request auto roles
      await expect(
        land.connect(buyer).requestAutoRoles()
      ).to.emit(land, "AutoRolesGranted").withArgs(buyer.address);
      
      // User should now have both roles
      const [finalBuyer, finalSeller] = await land.getUserRoles(buyer.address);
      expect(finalBuyer).to.be.true;
      expect(finalSeller).to.be.true;
    });

    it("prevents admin from getting auto roles", async function () {
      await expect(
        land.connect(admin).requestAutoRoles()
      ).to.be.revertedWith("Admin doesn't need auto roles");
    });

    it("prevents duplicate auto role grants", async function () {
      // First request should succeed
      await land.connect(other).requestAutoRoles();
      
      // Second request should fail
      await expect(
        land.connect(other).requestAutoRoles()
      ).to.be.revertedWith("Roles already granted");
    });
  });

  /* --------------------------------------------------------------------- */
  /*                     💠  BASIC LAND REGISTRATION 💠                     */
  /* --------------------------------------------------------------------- */
  it("registers a new land parcel with auto-role granting", async function () {
    // This should auto-grant roles and register the land
    await expect(
      land.connect(seller).registerLand("123 Elm St", 500, 12_345, "Elm House")
    ).to.emit(land, "AutoRolesGranted").withArgs(seller.address)
     .and.to.emit(land, "LandRegistered");

    /* whole-property token ⇒ seller balance must be 1 */
    expect(await land.balanceOf(seller.address, 1n)).to.equal(1n);
    
    // Verify seller got auto roles
    expect(await land.hasAutoRoles(seller.address)).to.be.true;
  });

  it("prevents duplicate registrations", async function () {
    await land.connect(seller).registerLand("123 Elm St", 500, 12_345, "Elm House");

    await expect(
      land.connect(seller).registerLand("123 Elm St", 500, 12_345, "Elm House")
    ).to.be.revertedWith("property already registered");
  });

  /* --------------------------------------------------------------------- */
  /*                   💠  WHOLE-PROPERTY SALE FLOW 💠                      */
  /* --------------------------------------------------------------------- */
  it("lists and buys un-shared land with auto-roles", async function () {
    // Register land (seller gets auto-roles)
    await land.connect(seller).registerLand("123 Elm St", 500, 12_345, "Elm House");

    const ONE_ETH = ethers.parseEther("1");

    // List property (seller already has roles)
    await land.connect(seller).listWhole(1n, ONE_ETH);

    // Buy property (buyer gets auto-roles during purchase)
    await expect(() =>
      land.connect(buyer).buyWhole(1n, { value: ONE_ETH })
    ).to.changeEtherBalances([buyer, seller], [-ONE_ETH, ONE_ETH]);

    /* buyer must now own the whole parcel (balance = 1) */
    expect(await land.balanceOf(buyer.address, 1n)).to.equal(1n);

    // Buyer should have received auto-roles
    expect(await land.hasAutoRoles(buyer.address)).to.be.true;

    const [, currentOwner] = await land.connect(admin).getLandDetails(1n);
    expect(currentOwner).to.equal(buyer.address);
  });

  /* --------------------------------------------------------------------- */
  /*               💠  FRACTIONAL OWNERSHIP  (SHARES) 💠                    */
  /* --------------------------------------------------------------------- */
  it("fractionalises a parcel and sells shares with auto-roles", async function () {
    /* 1️⃣  register the land (seller gets auto-roles) */
    await land.connect(seller).registerLand("456 Oak St", 750, 67_890, "Oak Villa");

    /* 2️⃣  convert to 100 shares @ 0.1 ETH each */
    const SHARE_PRICE = ethers.parseEther("0.1");
    await land.connect(seller).fractionalise(1n, 100n, SHARE_PRICE);

    /* 3️⃣  buyer purchases 10 shares (gets auto-roles) */
    await expect(() =>
      land.connect(buyer).buyShares(1n, 10n, { value: SHARE_PRICE * 10n })
    ).to.changeEtherBalances(
      [buyer, seller],
      [-SHARE_PRICE * 10n, SHARE_PRICE * 10n]
    );

    /* 4️⃣  buyer now owns 10 % of the property */
    const pct = await land.ownershipPercentage(buyer.address, 1n);
    expect(pct).to.equal(10);
    
    // Buyer should have received auto-roles
    expect(await land.hasAutoRoles(buyer.address)).to.be.true;
  });

  /* --------------------------------------------------------------------- */
  /*                  💠  DATA-ACCESS PERMISSIONS 💠                         */
  /* --------------------------------------------------------------------- */
  it("allows admin to fetch land details", async function () {
    await land.connect(seller).registerLand("123 Elm St", 500, 12_345, "Elm House");

    const [info] = await land.connect(admin).getLandDetails(1n);

    expect(info.propertyAddress).to.equal("123 Elm St");
    expect(info.propertyName).to.equal("Elm House");
  });

  it("allows users with auto-roles to fetch land details", async function () {
    await land.connect(seller).registerLand("123 Elm St", 500, 12_345, "Elm House");
    
    // Grant buyer auto-roles
    await land.connect(buyer).requestAutoRoles();
    
    // Buyer should now be able to access land details
    const [info] = await land.connect(buyer).getLandDetails(1n);
    expect(info.propertyAddress).to.equal("123 Elm St");
  });

  it("reverts for users without any roles", async function () {
    await land.connect(seller).registerLand("123 Elm St", 500, 12_345, "Elm House");

    // 'other' user has no roles and hasn't interacted
    await expect(
      land.connect(other).getLandDetails(1n)
    ).to.be.revertedWith("not authorized");
  });

  it("reverts when querying non-existent land", async function () {
    await expect(
      land.connect(admin).getLandDetails(99n)
    ).to.be.revertedWith("land does not exist");
  });

  /* --------------------------------------------------------------------- */
  /*                     💠  FRAUD DETECTION TESTS 💠                       */
  /* --------------------------------------------------------------------- */
  describe("Volume-Based Fraud Detection", function () {
    beforeEach(async function () {
      // Register a property for testing (seller gets auto-roles)
      await land.connect(seller).registerLand("123 Fraud St", 500, 12_345, "Test House");
      
      const ONE_ETH = ethers.parseEther("1");
      await land.connect(seller).listWhole(1n, ONE_ETH);
    });

    it("tracks transaction count between buyer-seller pairs", async function () {
      const ONE_ETH = ethers.parseEther("1");
      
      // Initial count should be 0
      expect(await land.getTransactionCount(buyer.address, seller.address)).to.equal(0);
      
      // After one transaction, count should be 1 (buyer gets auto-roles)
      await land.connect(buyer).buyWhole(1n, { value: ONE_ETH });
      expect(await land.getTransactionCount(buyer.address, seller.address)).to.equal(1);
    });

    it("emits SuspiciousActivity event when approaching fraud threshold", async function () {
      const ONE_ETH = ethers.parseEther("1");
      
      // Grant buyer auto-roles first
      await land.connect(buyer).requestAutoRoles();
      
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
      
      // Grant buyer auto-roles first
      await land.connect(buyer).requestAutoRoles();
      
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
      
      // Grant buyer auto-roles first
      await land.connect(buyer).requestAutoRoles();
      
      // Manually flag the pair using admin
      await land.connect(admin).setFlaggedPair(buyer.address, seller.address, true);
      
      // Transaction should be blocked
      await expect(
        land.connect(buyer).buyWhole(1n, { value: ONE_ETH })
      ).to.be.revertedWith("Transaction blocked: flagged pair");
    });

    it("allows admin to manually flag/unflag pairs", async function () {
      // Initially not flagged
      expect(await land.isPairFlagged(buyer.address, seller.address)).to.be.false;
      
      // Admin flags the pair
      await expect(
        land.connect(admin).setFlaggedPair(buyer.address, seller.address, true)
      ).to.emit(land, "PairFlagged");
      
      expect(await land.isPairFlagged(buyer.address, seller.address)).to.be.true;
      
      // Admin unflags the pair
      await land.connect(admin).setFlaggedPair(buyer.address, seller.address, false);
      expect(await land.isPairFlagged(buyer.address, seller.address)).to.be.false;
    });

    it("allows admin to view transaction history", async function () {
      const ONE_ETH = ethers.parseEther("1");
      
      // Grant buyer auto-roles first
      await land.connect(buyer).requestAutoRoles();
      
      // Make a few transactions
      await land.connect(buyer).buyWhole(1n, { value: ONE_ETH });
      
      await land.connect(seller).registerLand("2 Fraud St", 500, 12_345, "House 2");
      await land.connect(seller).listWhole(2n, ONE_ETH);
      await land.connect(buyer).buyWhole(2n, { value: ONE_ETH });
      
      // Admin should be able to view history
      const history = await land.connect(admin).getTransactionHistory(buyer.address, seller.address);
      expect(history).to.have.lengthOf(2);
      expect(history[0]).to.equal(1n);
      expect(history[1]).to.equal(2n);
    });

    it("prevents non-admin from viewing transaction history", async function () {
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
      
      // Buy shares - should increment count (buyer gets auto-roles)
      await land.connect(buyer).buyShares(2n, 10n, { value: SHARE_PRICE * 10n });
      expect(await land.getTransactionCount(buyer.address, seller.address)).to.equal(1);
    });


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

  /* --------------------------------------------------------------------- */
  /*              💠  NO MANUAL ROLE MANAGEMENT TESTS 💠                    */
  /* --------------------------------------------------------------------- */
  describe("No Manual Role Management (Fully Automated)", function () {
    it("admin cannot manually grant roles - functions don't exist", async function () {
      // These functions should not exist in the contract
      // The contract should throw an error if we try to call them
      await expect(() => {
        // @ts-ignore - This will fail at runtime since function doesn't exist
        return land.connect(admin).grantBuyerRole(other.address);
      }).to.throw();
      
      await expect(() => {
        // @ts-ignore - This will fail at runtime since function doesn't exist
        return land.connect(admin).grantSellerRole(other.address);
      }).to.throw();
    });

    it("admin cannot revoke roles - functions don't exist", async function () {
      // First grant auto-roles
      await land.connect(other).requestAutoRoles();
      
      // These functions should not exist in the contract
      await expect(() => {
        // @ts-ignore - This will fail at runtime since function doesn't exist
        return land.connect(admin).revokeBuyerRole(other.address);
      }).to.throw();
      
      await expect(() => {
        // @ts-ignore - This will fail at runtime since function doesn't exist
        return land.connect(admin).revokeSellerRole(other.address);
      }).to.throw();
    });

    it("only auto-role system works for role assignment", async function () {
      // Initially, other user has no roles
      const [initialBuyer, initialSeller] = await land.getUserRoles(other.address);
      expect(initialBuyer).to.be.false;
      expect(initialSeller).to.be.false;
      
      // Only way to get roles is through auto-role system
      await land.connect(other).requestAutoRoles();
      
      // Now user should have both roles
      const [finalBuyer, finalSeller] = await land.getUserRoles(other.address);
      expect(finalBuyer).to.be.true;
      expect(finalSeller).to.be.true;
      
      // Verify auto-role tracking
      expect(await land.hasAutoRoles(other.address)).to.be.true;
    });

    it("demonstrates fully decentralized onboarding", async function () {
      // New users can get roles without any admin intervention
      const newUsers = [seller, buyer, other];
      
      for (let i = 0; i < newUsers.length; i++) {
        const user = newUsers[i];
        
        // Each user can independently get roles
        await land.connect(user).requestAutoRoles();
        
        // Verify they received both roles
        const [isBuyer, isSeller, isAdmin] = await land.getUserRoles(user.address);
        expect(isBuyer).to.be.true;
        expect(isSeller).to.be.true;
        expect(isAdmin).to.be.false;
        
        // Verify auto-role tracking
        expect(await land.hasAutoRoles(user.address)).to.be.true;
      }
      
      console.log("✅ All users successfully onboarded without admin intervention");
    });
  });
});
