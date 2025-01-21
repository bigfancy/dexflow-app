"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAdDetail } from "~~/hooks/useAd";

export default function AdRedirectPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const { ad } = useAdDetail(params.linkId as string);

  useEffect(() => {
    if (ad) {
      // Record click
      fetch("/api/ad/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: params.linkId }),
      }).then(() => {
        // Redirect to target URL after short delay
        setTimeout(() => {
          window.location.href = ad.targetUrl;
        }, 3000);
      });
    }
  }, [ad, params.linkId]);

  if (!ad) {
    return <div>Ad not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative aspect-video mb-8">
          <Image src={ad.imageUrl} alt="Ad" fill className="object-contain" />
        </div>
        <p className="text-lg">Redirecting to {new URL(ad.targetUrl).hostname} in 3 seconds...</p>
      </div>
    </div>
  );
}
