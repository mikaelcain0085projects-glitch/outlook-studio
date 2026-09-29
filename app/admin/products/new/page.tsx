import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createProduct } from "./actions";
import ProductImageField from "@/components/ProductImageField";
import BackToProductsButton from "./BackToProductsButton";
import SubmitButton from "./SubmitButton";
import ProductNameFields from "./ProductNameFields";

export default async function NewProductPage() {
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
        .filter((id): id is string => Boolean(id))
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

  return (
    <main className="min-h-screen bg-[#f1ede7] text-[#171717]">
      {/* Header */}
      <header className="border-b border-black/[0.06] bg-[#f1ede7]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-7 sm:px-8 lg:px-10">
          <div>
            <p className="text-[15px] font-medium uppercase tracking-[0.32em] text-[#171717]/35">
              OUTLOOK STUDIO · ADMIN
            </p>

            <div className="mt-3 flex items-end gap-4">
              <h1 className="text-3xl font-light tracking-[-0.04em] sm:text-4xl">
                New Product
              </h1>

              <span className="mb-1 h-1.5 w-1.5 rounded-full bg-[#16C172]" />
            </div>

            <p className="mt-2 max-w-md text-xs leading-5 text-[#171717]/45">
              Create a new piece for the OUTLOOK STUDIO collection.
            </p>
          </div>

          <BackToProductsButton />
        </div>
      </header>

      {/* Form */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <form
  action={createProduct}
  className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-[#e8e3dc] shadow-[0_18px_60px_rgba(23,23,23,0.035)]"
>
          {/* Product identity */}
          <section className="border-b border-black/[0.06] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="mb-7">
              <p className="text-[8px] font-medium uppercase tracking-[0.28em] text-[#171717]/30">
                01
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">
                Product details
              </h2>

              <p className="mt-1 text-xs text-[#171717]/40">
                Start with the name and basic information.
              </p>
            </div>

            <div className="space-y-6">
              <ProductNameFields />

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
                  className="w-full resize-y rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/25 hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                  placeholder="Describe the product..."
                />
              </div>
            </div>
          </section>

          {/* Pricing & category */}
          <section className="border-b border-black/[0.06] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="mb-7">
              <p className="text-[8px] font-medium uppercase tracking-[0.28em] text-[#171717]/30">
                02
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">
                Pricing & collection
              </h2>

              <p className="mt-1 text-xs text-[#171717]/40">
                Set the commercial details and product placement.
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

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/25 hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label
                  htmlFor="sale_price"
                  className="mb-2.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55"
                >
                  Sale price
                </label>

                <input
                  id="sale_price"
                  name="sale_price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-[#171717]/25 hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                  placeholder="Optional"
                />
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
                  defaultValue="0"
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
                defaultValue=""
                className="w-full appearance-none rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
              >
                <option value="" disabled>
                  Select a category
                </option>

                {sortedCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {parentMap.get(category.parent_id) ?? "Other"} →{" "}
                    {category.name}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-[10px] leading-5 text-[#171717]/35">
                Select the specific subcategory for this product.
              </p>
            </div>
          </section>

          {/* Variants */}
          <section className="border-b border-black/[0.06] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="mb-7">
              <p className="text-[8px] font-medium uppercase tracking-[0.28em] text-[#171717]/30">
                03
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">
                Sizes & colours
              </h2>

              <p className="mt-1 text-xs text-[#171717]/40">
                Choose exactly which options customers can select.
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-2">
              {/* Sizes */}
              <div>
                <label className="mb-3 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55">
                  Available sizes
                </label>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <label
                      key={size}
                      className="group flex cursor-pointer items-center justify-center rounded-xl border border-black/[0.08] bg-[#faf9f7] px-3 py-3 text-xs transition-all duration-200 hover:border-black/[0.18] hover:bg-white has-[:checked]:border-[#171717] has-[:checked]:bg-[#171717] has-[:checked]:text-white"
                    >
                      <input
                        type="checkbox"
                        name="sizes"
                        value={size}
                        className="sr-only"
                      />

                      <span>{size}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="custom-size"
                    className="mb-2 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/45"
                  >
                    Custom size
                  </label>

                  <input
                    id="custom-size"
                    name="custom_size"
                    type="text"
                    placeholder="28, 32, 34 or Free Size"
                    className="w-full rounded-xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3 text-xs text-[#171717] outline-none transition placeholder:text-[#171717]/25 hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                  />

                  <p className="mt-2 text-[10px] leading-5 text-[#171717]/35">
                    Add a custom option when the standard sizes do not apply.
                  </p>
                </div>
              </div>

              {/* Colours */}
              <div>
                <label className="mb-3 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/55">
                  Available colours
                </label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {[
                    "Black",
                    "White",
                    "Red",
                    "Blue",
                    "Green",
                    "Yellow",
                    "Pink",
                    "Grey",
                    "Brown",
                    "Beige",
                  ].map((color) => (
                    <label
                      key={color}
                      className="group flex cursor-pointer items-center justify-center rounded-xl border border-black/[0.08] bg-[#faf9f7] px-3 py-3 text-xs transition-all duration-200 hover:border-black/[0.18] hover:bg-white has-[:checked]:border-[#171717] has-[:checked]:bg-[#171717] has-[:checked]:text-white"
                    >
                      <input
                        type="checkbox"
                        name="colors"
                        value={color}
                        className="sr-only"
                      />

                      <span>{color}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="custom-color"
                    className="mb-2 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/45"
                  >
                    Custom colour
                  </label>

                  <input
                    id="custom-color"
                    name="custom_color"
                    type="text"
                    placeholder="Wine Red"
                    className="w-full rounded-xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3 text-xs text-[#171717] outline-none transition placeholder:text-[#171717]/25 hover:border-black/[0.13] focus:border-black/[0.22] focus:bg-white"
                  />

                  <p className="mt-2 text-[10px] leading-5 text-[#171717]/35">
                    Add a custom colour when needed.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="border-b border-black/[0.06] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="mb-7">
              <p className="text-[8px] font-medium uppercase tracking-[0.28em] text-[#171717]/30">
                04
              </p>

              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">
                Product imagery
              </h2>

              <p className="mt-1 text-xs text-[#171717]/40">
                Upload the front and back product images.
              </p>
            </div>

            <ProductImageField />
          </section>

          {/* Publishing */}
          <section className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="is_active"
                className="group flex cursor-pointer items-center gap-3"
              >
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  defaultChecked
                  className="peer sr-only"
                />

                <span className="relative h-6 w-10 rounded-full bg-black/[0.12] transition peer-checked:bg-[#171717]">
                  <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
                </span>

                <span>
                  <span className="block text-xs font-medium">
                    Product is active
                  </span>

                  <span className="mt-0.5 block text-[10px] text-[#171717]/35">
                    Make this product visible in the store.
                  </span>
                </span>
              </label>

              <div className="w-full sm:w-auto sm:min-w-[220px]">
                <SubmitButton />
              </div>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}