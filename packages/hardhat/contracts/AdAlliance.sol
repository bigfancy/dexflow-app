// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdAlliance {
    struct Ad {
        uint256 id;
        address advertiser;
        string target;
        uint256 budget;
        uint256 costPerClick;
        uint256 totalClicks;
        uint256 totalReward;
        bool isActive;
    }

    // Token used for settlement
    IERC20 public datToken;

    // Mappings for ads and user associations
    mapping(uint256 => Ad) public ads;
    mapping(uint256 => mapping(uint256 => address)) public adLinks;
    mapping(address => mapping(uint256 => uint256)) public userLinkIds;

    uint256 public adCount;
    uint256 public linkCounter;

    address public admin;

    // Events
    event AdCreated(uint256 indexed adId, address indexed advertiser, string target, uint256 budget);
    event AdUpdated(uint256 indexed adId, bool isActive, uint256 budget);
    event LinkGenerated(uint256 indexed adId, uint256 indexed linkId, address indexed user);
    event ClicksSettled(uint256 indexed adId, uint256 totalClicks, uint256 totalCost);

    constructor(address _datTokenAddress) {
        datToken = IERC20(_datTokenAddress);
        admin = msg.sender;
    }

    modifier onlyAdvertiser(uint256 _adId) {
        require(ads[_adId].advertiser == msg.sender, "Not the advertiser");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not an admin");
        _;
    }

    // 1. Create a new ad
    function createAd(string calldata _target, uint256 _budget, uint256 _costPerClick) external {
        require(_budget > 0, "Budget must be greater than 0");
        require(_costPerClick > 0, "Cost per click must be greater than 0");
        require(datToken.transferFrom(msg.sender, address(this), _budget), "Budget transfer failed");

        adCount++;
        ads[adCount] = Ad({
            id: adCount,
            advertiser: msg.sender,
            target: _target,
            budget: _budget,
            costPerClick: _costPerClick,
            totalClicks: 0,
            totalReward: 0,
            isActive: true
        });

        emit AdCreated(adCount, msg.sender, _target, _budget);
    }

    // 2. Generate a unique link for a user
    function generateAdLink(uint256 _adId) external returns (uint256) {
        require(ads[_adId].isActive, "Ad is not active");
        require(userLinkIds[msg.sender][_adId] == 0, "Link already exists for user");

        linkCounter++;
        adLinks[_adId][linkCounter] = msg.sender;
        userLinkIds[msg.sender][_adId] = linkCounter;

        emit LinkGenerated(_adId, linkCounter, msg.sender);
        return linkCounter;
    }

    // 3. Settle daily clicks and distribute rewards
    function settleClicks(uint256 _adId, uint256[] calldata linkIds, uint256[] calldata clickCounts) external onlyAdmin {
        require(linkIds.length == clickCounts.length, "Array lengths mismatch");
        Ad storage ad = ads[_adId];
        require(ad.isActive, "Ad is not active");

        uint256 totalClicks = 0;
        uint256 totalCost = 0;

        for (uint256 i = 0; i < linkIds.length; i++) {
            uint256 linkId = linkIds[i];
            uint256 clicks = clickCounts[i];

            // Find user associated with linkId
            address user = adLinks[_adId][linkId];
            require(user != address(0), "Invalid linkId");

            uint256 reward = clicks * ad.costPerClick;
            require(ad.budget >= reward, "Insufficient budget");

            ad.budget -= reward;
            totalClicks += clicks;
            totalCost += reward;

            // Transfer reward to user
            require(datToken.transfer(user, reward), "Reward transfer failed");
        }

        ad.totalClicks += totalClicks;
        ad.totalReward += totalCost;

        if (ad.budget < ad.costPerClick) {
            ad.isActive = false;
        }

        emit ClicksSettled(_adId, totalClicks, totalCost);
    }
}

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}
