"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type EditButtonProps = {
  productId: string;
};

export default function EditButton({
  productId,
}: EditButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    router.push(`/admin/products/${productId}/edit`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="
        inline-flex
        h-8
        items-center
        justify-center
        gap-1.5
        rounded-lg
        border
        border-[#DCDCDC]
        bg-white
        px-3
        text-[11px]
        font-semibold
        text-[#222222]
        shadow-sm
        transition-all
        duration-200
        hover:border-[#16C172]
        hover:bg-[#F3FFF8]
        hover:text-[#119957]
        active:scale-[0.97]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? (
        <>
          <span
            className="
              h-3.5
              w-3.5
              animate-spin
              rounded-full
              border-2
              border-[#16C172]/30
              border-t-[#16C172]
            "
            aria-hidden="true"
          />
          Opening...
        </>
      ) : (
        <>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 20H21"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L8 18L3 19L4 14L16.5 3.5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          Edit
        </>
      )}
    </button>
  );
}