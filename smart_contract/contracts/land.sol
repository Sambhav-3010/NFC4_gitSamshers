// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract LandRegistration1155 is ERC1155, AccessControl {
    /* ─────────────── roles ─────────────── */
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");
    bytes32 public constant SELLER_ROLE    = keccak256("SELLER_ROLE");
    bytes32 public constant BUYER_ROLE     = keccak256("BUYER_ROLE");

    /* ─────────────── fraud detection ─────────────── */
    uint256 public constant FRAUD_THRESHOLD = 10;  // transactions before flagging

    // Track transactions between specific buyer-seller pairs
    mapping(bytes32 => uint256) public transactionCount;     // hash(buyer,seller) => count
    mapping(bytes32 => bool) public flaggedPairs;           // hash(buyer,seller) => flagged
    mapping(bytes32 => uint256[]) public transactionHistory; // hash(buyer,seller) => [landIds]

    /* ───────────── data model ───────────── */
    struct Land {
        uint256 id;
        string  propertyAddress;
        uint256 totalLandArea;
        uint256 postalCode;
        string  propertyName;
        bool    isShared;
        uint256 totalShares;      // 1 when not shared
        uint256 pricePerShare;    // wei
        uint256 availableShares;  // remaining in creator's wallet
        address originalOwner;
        bool    forSale;          // whole parcel listing flag
        uint256 wholePrice;       // wei
    }

    uint256 private _tokenIdCounter = 1;
    mapping(uint256 => Land) public lands;     // landId → info
    mapping(bytes32 => bool) private propertySeen;

    /* ───────────── events ───────────── */
    event LandRegistered(uint256 indexed landId, address indexed owner);
    event LandFractionalised(uint256 indexed landId, uint256 shares, uint256 pricePerShare);
    event SharesPurchased(uint256 indexed landId, address indexed buyer, uint256 amount);
    event WholeListed(uint256 indexed landId, uint256 priceWei);
    event WholeDelisted(uint256 indexed landId);
    event WholeSold(uint256 indexed landId, address indexed buyer, uint256 priceWei);
    
    /* ─────────────── NEW: fraud detection events ─────────────── */
    event SuspiciousActivity(
        address indexed buyer,
        address indexed seller, 
        uint256 transactionCount,
        uint256 indexed landId
    );
    
    event PairFlagged(
        address indexed buyer,
        address indexed seller,
        uint256 totalTransactions
    );

    /* ────────── constructor ─────────── */
    constructor(string memory defaultURI) ERC1155(defaultURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGULATOR_ROLE, msg.sender);
    }

    /* ───── supportsInterface override ──── */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /* ─────────────── NEW: fraud detection helper functions ─────────────── */
    
    /// Generate unique hash for buyer-seller pair
    function _getPairHash(address buyer, address seller) internal pure returns (bytes32) {
        // Ensure consistent ordering regardless of who calls first
        if (buyer < seller) {
            return keccak256(abi.encodePacked(buyer, seller));
        } else {
            return keccak256(abi.encodePacked(seller, buyer));
        }
    }

    /// Check and update fraud detection counters
    function _checkFraudulentActivity(address buyer, address seller, uint256 landId) internal {
        bytes32 pairHash = _getPairHash(buyer, seller);
        
        // Increment transaction count
        transactionCount[pairHash]++;
        transactionHistory[pairHash].push(landId);
        
        uint256 count = transactionCount[pairHash];
        
        // Emit warning for suspicious activity (every transaction after threshold-1)
        if (count >= FRAUD_THRESHOLD - 1) {
            emit SuspiciousActivity(buyer, seller, count, landId);
        }
        
        // Flag the pair if they hit the threshold
        if (count >= FRAUD_THRESHOLD && !flaggedPairs[pairHash]) {
            flaggedPairs[pairHash] = true;
            emit PairFlagged(buyer, seller, count);
        }
    }

    /// Check if a buyer-seller pair is flagged
    function isPairFlagged(address buyer, address seller) external view returns (bool) {
        bytes32 pairHash = _getPairHash(buyer, seller);
        return flaggedPairs[pairHash];
    }

    /// Get transaction count between two addresses
    function getTransactionCount(address buyer, address seller) external view returns (uint256) {
        bytes32 pairHash = _getPairHash(buyer, seller);
        return transactionCount[pairHash];
    }

    /// Get transaction history for a pair (landIds they've traded)
    function getTransactionHistory(address buyer, address seller) 
        external 
        view 
        onlyRole(REGULATOR_ROLE)
        returns (uint256[] memory) 
    {
        bytes32 pairHash = _getPairHash(buyer, seller);
        return transactionHistory[pairHash];
    }

    /// Regulators can manually flag/unflag suspicious pairs
    function setFlaggedPair(address buyer, address seller, bool flagged) 
        external 
        onlyRole(REGULATOR_ROLE) 
    {
        bytes32 pairHash = _getPairHash(buyer, seller);
        flaggedPairs[pairHash] = flagged;
        
        if (flagged) {
            emit PairFlagged(buyer, seller, transactionCount[pairHash]);
        }
    }

    /// Optional: Block transactions from flagged pairs
    modifier notFlagged(address buyer, address seller) {
        bytes32 pairHash = _getPairHash(buyer, seller);
        require(!flaggedPairs[pairHash], "Transaction blocked: flagged pair");
        _;
    }

    /* ───── modifiers ───── */
    modifier onlySeller() {
        require(hasRole(SELLER_ROLE, msg.sender), "not seller");
        _;
    }
    modifier onlyAuthorized() {
        require(
            hasRole(BUYER_ROLE, msg.sender) ||
            hasRole(SELLER_ROLE, msg.sender) ||
            hasRole(REGULATOR_ROLE, msg.sender),
            "not authorized"
        );
        _;
    }
    modifier landExists(uint256 id) {
        require(lands[id].id != 0, "land does not exist");
        _;
    }

    /* ───── register land ───── */
    function registerLand(
        string calldata addr,
        uint256 area,
        uint256 postal,
        string calldata name
    ) external onlySeller returns (uint256 id) {

        bytes32 hash = keccak256(abi.encodePacked(addr, area, postal, name));
        require(!propertySeen[hash], "property already registered");

        id = _tokenIdCounter++;
        lands[id] = Land({
            id: id,
            propertyAddress: addr,
            totalLandArea: area,
            postalCode: postal,
            propertyName: name,
            isShared: false,
            totalShares: 1,
            pricePerShare: 0,
            availableShares: 0,
            originalOwner: msg.sender,
            forSale: false,
            wholePrice: 0
        });
        propertySeen[hash] = true;

        _mint(msg.sender, id, 1, "");
        emit LandRegistered(id, msg.sender);
    }

    /* ───── whole-parcel trading ───── */
    function listWhole(uint256 id, uint256 priceWei) external landExists(id) {
        Land storage l = lands[id];
        require(!l.isShared, "already shared");
        require(balanceOf(msg.sender, id) == 1, "not owner");
        require(priceWei > 0, "price=0");

        l.forSale = true;
        l.wholePrice = priceWei;
        emit WholeListed(id, priceWei);
    }

    function delistWhole(uint256 id) external landExists(id) {
        Land storage l = lands[id];
        require(l.forSale, "not listed");
        require(
            balanceOf(msg.sender, id) == 1 || hasRole(REGULATOR_ROLE, msg.sender),
            "not owner / regulator"
        );

        l.forSale = false;
        l.wholePrice = 0;
        emit WholeDelisted(id);
    }

    function buyWhole(uint256 id)
        external
        payable
        onlyAuthorized
        landExists(id)
        notFlagged(msg.sender, lands[id].originalOwner)  // NEW: check for flagged pairs
    {
        Land storage l = lands[id];
        require(!l.isShared, "shared land");
        require(l.forSale, "not for sale");
        require(msg.value == l.wholePrice, "wrong ETH amount");

        address seller = l.originalOwner;

        /* INTERNAL transfer—no approval needed */
        _safeTransferFrom(seller, msg.sender, id, 1, "");

        l.forSale = false;
        l.wholePrice = 0;
        l.originalOwner = msg.sender;

        (bool ok, ) = payable(seller).call{value: msg.value}("");
        require(ok, "ETH transfer failed");

        // NEW: Track this transaction for fraud detection
        _checkFraudulentActivity(msg.sender, seller, id);

        emit WholeSold(id, msg.sender, msg.value);
    }

    /* ───── fractionalisation ───── */
    function fractionalise(uint256 id, uint256 shares, uint256 pricePerShare)
        external
        landExists(id)
    {
        Land storage l = lands[id];
        require(!l.isShared, "already shared");
        require(balanceOf(msg.sender, id) == 1, "not owner");
        require(shares > 1, "shares<=1");
        require(pricePerShare > 0, "price/share=0");

        _burn(msg.sender, id, 1);                // burn 1-of-1 token

        l.isShared = true;
        l.totalShares = shares;
        l.pricePerShare = pricePerShare;
        l.availableShares = shares;

        _mint(msg.sender, id, shares, "");       // mint shares
        emit LandFractionalised(id, shares, pricePerShare);
    }

    /* ───── buy shares ───── */
    function buyShares(uint256 id, uint256 amount)
        external
        payable
        onlyAuthorized
        landExists(id)
        notFlagged(msg.sender, lands[id].originalOwner)  // NEW: check for flagged pairs
    {
        Land storage l = lands[id];
        require(l.isShared && l.availableShares >= amount, "not enough shares");

        uint256 cost = amount * l.pricePerShare;
        require(msg.value == cost, "wrong ETH");

        address seller = l.originalOwner;

        (bool ok, ) = payable(seller).call{value: cost}("");
        require(ok, "ETH fail");

        /* INTERNAL transfer—no approval needed */
        _safeTransferFrom(seller, msg.sender, id, amount, "");

        l.availableShares -= amount;

        // NEW: Track this transaction for fraud detection
        _checkFraudulentActivity(msg.sender, seller, id);

        emit SharesPurchased(id, msg.sender, amount);
    }

    /* ───── secondary share transfer ───── */
    function transferShares(address to, uint256 id, uint256 amount) 
        external 
        notFlagged(msg.sender, to)  // NEW: check for flagged pairs on secondary transfers
    {
        require(lands[id].isShared, "land not shared");
        _safeTransferFrom(msg.sender, to, id, amount, "");
        
        // NEW: Track secondary market transactions too
        _checkFraudulentActivity(to, msg.sender, id);
    }

    /* ───── defragment ───── */
    function defragmentLand(uint256 id) external landExists(id) {
        Land storage l = lands[id];
        require(l.isShared, "not shared");
        require(balanceOf(msg.sender, id) == l.totalShares, "need all shares");

        _burn(msg.sender, id, l.totalShares);

        l.isShared = false;
        l.totalShares = 1;
        l.pricePerShare = 0;
        l.availableShares = 0;
        l.originalOwner = msg.sender;

        _mint(msg.sender, id, 1, "");
    }

    /* ───── view helpers ───── */
    function ownershipPercentage(address account, uint256 id)
        external
        view
        landExists(id)
        returns (uint256)
    {
        Land memory l = lands[id];
        uint256 bal = balanceOf(account, id);
        return (bal * 100) / l.totalShares;
    }

    function getLandDetails(uint256 id)
        external
        view
        onlyAuthorized
        landExists(id)
        returns (
            Land memory details,
            address currentOwner,
            bool isShared,
            uint256 totalShares,
            uint256 availableShares,
            uint256 pricePerShare
        )
    {
        Land memory land = lands[id];
        return (
            land,
            land.originalOwner,
            land.isShared,
            land.totalShares,
            land.availableShares,
            land.pricePerShare
        );
    }

    /* ───── role helpers ───── */
    function grantSellerRole(address a) external onlyRole(DEFAULT_ADMIN_ROLE) { 
        _grantRole(SELLER_ROLE, a); 
    }
    function grantBuyerRole(address a) external onlyRole(DEFAULT_ADMIN_ROLE) { 
        _grantRole(BUYER_ROLE, a); 
    }
    function grantRegulatorRole(address a) external onlyRole(DEFAULT_ADMIN_ROLE) { 
        _grantRole(REGULATOR_ROLE, a); 
    }

    function revokeSellerRole(address a) external onlyRole(DEFAULT_ADMIN_ROLE) { 
        _revokeRole(SELLER_ROLE, a); 
    }
    function revokeBuyerRole(address a) external onlyRole(DEFAULT_ADMIN_ROLE) { 
        _revokeRole(BUYER_ROLE, a); 
    }
    function revokeRegulatorRole(address a) external onlyRole(DEFAULT_ADMIN_ROLE) { 
        _revokeRole(REGULATOR_ROLE, a); 
    }
}
