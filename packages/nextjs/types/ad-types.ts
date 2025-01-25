// export interface Ad {
//   id: string;
//   title: string;
//   image: string;
//   creator: string;
//   advertiser: string;
//   target: string;
//   budget: string;
//   costPerClick: string;
//   totalClicks: number;
//   totalReward: string;
//   impressions: number;
//   startingAt: string;
//   endingAt: string;
//   status: string;
//   isActive: boolean;
// }

export interface Ad {
  id: string;
  advertiser: string;
  targetUrl: string;
  imageUrl: string;
  budget: string;
  costPerClick: string;
  totalClicks: string;
  totalReward: string;
  isActive: boolean;
}
