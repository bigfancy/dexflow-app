"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdCloudUpload } from "react-icons/md";
import Image from "next/image";
import { useAccount } from "wagmi";
import { toast } from "react-hot-toast";
import { Web3Storage } from "web3.storage";

interface UploadedFile {
  preview: string;
  file: File;
  type: "image" | "video";
}

export default function CreateAdPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);

  // 表单状态
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [costPerClick, setCostPerClick] = useState("");
  const [duration, setDuration] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const fileType = file.type.split("/")[0];
    if (fileType !== "image" && fileType !== "video") {
      toast.error("Please upload an image or video file");
      return;
    }

    // 检查文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    setUploadedFile({
      preview,
      file,
      type: fileType as "image" | "video",
    });
  };

  // 上传文件到 IPFS
  const uploadToIPFS = async (file: File): Promise<string> => {
    const client = new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN!,
    });
    const files = [file];
    const cid = await client.put(files);
    return `https://${cid}.ipfs.w3s.link/${file.name}`;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!uploadedFile) {
      toast.error("Please upload an image or video");
      return;
    }

    setLoading(true);

    try {
      // 上传文件到 IPFS
      const ipfsUrl = await uploadToIPFS(uploadedFile.file);

      // TODO: 调用智能合约创建广告
      const adData = {
        title,
        targetUrl,
        budget,
        costPerClick,
        duration,
        mediaUrl: ipfsUrl,
        advertiser: address,
      };

      console.log("Creating ad:", adData);

      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Ad created successfully!");
      router.push("/ad");
    } catch (error) {
      console.error("Failed to create ad:", error);
      toast.error("Failed to create ad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/ad")}
        className="mb-8 text-gray-600 hover:text-gray-800 flex items-center gap-2"
      >
        <MdArrowBack className="w-5 h-5" />
        Back to Ads
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Ad</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload Media (Image or Video)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              {uploadedFile ? (
                <div className="relative aspect-video w-full">
                  {uploadedFile.type === "image" ? (
                    <Image
                      src={uploadedFile.preview}
                      alt="Preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  ) : (
                    <video
                      src={uploadedFile.preview}
                      controls
                      className="w-full h-full rounded-lg"
                    />
                  )}
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
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, MP4 up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Target URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target URL
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Budget (DAT)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Cost Per Click */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost Per Click (DAT)
            </label>
            <input
              type="number"
              value={costPerClick}
              onChange={(e) => setCostPerClick(e.target.value)}
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (Days)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isConnected}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              loading || !isConnected
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating..." : "Create Ad"}
          </button>
        </form>
      </div>
    </div>
  );
}
