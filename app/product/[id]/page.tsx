"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { addToCart } from "@/lib/cart";

type ProductImage = {
  url: string;
  type?: string;
};

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number | null;
  category_id: string | null;
  images: ProductImage[] | null;
  sizes: string[] | null;
  colors: string[] | null;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const { data, error: productError } = await supabase
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
            colors
          `
        )
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (productError || !data) {
        setError(productError?.message ?? "Product not found.");
        setLoading(false);
        return;
      }

      const typedProduct = data as Product;

      setProduct(typedProduct);

      setSelectedSize(typedProduct.sizes?.[0] ?? "");
      setSelectedColor(typedProduct.colors?.[0] ?? "");

      if (typedProduct.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id, name, parent_id")
          .eq("id", typedProduct.category_id)
          .maybeSingle();

        setCategory(categoryData as Category | null);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const images = useMemo(() => {
    if (!product?.images?.length) {
      return [];
    }

    const frontImage = product.images.find(
      (image) => image?.type === "front"
    );

    const backImage = product.images.find(
      (image) => image?.type === "back"
    );

    const orderedImages: ProductImage[] = [];

    if (frontImage) {
      orderedImages.push(frontImage);
    }

    if (backImage && backImage.url !== frontImage?.url) {
      orderedImages.push(backImage);
    }

    for (const image of product.images) {
      if (
        image?.url &&
        !orderedImages.some(
          (existingImage) => existingImage.url === image.url
        )
      ) {
        orderedImages.push(image);
      }
    }

    return orderedImages;
  }, [product]);

  const increaseQuantity = () => {
    if (!product) return;

    const maxStock = product.stock ?? 99;

    setQuantity((current) => Math.min(current + 1, maxStock));
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(current - 1, 1));
  };

  if (loading) {
    return (
  <main className="min-h-screen bg-[linear-gradient(to_bottom,#8f877d_0%,#c9c1b7_15%,#f1ede7_50%,#c9c1b7_85%,#8f877d_100%)] text-[#24211e]">
    <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#292724]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#292724]/20 border-t-[#292724]" />
        Loading product
      </div>
    </div>
  </main>
);
  }

  if (error || !product) {
    return (
      <main
  className="min-h-screen text-white"
  style={{
  background:
    "linear-gradient(to bottom, #8f877d 0%, #c9c1b7 15%, #f1ede7 50%, #c9c1b7 85%, #8f877d 100%)",
}}
>
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
            Product
          </p>

          <h1 className="mt-4 text-3xl font-light">
            Product unavailable
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/45">
            This product could not be found or is no longer available.
          </p>

          <button
  type="button"
  onClick={() => router.push("/#shop")}
  className="group inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.10] px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-black/70 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all duration-500 hover:border-pink-300/50 hover:bg-pink-400/10 hover:text-pink-900 hover:shadow-[0_0_35px_rgba(236,72,153,0.28),0_12px_40px_rgba(0,0,0,0.12)]"
>
  Back to Store
</button>
        </div>
      </main>
    );
  }

  const isOnSale =
    product.sale_price !== null &&
    product.sale_price !== undefined;

  const displayPrice =
  product.sale_price !== null &&
  product.sale_price !== undefined
    ? product.sale_price
    : product.price;
  const outOfStock = (product.stock ?? 0) <= 0;

  return (
   <main
  className="min-h-screen text-white"
  style={{
    background:
      "linear-gradient(to bottom, #8f877d 0%, #c9c1b7 15%, #f1ede7 50%, #c9c1b7 85%, #8f877d 100%)",
  }}
>
     {/* Header */}
<header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
  <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:h-[72px] sm:px-6">
    <button
      type="button"
      onClick={() => router.push("/#shop")}
      className="text-sm font-medium tracking-[0.28em] text-white/90 transition hover:text-white"
    >
      OUTLOOK STUDIO
    </button>

    <div className="flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => router.push("/#shop")}
        className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
      >
        Store
      </button>

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-white/75 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
        aria-label="My Cart"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
      </button>

      <button
        type="button"
        className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
      >
        Account
      </button>
    </div>
  </div>
</header>

      {/* Product */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        {/* Back */}
       <button
  type="button"
  onClick={() => router.push("/#shop")}
  className="mb-8 inline-flex items-center justify-center rounded-full border border-black/10 bg-white/25 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-black/80 shadow-[0_10px_35px_rgba(0,0,0,0.10)] backdrop-blur-xl transition-all duration-500 hover:border-pink-400/40 hover:bg-pink-300/20 hover:text-pink-950 hover:shadow-[0_0_30px_rgba(236,72,153,0.35),0_12px_40px_rgba(0,0,0,0.12)] sm:mb-12"
>
  Back to Store
</button>
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          {/* Images */}
          <div className="flex justify-center">
  <div className="w-full max-w-[82%] sm:max-w-[72%] lg:max-w-[62%]">
    <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-black/[0.06] shadow-[0_25px_70px_rgba(0,0,0,0.12)]">
      <div className="aspect-[4/5]">
        {images[selectedImage]?.url ? (
          <img
            src={images[selectedImage].url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/25">
            No image
          </div>
        )}
      </div>
    </div>

    {images.length > 1 && (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => setSelectedImage(index)}
            className={`group overflow-hidden rounded-xl border transition ${
              selectedImage === index
                ? "border-black/50"
                : "border-black/10 hover:border-black/25"
            }`}
          >
            <div className="aspect-[4/5] overflow-hidden bg-black/[0.04]">
              <img
                src={image.url}
                alt={`${product.name} ${
                  image.type === "back" ? "back" : "front"
                }`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>

            <div className="bg-white/30 px-2 py-1.5 text-left text-[8px] uppercase tracking-[0.18em] text-black/45">
              {image.type === "back" ? "Back" : "Front"}
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
</div>
          {/* Details */}
<div className="flex flex-col justify-center">
  <div>
    <p className="text-[10px] uppercase tracking-[0.3em] text-[#4a4540]">
      {category?.name ?? "Collection"}
    </p>

    <h1 className="mt-4 text-3xl font-light tracking-tight text-[#24211e] sm:text-4xl lg:text-5xl">
      {product.name}
    </h1>

    <div className="mt-6 flex items-center gap-3">
      <span className="text-xl font-medium text-[#292724]">
        ₹{displayPrice.toLocaleString("en-IN")}
      </span>

      {isOnSale && (
        <span className="text-sm text-[#6b625a]/70 line-through">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
      )}
    </div>

    {product.description && (
      <div className="mt-8 border-t border-black/10 pt-8">
        <p className="whitespace-pre-line text-sm leading-7 text-[#4a4540]/75">
          {product.description}
        </p>
      </div>
    )}
  </div>

           {/* Options */}
<div className="mt-10 space-y-8">
  {product.sizes && product.sizes.length > 0 && (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#4a4540]">
          Size
        </p>

        <span className="text-[15px] text-orange-500">
          Select one
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {product.sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelectedSize(size)}
            className={`min-w-14 rounded-full border px-4 py-3 text-xs transition ${
              selectedSize === size
                ? "border-black/20 bg-black text-white"
                : "border-black/10 bg-black/[0.04] text-[#3b3733] hover:border-black/25 hover:bg-black/[0.08] hover:text-black"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )}

  {product.colors && product.colors.length > 0 && (
    <div>
      <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#4a4540]">
        Colour
      </p>

      <div className="flex flex-wrap gap-2">
        {product.colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setSelectedColor(color)}
            className={`rounded-full border px-4 py-3 text-xs transition ${
              selectedColor === color
                ? "border-black/20 bg-black text-white"
                : "border-black/10 bg-black/[0.04] text-[#3b3733] hover:border-black/25 hover:bg-black/[0.08] hover:text-black"
            }`}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  )}

              {/* Quantity */}
              <div>
  <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#4a4540]">
    Quantity
  </p>

  <div className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.04] backdrop-blur-xl">
    <button
      type="button"
      onClick={decreaseQuantity}
      disabled={quantity <= 1}
      className="flex h-11 w-11 items-center justify-center text-[#3b3733] transition hover:text-black disabled:opacity-25"
    >
      −
    </button>

    <span className="w-10 text-center text-sm font-medium text-[#292724]">
      {quantity}
    </span>

    <button
      type="button"
      onClick={increaseQuantity}
      disabled={
        outOfStock ||
        quantity >= (product.stock ?? 99)
      }
      className="flex h-11 w-11 items-center justify-center text-[#3b3733] transition hover:text-black disabled:opacity-25"
    >
      +
    </button>
  </div>
</div>            </div>

            {/* CTA */}
            <div className="mt-10 border-t border-white/10 pt-8">
              <button
  type="button"
  disabled={outOfStock}
 onClick={() => {
  addToCart({
    productId: product.id,
    name: product.name,
    price: displayPrice,
    image:
      product.images?.find((image) => image?.type === "front")?.url ??
      product.images?.[0]?.url ??
      null,
    size: selectedSize,
    color: selectedColor,
    quantity,
  });

  router.push("/cart");
}}
                className="w-full rounded-full bg-[#9a4f24] px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-[#713717] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <p className="mt-4 text-center text-[10px] uppercase tracking-[0.18em] text-black/80">
                Secure checkout · Easy order tracking
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}