import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminNavButton from "./components/AdminNavButton";
import AdminLogoutButton from "./components/AdminLogoutButton";

type ProductImage = {
  type?: string;
  url?: string;
};

type Product = {
  id: string;
  name: string;
  price: number | null;
  sale_price: number | null;
  stock: number | null;
  is_active: boolean | null;
  category_id: string | null;
  images: ProductImage[] | null;
};

type Category = {
  id: string;
  name: string;
  slug: string | null;
};

function getFrontImage(images: ProductImage[] | null) {
  if (!Array.isArray(images)) return null;

  const front = images.find(
    (image) => image?.type === "front" && image?.url
  );

  return front?.url ?? images.find((image) => image?.url)?.url ?? null;
}

function formatPrice(value: number | null) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    redirect("/");
  }

  const [
    { data: products, error: productsError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, price, sale_price, stock, is_active, category_id, images"
      )
      .order("name", { ascending: true }),

    supabase
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true }),
  ]);

  if (productsError || categoriesError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F1EDE7] px-6 py-12 text-[#171717]">
        <div className="w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white/80 p-8 text-center shadow-[0_24px_70px_rgba(40,35,30,0.08)] backdrop-blur-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7E5E7] text-[#8A4D57]">
            !
          </div>

          <h1 className="mt-5 text-xl font-light tracking-[-0.03em]">
            Dashboard couldn't load
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#171717]/50">
            There was a problem loading your store data.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-full bg-[#171717] px-6 py-3 text-[9px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#292929]"
          >
            Return to store
          </Link>
        </div>
      </main>
    );
  }

  const productList = (products ?? []) as Product[];
  const categoryList = (categories ?? []) as Category[];

  const totalProducts = productList.length;

  const activeProducts = productList.filter(
    (product) => product.is_active !== false
  ).length;

  const lowStockProducts = productList.filter(
    (product) =>
      typeof product.stock === "number" &&
      product.stock > 0 &&
      product.stock <= 5
  );

  const outOfStockProducts = productList.filter(
    (product) => typeof product.stock === "number" && product.stock <= 0
  );

  const categoryCounts = categoryList
    .map((category) => ({
      ...category,
      count: productList.filter(
        (product) => product.category_id === category.id
      ).length,
    }))
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count);

  const recentProducts = [...productList].slice(0, 6);

  return (
    <main className="min-h-screen bg-[#F1EDE7] text-[#171717]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-[#F1EDE7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/admin" className="group">
            <div className="text-[15px] font-normal tracking-[0.26em] transition-all duration-500 group-hover:tracking-[0.34em]">
              OUTLOOK{" "}
              <span className="text-[#171717]/45">STUDIO</span>
            </div>

            <div className="mt-1 text-[8px] uppercase tracking-[0.28em] text-[#171717]/35">
              Administration
            </div>
          </Link>

          <div className="flex items-center gap-2">
  <AdminLogoutButton />

  <AdminNavButton
    href="/"
              loadingText="Opening..."
              className="hidden h-9 items-center rounded-full border border-black/[0.08] bg-white/60 px-4 text-[9px] font-medium uppercase tracking-[0.16em] text-[#171717]/65 transition hover:border-black/[0.14] hover:bg-white sm:inline-flex"
            >
              Store
            </AdminNavButton>

            <AdminNavButton
              href="/admin/products/new"
              loadingText="Opening..."
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#171717] px-4 text-[9px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_8px_24px_rgba(23,23,23,0.10)] transition hover:-translate-y-0.5 hover:bg-[#292929]"
            >
              <span className="text-sm leading-none">+</span>
              <span>New Product</span>
            </AdminNavButton>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-14">
        {/* Intro */}
        <section className="max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.34em] text-[#171717]/35">
            Control Center
          </p>

          <h1 className="mt-4 text-4xl font-light leading-[0.98] tracking-[-0.055em] sm:text-5xl">
            Your store,
            <br />
            <span className="text-[#171717]/45">beautifully managed.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-[#171717]/50 sm:text-[15px]">
            Keep your catalog organized, monitor inventory, and make changes
            to your storefront from one simple place.
          </p>
        </section>

        {/* Stats */}
        <section className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AdminStat
            label="Products"
            value={totalProducts}
            caption="In your catalog"
          />

          <AdminStat
            label="Active"
            value={activeProducts}
            caption="Visible in store"
          />

          <AdminStat
            label="Low stock"
            value={lowStockProducts.length}
            caption="5 units or fewer"
            accent="pink"
          />

          <AdminStat
            label="Out of stock"
            value={outOfStockProducts.length}
            caption="Needs attention"
            accent="dark"
          />
        </section>

        {/* Quick actions */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#171717]/35">
                Shortcuts
              </p>

              <h2 className="mt-2 text-2xl font-light tracking-[-0.04em]">
                Quick actions
              </h2>
            </div>
          </div>

          <div className="mt-4 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AdminActionCard
              href="/admin/products/new"
              title="Add a new product"
              description="Create a product and add it to your storefront."
              icon="+"
              primary
            />

            <AdminActionCard
              href="/admin/products"
              title="Manage products"
              description="Browse, edit and organize your complete catalog."
              icon="→"
            />

            <AdminActionCard
              href="/admin/orders"
              title="Order management"
              description="View customer orders and manage their delivery status."
              icon="↗"
            />
          </div>
        </section>

        {/* Main content */}
        <section className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* Product activity */}
          <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/75 shadow-[0_18px_50px_rgba(40,35,30,0.04)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[8px] uppercase tracking-[0.28em] text-[#171717]/35">
                  Catalog
                </p>

                <h2 className="mt-2 text-xl font-light tracking-[-0.04em]">
                  Product activity
                </h2>
              </div>

              <AdminNavButton
                href="/admin/products"
                loadingText="Opening..."
                className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#171717]/45 transition hover:text-[#171717]"
              >
                View all →
              </AdminNavButton>
            </div>

            <div className="divide-y divide-black/[0.05]">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => {
                  const image = getFrontImage(product.images);

                  const category = categoryList.find(
                    (item) => item.id === product.category_id
                  );

                  const price =
                    product.sale_price !== null
                      ? product.sale_price
                      : product.price;

                  const isLowStock =
                    typeof product.stock === "number" &&
                    product.stock > 0 &&
                    product.stock <= 5;

                  const isOutOfStock =
                    typeof product.stock === "number" &&
                    product.stock <= 0;

                  return (
                    <AdminNavButton
                      key={product.id}
                      href={`/admin/products/${product.id}/edit`}
                      loadingText="Opening..."
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#F8F5F1] sm:px-6"
                    >
                      <div className="h-16 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#ECE7E1]">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#171717]/25">
                            <ProductsIcon />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[12px] font-medium text-[#171717]">
                            {product.name}
                          </h3>

                          {!product.is_active && (
                            <span className="shrink-0 rounded-full bg-[#F0EBE6] px-2 py-1 text-[7px] uppercase tracking-[0.1em] text-[#171717]/45">
                              Draft
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-[9px] uppercase tracking-[0.12em] text-[#171717]/35">
                          {category?.name ?? "Uncategorized"}
                        </p>
                      </div>

                      <div className="hidden shrink-0 text-right sm:block">
                        <p className="text-[11px] font-medium">
                          {formatPrice(price)}
                        </p>

                        <p
                          className={`mt-1 text-[8px] uppercase tracking-[0.1em] ${
                            isOutOfStock
                              ? "text-[#9A5963]"
                              : isLowStock
                                ? "text-[#A77A39]"
                                : "text-[#171717]/35"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of stock"
                            : isLowStock
                              ? `${product.stock} left`
                              : `${product.stock ?? 0} in stock`}
                        </p>
                      </div>

                      <span className="shrink-0 text-[#171717]/25 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#171717]/60">
                        →
                      </span>
                    </AdminNavButton>
                  );
                })
              ) : (
                <div className="px-6 py-14 text-center">
                  <p className="text-sm text-[#171717]/65">
                    No products yet.
                  </p>

                  <p className="mt-2 text-xs text-[#171717]/35">
                    Create your first product to populate the dashboard.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Categories */}
            <div className="rounded-[28px] border border-black/[0.06] bg-white/75 p-5 shadow-[0_18px_50px_rgba(40,35,30,0.04)] backdrop-blur-xl sm:p-6">
              <p className="text-[8px] uppercase tracking-[0.28em] text-[#171717]/35">
                Store mix
              </p>

              <h2 className="mt-2 text-xl font-light tracking-[-0.04em]">
                Categories
              </h2>

              <div className="mt-6 space-y-4">
                {categoryCounts.slice(0, 5).map((category, index) => {
                  const maxCount = Math.max(
                    ...categoryCounts.map((item) => item.count),
                    1
                  );

                  const width = Math.max(
                    10,
                    Math.round((category.count / maxCount) * 100)
                  );

                  return (
                    <div key={category.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] text-[#171717]/60">
                          {category.name}
                        </span>

                        <span className="text-[9px] text-[#171717]/35">
                          {category.count}
                        </span>
                      </div>

                      <div className="h-1 overflow-hidden rounded-full bg-[#E9E4DE]">
                        <div
                          className={`h-full rounded-full ${
                            index === 0
                              ? "bg-[#171717]"
                              : index === 1
                                ? "bg-[#C88E98]"
                                : index === 2
                                  ? "bg-[#B8A59A]"
                                  : "bg-[#D8CBC1]"
                          }`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {categoryCounts.length === 0 && (
                  <p className="py-6 text-center text-[10px] text-[#171717]/35">
                    No categorized products yet.
                  </p>
                )}
              </div>
            </div>

            {/* Storefront */}
            <div className="rounded-[28px] border border-black/[0.06] bg-[#171717] p-6 text-white shadow-[0_18px_50px_rgba(23,23,23,0.10)]">
              <p className="text-[8px] uppercase tracking-[0.28em] text-white/35">
                Storefront
              </p>

              <h2 className="mt-3 text-2xl font-light tracking-[-0.04em]">
                See your store.
              </h2>

              <p className="mt-3 text-xs leading-5 text-white/45">
                Visit the customer-facing storefront and see your products in
                context.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-[9px] uppercase tracking-[0.16em] text-white transition hover:bg-white/[0.12]"
              >
                Open storefront
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Inventory attention */}
        {lowStockProducts.length > 0 && (
          <section className="mt-5 rounded-[28px] border border-[#D9A0A8]/25 bg-[#F3D9DD]/45 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[8px] uppercase tracking-[0.28em] text-[#7B4B53]/55">
                  Inventory
                </p>

                <h2 className="mt-2 text-lg font-light tracking-[-0.03em] text-[#633B43]">
                  A few products need attention.
                </h2>

                <p className="mt-1 text-xs text-[#7B4B53]/60">
                  {lowStockProducts.length} product
                  {lowStockProducts.length === 1 ? "" : "s"} have 5 or fewer
                  units remaining.
                </p>
              </div>

              <AdminNavButton
                href="/admin/products"
                loadingText="Opening..."
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#B9828B]/30 bg-white/50 px-5 py-3 text-[9px] uppercase tracking-[0.16em] text-[#7B4B53] transition hover:bg-white/80"
              >
                Review inventory →
              </AdminNavButton>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-14 border-t border-black/[0.06] pt-6">
          <div className="flex flex-col gap-3 text-[8px] uppercase tracking-[0.2em] text-[#171717]/25 sm:flex-row sm:items-center sm:justify-between">
            <span>OUTLOOK STUDIO ADMIN</span>

            <Link
              href="/"
              className="transition text-black/80 hover:text-[#171717]/55"
            >
              Return to storefront →
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

function AdminStat({
  label,
  value,
  caption,
  accent = "neutral",
}: {
  label: string;
  value: number;
  caption: string;
  accent?: "neutral" | "pink" | "dark";
}) {
  const iconBackground =
    accent === "pink"
      ? "bg-[#F3D9DD]"
      : accent === "dark"
        ? "bg-[#E8E3DE]"
        : "bg-[#E9E4DE]";

  return (
    <div className="rounded-[24px] border border-black/[0.06] bg-white/65 p-5 shadow-[0_12px_35px_rgba(40,35,30,0.035)] backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.24em] text-[#171717]/35">
            {label}
          </p>

          <p className="mt-3 text-3xl font-light tracking-[-0.06em]">
            {value}
          </p>
        </div>

        <span className={`h-2.5 w-2.5 rounded-full ${iconBackground}`} />
      </div>

      <p className="mt-3 text-[9px] text-[#171717]/35">{caption}</p>
    </div>
  );
}

function AdminActionCard({
  href,
  title,
  description,
  icon,
  primary = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  primary?: boolean;
}) {
  return (
    <AdminNavButton
      href={href}
      loadingText="Opening..."
      className={`group flex min-h-[92px] w-full items-center gap-3 rounded-[22px] border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
        primary
          ? "border-[#171717] bg-[#171717] text-white shadow-[0_15px_35px_rgba(23,23,23,0.10)] hover:bg-[#292929]"
          : "border-black/[0.06] bg-white/70 text-[#171717] shadow-[0_12px_35px_rgba(40,35,30,0.035)] hover:bg-white"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-lg ${
          primary
            ? "bg-white/10 text-white"
            : "bg-[#F0EBE6] text-[#171717]/55"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-[12px] font-medium ${
            primary ? "text-white" : "text-[#171717]"
          }`}
        >
          {title}
        </span>

        <span
          className={`mt-1 block text-[10px] leading-5 ${
            primary ? "text-white/45" : "text-[#171717]/40"
          }`}
        >
          {description}
        </span>
      </span>

      <span
        className={`text-sm transition-transform duration-300 group-hover:translate-x-1 ${
          primary ? "text-white/45" : "text-[#171717]/30"
        }`}
      >
        →
      </span>
    </AdminNavButton>
  );
}

function ProductsIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3H18V21H6V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 7H15M9 11H15M9 15H13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}