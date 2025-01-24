import Image from "next/image";
import CopyAddressButton from "~~/components/CopyAddressButton";

interface MiniNFTCardProps {
  address: string;
  tokenId: string;
  image: string;
}

export default function MiniNFTCard({ address, tokenId, image }: MiniNFTCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all border border-gray-200">
      <div className="relative aspect-square">
        <Image src={image || "/nft-placeholder.png"} alt={`NFT #${tokenId}`} fill className="object-cover" />
      </div>
      <div className="p-3 space-y-1">
        <div className="text-xs text-gray-500 truncate">
          <CopyAddressButton address={address} />
        </div>
        <div className="text-sm font-medium text-gray-900">#{tokenId}</div>
      </div>
    </div>
  );
}
