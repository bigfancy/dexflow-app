export interface EnglishAuction {
  auctionType: string;
  transactionHash: string;
  auctionId: string;
  seller: string;
  nftAddress: string;
  tokenId: string;
  tokenURI: string;
  startingAt: string;
  endingAt: string;
  startingPrice: string;
  status: string;
  highestBid: string;
  highestBidder: string;
  bidders: Array<{ bidder: string; bidAmount: string; bidTime: string }>;
}

export interface BidEvent {
  bidder: string;
  bidAmount: string;
  bidTime: string;
}

export interface DutchAuction {
  auctionType: string;
  transactionHash: string;
  auctionId: string;
  seller: string;
  nftAddress: string;
  tokenId: string;
  tokenURI: string;
  startingAt: string;
  endingAt: string;
  startingPrice: string;
  discountRate: string;
  status: string;
}

export type Auction = EnglishAuction | DutchAuction;
