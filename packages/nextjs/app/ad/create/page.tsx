"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { notification } from "antd";
import axios from "axios";
import { MdArrowBack, MdCloudUpload } from "react-icons/md";
import { useAccount } from "wagmi";
import { useCreateAd } from "~~/hooks/useAd";

interface UploadedFile {
  preview: string;
  file: File;
}

export default function CreateAdPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [costPerClick, setCostPerClick] = useState("");
  const [duration, setDuration] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // Use create ad hook
  const { handleCreateAd, isCreating } = useCreateAd(
    title,
    targetUrl,
    uploadedFile?.preview || "",
    budget,
    costPerClick,
    duration,
  );

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      notification.error({
        message: "Invalid file type",
        description: "Please upload an image file only",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notification.error({
        message: "File too large",
        description: "Image size should be less than 5MB",
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    setUploadedFile({ preview, file });
  };

  // Upload to IPFS via Pinata
  const uploadToPinata = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
    });

    return `ipfs://${response.data.IpfsHash}`;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      notification.error({
        message: "Wallet not connected",
        description: "Please connect your wallet first",
      });
      return;
    }

    if (!uploadedFile) {
      notification.error({
        message: "No image uploaded",
        description: "Please upload an image",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload image to IPFS
      const ipfsUrl = await uploadToPinata(uploadedFile.file);

      // Create ad using the hook
      const success = await handleCreateAd();
      if (success) {
        router.push("/ad");
      }
    } catch (error: any) {
      console.error("Failed to create ad:", error);
      notification.error({
        message: "Failed to create ad",
        description: error.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/ad")}
        className="mb-6 text-gray-400 hover:text-gray-300 flex items-center gap-2"
      >
        <MdArrowBack className="w-5 h-5" />
        Back to Ads
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Ad</h1>

        <div className="grid grid-cols-6 gap-8">
          {/* Left Side - Steps */}
          <div className="col-span-2 space-y-4">
            <div
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                currentStep === 1
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={() => setCurrentStep(1)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${currentStep === 1 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                >
                  1
                </span>
                <div>
                  <h3 className="font-semibold">Upload Media</h3>
                  <p className="text-sm text-gray-500">Upload your ad image</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                currentStep === 2
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={() => uploadedFile && setCurrentStep(2)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${currentStep === 2 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                >
                  2
                </span>
                <div>
                  <h3 className="font-semibold">Ad Details</h3>
                  <p className="text-sm text-gray-500">Set your ad parameters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="col-span-4 bg-white rounded-xl p-6 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      {uploadedFile ? (
                        <div className="relative aspect-video w-full">
                          <Image src={uploadedFile.preview} alt="Preview" fill className="object-contain rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setUploadedFile(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                              <span>Upload a file</span>
                              <input type="file" className="sr-only" accept="image/*" onChange={handleFileUpload} />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => uploadedFile && setCurrentStep(2)}
                      disabled={!uploadedFile}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Target URL</label>
                      <input
                        type="url"
                        value={targetUrl}
                        onChange={e => setTargetUrl(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Budget (DAT)</label>
                      <input
                        type="number"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Cost Per Click (DAT)</label>
                      <input
                        type="number"
                        value={costPerClick}
                        onChange={e => setCostPerClick(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Duration (Days)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        min="1"
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || isCreating || !isConnected}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isCreating ? "Creating..." : "Create Ad"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
