import Image from "next/image";
import { FaEthereum } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { MdToken } from "react-icons/md";
import CopyAddressButton from "./CopyAddressButton";

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  contractAddress: string;
}

export default function NFTCard({
  id,
  name,
  image,
  price,
  tokenId,
  contractAddress,
}: NFTCardProps) {
  const router = useRouter();

  return (
    <div
      className="bg-gray-800 rounded-xl overflow-hidden  hover:shadow-lg transition-transform  hover:scale-105 hover:bg-gray-750 "
      // onClick={() => router.push(`/mynfts/${id}`)}
    >
      {/* NFT Image */}
      <div className="relative aspect-square">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>

      {/* NFT Info */}
      <div className="flex justify-between px-6 py-2">
        <span className="text-gray-400">NFT Contract</span>
        <span className="text-gray-200">
          <CopyAddressButton address={contractAddress} />
        </span>
      </div>

      <div className=" flex justify-between px-6 py-2 mb-4">
        <span className="text-gray-400">Token ID</span>
        <span className="text-bold text-gray-200">#{tokenId}</span>
      </div>
    </div>
  );
}
