"use client";

import { Suspense } from "react";
import AdShareContent from "~~/components/share/AdShareContent";
import InviteShareContent from "~~/components/share/InviteShareContent";

export default function SharePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <AdShareContent />
        <InviteShareContent />
      </div>
    </Suspense>
  );
}
