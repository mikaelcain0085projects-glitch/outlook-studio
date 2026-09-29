"use client";

import { useEffect, useState } from "react";
import { getCart, saveCart, type CartItem } from "@/lib/cart";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setLoaded(true);
  }, []);

  function updateQuantity(index: number, quantity: number) {
    if (quantity < 1) return;

    const updated = [...cart];
    updated[index] = {
      ...updated[index],
      quantity,
    };

    setCart(updated);
    saveCart(updated);
  }

  function removeItem(index: number) {
    const updated = cart.filter((_, itemIndex) => itemIndex !== index);

    setCart(updated);
    saveCart(updated);
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[linear-gradient(to_bottom,#8f877d_0%,#c9c1b7_15%,#f1ede7_50%,#c9c1b7_85%,#8f877d_100%)] text-[#24211e]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#292724]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#292724]/20 border-t-[#292724]" />
            Loading cart
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#8f877d_0%,#c9c1b7_15%,#f1ede7_50%,#c9c1b7_85%,#8f877d_100%)] text-[#24211e]">
      <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-black/10 bg-white/20 px-4 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur-2xl sm:h-[72px] sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/#shop")}
            className="text-sm font-medium tracking-[0.28em] text-[#292724] transition hover:text-black"
          >
            OUTLOOK STUDIO
          </button>

          <button
            type="button"
            onClick={() => router.push("/#shop")}
            className="rounded-full border border-[#d9a0a8]/40 bg-[#f3d9dd]/70 px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#7b4b53] shadow-[0_8px_24px_rgba(120,70,80,0.08)] backdrop-blur-sm transition hover:border-[#d9a0a8]/60 hover:bg-[#f3d9dd] hover:text-[#633b43]"
          >
            Continue Shopping
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#4a4540]">
            Your Selection
          </p>

          <h1 className="mt-3 text-4xl font-light tracking-tight text-[#24211e] sm:text-5xl">
            My Cart
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/20 px-6 py-20 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#4a4540]">
              Your cart is empty
            </p>

            <h2 className="mt-4 text-2xl font-light text-[#24211e]">
              Nothing here yet.
            </h2>

            <button
              type="button"
              onClick={() => router.push("/#shop")}
              className="mt-8 rounded-full bg-[#292724] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cart.map((item, index) => (
                <article
                  key={`${item.productId}-${item.size}-${item.color}-${index}`}
                  className="flex gap-5 rounded-[1.75rem] border border-black/10 bg-white/20 p-4 shadow-[0_15px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-5"
                >
                  <div className="h-32 w-24 shrink-0 overflow-hidden rounded-2xl bg-black/[0.05] sm:h-40 sm:w-32">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-widest text-[#4a4540]/60">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h2 className="truncate text-lg font-light text-[#24211e]">
                        {item.name}
                      </h2>

                      <div className="mt-2 space-y-1 text-[10px] uppercase tracking-[0.16em] text-[#4a4540]">
                        {item.size && <p>Size · {item.size}</p>}
                        {item.color && <p>Colour · {item.color}</p>}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.04]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                          className="flex h-9 w-9 items-center justify-center text-[#3b3733] transition hover:text-black"
                        >
                          −
                        </button>

                        <span className="w-8 text-center text-xs font-medium text-[#292724]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                          className="flex h-9 w-9 items-center justify-center text-[#3b3733] transition hover:text-black"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-[9px] uppercase tracking-[0.18em] text-[#6b625a] transition hover:text-black"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-medium text-[#292724]">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-[2rem] border border-black/10 bg-white/25 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur-2xl lg:sticky lg:top-28">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#4a4540]">
                Order Summary
              </p>

              <div className="mt-8 flex items-center justify-between border-b border-black/10 pb-5">
                <span className="text-sm font-light text-[#4a4540]">
                  Subtotal
                </span>

                <span className="text-lg font-medium text-[#292724]">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <p className="mt-5 text-[10px] leading-5 tracking-[0.12em] text-[#6b625a]">
                Shipping and payment options will be calculated during
                checkout.
              </p>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="mt-7 w-full rounded-full bg-[#292724] px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black"
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}