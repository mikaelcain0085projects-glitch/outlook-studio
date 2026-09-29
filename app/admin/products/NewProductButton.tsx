"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProductButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    router.push("/admin/products/new");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="
        group
        inline-flex
        items-center
        justify-center
        gap-2.5
        rounded-xl
        border
        border-[#E0AE24]
        bg-[#F4C542]
        px-5
        py-2.5
        text-sm
        font-semibold
        text-[#172554]
        shadow-[0_4px_14px_rgba(180,140,30,0.18)]
        transition-all
        duration-300
        ease-out
        hover:-translate-y-0.5
        hover:bg-[#F7CF55]
        hover:shadow-[0_0_0_1px_rgba(56,189,248,0.25),0_0_24px_rgba(56,189,248,0.38),0_8px_24px_rgba(14,116,144,0.16)]
        active:translate-y-0
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:hover:translate-y-0
        disabled:hover:shadow-[0_4px_14px_rgba(180,140,30,0.18)]
      "
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-[#172554]/25 border-t-[#172554]"
            aria-hidden="true"
          />
          Opening...
        </>
      ) : (
        <>
          <span
            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-md
              bg-[#172554]
              text-sm
              font-medium
              leading-none
              text-[#F4C542]
              transition-transform
              duration-300
              group-hover:rotate-90
            "
            aria-hidden="true"
          >
            +
          </span>

          New Product
        </>
      )}
    </button>
  );
}