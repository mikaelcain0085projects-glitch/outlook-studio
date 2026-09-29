"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingPage, setPendingPage] = useState<number | null>(null);

  useEffect(() => {
    if (!isPending && pendingPage === currentPage) {
      setPendingPage(null);
    }
  }, [isPending, currentPage, pendingPage]);

  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (page: number) => {
    setPendingPage(page);

    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const query = params.toString();

    startTransition(() => {
      router.push(
        query
          ? `/admin/products?${query}`
          : "/admin/products"
      );
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-6">
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {pendingPage === currentPage - 1 && isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Loading...
          </span>
        ) : (
          "Previous"
        )}
      </button>

      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            disabled={isPending}
            className={
              page === currentPage
                ? "rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed"
                : "rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            {pendingPage === page && isPending ? (
              <span className="flex items-center gap-2">
                <span
                  className={
                    page === currentPage
                      ? "h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black"
                      : "h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  }
                />
                Loading...
              </span>
            ) : (
              page
            )}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {pendingPage === currentPage + 1 && isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Loading...
          </span>
        ) : (
          "Next"
        )}
      </button>
    </div>
  );
}