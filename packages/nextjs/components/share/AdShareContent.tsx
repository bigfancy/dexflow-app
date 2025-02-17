"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AdShareContent() {
  const searchParams = useSearchParams();
  const adId = searchParams.get("adId");
  const adLinkId = searchParams.get("adLinkId");
  const imageUrl = searchParams.get("imageUrl");

  useEffect(() => {
    // 记录广告展示
    if (adId && adLinkId) {
      // TODO: 调用 API 记录展示
    }
  }, [adId, adLinkId]);

  if (!adId || !adLinkId || !imageUrl) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
        }
        body {
          overflow: hidden;
        }
        img {
          width: 100%;
          height: 100vh;
          object-fit: cover;
          cursor: pointer;
          display: block;
        }
      `}</style>
      <img
        src={imageUrl}
        alt="Advertisement"
        onClick={() => window.open(`/api/ad/click?adId=${adId}&adLinkId=${adLinkId}&imageUrl=${imageUrl}`, "_blank")}
      />
    </>
  );
}
