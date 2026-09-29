"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BackToProductsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    router.push("/admin/products");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="group inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-[#171717]/75 px-4 text-[9px] font-medium uppercase tracking-[0.16em] text-white/75 shadow-[0_8px_24px_rgba(23,23,23,0.10)] backdrop-blur-md transition-all duration-300 hover:border-[#9A5963]/45 hover:bg-[#171717]/90 hover:text-[#F3B7C0] hover:shadow-[0_8px_28px_rgba(154,89,99,0.22)]"
    >
      {loading && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden="true"
        />
      )}

      {loading ? "Going Back..." : "← Back to Products"}
    </button>
  );
}