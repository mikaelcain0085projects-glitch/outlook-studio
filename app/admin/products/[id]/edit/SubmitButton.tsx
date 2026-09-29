"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] px-6 py-3.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_8px_24px_rgba(22,163,74,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#15803D] hover:shadow-[0_12px_30px_rgba(22,163,74,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/25 border-t-white"
            aria-hidden="true"
          />
          Saving Changes...
        </>
      ) : (
        <>
          <span
            className="text-sm leading-none transition-transform duration-300 group-hover:translate-y-[-1px]"
            aria-hidden="true"
          >
            ✓
          </span>
          Save Changes
        </>
      )}
    </button>
  );
}