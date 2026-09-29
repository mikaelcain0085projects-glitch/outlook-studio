"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("order");
  const paymentMethod = searchParams.get("payment");

  const paymentLabel =
    paymentMethod === "upi" ? "UPI / GPay" : "Cash on Delivery";

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#8f877d_0%,#c9c1b7_15%,#f1ede7_50%,#c9c1b7_85%,#8f877d_100%)] text-[#24211e]">
      <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-black/10 bg-white/20 px-4 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur-2xl sm:h-[72px] sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-medium tracking-[0.28em] text-[#292724] transition hover:text-black"
          >
            OUTLOOK STUDIO
          </button>

          <button
            type="button"
            onClick={() => router.push("/#shop")}
            className="rounded-full border border-black/10 bg-black/[0.04] px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#4a4540] transition hover:bg-black/[0.08] hover:text-black"
          >
            Continue Shopping
          </button>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center px-5 py-16 sm:px-8 sm:py-20">
        <div className="w-full rounded-[2rem] border border-black/10 bg-white/25 p-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-2xl sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-black/[0.05]">
            <span className="text-2xl text-[#292724]">✓</span>
          </div>

          <p className="mt-7 text-[10px] uppercase tracking-[0.3em] text-[#4a4540]">
            Order Received
          </p>

          <h1 className="mt-3 text-4xl font-light tracking-tight text-[#24211e] sm:text-5xl">
            Thank you for your order.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#4a4540]/80">
            Your order has been received and is now being prepared. Keep your
            order number for tracking and future reference.
          </p>

          {orderNumber ? (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-black/10 bg-black/[0.04] p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#6b625a]">
                Order Number
              </p>
              <p className="mt-2 break-all text-lg font-medium tracking-[0.08em] text-[#292724]">
                {orderNumber}
              </p>
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-5">
              <p className="text-xs text-[#6b625a]">
                Your order was received, but the order number could not be
                displayed here.
              </p>
            </div>
          )}

          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-black/10 bg-white/20 p-5 text-left">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#6b625a]">Payment method</span>
              <span className="font-medium text-[#292724]">
                {paymentLabel}
              </span>
            </div>

            {paymentMethod === "upi" && (
              <p className="mt-3 border-t border-black/10 pt-3 text-xs leading-6 text-[#6b625a]">
                UPI payment instructions will be connected in the next payment
                step. Your order is currently recorded as payment pending.
              </p>
            )}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.push("/#shop")}
              className="rounded-full bg-[#292724] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black"
            >
              Continue Shopping
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full border border-black/10 bg-white/20 px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#4a4540] transition hover:bg-white/35 hover:text-black"
            >
              Back Home
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f1ede7] text-[#292724]">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-[#292724]" />
            Loading order
          </div>
        </main>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
