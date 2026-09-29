"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BackToHomeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="
        inline-flex
        h-11
        items-center
        justify-center
        gap-2.5
        rounded-xl
        bg-[#2563EB]
        px-5
        text-[13px]
        font-semibold
        tracking-[-0.01em]
        text-white
        shadow-[0_4px_14px_rgba(37,99,235,0.18)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:bg-[#1D4ED8]
        hover:shadow-[0_8px_22px_rgba(37,99,235,0.25)]
        active:translate-y-0
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? (
        <>
          <span
            className="
              h-4
              w-4
              animate-spin
              rounded-full
              border-2
              border-white/30
              border-t-white
            "
            aria-hidden="true"
          />
          Going Home...
        </>
      ) : (
        <>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M9 21V14H15V21"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>

          Back to Home
        </>
      )}
    </button>
  );
}