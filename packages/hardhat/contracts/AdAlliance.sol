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
    }

    // Store link info
    struct AdLink {
        uint256 adId;
        address user;
        uint256 clicks;
        uint256 rewards;
    }

    // Token used for settlement
    IERC20 public dftToken;

    // Mappings for ads and user associations
    // adId => Ad
    mapping(uint256 => Ad) public ads;
    // linkId => AdLink
    mapping(uint256 => AdLink) public adLinks;
    // user => adId => linkId (to prevent duplicate links)
    mapping(address => mapping(uint256 => uint256)) public userAdLinks;

    uint256 public adCount;
    uint256 public linkCounter;

    address public admin;

    // Track all ad IDs
    uint256[] private allAdIds;
    
    // Track user's ads
    // user => adId
    mapping(address => uint256[]) private userAds;

    // Events
    event AdCreated(uint256 indexed adId, address indexed advertiser, string target, uint256 budget);
    event AdUpdated(uint256 indexed adId, bool isActive, uint256 budget);
    event LinkGenerated(uint256 indexed linkId, uint256 indexed adId, address indexed user);
    event ClicksSettled(uint256 indexed linkId, uint256 indexed clickCounts);

    constructor(address _dftTokenAddress) {
        dftToken = IERC20(_dftTokenAddress);
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
        uint256 _costPerClick
    ) external {
        require(_budget > 0, "Budget must be greater than 0");
        require(_costPerClick > 0, "Cost per click must be greater than 0");
        require(dftToken.transferFrom(msg.sender, address(this), _budget), "Budget transfer failed");

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
            isActive: true
        });

        uint256 newAdId = adCount;
        allAdIds.push(newAdId);
        userAds[msg.sender].push(newAdId);

        emit AdCreated(adCount, msg.sender, _target, _budget);
    }

    // 2. Generate a unique link for a user
    function generateAdLink(uint256 _adId) external returns (uint256) {
        require(ads[_adId].isActive, "Ad is not active");
        require(userAdLinks[msg.sender][_adId] == 0, "Link already exists for user");

        linkCounter++;
        adLinks[linkCounter] = AdLink({
            adId: _adId,
            user: msg.sender,
            clicks: 0,
            rewards: 0
        });
        userAdLinks[msg.sender][_adId] = linkCounter;

        emit LinkGenerated(linkCounter, _adId, msg.sender);
        return linkCounter;
    }

    // 3. Settle daily clicks and distribute rewards
    function settleClicks(uint256[] calldata linkIds, uint256[] calldata clickCounts) external onlyAdmin {
        require(linkIds.length == clickCounts.length, "Array lengths mismatch");

        for (uint256 i = 0; i < linkIds.length; i++) {
            uint256 linkId = linkIds[i];
            uint256 clicks = clickCounts[i];
            
            AdLink storage link = adLinks[linkId];
            require(link.user != address(0), "Invalid link");
            
            Ad storage ad = ads[link.adId];
            require(ad.isActive, "Ad is not active");

            uint256 reward = clicks * ad.costPerClick;
            require(ad.budget >= reward, "Insufficient budget");

            ad.budget -= reward;
            link.clicks += clicks;
            link.rewards += reward;
            ad.totalClicks += clicks;
            ad.totalReward += reward;

            // Transfer reward to user
            require(dftToken.transfer(link.user, reward), "Reward transfer failed");

            if (ad.budget < ad.costPerClick) {
                ad.isActive = false;
            }
        }

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
    // get userAdLinks
    function getUserAdLink(address _user, uint256 _adId) external view returns (uint256) {
        return userAdLinks[_user][_adId];
    }

    // Get active ads
    function getActiveAds() external view returns (Ad[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allAdIds.length; i++) {
            uint256 adId = allAdIds[i];
            if (ads[adId].isActive) {
                activeCount++;
            }
        }

        Ad[] memory activeAds = new Ad[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allAdIds.length; i++) {
            uint256 adId = allAdIds[i];
            if (ads[adId].isActive) {
                activeAds[index] = ads[adId];
                index++;
            }
        }
        return activeAds;
    }
}

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}
