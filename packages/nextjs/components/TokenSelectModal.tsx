import { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import Image from "next/image";
import TokenListService, {
  ExtendedTokenInfo,
} from "@/services/tokenListService";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: ExtendedTokenInfo) => void;
  selectedToken?: ExtendedTokenInfo;
}

export default function TokenSelectModal({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
}: TokenSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tokens, setTokens] = useState<ExtendedTokenInfo[]>([]);
  const [recentTokens, setRecentTokens] = useState<ExtendedTokenInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const tokenListService = TokenListService.getInstance();

  useEffect(() => {
    if (isOpen) {
      loadTokens();
      setRecentTokens(tokenListService.getRecentTokens());
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      searchTokens();
    } else {
      loadTokens();
    }
  }, [searchQuery]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const tokenList = await tokenListService.getTokenList();
      setTokens(tokenList);
    } catch (error) {
      console.error("Failed to load tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchTokens = async () => {
    setLoading(true);
    try {
      const results = await tokenListService.searchTokens(searchQuery);
      setTokens(results);
    } catch (error) {
      console.error("Failed to search tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectToken = (token: ExtendedTokenInfo) => {
    tokenListService.addRecentToken(token);
    onSelect(token);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl w-full max-w-md p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Select a token
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search token"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Token List */}
          <div
            className="space-y-2 overflow-y-auto"
            style={{ maxHeight: "60vh" }}
          >
            {/* Recent Tokens */}
            {recentTokens.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Recent searches
                </h3>
                <div className="space-y-2">
                  {recentTokens.slice(0, 3).map((token) => (
                    <TokenItem
                      key={token.address}
                      token={token}
                      selected={selectedToken?.address === token.address}
                      onSelect={handleSelectToken}
                    />
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-sm font-medium text-gray-500 mb-2">Tokens</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              </div>
            ) : tokens.length > 0 ? (
              tokens.map((token) => (
                <TokenItem
                  key={token.address}
                  token={token}
                  selected={selectedToken?.address === token.address}
                  onSelect={handleSelectToken}
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No tokens found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenItem({
  token,
  selected,
  onSelect,
}: {
  token: ExtendedTokenInfo;
  selected: boolean;
  onSelect: (token: ExtendedTokenInfo) => void;
}) {
  return (
    <button
      onClick={() => onSelect(token)}
      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
    >
      <div className="w-8 h-8 relative">
        {token.logoURI ? (
          <Image
            src={token.logoURI}
            alt={token.name}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">
              {token.symbol.slice(0, 2)}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-900">{token.name}</div>
        <div className="text-sm text-gray-500">{token.symbol}</div>
      </div>
      {selected && <div className="text-blue-500">Selected</div>}
    </button>
  );
}
