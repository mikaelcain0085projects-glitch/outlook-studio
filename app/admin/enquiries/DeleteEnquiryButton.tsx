"use client";

import { useFormStatus } from "react-dom";

export default function DeleteEnquiryButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-red-900/10 bg-white px-5 py-3 text-[9px] font-medium uppercase tracking-[0.16em] text-red-600 transition-all duration-300 hover:border-red-900/20 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
    >
      {pending ? (
        <>
          <span
            className="h-3 w-3 animate-spin rounded-full border-2 border-red-600/20 border-t-red-600"
            aria-hidden="true"
          />
          <span>Deleting...</span>
        </>
      ) : (
        "Delete"
      )}
    </button>
  );
}