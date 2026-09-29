import Link from "next/link";

import { redirect } from "next/navigation";
import AdminNavButton from "../components/AdminNavButton";

import { createClient } from "@/lib/supabase-server";

import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";
import NewProductButton from "./NewProductButton";
import Pagination from "./Pagination";
import ProductFilters from "./ProductFilters";
import { deleteProduct } from "./actions";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
};

type ProductImage = {
  url?: string;
  publicId?: string;
  type?: string;
};

const FILTERS = [
  { label: "All", slug: "all" },
  { label: "Boys", slug: "boys" },
  { label: "Girls", slug: "girls" },
  { label: "Shoes", slug: "shoes" },
  { label: "Accessories", slug: "accessories" },
];

function getStockStatus(stock: number) {
  if (stock <= 0) {
    return {
      label: "Out of stock",
      dot: "bg-red-500",
      text: "text-red-600",
    };
  }

  if (stock <= 5) {
    return {
      label: "Low stock",
      dot: "bg-orange-500",
      text: "text-orange-600",
    };
  }

  return {
    label: "In stock",
    dot: "bg-[#16C172]",
    text: "text-[#119957]",
  };
}

function getFrontImage(images: unknown) {
  if (!Array.isArray(images)) {
    return null;
  }

  const typedImages = images as ProductImage[];

  return (
    typedImages.find((image) => image?.type === "front") ??
    typedImages[0] ??
    null
  );
}

function normalizeCategory(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

function findCategoryIds(
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>,
  filterSlug: string
) {
  if (filterSlug === "all") {
    return [];
  }

  return categories
    .filter((category) => {
      const categorySlug = normalizeCategory(
        category.slug ?? ""
      );

      return categorySlug.startsWith(
        normalizeCategory(`${filterSlug}-`)
      );
    })
    .map((category) => category.id);
}

export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  /* --------------------------------
     AUTHENTICATION
  -------------------------------- */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

  if (profileError || !profile?.is_admin) {
    redirect("/");
  }

  /* --------------------------------
     FILTER + PAGINATION
  -------------------------------- */

  const requestedCategory =
    params.category?.toLowerCase() ?? "all";

  const activeFilter = FILTERS.some(
    (filter) => filter.slug === requestedCategory
  )
    ? requestedCategory
    : "all";

  const requestedPage = Number(params.page ?? "1");

  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const pageSize = 10;

  /* --------------------------------
     CATEGORIES
  -------------------------------- */

  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const safeCategories = categories ?? [];

  const categoryMap = new Map(
    safeCategories.map((category) => [
      category.id,
      category,
    ])
  );

  const selectedCategoryIds = findCategoryIds(
    safeCategories,
    activeFilter
  );

  /* --------------------------------
     PRODUCT COUNT
  -------------------------------- */

  let countQuery = supabase
    .from("products")
    .select("id", {
      count: "exact",
      head: true,
    });

  if (selectedCategoryIds.length > 0) {
    countQuery = countQuery.in(
      "category_id",
      selectedCategoryIds
    );
  }

  const {
    count: productCount,
    error: countError,
  } = await countQuery;

  if (countError) {
    throw new Error(countError.message);
  }

  const totalProducts = productCount ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / pageSize)
  );

  const safePage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  /* --------------------------------
     PRODUCTS
  -------------------------------- */

  let productsQuery = supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        price,
        sale_price,
        stock,
        sizes,
        colors,
        is_active,
        category_id,
        images,
        created_at
      `
    )
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (selectedCategoryIds.length > 0) {
    productsQuery = productsQuery.in(
      "category_id",
      selectedCategoryIds
    );
  }

  const {
    data: products,
    error: productsError,
  } = await productsQuery;

  if (productsError) {
    throw new Error(productsError.message);
  }

  /* --------------------------------
     DISPLAY RANGE
  -------------------------------- */

  const displayStart =
    totalProducts === 0 ? 0 : from + 1;

  const displayEnd =
    totalProducts === 0
      ? 0
      : Math.min(to + 1, totalProducts);

  const activeFilterLabel =
    FILTERS.find(
      (filter) => filter.slug === activeFilter
    )?.label ?? "All";

  return (
    <main className="min-h-screen bg-[#F1EDE7] text-[#171717]">
      <div className="mx-auto w-full max-w-[1500px] px-5 pb-16 pt-5 sm:px-8 lg:px-12">

        {/* TOP NAV */}

        <header className="flex items-center justify-between border-b border-[#171717]/10 pb-5">
          <Link
            href="/admin"
            className="group flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-[12px] font-medium tracking-[0.08em] text-[#F1EDE7] transition-transform duration-300 group-hover:scale-105">
              O
            </span>

            <div>
              <p className="text-[12px] font-medium tracking-[0.26em]">
                OUTLOOK
              </p>

              <p className="mt-1 text-[8px] uppercase tracking-[0.38em] text-[#171717]/40">
                Studio Admin
              </p>
            </div>
          </Link>

         <AdminNavButton
  href="/admin"
  loadingText="Opening..."
  className="group inline-flex items-center gap-2 rounded-full bg-[#34312F] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#F1EDE7] shadow-[0_6px_18px_rgba(52,49,47,0.12)] transition-all duration-300 hover:bg-[#3C3836] hover:shadow-[0_8px_28px_rgba(243,217,221,0.42)]"
>
  <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
    ←
  </span>
  Admin Dashboard
</AdminNavButton>
        </header>

        {/* PAGE INTRO */}

        <section className="pt-12 sm:pt-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16C172]" />

                <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#171717]/40">
                  Collection Management
                </span>
              </div>

              <h1 className="text-[38px] font-light leading-none tracking-[-0.045em] sm:text-[52px]">
                Products
              </h1>

              <p className="mt-4 max-w-lg text-[13px] leading-6 text-[#171717]/50 sm:text-sm">
                Manage your collection, inventory,
                availability and product details from one
                place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-[#171717]/10 bg-white/50 px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#171717]/45 sm:block">
                {totalProducts}{" "}
                {totalProducts === 1
                  ? "Product"
                  : "Products"}
              </div>

              <NewProductButton />
            </div>
          </div>
        </section>

        {/* FILTERS */}

        <div className="mt-10 overflow-hidden rounded-2xl border border-[#171717]/10 bg-white/45">
          <ProductFilters activeFilter={activeFilter} />
        </div>

        {/* COLLECTION META */}

        <section className="flex flex-col gap-3 py-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#171717]/70">
              {activeFilterLabel}
            </p>

            <p className="mt-1.5 text-[11px] text-[#171717]/40">
              Showing {displayStart}-{displayEnd} of{" "}
              {totalProducts} products
            </p>
          </div>

          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[#171717]/35">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16C172]" />
            Live inventory
          </div>
        </section>

        {/* PRODUCTS */}

        {products && products.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const frontImage = getFrontImage(
                product.images
              );

              const stockStatus = getStockStatus(
                product.stock ?? 0
              );

              const hasSalePrice =
                product.sale_price !== null &&
                product.sale_price !== undefined;

              const categoryName =
                categoryMap.get(product.category_id)
                  ?.name ?? "Uncategorized";

              const sizes = Array.isArray(product.sizes)
                ? product.sizes
                : [];

              const colors = Array.isArray(product.colors)
                ? product.colors
                : [];

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-[#171717]/10 bg-white/65 shadow-[0_10px_35px_rgba(23,23,23,0.035)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_45px_rgba(23,23,23,0.07)]"
                >
                  {/* IMAGE */}

                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#E9E4DE]">
                      {frontImage?.url ? (
                        <img
                          src={frontImage.url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="text-center">
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-[#171717]/25">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M4 5.5C4 4.67157 4.67157 4 5.5 4H18.5C19.3284 4 20 4.67157 20 5.5V18.5C20 19.3284 19.3284 20 18.5 20H5.5C4.67157 20 4 19.3284 4 18.5V5.5Z"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                />
                                <path
                                  d="M7 15L10.5 11.5L13 14L15 12L18 15"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#171717]/30">
                              No image
                            </p>
                          </div>
                        </div>
                      )}

                      {/* STATUS */}

                      <div className="absolute left-4 top-4 rounded-full bg-white/85 px-2.5 py-1.5 backdrop-blur-md">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${stockStatus.dot}`}
                          />

                          <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-[#171717]/60">
                            {stockStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* PRODUCT DETAILS */}

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-[14px] font-medium tracking-[-0.01em]">
                          {product.name}
                        </h2>

                        <p className="mt-1.5 truncate text-[9px] uppercase tracking-[0.18em] text-[#171717]/35">
                          {categoryName}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {hasSalePrice ? (
                          <>
                            <p className="text-[13px] font-medium">
                              ₹{product.sale_price}
                            </p>

                            <p className="mt-0.5 text-[9px] text-[#171717]/30 line-through">
                              ₹{product.price}
                            </p>
                          </>
                        ) : (
                          <p className="text-[13px] font-medium">
                            ₹{product.price}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* INVENTORY */}

                    <div className="mt-4 flex items-center justify-between border-t border-[#171717]/8 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${stockStatus.dot}`}
                        />

                        <span
                          className={`text-[9px] font-medium ${stockStatus.text}`}
                        >
                          {stockStatus.label}
                        </span>
                      </div>

                      <span className="text-[9px] text-[#171717]/35">
                        {product.stock ?? 0} units
                      </span>
                    </div>

                    {/* OPTIONS */}

                    {(sizes.length > 0 ||
                      colors.length > 0) && (
                      <div className="mt-3 flex min-w-0 items-center gap-2 text-[9px] text-[#171717]/40">
                        {sizes.length > 0 && (
                          <span className="truncate">
                            {sizes.join(" · ")}
                          </span>
                        )}

                        {sizes.length > 0 &&
                          colors.length > 0 && (
                            <span className="text-[#171717]/15">
                              /
                            </span>
                          )}

                        {colors.length > 0 && (
                          <span className="truncate">
                            {colors.join(" · ")}
                          </span>
                        )}
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="mt-4 flex items-center justify-between border-t border-[#171717]/8 pt-3">
                      <span className="text-[8px] uppercase tracking-[0.2em] text-[#171717]/30">
                        Manage
                      </span>

                      <div className="flex items-center gap-2">
                        <EditButton
                          productId={product.id}
                        />

                        <form action={deleteProduct}>
                          <input
                            type="hidden"
                            name="id"
                            value={product.id}
                          />

                          <DeleteButton />
                        </form>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="flex min-h-[360px] items-center justify-center rounded-2xl border border-[#171717]/10 bg-white/45">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#171717]/5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[#171717]/35"
                >
                  <path
                    d="M6 7H18L19 20H5L6 7Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 7V5.5C9 4.67157 9.67157 4 10.5 4H13.5C14.3284 4 15 4.67157 15 5.5V7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h2 className="mt-4 text-[14px] font-medium">
                No products found
              </h2>

              <p className="mt-1 text-[11px] text-[#171717]/40">
                There are no products in this collection yet.
              </p>

              {activeFilter !== "all" && (
                <Link
                  href="/admin/products"
                  className="mt-5 inline-flex rounded-full bg-[#171717] px-5 py-2.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#F1EDE7] transition-all duration-300 hover:bg-[#292929]"
                >
                  View all products
                </Link>
              )}
            </div>
          </section>
        )}

        {/* PAGINATION */}

        <div className="mt-8 border-t border-[#171717]/10 pt-2">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </main>
  );
}