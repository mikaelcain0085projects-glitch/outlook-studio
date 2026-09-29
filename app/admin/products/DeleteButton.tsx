"use client";

import { useFormStatus } from "react-dom";

export default function DeleteButton() {
  const { pending } = useFormStatus();

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      event.preventDefault();
    }
  };

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400"
          aria-hidden="true"
        />
      )}

      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}