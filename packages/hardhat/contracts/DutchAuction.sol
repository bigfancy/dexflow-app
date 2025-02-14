// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {DFNFT} from "./DFNFT.sol";
import "hardhat/console.sol"; // used in testing chains

// ---

contract DutchAuction {
  IERC20 public immutable dfToken;
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
    uint256 currentPrice;
    uint256 discountRate;
    AuctionStatus status;
  }

  // 使用单个数组来跟踪所有拍卖
  struct AuctionInfo {
    address nftAddress;
    uint256 tokenId;
  }

  uint256 private constant DURATION = 7 days;

  /// @notice NFT address -> tokenId -> Auction Object
  mapping(address => mapping(uint256 => Auction)) public auctions;
  
  AuctionInfo[] public auctionRegistry;

  /// @dev The available state of the auction
  enum AuctionStatus {
    NOT_CREATED,
    IN_PROGRESS,
    ENDED
  }

  // Events for auction lifecycle
  event AuctionCreated(address indexed nftAddress, uint256 indexed tokenId);
  event AuctionEnded(address indexed nftAddress, uint256 indexed tokenId, address winner);
  
  // Events replacing errors
  event InvalidAddress(address nftAddress);
  event NotOwner(address nftAddress, uint256 tokenId, address seller);
  event NotApproved(address nftAddress, uint256 tokenId, address owner);
  event FloorPriceLessThanZero(uint256 startingPrice, uint256 discountRate, uint256 duration);
  event AuctionAlreadyCreated(address nftAddress, uint256 tokenId);
  event AuctionNotInProgress(address nftAddress, uint256 tokenId);
  event InsufficientPayment(address nftAddress, uint256 tokenId, uint256 price, uint256 paid);
  event RefundFailed(address buyer, uint256 amount);
  event PaymentFailed(address seller, uint256 amount);
  event NotAuctionSeller(address caller, address seller);

  modifier isAuctionNotCreated(address _nftAddress, uint256 _tokenId) {
    Auction memory auction = auctions[_nftAddress][_tokenId];
    if (auction.status != AuctionStatus.NOT_CREATED) {
      emit AuctionAlreadyCreated(_nftAddress, _tokenId);
      revert("Auction already created");
    }
    _;
  }

  modifier isAuctionInProgress(address _nftAddress, uint256 _tokenId) {
    Auction memory auction = auctions[_nftAddress][_tokenId];
    if (auction.status != AuctionStatus.IN_PROGRESS) {
      emit AuctionNotInProgress(_nftAddress, _tokenId);
      revert("Auction not in progress");
    }
    _;
  }

  constructor(address _dfTokenAddress) {
      require(_dfTokenAddress != address(0), "Invalid address");
      dfToken = IERC20(_dfTokenAddress);
  }

  /**
   * @notice Create new auction for a given NFT item
   */
  function createAuction(
    address _nftAddress,
    uint256 _tokenId,
    uint256 _startingPrice,
    uint256 _discountRate
  ) external {
    if (_nftAddress == address(0)) {
      emit InvalidAddress(_nftAddress);
      revert("Invalid address");
    }
    
    if (IERC721(_nftAddress).ownerOf(_tokenId) != msg.sender) {
      emit NotOwner(_nftAddress, _tokenId, msg.sender);
      revert("Not owner of NFT");
    }
    
    if (IERC721(_nftAddress).getApproved(_tokenId) != address(this) &&
        !IERC721(_nftAddress).isApprovedForAll(msg.sender, address(this))) {
      emit NotApproved(_nftAddress, _tokenId, msg.sender);
      revert("Not approved for NFT");
    }
    console.log("_startingPrice", _startingPrice);
    console.log("_discountRate * DURATION = ", _discountRate * DURATION);
    if (_startingPrice < _discountRate * DURATION) {
      emit FloorPriceLessThanZero(_startingPrice, _discountRate, DURATION);
      revert("Floor price less than zero");
    }

    // If the auction was ended then we will reset it again
    Auction storage auction = auctions[_nftAddress][_tokenId];
    if (auction.status == AuctionStatus.ENDED) {
      auctions[_nftAddress][_tokenId].status = AuctionStatus.NOT_CREATED;
    }

    _createAuction(_nftAddress, _tokenId, _startingPrice, _discountRate);
  }

  function buyItem(
    address _nftAddress,
    uint256 _tokenId
  ) external payable isAuctionInProgress(_nftAddress, _tokenId) {
    Auction memory auction = getAuction(_nftAddress, _tokenId);
    uint256 price = getPrice(_nftAddress, _tokenId);

    // 确保用户已授权合约可以转移其代币
    require(dfToken.allowance(msg.sender, address(this)) >= price, "Insufficient allowance");

    console.log("price = ", price);
    console.log("Buyer balance before transfer:", dfToken.balanceOf(msg.sender));
    console.log("Contract balance before transfer:", dfToken.balanceOf(address(this)));
    // 从用户转移代币到合约
    require(dfToken.transferFrom(msg.sender, address(this), price), "Transfer failed");
    console.log("Buyer balance after transfer:", dfToken.balanceOf(msg.sender));
    console.log("Contract balance after transfer:", dfToken.balanceOf(address(this)));
    IERC721(_nftAddress).safeTransferFrom(auction.seller, msg.sender, _tokenId);


    _endAuction(_nftAddress, _tokenId);
    
    emit AuctionEnded(_nftAddress, _tokenId, msg.sender);
  }

  function cancelAuction(
    address _nftAddress,
    uint256 _tokenId
  ) external isAuctionInProgress(_nftAddress, _tokenId) {
    Auction memory auction = getAuction(_nftAddress, _tokenId);
    if (auction.seller != msg.sender) {
      emit NotAuctionSeller(msg.sender, auction.seller);
      revert("Not auction seller");
    }

    _endAuction(_nftAddress, _tokenId);
    
    emit AuctionEnded(_nftAddress, _tokenId, address(0));
  }

  function _createAuction(
    address _nftAddress,
    uint256 _tokenId,
    uint256 _startingPrice,
    uint256 _discountRate
  ) private isAuctionNotCreated(_nftAddress, _tokenId) {
    string memory tokenURI = DFNFT(_nftAddress).tokenURI(_tokenId);
    
    auctions[_nftAddress][_tokenId].seller = msg.sender;
    auctions[_nftAddress][_tokenId].nftInfo = NFTInfo({
      nftAddress: _nftAddress,
      tokenId: _tokenId,
      tokenURI: tokenURI
    });
    auctions[_nftAddress][_tokenId].startingAt = block.timestamp;
    auctions[_nftAddress][_tokenId].endingAt = block.timestamp + DURATION;
    auctions[_nftAddress][_tokenId].startingPrice = _startingPrice;
    auctions[_nftAddress][_tokenId].currentPrice = _startingPrice;
    auctions[_nftAddress][_tokenId].discountRate = _discountRate;
    auctions[_nftAddress][_tokenId].status = AuctionStatus.IN_PROGRESS;

    // 添加到注册表
    auctionRegistry.push(AuctionInfo({
      nftAddress: _nftAddress,
      tokenId: _tokenId
    }));

    emit AuctionCreated(_nftAddress, _tokenId);
  }

  function _endAuction(address _nftAddress, uint256 _tokenId) private {
    auctions[_nftAddress][_tokenId].status = AuctionStatus.ENDED;
  }

  function getPrice(
    address _nftAddress,
    uint256 _tokenId
  ) public view returns (uint256) {
    Auction memory auction = auctions[_nftAddress][_tokenId];
    uint256 timeElapsed = block.timestamp - auction.startingAt;
    uint256 discount = auction.discountRate * timeElapsed;
    return auction.startingPrice - discount;
  }

  function getAuction(
    address _nftAddress,
    uint256 _tokenId
  ) public view returns (Auction memory) {
    return auctions[_nftAddress][_tokenId];
  }

  /// @notice Get all auctions
  function getAllAuctions() external view returns (Auction[] memory) {
    Auction[] memory auctionList = new Auction[](auctionRegistry.length);
    
    for (uint256 i = 0; i < auctionRegistry.length; i++) {
      AuctionInfo memory info = auctionRegistry[i];
      auctionList[i] = auctions[info.nftAddress][info.tokenId];
    }
    
    return auctionList;
  }

  /// @notice Get all active auctions
  function getActiveAuctions() external view returns (Auction[] memory) {
    uint256 activeCount = 0;
    for (uint256 i = 0; i < auctionRegistry.length; i++) {
      AuctionInfo memory info = auctionRegistry[i];
      if (auctions[info.nftAddress][info.tokenId].status == AuctionStatus.IN_PROGRESS) {
        activeCount++;
      }
    }

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

  function getDuration() public pure returns (uint256) {
    return DURATION;
  }
}