"use client";

import { useSearchParams } from "next/navigation";

export default function AdSharePage() {
  const searchParams = useSearchParams();
  const adId = searchParams.get("adId");
  const adLinkId = searchParams.get("adLinkId");
  const imageUrl = searchParams.get("imageUrl");

  if (!adId || !adLinkId || !imageUrl) {
    return null;
  }

  // 返回纯 HTML 字符串
  return (
    <html>
      <head>
        <style>{`
          * { margin: 0; padding: 0; }
          body { overflow: hidden; }
          img { 
            width: 100%;
            height: 100vh;
            object-fit: cover;
            cursor: pointer;
            display: block;
          }
        `}</style>
      </head>
      <body>
        <img
          src={imageUrl}
          alt="Advertisement"
          onClick={() => window.open(`/api/ad/click?adId=${adId}&adLinkId=${adLinkId}&imageUrl=${imageUrl}`, "_blank")}
        />
      </body>
    </html>
  );
}
