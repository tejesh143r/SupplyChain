// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecureChainFlow
 * @dev Domain-Agnostic Blockchain Ledger for Supply Chain Tracking & AI Anomaly Management
 */
contract SecureChainFlow {

    enum State {
        Created,
        Processed,
        InTransit,
        Inspected,
        Delivered,
        Flagged
    }

    struct CustodyRecord {
        address custodian;
        State state;
        uint256 timestamp;
        string remarks;
    }

    struct Product {
        uint256 productId;
        string productName;
        string category;
        address manufacturer;
        address currentCustodian;
        uint256 timestamp;
        State currentState;
        string ipfsMetadataHash;
        bool isFlagged;
        string flagReason;
    }

    uint256 private _productCounter;
    
    // productId => Product
    mapping(uint256 => Product) private _products;
    
    // productId => CustodyRecord[]
    mapping(uint256 => CustodyRecord[]) private _productHistory;

    // Array of all product IDs
    uint256[] private _allProductIds;

    // Authorized AI / Monitoring agents
    mapping(address => bool) public authorizedMonitors;
    address public owner;

    // Events
    event ProductRegistered(
        uint256 indexed productId,
        string productName,
        string category,
        address indexed manufacturer,
        string ipfsMetadataHash
    );

    event CustodyTransferred(
        uint256 indexed productId,
        address indexed previousCustodian,
        address indexed newCustodian,
        State newState,
        string remarks
    );

    event ProductFlagged(
        uint256 indexed productId,
        address indexed flaggedBy,
        string reason,
        uint256 timestamp
    );

    event StateUpdated(
        uint256 indexed productId,
        State newState,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "SecureChainFlow: Only owner allowed");
        _;
    }

    modifier onlyCustodianOrManufacturer(uint256 productId) {
        Product memory p = _products[productId];
        require(p.productId != 0, "SecureChainFlow: Product does not exist");
        require(
            msg.sender == p.currentCustodian || msg.sender == p.manufacturer || msg.sender == owner,
            "SecureChainFlow: Sender is not authorized custodian or manufacturer"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedMonitors[msg.sender] = true;
    }

    function setAuthorizedMonitor(address monitor, bool status) external onlyOwner {
        authorizedMonitors[monitor] = status;
    }

    /**
     * @dev Register a new product on-chain with dynamic category & IPFS metadata hash
     */
    function registerProduct(
        string memory productName,
        string memory category,
        string memory ipfsMetadataHash
    ) external returns (uint256) {
        require(bytes(productName).length > 0, "Product name required");
        require(bytes(category).length > 0, "Category required");

        _productCounter++;
        uint256 newId = _productCounter;

        Product memory newProd = Product({
            productId: newId,
            productName: productName,
            category: category,
            manufacturer: msg.sender,
            currentCustodian: msg.sender,
            timestamp: block.timestamp,
            currentState: State.Created,
            ipfsMetadataHash: ipfsMetadataHash,
            isFlagged: false,
            flagReason: ""
        });

        _products[newId] = newProd;
        _allProductIds.push(newId);

        _productHistory[newId].push(CustodyRecord({
            custodian: msg.sender,
            state: State.Created,
            timestamp: block.timestamp,
            remarks: "Product Registered"
        }));

        emit ProductRegistered(newId, productName, category, msg.sender, ipfsMetadataHash);
        return newId;
    }

    /**
     * @dev Transfer product custody and state across stakeholders
     */
    function transferCustody(
        uint256 productId,
        address newCustodian,
        State newState,
        string memory remarks
    ) external onlyCustodianOrManufacturer(productId) {
        require(newCustodian != address(0), "Invalid new custodian address");
        Product storage prod = _products[productId];
        require(!prod.isFlagged, "SecureChainFlow: Cannot transfer flagged product");

        address prevCustodian = prod.currentCustodian;
        prod.currentCustodian = newCustodian;
        prod.currentState = newState;

        _productHistory[productId].push(CustodyRecord({
            custodian: newCustodian,
            state: newState,
            timestamp: block.timestamp,
            remarks: remarks
        }));

        emit CustodyTransferred(productId, prevCustodian, newCustodian, newState, remarks);
        emit StateUpdated(productId, newState, block.timestamp);
    }

    /**
     * @dev Direct hook for AI/ML modules and telemetry monitors to flag anomalous products
     */
    function flagAnomalousProduct(uint256 productId, string memory reason) external {
        Product storage prod = _products[productId];
        require(prod.productId != 0, "SecureChainFlow: Product does not exist");
        
        prod.currentState = State.Flagged;
        prod.isFlagged = true;
        prod.flagReason = reason;

        _productHistory[productId].push(CustodyRecord({
            custodian: prod.currentCustodian,
            state: State.Flagged,
            timestamp: block.timestamp,
            remarks: string(abi.encodePacked("AI Flagged: ", reason))
        }));

        emit ProductFlagged(productId, msg.sender, reason, block.timestamp);
        emit StateUpdated(productId, State.Flagged, block.timestamp);
    }

    /**
     * @dev Fetch detailed product provenance
     */
    function getProduct(uint256 productId) external view returns (Product memory) {
        require(_products[productId].productId != 0, "Product does not exist");
        return _products[productId];
    }

    /**
     * @dev Fetch complete custody history audit trail
     */
    function getProductHistory(uint256 productId) external view returns (CustodyRecord[] memory) {
        require(_products[productId].productId != 0, "Product does not exist");
        return _productHistory[productId];
    }

    /**
     * @dev Fetch total registered products count
     */
    function getProductCount() external view returns (uint256) {
        return _productCounter;
    }

    /**
     * @dev Fetch list of all product IDs
     */
    function getAllProductIds() external view returns (uint256[] memory) {
        return _allProductIds;
    }
}
