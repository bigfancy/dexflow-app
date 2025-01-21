"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FaEthereum, FaExternalLinkAlt } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { useAccount } from "wagmi";
import { useAdDetail, useGenerateAdLink } from "~~/hooks/useAd";
import { shortenAddress } from "~~/utils/addresses";

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { ad, isLoading } = useAdDetail(params.id as string);
  const { address } = useAccount();
  const [generatingLink, setGeneratingLink] = useState(false);
  const [adLink, setAdLink] = useState<string | null>(null);
  const { handleGenerateLink, isGenerating, linkId } = useGenerateAdLink(params.id as string);

  useEffect(() => {
    if (linkId) {
      setAdLink(`${window.location.origin}/ad/share?adId=${params.id}&adLinkId=${linkId}&imageUrl=${ad?.imageUrl}`);
    }
  }, [linkId, params.id, ad?.imageUrl]);

  const onGenerateLink = async () => {
    if (!address) return;

    setGeneratingLink(true);
    try {
      const newLinkId = await handleGenerateLink();
      if (newLinkId) {
        setAdLink(
          `${window.location.origin}/ad/share?adId=${params.id}&adLinkId=${newLinkId}&imageUrl=${ad?.imageUrl}`,
        );
      }
    } catch (error) {
      console.error("Failed to generate link:", error);
    } finally {
      setGeneratingLink(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 w-1/4 mb-8 rounded" />
          <div className="aspect-video bg-gray-200 rounded-2xl mb-8" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 w-3/4 rounded" />
            <div className="h-6 bg-gray-200 w-1/2 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ad not found</h2>
          <button onClick={() => router.push("/ad")} className="mt-4 text-blue-600 hover:text-blue-700">
            Back to Ads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/ad")}
        className="mb-8 text-gray-600 hover:text-gray-800 flex items-center gap-2"
      >
        <MdArrowBack className="w-5 h-5" />
        Back to Ads
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="relative aspect-video">
            <Image src={ad.imageUrl} alt="Ad" fill className="object-cover" />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Ad Details</h1>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  ad.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {ad.isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Advertiser</h3>
                <p className="text-gray-900">{shortenAddress(ad.advertiser)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Target URL</h3>
                <a
                  href={ad.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  {new URL(ad.targetUrl).hostname}
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Budget</h3>
                <p className="text-xl font-semibold text-gray-900 flex items-center gap-1">
                  <FaEthereum className="text-[#627EEA]" />
                  {ad.budget}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Cost Per Click</h3>
                <p className="text-xl font-semibold text-gray-900 flex items-center gap-1">
                  <FaEthereum className="text-[#627EEA]" />
                  {ad.costPerClick}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Clicks</h3>
                <p className="text-xl font-semibold text-gray-900">{ad.totalClicks}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Reward</h3>
                <p className="text-xl font-semibold text-gray-900 flex items-center gap-1">
                  <FaEthereum className="text-[#627EEA]" />
                  {ad.totalReward}
                </p>
              </div>
            </div>

            {address && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                {!linkId ? (
                  <button
                    onClick={onGenerateLink}
                    disabled={generatingLink || isGenerating}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {generatingLink || isGenerating ? "Generating..." : "Generate Ad Link"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <p className="text-sm font-medium text-gray-900">Ad link has been generated</p>
                    </div>

                    <div className="mt-4 space-y-4">
                      {/* <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Your Ad Link:</p>
                        <div className="flex items-center gap-2">
                          <input type="text" value={adLink} readOnly className="flex-1 p-2 border rounded" />
                          <button
                            onClick={() => navigator.clipboard.writeText(adLink!)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Copy
                          </button>
                        </div>
                      </div> */}

                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Your Ad Link Code:</p>
                        <div className="relative">
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                            <code className="language-html">
                              {`<div id="ad-container">
  <iframe
    src="${window.location.origin}/share?adId=${params.id}&adLinkId=${linkId}&imageUrl=${ad?.imageUrl}"
    style="border: none; width: 300px; height: 250px;"
    scrolling="no"
    allow="fullscreen"
    title="Advertisement"
  ></iframe>
</div>`}
                            </code>
                          </pre>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                `<div id="ad-container">
                                  <iframe
                                    src="${window.location.origin}/share?adId=${params.id}&adLinkId=${linkId}&imageUrl=${ad?.imageUrl}"
                                    style="border: none; width: 300px; height: 250px;"
                                    scrolling="no"
                                    allow="fullscreen"
                                    title="Advertisement"
                                  ></iframe>
                                </div>`,
                              )
                            }
                            className="absolute top-2 right-2 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Preview:</p>
                        <div className="border rounded-lg p-4 bg-white">
                          <div id="ad-container">
                            <iframe
                              src={`${window.location.origin}/share?adId=${params.id}&adLinkId=${linkId}&imageUrl=${ad?.imageUrl}`}
                              style={{ border: "none", width: "600px", height: "500px" }}
                              scrolling="no"
                              allow="fullscreen"
                              title="Advertisement"
                            ></iframe>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
