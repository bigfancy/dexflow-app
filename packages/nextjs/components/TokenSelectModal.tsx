import { useEffect, useState } from "react";
import Image from "next/image";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Token, useTokenList } from "~~/hooks/useTokenList";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken: Token;
}

export default function TokenSelectModal({ isOpen, onClose, onSelect, selectedToken }: TokenSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { tokens, recentTokens, isLoading, searchTokens, addRecentToken } = useTokenList();
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);

  useEffect(() => {
    setFilteredTokens(tokens);
  }, [tokens]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredTokens(searchTokens(searchQuery));
    } else {
      setFilteredTokens(tokens);
    }
  }, [searchQuery, tokens, searchTokens]);

  const handleSelectToken = (token: Token) => {
    addRecentToken(token);
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
            <h2 className="text-xl font-semibold text-gray-900">Select a token</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
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
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Token List */}
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "60vh" }}>
            {/* Recent Tokens */}
            {recentTokens.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Recent searches</h3>
                <div className="space-y-2">
                  {recentTokens.slice(0, 3).map(token => (
                    <TokenItem
                      key={token.symbol}
                      token={token}
                      selected={selectedToken.symbol === token.symbol}
                      onSelect={handleSelectToken}
                    />
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-sm font-medium text-gray-500 mb-2">Tokens</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              </div>
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map(token => (
                <TokenItem
                  key={token.symbol}
                  token={token}
                  selected={selectedToken.symbol === token.symbol}
                  onSelect={handleSelectToken}
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No tokens found</div>
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
  token: Token;
  selected: boolean;
  onSelect: (token: Token) => void;
}) {
  return (
    <button
      onClick={() => onSelect(token)}
      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors ${
        selected ? "bg-gray-100" : ""
      }`}
    >
      {token.logoURI ? (
        <Image src={token.logoURI} alt={token.name} width={32} height={32} className="rounded-full" />
      ) : (
        token.icon
      )}
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-900">{token.symbol}</div>
        <div className="text-sm text-gray-500">{token.name}</div>
      </div>
      {selected && <div className="text-blue-500">Selected</div>}
    </button>
  );
}
