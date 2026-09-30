"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { addToCart } from "@/lib/cart";

const slides = [
  "/media/landing/slide1.png",
  "/media/landing/slide2.png",
  "/media/landing/slide3.png",
  "/media/landing/slide4.png",
  "/media/landing/slide5.jpg",
];

const categories = [
  {
    name: "All",
    description: "Explore everything",
    href: "/shop",
    image: "/media/landing/slide5.jpg",
  },
  {
    name: "Boys",
    description: "Modern styles for boys",
    href: "/shop?category=boys",
    image: "/media/categories/boys.jpg",
  },
  {
    name: "Girls",
    description: "Contemporary girlswear",
    href: "/shop?category=girls",
    image: "/media/categories/girls.jpg",
  },
  {
    name: "Shoes",
    description: "Complete the look",
    href: "/shop?category=shoes",
    image: "/media/categories/shoes.jpg",
  },
  {
    name: "Accessories",
    description: "The finishing touch",
    href: "/shop?category=accessories",
    image: "/media/categories/accessories.jpg",
  },
];
const productCategories = [
  "All",
  "Boys",
  "Girls",
  "Shoes",
  "Accessories",
];

type ProductImage = {
  url: string;
  type?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  stock: number | null;
  category_id: string | null;
  images: ProductImage[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  description: string | null;
};

const PRODUCTS_PER_PAGE = 12;
const decodeCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*";

function DecodeText() {
  const original = "STUDIO";
  const [text, setText] = useState(original);  

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let timeout: ReturnType<typeof setTimeout>;

    const startDecode = () => {
      let frame = 0;

      interval = setInterval(() => {
        frame++;

        const progress = frame / 20;

        const decoded = original
          .split("")
          .map((character, index) => {
            const revealPoint = index / original.length;

            if (progress >= revealPoint + 0.35) {
              return character;
            }

            return decodeCharacters[
              Math.floor(Math.random() * decodeCharacters.length)
            ];
          })
          .join("");

        setText(decoded);

        if (frame >= 20) {
          clearInterval(interval);
          setText(original);

          timeout = setTimeout(startDecode, 2000);
        }
      }, 50);
    };

    timeout = setTimeout(startDecode, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return <span>{text}</span>;
}

export default function Home() {
  
   const [showDeveloper, setShowDeveloper] = useState(false);
  const developerSectionRef = useRef<HTMLDivElement>(null);
  


  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
const [currentPage, setCurrentPage] = useState(1);
const [cartProduct, setCartProduct] = useState<Product | null>(null);
const [selectedSize, setSelectedSize] = useState("");
const [selectedColor, setSelectedColor] = useState("");
const [addingToCart, setAddingToCart] = useState(false);
const [cartAdded, setCartAdded] = useState(false);
const router = useRouter();
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [enquiryOpen, setEnquiryOpen] = useState(false);
const [enquiryName, setEnquiryName] = useState("");
const [enquiryPhone, setEnquiryPhone] = useState("");
const [enquiryMessage, setEnquiryMessage] = useState("");
const [enquirySubmitting, setEnquirySubmitting] = useState(false);
const [enquirySuccess, setEnquirySuccess] = useState(false);
const [enquiryError, setEnquiryError] = useState("");
const [showUnauthorized, setShowUnauthorized] = useState(false);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("admin") === "unauthorized") {
    setShowUnauthorized(true);

    window.history.replaceState(
      {},
      "",
      window.location.pathname
    );
  }
}, []);

const [products, setProducts] = useState<Product[]>([]);
type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

const [categoriesMap, setCategoriesMap] = useState(
  new Map<string, Category>()
);
const [productsLoading, setProductsLoading] = useState(true);
const [productsError, setProductsError] = useState<string | null>(null);
useEffect(() => {
  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);

    const supabase = createClient();

    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          `
            id,
name,
description,
price,
sale_price,
stock,
category_id,
images,
sizes,
colors,
created_at
          `
        )
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        }),

      supabase
  .from("categories")
  .select("id, name, parent_id")
    ]);

    if (productsResult.error) {
      setProductsError(productsResult.error.message);
      setProductsLoading(false);
      return;
    }

    if (categoriesResult.error) {
      setProductsError(categoriesResult.error.message);
      setProductsLoading(false);
      return;
    }

    const categoryMap = new Map(
  (categoriesResult.data ?? []).map(
    (category: {
      id: string;
      name: string;
      parent_id: string | null;
    }) => [category.id, category]
  )
);
console.log("Shop categories:", Array.from(categoryMap.entries()));
    setCategoriesMap(categoryMap);
    setProducts((productsResult.data ?? []) as Product[]);
    setProductsLoading(false);
  };

  fetchProducts();
}, []);

const filteredProducts =
  selectedCategory === "All"
    ? products
    : products.filter((product) => {
        const category = categoriesMap.get(
          product.category_id ?? ""
        );

        if (!category) {
          return false;
        }

        if (
          category.name.trim().toLowerCase() ===
          selectedCategory.toLowerCase()
        ) {
          return true;
        }

        const parentCategory = categoriesMap.get(
          category.parent_id ?? ""
        );

        return (
          parentCategory?.name.trim().toLowerCase() ===
          selectedCategory.toLowerCase()
        );
      });
const totalPages = Math.ceil(
  filteredProducts.length / PRODUCTS_PER_PAGE
);

const visibleProducts = filteredProducts.slice(
  (currentPage - 1) * PRODUCTS_PER_PAGE,
  currentPage * PRODUCTS_PER_PAGE
);

const changeProductCategory = (category: string) => {
  setSelectedCategory(category);
  setCurrentPage(1);
};
useEffect(() => {
  if (!showDeveloper) return;

  const timer = setTimeout(() => {
    const section = developerSectionRef.current;

    if (!section) return;

    const top =
      section.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: top - window.innerHeight / 2 + section.offsetHeight / 2,
      behavior: "smooth",
    });
  }, 100);

  return () => clearTimeout(timer);
}, [showDeveloper]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);
  const handleEnquirySubmit = async () => {
  if (!enquiryName.trim() || !enquiryPhone.trim() || !enquiryMessage.trim()) {
    setEnquiryError("Please fill in all fields.");
    return;
  }

  setEnquirySubmitting(true);
  setEnquiryError("");
  setEnquirySuccess(false);

  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("customer_enquiries")
      .insert({
        name: enquiryName.trim(),
        phone: enquiryPhone.trim(),
        message: enquiryMessage.trim(),
      });

    if (error) {
      throw error;
    }

    setEnquirySuccess(true);
    setEnquiryName("");
    setEnquiryPhone("");
    setEnquiryMessage("");
  } catch (error) {
    console.error("Enquiry submission error:", error);
    setEnquiryError(
      "We couldn't send your enquiry. Please try again."
    );
  } finally {
    setEnquirySubmitting(false);
  }
};

  return (
    <main className="w-full bg-black text-white">
      {showUnauthorized && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-5 backdrop-blur-md">
    <div className="w-full max-w-md rounded-[28px] border border-black/[0.06] bg-[#F1EDE7] p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3D9DD] text-[#8A4D57]">
        !
      </div>

      <h2 className="mt-5 text-2xl font-light tracking-[-0.04em]">
        Admin access not authorized
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#171717]/50">
        This Google account isn&apos;t authorized to access the OUTLOOK
        STUDIO administration panel.
      </p>

      <button
        type="button"
        onClick={() => setShowUnauthorized(false)}
        className="mt-7 rounded-full bg-[#171717] px-6 py-3 text-[9px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#292929]"
      >
        Return to Store
      </button>
    </div>
  </div>
)}
      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Slideshow */}
        {slides.map((slide, index) => (
          <div
            key={slide}
            className={`absolute inset-0 transition-all duration-[1600ms] ease-out ${
              index === currentSlide
                ? "scale-100 opacity-100"
                : "scale-[1.06] opacity-0"
            }`}
          >
            <img
              src={slide}
              alt={`OUTLOOK STUDIO fashion collection ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        {/* Overlay */}
       
       {/* Navigation */}
<nav className="absolute left-1/2 top-5 z-40 flex w-[calc(100%-32px)] max-w-6xl -translate-x-1/2 items-center justify-between rounded-full border border-white/20 bg-white/[0.10] px-5 py-3 shadow-2xl backdrop-blur-xl md:px-6">

  {/* Logo */}
  <a
    href="/"
    className="text-sm font-normal tracking-[0.28em] text-[#171717] transition-all duration-500 hover:tracking-[0.4em]"
  >
    OUTLOOK <span className="text-[#171717]/55">STUDIO</span>
  </a>

 {/* Desktop navigation */}
<div className="hidden items-center gap-8 text-sm md:flex">
  <a
    href="#shop"
    className="text-black/80 transition-opacity duration-300 hover:opacity-60"
  >
    Shop
  </a>

  <a
  href="#enquiry"
  aria-label="Make an enquiry"
  className="group flex h-9 w-9 items-center justify-center text-black/80"
>
  <span className="flex items-end font-serif font-light leading-none transition-transform duration-300 hover:opacity-60 group-hover:scale-130">
    <span className="text-lg">?</span>
    <span className="-ml-1 text-2xl">?</span>
  </span>
</a>
</div>
  {/* Desktop actions */}
  <div className="hidden items-center gap-2 md:flex">
    <a
      href="/cart"
      aria-label="Cart"
      className="group flex items-center justify-center text-[#252525] transition-colors duration-300 hover:text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.4 1.493m0 0L6.75 14.25a2.25 2.25 0 002.18 1.69h7.89a2.25 2.25 0 002.18-1.69l1.44-5.355a.75.75 0 00-.725-.945H5.123m0 0L4.5 5.25M9 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
    </a>

    <a
      href="/track-order"
      className="text-xs text-black transition-colors duration-300 hover:text-white"
    >
      Track Order
    </a>

    <a
      href="/account"
      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-black/85 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
    >
      Account
    </a>

    <a
      href="/admin/login"
      className="rounded-full px-4 py-2 text-sm text-black/85 transition hover:bg-white/10 hover:text-white"
    >
      Admin
    </a>
  </div>

  {/* Mobile hamburger */}
  <button
    type="button"
    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
    aria-expanded={mobileMenuOpen}
    onClick={() => setMobileMenuOpen((open) => !open)}
    className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[#171717]/10 bg-white/20 backdrop-blur-md transition-all duration-500 hover:bg-white/40 md:hidden"
  >
    <span className="relative flex h-4 w-5 flex-col justify-between">
      <span
        className={`h-px w-full bg-[#171717] transition-all duration-500 ${
          mobileMenuOpen
            ? "translate-y-[7px] rotate-45"
            : ""
        }`}
      />

      <span
        className={`h-px w-full bg-[#171717] transition-all duration-300 ${
          mobileMenuOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
        }`}
      />

      <span
        className={`h-px w-full bg-[#171717] transition-all duration-500 ${
          mobileMenuOpen
            ? "-translate-y-[7px] -rotate-45"
            : ""
        }`}
      />
    </span>
  </button>

  {/* Mobile navigation panel */}
  <div
    className={`absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-[1.75rem] border border-white/40 bg-[#f4f1ec]/90 shadow-[0_25px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl transition-all duration-500 ease-out md:hidden ${
      mobileMenuOpen
        ? "pointer-events-auto max-h-[520px] translate-y-0 opacity-100"
        : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
    }`}
  >
    <div className="p-3">
      <div className="flex flex-col">

        <a
          href="#shop"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-white/60"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#171717]/75 transition-all duration-300 group-hover:tracking-[0.3em] group-hover:text-[#171717]">
            Shop
          </span>
          <span className="text-sm text-[#171717]/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#171717]/70">
            →
          </span>
        </a>

        <a
  href="#enquiry"
  onClick={() => setMobileMenuOpen(false)}
  className="group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-white/60"
>
  <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#171717]/75 transition-all duration-300 group-hover:tracking-[0.3em] group-hover:text-[#171717]">
    Make an Enquiry
  </span>

  <span className="text-sm text-[#171717]/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#171717]/70">
    →
  </span>
</a>

        <a
          href="/track-order"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-white/60"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#171717]/75 transition-all duration-300 group-hover:tracking-[0.3em] group-hover:text-[#171717]">
            Track Order
          </span>
          <span className="text-sm text-[#171717]/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#171717]/70">
            →
          </span>
        </a>

        <a
          href="/cart"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-white/60"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#171717]/75 transition-all duration-300 group-hover:tracking-[0.3em] group-hover:text-[#171717]">
            Cart
          </span>
          <span className="text-sm text-[#171717]/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#171717]/70">
            →
          </span>
        </a>

        <a
          href="/account"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-white/60"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#171717]/75 transition-all duration-300 group-hover:tracking-[0.3em] group-hover:text-[#171717]">
            Account
          </span>
          <span className="text-sm text-[#171717]/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#171717]/70">
            →
          </span>
        </a>

        {/* Admin separation */}
        <div className="mx-5 my-2 h-px bg-[#171717]/10" />

        <a
          href="/admin/login"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-white/60"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#171717]/45 transition-all duration-300 group-hover:tracking-[0.3em] group-hover:text-[#171717]/75">
            Admin
          </span>
          <span className="text-sm text-[#171717]/25 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#171717]/60">
            →
          </span>
        </a>

      </div>
    </div>
  </div>
</nav>

        {/* Hero Content */}
        <section className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-6xl items-end justify-between px-6 pb-10 md:px-10 md:pb-12">
          <div className="max-w-xl">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-black/90">
              Contemporary Fashion
            </p>

          <h1 className="text-5xl text-black/80 font-light tracking-tight sm:text-6xl md:text-9xl">
  <span className="block md:inline">OUTLOOK </span>
  <DecodeText />
  <br className="md:hidden" />
  <span className="font-medium"></span>
</h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-black/50 md:text-base">
              
            </p>

           <a
   href="#shop"
  className="group mt-7 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/[0.12] px-7 py-3.5 text-sm font-normal tracking-[0.08em] text-black/85 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-500 hover:border-pink-200/50 hover:bg-white/[0.18] hover:shadow-[0_8px_50px_rgba(244,114,182,0.28)]"
>
  <span>EXPLORE COLLECTION</span>

  <span className="transition-transform duration-500 group-hover:translate-x-1">
    
  </span>
</a>
          </div>
          <div className="mt-8 flex flex-col items-center gap-2">
  <span className="text-[9px] uppercase tracking-[0.35em] text-black/80">
    Scroll Down
  </span>

  <span className="animate-bounce text-sm text-black/40">
    ↓
  </span>
</div>

          {/* Slide Counter */}
          <div className="hidden items-center gap-3 pb-2 sm:flex">
            <span className="text-xs tracking-[0.25em] text-white/60">
              0{currentSlide + 1}
            </span>

            <div className="h-px w-16 bg-white/30">
              <div
                className="h-full bg-white transition-all duration-700"
                style={{
                  width: `${((currentSlide + 1) / slides.length) * 100}%`,
                }}
              />
            </div>

            <span className="text-xs tracking-[0.25em] text-white/40">
              05
            </span>
          </div>
        </section>
      </section>

      {/* CATEGORIES */}
      <section className="relative bg-[#090909] px-5 py-24 sm:px-8 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/45">
            Explore
          </p>

          <h2 className="text-5xl font-light tracking-tight sm:text-5xl md:text-6xl">
            Shop by Category
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-6 text-white/50 md:text-base">
            Discover pieces curated for every style, occasion and personality.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
  {categories.map((category) => (
    <button
  key={category.name}
  type="button"
  onClick={() => {
    changeProductCategory(category.name);
    document
      .getElementById("shop")
      ?.scrollIntoView({ behavior: "smooth" });
  }}
  className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 text-left sm:aspect-[4/3] md:rounded-3xl"
>
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-white/55 sm:text-xs">
          {category.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-light sm:text-2xl md:text-3xl">
            {category.name}
          </h3>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm backdrop-blur-md transition duration-500 group-hover:bg-white group-hover:text-black sm:h-10 sm:w-10">
            →
          </span>
        </div>
      </div>
    </button>
  ))}
</div>
        </div>
      </section>
      {/* PRODUCTS */}
<section
  id="shop"
 className="relative overflow-hidden bg-[#f1ede7] px-5 py-24 text-black sm:px-8 md:px-12"
>
 
  <div className="relative mx-auto max-w-6xl">

    {/* Heading */}
    <div className="mb-10">
  <a
    href="/"
    className="text-sm font-xl tracking-[0.28em] text-[#171717] transition-all duration-500 hover:tracking-[0.4em]"
  >
    OUTLOOK <span className="text-[#171717]/55">STUDIO</span>
  </a>

  <p className="mb-4 text-xl uppercase tracking-[0.35em] text-black/40">
    Collection
  </p>

  <h2 className="text-5xl font-light tracking-tight text-[#24211e] sm:text-5xl md:text-7xl">
    Products
  </h2>


<p className="mt-5 max-w-lg text-sm leading-6 text-[#4a4641] md:text-base">
  Explore the latest pieces from OUTLOOK STUDIO.
</p>
    </div>

    {/* CATEGORY FILTER */}
    <div className="mb-10 flex gap-2 overflow-x-auto pb-2">
      {productCategories.map((category) => {
        const active = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => changeProductCategory(category)}
           className={`shrink-0 rounded-full border px-5 py-2.5 text-sm backdrop-blur-xl transition-all duration-300 ${
  active
    ? "border-black/20 bg-black text-white shadow-lg shadow-black/10"
    : "border-black/10 bg-black/[0.08] text-black/65 hover:border-black/20 hover:bg-black/[0.14] hover:text-black"
}`}
          >
            {category}
          </button>
        );
      })}
    </div>
    {productsLoading && (
  <div className="py-20 text-center text-sm text-black/40">
    Loading products...
  </div>
)}

{productsError && (
  <div className="py-20 text-center text-sm text-red-600">
    Unable to load products.
  </div>
)}

    {/* PRODUCT GRID */}
    {!productsLoading && !productsError && (
  <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {visibleProducts.map((product) => (
        <article
  key={product.id}
  onClick={() => router.push(`/product/${product.id}`)}
  className="group cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-black/[0.08] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:border-black/15 hover:bg-black/[0.12]"
>
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden">
            {(() => {
  const frontImage =
    product.images?.find(
      (image) => image?.type === "front"
    ) ?? product.images?.[0];

  return frontImage?.url ? (
    <img
      src={frontImage.url}
      alt={product.name}
      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.15em] text-black/30">
      No image
    </div>
    
  );
})()}
            {/* Wishlist */}
            <button
              type="button"
              onClick={(event) => {
  event.stopPropagation();
}}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.08] text-black/60 backdrop-blur-xl transition hover:bg-black hover:text-white"
              aria-label={`Add ${product.name} to wishlist`}
            >
              ♡
            </button>
          </div>

          {/* Product info */}
          <div className="p-4">
            <div className="mt-4 flex justify-end">
  <button
    type="button"
    onClick={(event) => {
  event.stopPropagation();

  setCartProduct(product);
  setSelectedSize(product.sizes?.[0] ?? "");
  setSelectedColor(product.colors?.[0] ?? "");
}}
    className="text-xs font-medium uppercase tracking-[0.15em] text-[#9a4f24] transition hover:text-[#713717]"
  >
    Add to cart
  </button>
</div>
            <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-black/40">
  {categoriesMap.get(product.category_id ?? "")?.name ??
  "Uncategorized"}
</p>

<h3 className="truncate text-sm font-light text-black/80 sm:text-base">
  {product.name}
</h3>

<div className="mt-2">
  {product.sale_price !== null &&
  product.sale_price !== undefined ? (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-black/70">
        ₹{product.sale_price.toLocaleString("en-IN")}
      </span>

      <span className="text-xs text-black/35 line-through">
        ₹{product.price.toLocaleString("en-IN")}
      </span>
    </div>
    
  ) : (
    <span className="text-sm text-black/60">
      ₹{product.price.toLocaleString("en-IN")}
    </span>
  )}
</div>
<div className="mt-2">
  {(product.stock ?? 0) > 0 ? (
    <span
      className={`text-[9px] uppercase tracking-[0.16em] ${
        (product.stock ?? 0) <= 3
          ? "text-amber-700"
          : "text-emerald-700/70"
      }`}
    >
      {product.stock ?? 0}{" "}
      {(product.stock ?? 0) === 1 ? "item" : "items"} in stock
    </span>
  ) : (
    <span className="text-[9px] uppercase tracking-[0.16em] text-red-700/70">
      Out of stock
    </span>
  )}
</div>         </div>
        </article>
      ))}
    </div>
    )}

    {/* PAGINATION */}
{totalPages > 1 && (
  <div className="mt-12 flex items-center justify-center gap-2">

    <button
      type="button"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage((page) => page - 1)
      }
      className="rounded-full border border-black/10 bg-black/[0.04] px-4 py-2 text-sm text-black/60 backdrop-blur-xl transition hover:border-black/20 hover:bg-black/[0.08] hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
    >
      ←
    </button>

    {Array.from(
      { length: totalPages },
      (_, index) => index + 1
    ).map((page) => (
      <button
        key={page}
        type="button"
        onClick={() => setCurrentPage(page)}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
          currentPage === page
            ? "bg-black text-white shadow-lg shadow-black/10"
            : "border border-black/10 bg-black/[0.04] text-black/50 backdrop-blur-xl hover:bg-black/[0.08] hover:text-black"
        }`}
      >
        {page}
      </button>
    ))}

    <button
      type="button"
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage((page) => page + 1)
      }
      className="rounded-full border border-black/10 bg-black/[0.04] px-4 py-2 text-sm text-black/60 backdrop-blur-xl transition hover:border-black/20 hover:bg-black/[0.08] hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
    >
      →
    </button>

  </div>
)}

</div>
{cartProduct && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
   <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-black/30 p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">

      {/* Close */}
      <button
        type="button"
        onClick={() => setCartProduct(null)}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        ×
      </button>

      {/* Product */}
      <div className="pr-10">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
          Add to cart
        </p>

        <h3 className="mt-2 text-xl font-light">
          {cartProduct.name}
        </h3>
      </div>

      {/* Size */}
      {cartProduct.sizes && cartProduct.sizes.length > 0 && (
        <div className="mt-7">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/45">
            Size
          </p>

          <div className="flex flex-wrap gap-2">
            {cartProduct.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  selectedSize === size
                    ? "border-white bg-white text-black"
                    : "border-white/15 bg-white/[0.06] backdrop-blur-xl text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colour */}
      {cartProduct.colors && cartProduct.colors.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/45">
            Colour
          </p>

          <div className="flex flex-wrap gap-2">
            {cartProduct.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  selectedColor === color
                    ? "border-white bg-white text-black"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => setCartProduct(null)}
          disabled={addingToCart || cartAdded}
          className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.15em] text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={
            addingToCart ||
            (!!cartProduct.sizes?.length && !selectedSize) ||
            (!!cartProduct.colors?.length && !selectedColor)
          }
          onClick={async () => {
  setAddingToCart(true);
  setCartAdded(false);

  addToCart({
    productId: cartProduct.id,
    name: cartProduct.name,
    price: cartProduct.sale_price ?? cartProduct.price,
    image:
      cartProduct.images?.find((image) => image?.type === "front")?.url ??
      cartProduct.images?.[0]?.url ??
      null,
    size: cartProduct.sizes?.[0] ?? null,
    color: cartProduct.colors?.[0] ?? null,
    quantity: 1,
  });

  await new Promise((resolve) => setTimeout(resolve, 700));

  setAddingToCart(false);
  setCartAdded(true);

  await new Promise((resolve) => setTimeout(resolve, 900));

  setCartAdded(false);
  setCartProduct(null);
}}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#9a4f24] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-[#713717] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addingToCart ? (
  <>
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    Adding...
  </>
) : cartAdded ? (
  "✓ Added to cart"
) : (
  "Add to cart"
)}
        </button>
      </div>
    </div>
  </div>
)}
</section>
{/* Brand Divider */}
<section className="relative flex min-h-[20vh] items-center justify-center overflow-hidden bg-[#f1ede7] px-6 py-20 text-center">
  <div className="relative z-10 mx-auto max-w-3xl">
    <p className="mb-6 text-[20px] uppercase tracking-[0.42em] text-[#171717]/40">
      OUTLOOK STUDIO
    </p>

    <h2 className="text-3xl font-light leading-[0.95] tracking-[-0.04em] text-[#171717] sm:text-5xl md:text-5xl">
      FOR LITTLE MOMENTS.
      <br />
      <span className="text-[#171717]/55">
        MADE TO BE REMEMBERED.
      </span>
    </h2>

    <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-[#171717]/50 sm:text-base">
      Thoughtful pieces for every day, every adventure, and everything in between.
    </p>

    <div className="mx-auto mt-8 h-px w-12 bg-[#171717]/20" />
  </div>
</section>
{/* TRACK ORDER */}
<section className="relative min-h-screen overflow-hidden">
  {/* Background image */}
  <img
    src="/media/track-order/track-order.png"
    alt="Track your OUTLOOK STUDIO order"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />

  {/* Soft editorial overlay */}
  <div className="absolute inset-0 bg-black/[0.03]" />

  <div className="relative z-10 flex min-h-screen items-center px-6 py-24 sm:px-10 md:px-16 lg:px-24">
    <div className="mx-auto w-full max-w-6xl">
      <div className="max-w-xl">
        <p className="mb-5 text-[10px] uppercase tracking-[0.38em] text-black/55">
          Track Order
        </p>

        <h2 className="max-w-2xl text-5xl font-light leading-[0.94] tracking-[-0.04em] text-[#171717] sm:text-6xl md:text-7xl lg:text-8xl">
          YOUR ORDER,
          <br />
          WHEREVER IT GOES.
        </h2>

        <p className="mt-7 max-w-md text-sm leading-6 text-[#171717]/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)] sm:text-base">
          Sign in with Google to view your orders and follow every update from
          confirmation to delivery.
        </p>

        <button
          type="button"
          onClick={() => router.push("/track-order")}
          className="group mt-8 flex min-h-14 items-center gap-4 rounded-full border border-white/15 bg-[#17191c]/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#f7f3ed] shadow-[0_12px_40px_rgba(0,0,0,0.20)] backdrop-blur-2xl transition-all duration-500 hover:border-[#8fc9ff]/45 hover:bg-[#17191c]/90 hover:text-white hover:shadow-[0_0_32px_rgba(111,190,255,0.28),0_14px_55px_rgba(0,0,0,0.28)]"
        >
          <span>
            TRACK ORDER
          </span>

          <span className="text-lg text-[#dce8f5] transition-all duration-500 group-hover:translate-x-1 group-hover:text-[#9ed3ff]">
  →
</span>
        </button>
        </div>
      </div>
    </div>

</section>
{/* TRACK ORDER → ENQUIRY BRAND BREAK */}
<section className="flex h-24 items-center justify-center bg-[#171717] px-6 sm:h-28">
  <div className="text-center">
    <p className="text-[15px] uppercase tracking-[0.42em] text-[#f1ede7]/45">
      OUTLOOK STUDIO
    </p>

    <p className="mt-2 text-[10px] font-light uppercase tracking-[0.28em] text-[#f1ede7]/75 sm:text-xs">
      MADE FOR LITTLE MOMENTS.
    </p>
  </div>
</section>

{/* ENQUIRY */}
<section
  id="enquiry"
  className="relative min-h-screen overflow-hidden bg-[#f1ede7]"
>
  
  {/* Background image */}
  <img
    src="/media/enquiry/enquiry.png"
    alt="OUTLOOK STUDIO customer enquiry"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />
  

  {/* Soft editorial overlay */}
  <div className="absolute inset-0 bg-[#f1ede7]/[0.10]" />
  
  

  <div className="relative z-10 flex min-h-screen items-center px-6 py-24 sm:px-10 md:px-16 lg:px-24">
    <div className="mx-auto w-full max-w-6xl">
      <div className="max-w-xl">
        
        <p className="mb-5 text-[10px] uppercase tracking-[0.38em] text-[#171717]/50">
          Customer Enquiry
        </p>

        <h2 className="max-w-2xl text-5xl font-light leading-[0.94] tracking-[-0.04em] text-[#171717] sm:text-6xl md:text-7xl lg:text-8xl">
          WE&apos;RE HERE
          <br />
          TO HELP.
        </h2>

        <p className="mt-7 max-w-md text-sm leading-6 text-[#171717]/90 sm:text-base">
          Have a question about a piece, your order, sizing, or anything
          else? Leave us a message and our team will get back to you.
        </p>

        <button
          type="button"
          onClick={() => setEnquiryOpen(true)}
          className="group mt-8 flex min-h-14 items-center gap-4 rounded-full border border-white/10 bg-[#171717]/85 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#f7f3ed] shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-all duration-500 hover:border-[#16A34A]/45 hover:bg-[#16A34A] hover:text-white hover:shadow-[0_0_32px_rgba(22,163,74,0.20),0_14px_55px_rgba(0,0,0,0.20)]"
        >
          <span>Make Enquiry</span>

          <span className="text-lg text-white/70 transition-all duration-500 group-hover:translate-x-1 group-hover:text-white">
            →
          </span>
        </button>
      </div>
    </div>
  </div>
</section>

{/* ENQUIRY MODAL */}
{enquiryOpen && (
  <div
    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-md"
    onClick={() => setEnquiryOpen(false)}
  >
    <div
      className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-black/[0.08] bg-[#f1ede7] text-[#171717] shadow-[0_30px_100px_rgba(0,0,0,0.30)]"
      onClick={(event) => event.stopPropagation()}
    >
      {/* Close */}
      <button
        type="button"
        onClick={() => setEnquiryOpen(false)}
        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-black/[0.04] text-lg text-[#171717]/45 transition-all duration-300 hover:bg-[#171717] hover:text-white"
        aria-label="Close enquiry form"
      >
        ×
      </button>

      <div className="p-6 sm:p-8 md:p-10">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-[#171717]/40">
          OUTLOOK STUDIO
        </p>

        <h3 className="mt-3 pr-10 text-3xl font-light tracking-[-0.03em] text-[#171717] sm:text-4xl">
          Make an enquiry.
        </h3>

        <p className="mt-3 max-w-md text-sm leading-6 text-[#171717]/50">
          Tell us what you&apos;d like to know and we&apos;ll be happy to help.
        </p>

        <div className="mt-8 space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="enquiry-name"
              className="mb-2 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/50"
            >
              Name
            </label>

            <input
              id="enquiry-name"
              type="text"
              placeholder="Your name"
              value={enquiryName}
              onChange={(event) => setEnquiryName(event.target.value)}
              className="w-full rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition-all duration-300 placeholder:text-[#171717]/25 focus:border-[#171717]/25 focus:bg-white"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="enquiry-phone"
              className="mb-2 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/50"
            >
              Phone number
            </label>

            <input
              id="enquiry-phone"
              type="tel"
              placeholder="Your phone number"
              value={enquiryPhone}
              onChange={(event) => setEnquiryPhone(event.target.value)}
              className="w-full rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm text-[#171717] outline-none transition-all duration-300 placeholder:text-[#171717]/25 focus:border-[#171717]/25 focus:bg-white"
            />
          </div>

          {/* Enquiry */}
          <div>
            <label
              htmlFor="enquiry-message"
              className="mb-2 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#171717]/50"
            >
              Your enquiry
            </label>

            <textarea
              id="enquiry-message"
              rows={5}
              placeholder="How can we help?"
              value={enquiryMessage}
              onChange={(event) => setEnquiryMessage(event.target.value)}
              className="w-full resize-none rounded-2xl border border-black/[0.08] bg-[#faf9f7] px-4 py-3.5 text-sm leading-6 text-[#171717] outline-none transition-all duration-300 placeholder:text-[#171717]/25 focus:border-[#171717]/25 focus:bg-white"
            />
          </div>

          {/* Status messages */}
          {enquiryError && (
            <p className="rounded-2xl border border-red-900/10 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
              {enquiryError}
            </p>
          )}

          {enquirySuccess && (
            <div className="rounded-2xl border border-green-900/10 bg-green-50 px-4 py-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-green-700">
                Enquiry received
              </p>

              <p className="mt-1 text-sm leading-5 text-green-800/75">
                Thank you. Our team will get back to you soon.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleEnquirySubmit}
            disabled={enquirySubmitting}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#171717] px-6 py-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(23,23,23,0.15)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#16A34A] hover:shadow-[0_12px_32px_rgba(22,163,74,0.20)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-[#171717]"
          >
            {enquirySubmitting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send Enquiry</span>

                <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}


{/* Footer */}
<footer className="relative overflow-hidden bg-[#171717] px-6 py-16 text-[#f1ede7] sm:px-10 md:px-16 md:py-20">
  <div className="mx-auto max-w-7xl">

    <div className="flex flex-col items-center text-center">

      <a
        href="/"
        className="text-2xl font-normal tracking-[0.28em] text-[#f1ede7] transition-all duration-500 hover:tracking-[0.4em] sm:text-3xl md:text-4xl"
      >
        OUTLOOK{" "}
        <span className="text-[#f1ede7]/55">
          STUDIO
        </span>
      </a>

      <p className="mt-5 max-w-md text-xs leading-6 tracking-wide text-[#f1ede7]/45 sm:text-sm">
        Thoughtfully made for little moments,
        <br className="sm:hidden" /> beautifully lived.
      </p>

      <div className="mt-9 flex items-center gap-6 text-[9px] uppercase tracking-[0.22em] text-[#f1ede7]/45">
       <a
  href="/privacy"
  className="transition-colors duration-300 hover:text-[#f1ede7]"
>
  Privacy Policy
</a>
        <span className="h-3 w-px bg-[#f1ede7]/15" />

        <a
  href="/terms"
  className="transition-colors duration-300 hover:text-[#f1ede7]"
>
  Terms of Agreement
</a>
      </div>

    </div>

    <div className="mt-14 border-t border-[#f1ede7]/10 pt-6 text-center">
      <p className="text-[9px] uppercase tracking-[0.24em] text-[#f1ede7]/25">
        © 2026 OUTLOOK STUDIO. ALL RIGHTS RESERVED.
      </p>
    </div>

  </div>

  {/* Easter Egg Button */}
  <button
    onClick={() => {
  if (!showDeveloper) {
    setShowDeveloper(true);

    setTimeout(() => {
      developerSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 750);
  } else {
    setShowDeveloper(false);
  }
}}
    aria-label={showDeveloper ? "Close developer information" : "Show developer information"}
   className="absolute bottom-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-yellow-400/25 text-lg font-light text-yellow-400/75 shadow-[0_0_18px_rgba(250,204,21,0.08)] transition-all duration-500 hover:border-yellow-400/60 hover:text-yellow-300 hover:shadow-[0_0_24px_rgba(250,204,21,0.18)] sm:bottom-6 sm:right-7"
  >
    <span
  className={`${
    showDeveloper ? "rotate-45" : "rotate-0"
  } transition-transform duration-500`}
>
  +
</span>
  </button>
</footer>

{/* Developer Easter Egg */}
<div
  ref={developerSectionRef}
  className={`overflow-hidden bg-[#111111] transition-all duration-700 ease-in-out ${
    showDeveloper ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
  }`}
>
  <div className="flex min-h-20 items-center justify-center px-6 py-6 text-center">
    <p className="text-[9px] uppercase tracking-[0.28em] text-[#f1ede7]/60 sm:text-[10px]">
      Design,Build and developed by Mikael : 8837067518.
    </p>
  </div>
</div>
</main>
);
}
