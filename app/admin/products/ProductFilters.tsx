"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useTransition } from "react";

const FILTERS = [
  { label: "All", slug: "all" },
  { label: "Boys", slug: "boys" },
  { label: "Girls", slug: "girls" },
  { label: "Shoes", slug: "shoes" },
  { label: "Accessories", slug: "accessories" },
];

type ProductFiltersProps = {
  activeFilter: string;
};

export default function ProductFilters({
  activeFilter,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const handleFilter = (slug: string) => {
    if (slug === activeFilter || isPending) {
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.delete("page");

    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }

    const query = params.toString();

    startTransition(() => {
      router.push(
        query
          ? `${pathname}?${query}`
          : pathname
      );
    });
  };

  return (
    <section className="px-5 py-5 sm:px-6">
      <div className="flex items-center gap-7 overflow-x-auto scrollbar-none">
        <span className="shrink-0 text-[8px] font-medium uppercase tracking-[0.28em] text-[#171717]/30">
          Collection
        </span>

        <div className="h-4 w-px shrink-0 bg-[#171717]/10" />

        <div className="flex items-center gap-6 sm:gap-8">
          {FILTERS.map((filter) => {
            const isActive =
              activeFilter === filter.slug;

            const isLoading =
              isPending && isActive;

            return (
              <button
                key={filter.slug}
                type="button"
                onClick={() =>
                  handleFilter(filter.slug)
                }
                disabled={isPending}
                className={[
                  "group relative shrink-0 pb-2 text-[9px] font-medium uppercase tracking-[0.18em] transition-all duration-300",
                  isActive
                    ? "text-[#171717]"
                    : "text-[#171717]/35 hover:text-[#171717]/75",
                  "disabled:cursor-not-allowed",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  {isLoading && (
                    <span
                      className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-[#171717]/15 border-t-[#171717]/70"
                      aria-hidden="true"
                    />
                  )}

                  {filter.label}
                </span>

                <span
                  className={[
                    "absolute bottom-0 left-0 h-px bg-[#171717] transition-all duration-300",
                    isActive
                      ? "w-full"
                      : "w-0 group-hover:w-1/2",
                  ].join(" ")}
                />

                {isActive && !isLoading && (
                  <span className="absolute -right-2 -top-1 h-1 w-1 rounded-full bg-[#16C172]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}