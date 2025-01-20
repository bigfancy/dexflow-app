// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdAlliance {
    struct Ad {
        uint256 id;
        address advertiser;
        string targetUrl;
        string imageUrl;
        uint256 budget;
        uint256 costPerClick;
        uint256 totalClicks;
        uint256 totalReward;
        bool isActive;
        uint256 duration;
    }

    // Token used for settlement
    IERC20 public datToken;

    // Mappings for ads and user associations
    mapping(uint256 => Ad) public ads;
    // adId => linkId => user
    mapping(uint256 => mapping(uint256 => address)) public adLinks;
    // user => adId => linkId
    mapping(address => mapping(uint256 => uint256)) public userLinkIds;

    uint256 public adCount;
    uint256 public linkCounter;

    address public admin;

    // Track all ad IDs
    uint256[] private allAdIds;
    
    // Track user's ads
    mapping(address => uint256[]) private userAds;

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
    function createAd(
        string calldata _target, 
        string calldata _imageUrl,
        uint256 _budget, 
        uint256 _costPerClick,
        uint256 _duration
    ) external {
        require(_budget > 0, "Budget must be greater than 0");
        require(_costPerClick > 0, "Cost per click must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(datToken.transferFrom(msg.sender, address(this), _budget), "Budget transfer failed");

        adCount++;
        ads[adCount] = Ad({
            id: adCount,
            advertiser: msg.sender,
            targetUrl: _target,
            imageUrl: _imageUrl,
            budget: _budget,
            costPerClick: _costPerClick,
            totalClicks: 0,
            totalReward: 0,
            isActive: true,
            duration: _duration
        });

        uint256 newAdId = adCount;
        allAdIds.push(newAdId);
        userAds[msg.sender].push(newAdId);

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

    // Get all ads
    function getAllAds() external view returns (Ad[] memory) {
        Ad[] memory allAds = new Ad[](allAdIds.length);
        
        for (uint256 i = 0; i < allAdIds.length; i++) {
            uint256 adId = allAdIds[i];
            allAds[i] = ads[adId];
        }
        
        return allAds;
    }

    // Get user's ads
    function getUserAds(address _user) external view returns (Ad[] memory) {
        uint256[] storage userAdIds = userAds[_user];
        Ad[] memory userAdList = new Ad[](userAdIds.length);
        
        for (uint256 i = 0; i < userAdIds.length; i++) {
            uint256 adId = userAdIds[i];
            userAdList[i] = ads[adId];
        }
        
        return userAdList;
    }

    // Get single ad
    function getAd(uint256 _adId) external view returns (Ad memory) {
        require(_adId > 0 && _adId <= adCount, "Invalid ad ID");
        return ads[_adId];
    }

    // Get active ads
    function getActiveAds() external view returns (Ad[] memory) {
        uint256 activeCount = 0;
        
        // First count active ads
        for (uint256 i = 0; i < allAdIds.length; i++) {
            if (ads[allAdIds[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of correct size
        Ad[] memory activeAds = new Ad[](activeCount);
        uint256 currentIndex = 0;
        
        // Fill array with active ads
        for (uint256 i = 0; i < allAdIds.length; i++) {
            uint256 adId = allAdIds[i];
            if (ads[adId].isActive) {
                activeAds[currentIndex] = ads[adId];
                currentIndex++;
            }
        }
        
        return activeAds;
    }
}

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}
