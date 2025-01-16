import Image from 'next/image';
import { FaEthereum } from 'react-icons/fa';

interface MiniNFTCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  tokenId: string;
  onClick: () => void;
}

export default function MiniNFTCard({ name, image, price, tokenId, onClick }: MiniNFTCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-gray-700/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
    >
      <div className="relative aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-100 truncate">{name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">#{tokenId}</span>
          <div className="flex items-center gap-1">
            <FaEthereum className="text-blue-400 w-3 h-3" />
            <span className="text-xs text-gray-200">{price}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 