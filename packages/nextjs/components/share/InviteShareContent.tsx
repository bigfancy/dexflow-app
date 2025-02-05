"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

export default function InviteShareContent() {
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const inviteCode = searchParams.get("code");

  useEffect(() => {
    if (inviteCode && address) {
      handleInvite();
    }
  }, [inviteCode, address]);

  const handleInvite = async () => {
    try {
      // 处理邀请逻辑
      notification.success("Welcome to DexFlow!");
    } catch (error) {
      console.error("Failed to process invite:", error);
      notification.error("Failed to process invite");
    }
  };

  if (!inviteCode) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Welcome to DexFlow!</h1>
        <p className="text-gray-600 text-center">
          {address
            ? inviteCode
              ? "Processing your invitation..."
              : "Invalid invitation link"
            : "Please connect your wallet to continue"}
        </p>
      </div>
    </div>
  );
}
