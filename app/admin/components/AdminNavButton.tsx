"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

type AdminNavButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  loadingText?: string;
};

export default function AdminNavButton({
  href,
  children,
  className = "",
  loadingText = "Opening...",
}: AdminNavButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;

    setLoading(true);
    router.push(href);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {loading ? (
        <>
          <span
            className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current/25 border-t-current"
            aria-hidden="true"
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
