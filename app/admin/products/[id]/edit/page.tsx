import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { updateProduct } from "./actions";
import ProductImageField from "@/components/ProductImageField";
import SubmitButton from "./SubmitButton";
import BackToProductsButton from "./BackToProductsButton";
import EditProductOptions from "./EditProductOptions";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProductImage = {
  type?: string;
  url?: string;
  publicId?: string;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

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

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      price,
      sale_price,
      category_id,
      stock,
      sizes,
      colors,
      is_active,
      images
    `)
    .eq("id", id)
    .single();

  if (productError || !product) {
    notFound();
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .not("parent_id", "is", null);

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const parentIds = [
    ...new Set(
      categories
        ?.map((category) => category.parent_id)
        .filter((parentId): parentId is string => Boolean(parentId))
    ),
  ];

  const { data: parents, error: parentsError } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", parentIds);

  if (parentsError) {
    throw new Error(parentsError.message);
  }

  const parentMap = new Map(
    parents?.map((parent) => [parent.id, parent.name])
  );

  const parentOrder = [
    "Accessories",
    "Boys",
    "Girls",
    "Shoes",
  ];

  const categoryOrder: Record<string, string[]> = {
    Accessories: ["Bags", "Belts", "Caps", "Others"],
    Boys: ["Hoodie", "Jacket", "Pants", "Shirts", "T-Shirts"],
    Girls: ["Hoodie", "Jacket", "Pants", "Shirts", "T-Shirt"],
    Shoes: ["Boys", "Girls"],
  };

  const sortedCategories = [...(categories ?? [])].sort((a, b) => {
    const parentA = parentMap.get(a.parent_id) ?? "";
    const parentB = parentMap.get(b.parent_id) ?? "";

    const parentIndexA = parentOrder.indexOf(parentA);
    const parentIndexB = parentOrder.indexOf(parentB);

    if (parentIndexA !== parentIndexB) {
      return parentIndexA - parentIndexB;
    }

    const childrenA = categoryOrder[parentA] ?? [];
    const childrenB = categoryOrder[parentB] ?? [];

    return (
      childrenA.indexOf(a.name) -
      childrenB.indexOf(b.name)
    );
  });

  const selectedSizes = Array.isArray(product.sizes)
    ? product.sizes.map(String)
    : [];

  const selectedColors = Array.isArray(product.colors)
    ? product.colors.map(String)
    : [];

  const images: ProductImage[] = Array.isArray(product.images)
    ? product.images
    : [];

  const currentFrontImage =
    images.find((image) => image?.type === "front") ??
    (images.length > 0 && images[0]?.url ? images[0] : null);

  const currentBackImage =
    images.find((image) => image?.type === "back") ?? null;

  return (
    <main className="min-h-screen bg-[#f1ede7] text-[#171717]">
      {/* Header */}
      <header className="border-b border-black/[0.06] bg-[#f1ede7]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-7 sm:px-8 lg:px-10">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.32em] text-[#171717]/35">
              OUTLOOK STUDIO · ADMIN
            </p>

            <div className="mt-3 flex items-end gap-4">
              <h1 className="text-3xl font-light tracking-[-0.04em] sm:text-4xl">
                Edit Product
              </h1>

              <span className="mb-1.5 h-1.5 w-1.5 rounded-full bg-[#16C172]" />
            </div>

            <p className="mt-2 max-w-xl text-xs leading-5 text-[#171717]/45">
              Refine the details, pricing, options and imagery for this product.
            </p>
          </div>

          <BackToProductsButton />
        </div>
      </header>

      {/* Form */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <form
          action={updateProduct}
          className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-[#e8e3dc] shadow-[0_18px_60px_rgba(23,23,23,0.035)]"
        >
          <input type="hidden" name="id" value={product.id} />

          <input
            type="hidden"
            name="existing_front_image_url"
            value={currentFrontImage?.url ?? ""}
          />

          <input
            type="hidden"
            name="existing_front_image_public_id"
            value={currentFrontImage?.publicId ?? ""}
          />

          <input
            type="hidden"
            name="existing_back_image_url"
            value={currentBackImage?.url ?? ""}
          />

          <input
            type="hidden"
            name="existing_back_image_public_id"
            value={currentBackImage?.publicId ?? ""}
          />

          {/* 01 — Product details */}
          <section className="border-b border-black/[0.06] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="mb-7">
              <p className="text-[8px] font-medium uppercase tracking-[0.28em] text-[#171717]/30">
                01
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">
                Product details
              </h2>

              <p className="mt-1 text-xs text-[#171717]/40">
                Name, URL and product description.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55"
                >
                  Product name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={product.name}
                  className="w-full rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/25 hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="mb-2.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55"
                >
                  Slug
                </label>

                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  defaultValue={product.slug}
                  className="w-full rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/25 hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                />

                <p className="mt-2 text-[10px] leading-5 text-[#171717]/35">
                  The storefront URL identifier for this product.
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={product.description ?? ""}
                  className="w-full resize-y rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm leading-6 text-[#171717] outline-none transition placeholder:text-[#171717]/25 hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                />
              </div>
            </div>
          </section>

          {/* 02 — Pricing */}
          <section className="border-b border-black/[0.06] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="mb-7">
              <p className="text-[8px] font-medium uppercase tracking-[0.28em] text-[#171717]/30">
                02
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">
                Pricing & collection
              </h2>

              <p className="mt-1 text-xs text-[#171717]/40">
                Update pricing, inventory and storefront placement.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55"
                >
                  Price
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#171717]/35">
                    ₹
                  </span>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={product.price}
                    className="w-full rounded-2xl border border-black/[0.08] bg-[#faf9f7] py-3.5 pl-8 pr-4 text-sm text-[#171717] outline-none transition hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sale_price"
                  className="mb-2.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55"
                >
                  Sale price
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#171717]/35">
                    ₹
                  </span>

                  <input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product.sale_price ?? ""}
                    className="w-full rounded-2xl border border-black/[0.08] bg-[#faf9f7] py-3.5 pl-8 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/25 hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="mb-2.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55"
                >
                  Stock
                </label>

                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  defaultValue={product.stock}
                  className="w-full rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="category_id"
                className="mb-2.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55"
              >
                Collection
              </label>

              <select
                id="category_id"
                name="category_id"
                required
                defaultValue={product.category_id}
                className="w-full appearance-none rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
              >
                {sortedCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {parentMap.get(category.parent_id) ?? "Other"} →{" "}
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* 03 — Options */}
          <section className="border-b border-black/[0.06] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="mb-7">
              <p className="text-[8px] font-medium uppercase tracking-[0.28em] text-[#171717]/30">
                03
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">
                Sizes & colours
              </h2>

              <p className="mt-1 text-xs text-[#171717]/40">
                Control exactly which options customers can select.
              </p>
            </div>

            <EditProductOptions
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
            />
          </section>

          {/* 04 — Product imagery */}
          <section className="border-b border-black/[0.06] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="mb-7">
              <p className="text-[8px] font-medium uppercase tracking-[0.28em] text-[#171717]/30">
                04
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">
                Product imagery
              </h2>

              <p className="mt-1 text-xs text-[#171717]/40">
                Review the current images or upload replacements.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Front */}
              <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-[#ddd8d1]">
                <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
                  <span className="text-[8px] font-medium uppercase tracking-[0.22em] text-[#171717]/50">
                    Front image
                  </span>

                  <span className="text-[8px] uppercase tracking-[0.14em] text-[#16C172]">
                    Current
                  </span>
                </div>

                <div className="flex h-72 items-center justify-center bg-[#f8f6f2] p-5">
                  {currentFrontImage?.url ? (
                    <img
                      src={currentFrontImage.url}
                      alt={`${product.name} front`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#171717]/30">
                      No front image
                    </span>
                  )}
                </div>
              </div>

              {/* Back */}
              <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-[#ddd8d1]">
                <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
                  <span className="text-[8px] font-medium uppercase tracking-[0.22em] text-[#171717]/50">
                    Back image
                  </span>

                  <span className="text-[8px] uppercase tracking-[0.14em] text-[#16C172]">
                    Current
                  </span>
                </div>

                <div className="flex h-72 items-center justify-center bg-[#f8f6f2] p-5">
                  {currentBackImage?.url ? (
                    <img
                      src={currentBackImage.url}
                      alt={`${product.name} back`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#171717]/30">
                      No back image
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-black/[0.06] pt-7">
              <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/50">
                Upload replacement images
              </p>

              <ProductImageField />
            </div>
          </section>

          {/* 05 — Status */}
          <section className="border-b border-black/[0.06] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/40">
                  05 · Publishing
                </p>

                <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">
                  Product status
                </h2>

                <p className="mt-1 text-xs text-[#171717]/40">
                  Active products are visible on the storefront.
                </p>
              </div>

              <label
                htmlFor="is_active"
                className="group relative inline-flex cursor-pointer items-center"
              >
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  defaultChecked={product.is_active}
                  className="peer sr-only"
                />

                <span className="h-7 w-12 rounded-full bg-black/[0.12] transition-colors duration-300 peer-checked:bg-[#16C172]" />

                <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(23,23,23,0.12)] transition-transform duration-300 peer-checked:translate-x-5" />
              </label>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="w-full sm:w-auto sm:min-w-[220px]">
              <SubmitButton />
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}