"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function BackToProductsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          router.push("/admin/products");
        });
      }}
      disabled={isPending}
      className="group inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-[#252525] px-5 text-[9px] font-medium uppercase tracking-[0.16em] text-white/80 shadow-[0_8px_24px_rgba(23,23,23,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-[#171717] hover:text-white hover:shadow-[0_12px_30px_rgba(23,23,23,0.20)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <>
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white"
            aria-hidden="true"
          />
          Loading...
        </>
      ) : (
        <>
          <span
            className="text-sm leading-none transition-transform duration-300 group-hover:-translate-x-0.5"
            aria-hidden="true"
          >
            ←
          </span>
          Back to Products
        </>
      )}
    </button>
  );
}