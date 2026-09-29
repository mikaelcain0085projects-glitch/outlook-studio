"use client";

import { useMemo, useState } from "react";

const categories = [
  "All",
  "Boys",
  "Girls",
  "Shoes",
  "Accessories",
];

const products = [
  {
    id: 1,
    name: "Classic Oversized Tee",
    category: "Boys",
    price: 899,
    image: "/media/landing/slide1.png",
  },
  {
    id: 2,
    name: "Everyday Summer Dress",
    category: "Girls",
    price: 1299,
    image: "/media/landing/slide2.png",
  },
  {
    id: 3,
    name: "Urban Runner",
    category: "Shoes",
    price: 1899,
    image: "/media/landing/slide3.png",
  },
  {
    id: 4,
    name: "Minimal Crossbody",
    category: "Accessories",
    price: 999,
    image: "/media/landing/slide4.png",
  },
  {
    id: 5,
    name: "Essential Hoodie",
    category: "Boys",
    price: 1599,
    image: "/media/landing/slide5.jpg",
  },
  {
    id: 6,
    name: "Soft Knit Top",
    category: "Girls",
    price: 1199,
    image: "/media/categories/girls.jpg",
  },
  {
    id: 7,
    name: "Street Low Sneakers",
    category: "Shoes",
    price: 2199,
    image: "/media/categories/shoes.jpg",
  },
  {
    id: 8,
    name: "Everyday Cap",
    category: "Accessories",
    price: 699,
    image: "/media/categories/accessories.jpg",
  },
  {
    id: 9,
    name: "Relaxed Fit Shirt",
    category: "Boys",
    price: 1099,
    image: "/media/categories/boys.jpg",
  },
  {
    id: 10,
    name: "Casual Outfit",
    category: "Girls",
    price: 1499,
    image: "/media/categories/girls.jpg",
  },
];

const PRODUCTS_PER_PAGE = 6;

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }

    return products.filter(
      (product) => product.category === selectedCategory
    );
  }, [selectedCategory]);

  const totalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const changeCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      {/* HEADER */}
      <section className="px-5 pb-10 pt-32 sm:px-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">
            OUTLOOK STUDIO
          </p>

          <h1 className="text-4xl font-light tracking-tight sm:text-5xl md:text-7xl">
            Products
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-white/50 md:text-base">
            Discover the latest pieces from our collection.
          </p>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="px-5 sm:px-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-4 scrollbar-hide">
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => changeCategory(category)}
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-sm transition-all duration-300 ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="px-5 py-10 sm:px-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-500 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition hover:bg-white hover:text-black"
                      aria-label={`Add ${product.name} to wishlist`}
                    >
                      ♡
                    </button>
                  </div>

                  {/* DETAILS */}
                  <div className="p-4">
                    <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-white/35">
                      {product.category}
                    </p>

                    <h2 className="truncate text-sm font-light text-white/90 sm:text-base">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-sm text-white/60">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-white/40">
                No products found.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <section className="px-5 pb-20 sm:px-8 md:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                    currentPage === page
                      ? "bg-white text-black"
                      : "text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              →
            </button>
          </div>
        </section>
      )}
    </main>
  );
}