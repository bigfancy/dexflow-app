// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {DFNFT} from "./DFNFT.sol";

import "hardhat/console.sol"; // used in testing chains

contract EnglishAuction {

  IERC20 public immutable dfToken;



  /// @notice Bidder parameters
  struct Bidder {
    address bidder;
    uint256 bidAmount;
    uint256 bidTime;
  }

  struct NFTInfo {
    address nftAddress;
    uint256 tokenId;
    string tokenURI;
  }

  /// @notice Auction parameters
  struct Auction {
    address seller;
    NFTInfo nftInfo;
    uint256 startingAt;
    uint256 endingAt;
    uint256 startingPrice;
    uint256 highestBid;
    address highestBidder;
    Bidder[] bidders;
    AuctionStatus status;
  }

    // 使用单个数组来跟踪所有拍卖
  struct AuctionInfo {
    address nftAddress;
    uint256 tokenId;
  }

  /// @notice NFT address -> tokenId -> Auction Object
  mapping(address => mapping(uint256 => Auction)) public auctions;
  
  AuctionInfo[] public auctionRegistry;

    
  constructor(address _dfTokenAddress) {
      require(_dfTokenAddress != address(0), "Invalid address");
      dfToken = IERC20(_dfTokenAddress);
  }
  /// @dev The available state of the auction
  enum AuctionStatus {
    NOT_CREATED,
    IN_PROGRESS,
    ENDED
  }

  event AuctionCreated(address indexed nftAddress, uint256 indexed tokenId);

  event NewBid(address indexed nftAddress, uint256 indexed tokenId, uint256 price);

  event AuctionEnded(address indexed nftAddress, uint256 indexed tokenId, address winner);


  modifier isAuctionNotCreated(address _nftAddress, uint256 _tokenId) {
    Auction memory auction = auctions[_nftAddress][_tokenId];
    require(auction.status == AuctionStatus.NOT_CREATED, "Auction already created");
    _;
  }

  modifier isAuctionInProgress(address _nftAddress, uint256 _tokenId) {
    Auction memory auction = auctions[_nftAddress][_tokenId];
    require(auction.status == AuctionStatus.IN_PROGRESS, "Auction not in progress");
    _;
  }

  ///////////////////////////////////////////////
  //////// external and public function /////////
  ///////////////////////////////////////////////

  /**
   * @notice Create new auction for a given NFT item
   * @dev Only the owner of this NFT can list the item
   *
   * @param _nftAddress ERC721 Address
   * @param _tokenId Token ID of the item being auctioned
   * @param _startingPrice Auction starting price
   * @param _duration How long the auction takes to end
   */
  function createAuction(
    address _nftAddress,
    uint256 _tokenId,
    uint256 _startingPrice,
    uint256 _duration
  ) external {
    require(_nftAddress != address(0), "Invalid address");
    require(IERC721(_nftAddress).ownerOf(_tokenId) == msg.sender, "Not owner of NFT");
    require(
      IERC721(_nftAddress).getApproved(_tokenId) == address(this) ||
      IERC721(_nftAddress).isApprovedForAll(msg.sender, address(this)),
      "Not approved for NFT"
    );

    // It is better to check for duration and to make it has minimum value like 1 day

    // If the auction was ended then we will reset it again as the auction should be
    // in `NOT_CREATED` state in order to be opened
    Auction storage auction = auctions[_nftAddress][_tokenId];
    if (auction.status == AuctionStatus.ENDED) {
      auctions[_nftAddress][_tokenId].status = AuctionStatus.NOT_CREATED;
    }

    _createAuction(_nftAddress, _tokenId, _startingPrice, _duration);
  }

  /**
   * @notice Add new bid in the given auction
   *
   * @param _nftAddress ERC721 address
   * @param _tokenId Token ID of the item being auctioned
   */
  function bid(
    address _nftAddress,
    uint256 _tokenId,
    uint256 _bidAmount
  ) external payable isAuctionInProgress(_nftAddress, _tokenId) {
    Auction memory auction = getAuction(_nftAddress, _tokenId);
  

    require(auction.seller != msg.sender, "Seller cannot bid");

    if (auction.highestBidder == address(0)) {
        require(_bidAmount >= auction.startingPrice, "Bid amount too low");
    } else {
        require(_bidAmount > auction.highestBid, "Bid amount too low");
    }

    require(dfToken.transferFrom(msg.sender, address(this), _bidAmount), "Token transfer failed");

    if (auction.highestBidder != address(0)) {
        require(dfToken.transfer(auction.highestBidder, auction.highestBid), "Refund transfer failed");
    }

    _addNewBidder(_nftAddress, _tokenId, msg.sender, _bidAmount);
  }

  /**
   * @notice End the auction and transfer item to the highest bidder if existed, and send money to the seller.
   * @dev This function can only be caller by the seller address.
   * @dev It is better to make an automation to call this function once the real time reaches ending time of the
   *      auction using oracle networks like ChainLink, but we kept it simple by making it called by the seller.
   *
   * @param _nftAddress ERC721 address
   * @param _tokenId Token ID of the item being auctioned
   */
  function endAuction(
        address _nftAddress,
        uint256 _tokenId
    ) external isAuctionInProgress(_nftAddress, _tokenId) {
 
        Auction memory auction = getAuction(_nftAddress, _tokenId);

        require(auction.seller == msg.sender, "Only seller can end auction");
        require(block.timestamp >= auction.endingAt, "Auction not ended yet");

        _endAuction(_nftAddress, _tokenId);

        if (auction.highestBidder == address(0) || auction.highestBid == 0) {
            emit AuctionEnded(_nftAddress, _tokenId, address(0));
            return;
        }

        IERC721(_nftAddress).safeTransferFrom(auction.seller, auction.highestBidder, _tokenId);
        require(dfToken.transfer(auction.seller, auction.highestBid), "Token transfer failed");

        emit AuctionEnded(_nftAddress, _tokenId, auction.highestBidder);
    }

  ///////////////////////////////////////////////
  //////// private and internal function ////////
  ///////////////////////////////////////////////

  /**
   * @notice Private method that has the logic of creating an auction
   * @dev the auction status should be `NOT_CREATED` in order to create the auction successfully
   *
   * @param _nftAddress ERC721 address
   * @param _tokenId token id of the item to be listed
   * @param _startingPrice the price at which the auction will starts
   * @param _duration How long the auction takes to end
   */
  function _createAuction(
    address _nftAddress,
    uint256 _tokenId,
    uint256 _startingPrice,
    uint256 _duration
  ) private isAuctionNotCreated(_nftAddress, _tokenId) {
    string memory tokenURI = DFNFT(_nftAddress).tokenURI(_tokenId);
    
    auctions[_nftAddress][_tokenId].seller = msg.sender;
    auctions[_nftAddress][_tokenId].nftInfo = NFTInfo({
      nftAddress: _nftAddress,
      tokenId: _tokenId,
      tokenURI: tokenURI
    });
    auctions[_nftAddress][_tokenId].startingAt = block.timestamp;
    auctions[_nftAddress][_tokenId].endingAt = block.timestamp + _duration;
    auctions[_nftAddress][_tokenId].startingPrice = _startingPrice;
    auctions[_nftAddress][_tokenId].highestBid = _startingPrice;
    auctions[_nftAddress][_tokenId].status = AuctionStatus.IN_PROGRESS;

    // 添加到注册表
    auctionRegistry.push(AuctionInfo({
      nftAddress: _nftAddress,
      tokenId: _tokenId
    }));

    emit AuctionCreated(_nftAddress, _tokenId);
  }

  /**
   * @notice Add new bidder to the auction of the given `_nftAddress` and `_tokenId`
   * @dev All check are done on `bid` functions, so we don't neede to check values in this function
   * @dev Refunding the previous bidder (if existed) occuars in `bid` function too
   *
   * @param _nftAddress ERC721 address
   * @param _tokenId Token ID of the item being auctioned
   * @param _bidder Bidder address
   * @param _bidAmount Bidded amount buy the bidder
   */
  function _addNewBidder(
    address _nftAddress,
    uint256 _tokenId,
    address _bidder,
    uint256 _bidAmount
  ) private {
    Auction storage auction = auctions[_nftAddress][_tokenId];

    auction.highestBidder = _bidder;
    auction.highestBid = _bidAmount;
    auction.bidders.push(Bidder(_bidder, _bidAmount, block.timestamp));

    emit NewBid(_nftAddress, _tokenId, _bidAmount);
  }

  /**
   * @notice Ending a specific auction by reseting bidders and update state to `ENDED`
   * @dev This function only ends an auction by updating its values, transfereing money, and NFTs
   *      is done in public `endAuction` function
   *
   * @param _nftAddress ERC721 address
   * @param _tokenId Token ID of the item being auctioned
   */
  function _endAuction(address _nftAddress, uint256 _tokenId) private {
    Auction storage auction = auctions[_nftAddress][_tokenId];
    auction.status = AuctionStatus.ENDED;

    // We don't have to remove the first element as the first element is AddressZero by default
    while (auction.bidders.length > 1) {
      auction.bidders.pop();
    }
  }

  ///////////////////////////////////////////////
  /////// Getter, View, and Pure function ///////
  ///////////////////////////////////////////////

  /**
   * @notice Getting all information about a given auction by giving `nftAddress` and `tokenId`
   * @dev if there is no listed auction of this nftAddress and tokenId, all returned value will be the default
   *
   * @param _nftAddress ERC721 address
   * @param _tokenId token of the listed item in the auction
   * @return Auction the auction information
   */
  function getAuction(
    address _nftAddress,
    uint256 _tokenId
  ) public view returns (Auction memory) {
    Auction storage auction = auctions[_nftAddress][_tokenId];
    return auction;
  }

    // 添加紧急取回函数
    // function emergencyWithdraw(
    //     address _token,
    //     uint256 _amount
    // ) external {
    //     require(msg.sender == owner(), "Not authorized");
    //     if (_token == address(daToken)) {
    //         bool success = daToken.transfer(msg.sender, _amount);
    //         require(success, "Transfer failed");
    //     }
    // }

  /// @notice Get all auctions
  /// @return auctionList Array of all auctions
  function getAllAuctions() external view returns (Auction[] memory) {
    Auction[] memory auctionList = new Auction[](auctionRegistry.length);
    
    for (uint256 i = 0; i < auctionRegistry.length; i++) {
      AuctionInfo memory info = auctionRegistry[i];
      auctionList[i] = auctions[info.nftAddress][info.tokenId];
    }
    
    return auctionList;
  }

  function getAuctionsByUser(address _user) external view returns (Auction[] memory) {
    // 1. 首先计算用户的拍卖数量
    uint256 userAuctionCount = 0;

    //Auction[] memory tempAuctions = new Auction[](auctionRegistry.length); // 临时数组

    for (uint256 i = 0; i < auctionRegistry.length; i++) {
        AuctionInfo memory info = auctionRegistry[i];
        if (auctions[info.nftAddress][info.tokenId].seller == _user) {
            userAuctionCount++;
        }
    }

    // 2. 创建正确大小的数组
    Auction[] memory userAuctions = new Auction[](userAuctionCount);
    
    /* 
    for (uint256 j = 0; j < userAuctionCount; j++) {
        userAuctions[j] = tempAuctions[j];
    }
    */

    // 3. 填充数组
    uint256 currentIndex = 0;
    for (uint256 i = 0; i < auctionRegistry.length; i++) {
        AuctionInfo memory info = auctionRegistry[i];
        if (auctions[info.nftAddress][info.tokenId].seller == _user) {
            userAuctions[currentIndex] = auctions[info.nftAddress][info.tokenId];
            currentIndex++;
        }
    }

    return userAuctions;
  } 

  /// @notice Get all active auctions
  /// @return activeList Array of active auctions
  function getActiveAuctions() external view returns (Auction[] memory) {
    // 首先计算活跃拍卖的数量
    uint256 activeCount = 0;
    for (uint256 i = 0; i < auctionRegistry.length; i++) {
      AuctionInfo memory info = auctionRegistry[i];
      if (auctions[info.nftAddress][info.tokenId].status == AuctionStatus.IN_PROGRESS) {
        activeCount++;
      }
    }

    // 创建并填充活跃拍卖数组
    Auction[] memory activeList = new Auction[](activeCount);
    uint256 currentIndex = 0;
    
    for (uint256 i = 0; i < auctionRegistry.length && currentIndex < activeCount; i++) {
      AuctionInfo memory info = auctionRegistry[i];
      Auction memory auction = auctions[info.nftAddress][info.tokenId];
      if (auction.status == AuctionStatus.IN_PROGRESS) {
        activeList[currentIndex] = auction;
        currentIndex++;
      }
    }
    
    return activeList;
  }


}