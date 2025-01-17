import React, { useState } from "react";
import { shortenAddress } from "../utils/addresses";
import CopyToClipboard from "react-copy-to-clipboard";
import { FiCheckCircle, FiCopy } from "react-icons/fi";

const CopyAddressButton: React.FC<{ address: string }> = ({ address }) => {
  const [addressCopied, setAddressCopied] = useState(false);
  const handleCopy = () => {
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000); // Tooltip disappears after 2 seconds
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", position: "relative" }}>
      <span style={{ marginRight: "8px" }}>{shortenAddress(address)}</span>
      <CopyToClipboard text={address} onCopy={handleCopy}>
        <button style={{ border: "none", background: "none", cursor: "pointer" }}>
          {addressCopied ? <FiCheckCircle /> : <FiCopy />}
        </button>
      </CopyToClipboard>
    </div>
  );
};

export default CopyAddressButton;
