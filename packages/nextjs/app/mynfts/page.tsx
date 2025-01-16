"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNFTs } from "@/store/nftSlice"; // 导入 fetchNFTs
import { RootState } from "@/store"; // 导入 RootState 类型
import NFTCard from "@/components/NFTCard";

export default function HomePage() {
  const dispatch = useDispatch();
  const { nfts, loading, error } = useSelector(
    (state: RootState) => state.nfts
  ); // 从状态中选择 nfts

  useEffect(() => {
    const owner = process.env.NEXT_PUBLIC_OWNER_ADDRESS;
    dispatch(fetchNFTs(owner)); // 调用 fetchNFTs 获取 NFT 列表
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>; // 加载状态
  }

  if (error) {
    return <div>Error: {error}</div>; // 错误状态
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My NFTs</h1>

      {nfts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="mb-4">You don't own any NFTs yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <NFTCard key={nft.id} {...nft} />
          ))}
        </div>
      )}
    </div>
  );
}
