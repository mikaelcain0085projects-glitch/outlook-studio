"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;

    setLoading(true);
    router.push("/admin");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-[#16A34A] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_8px_24px_rgba(22,163,74,0.16)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#22C55E] hover:shadow-[0_10px_32px_rgba(0,0,0,0.28)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-[#16A34A] disabled:hover:shadow-[0_8px_24px_rgba(22,163,74,0.16)]"
    >
      {loading ? (
        <>
          <span
            className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <span>←</span>
          <span>Dashboard</span>
        </>
      )}
    </button>
  );
}