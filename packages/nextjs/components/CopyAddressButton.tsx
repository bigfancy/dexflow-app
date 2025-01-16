import React, { useCallback, useState } from "react";
import { shortenAddress } from "../utils/addresses";
import { FiCopy } from "react-icons/fi";

const InlineCopyAddressButton: React.FC<{ address: string }> = ({ address }) => {
  const [tooltip, setTooltip] = useState("");

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setTooltip("copied");
      setTimeout(() => setTooltip(""), 2000); // Tooltip disappears after 2 seconds
    } catch (err) {
      setTooltip("Failed to copy!");
      setTimeout(() => setTooltip(""), 2000); // Tooltip disappears after 2 seconds
    }
  }, [address]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
      }}
    >
      <span style={{ marginRight: "8px" }}>{shortenAddress(address)}</span>
      <button onClick={copyToClipboard} style={{ border: "none", background: "none", cursor: "pointer" }}>
        <FiCopy />
        {tooltip && <div style={tooltipStyle}>{tooltip}</div>}
      </button>
    </div>
  );
};

// CSS for the tooltip
const tooltipStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "100%",
  left: "80%",
  transform: "translateX(-50%)",
  padding: "8px",
  color: "white",
  backgroundColor: "black",
  borderRadius: "4px",
  fontSize: "14px",
  whiteSpace: "nowrap",
};

export default InlineCopyAddressButton;
