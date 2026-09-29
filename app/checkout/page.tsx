"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCart, getCart, type CartItem } from "@/lib/cart";
import { createClient } from "@/lib/supabase-browser";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<"cod" | "upi">("cod");

  const [checkoutMode, setCheckoutMode] = useState<"google" | null>(null);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [orderCreating, setOrderCreating] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "review">(
    "details",
  );

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pinCode: "",
    state: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleGoogleLogin() {
    setGoogleLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/checkout`,
      },
    });

    if (error) {
      console.error("Google login failed:", error);
      setGoogleLoading(false);

      setErrors((current) => ({
        ...current,
        checkoutMode:
          "Google login could not be started. Please try again.",
      }));
    }
  }

  function updateField(field: string, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  function selectCheckoutMode(mode: "google") {
    setCheckoutMode(mode);

    setErrors((current) => ({
      ...current,
      checkoutMode: "",
    }));
  }

  function validateCheckout() {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Please enter your delivery address.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city.";
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = "Please enter your PIN code.";
    } else if (!/^\d{6}$/.test(formData.pinCode.trim())) {
      newErrors.pinCode = "Enter a valid 6-digit PIN code.";
    }

    if (!formData.state.trim()) {
      newErrors.state = "Please enter your state.";
    }

    setErrors((current) => ({
      ...current,
      ...newErrors,
      ...(!newErrors.fullName ? { fullName: "" } : {}),
      ...(!newErrors.phone ? { phone: "" } : {}),
      ...(!newErrors.email ? { email: "" } : {}),
      ...(!newErrors.address ? { address: "" } : {}),
      ...(!newErrors.city ? { city: "" } : {}),
      ...(!newErrors.pinCode ? { pinCode: "" } : {}),
      ...(!newErrors.state ? { state: "" } : {}),
    }));

    return Object.keys(newErrors).length === 0;
  }

  function handleContinueToPayment() {
    if (checkoutMode !== "google") {
      setErrors((current) => ({
        ...current,
        checkoutMode:
          "Please continue with Google to place your order securely.",
      }));
      return;
    }

    if (!validateCheckout()) return;

    if (cart.length === 0) {
      setErrors((current) => ({ ...current, checkoutMode: "Your cart is empty." }));
      return;
    }

    setErrors((current) => ({ ...current, checkoutMode: "" }));
    setCheckoutStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePlaceOrder() {
    if (orderCreating) return;
    setOrderCreating(true);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
          customer: {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pinCode: formData.pinCode,
          },
          paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors((current) => ({
          ...current,
          checkoutMode:
            result.error || "Unable to create your order. Please try again.",
        }));
        return;
      }

      clearCart();
      router.push(
        `/order-confirmation?order=${encodeURIComponent(
          result.orderNumber,
        )}&payment=${encodeURIComponent(paymentMethod)}`,
      );
    } catch (error) {
      console.error("Checkout request failed:", error);
      setErrors((current) => ({
        ...current,
        checkoutMode:
          "Something went wrong while creating your order. Please try again.",
      }));
    } finally {
      setOrderCreating(false);
    }
  }

 useEffect(() => {
  async function loadCheckout() {
    setCart(getCart());

    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      setCheckoutMode("google");

      setFormData((current) => ({
        ...current,
        email: session.user.email ?? current.email,
        fullName:
          session.user.user_metadata?.full_name ??
          session.user.user_metadata?.name ??
          current.fullName,
      }));
    }

    setLoaded(true);
  }

  loadCheckout();
}, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[linear-gradient(to_bottom,#8f877d_0%,#c9c1b7_15%,#f1ede7_50%,#c9c1b7_85%,#8f877d_100%)] text-[#24211e]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#292724]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#292724]/20 border-t-[#292724]" />
            Loading checkout
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
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
              onClick={() => router.push("/cart")}
              className="rounded-full border border-black/10 bg-black/[0.04] px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#4a4540] transition hover:bg-black/[0.08] hover:text-black"
            >
              Back to Cart
            </button>
          </div>
        </header>

        <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-6 py-20">
          <div className="w-full rounded-[2rem] border border-black/10 bg-white/20 px-6 py-20 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#4a4540]">
              Checkout
            </p>

            <h1 className="mt-4 text-3xl font-light text-[#24211e]">
              Your cart is empty.
            </h1>

            <button
              type="button"
              onClick={() => router.push("/#shop")}
              className="mt-8 rounded-full bg-[#292724] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black"
            >
              Explore Collection
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#8f877d_0%,#c9c1b7_15%,#f1ede7_50%,#c9c1b7_85%,#8f877d_100%)] text-[#24211e]">
      {/* Navigation */}
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
            onClick={() => router.push("/cart")}
            className="rounded-full border border-black/10 bg-black/[0.04] px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#4a4540] transition hover:bg-black/[0.08] hover:text-black"
          >
            Back to Cart
          </button>
        </div>
      </header>

      {/* Checkout */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#4a4540]">
            Secure Checkout
          </p>

          <h1 className="mt-3 text-4xl font-light tracking-tight text-[#24211e] sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#4a4540]/75">
            Complete your delivery details, choose payment, then review your order before placing it.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Customer Details */}
          <div className="space-y-6">
            {checkoutStep === "details" ? (
              <>
            {/* Customer */}
            <section className="rounded-[2rem] border border-black/10 bg-white/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#4a4540]">
                  Customer
                </p>

                <h2 className="mt-2 text-2xl font-light text-[#24211e]">
                  Account
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => {
                    selectCheckoutMode("google");
                    handleGoogleLogin();
                  }}
                  disabled={googleLoading}
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    checkoutMode === "google"
                      ? "border-orange-500/40 bg-orange-500/[0.06]"
                      : "border-black/10 bg-white/20 hover:border-black/20 hover:bg-white/30"
                  } disabled:cursor-wait disabled:opacity-70`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#292724]">
                        {googleLoading
                          ? "Connecting to Google..."
                          : "Continue with Google"}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-[#6b625a]">
                        Use your Google account for a faster checkout.
                      </p>
                    </div>

                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        checkoutMode === "google"
                          ? "border-orange-500 bg-orange-500"
                          : "border-black/20"
                      }`}
                    >
                      {checkoutMode === "google" && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                </button>
              </div>

              {errors.checkoutMode && (
                <p className="mt-5 px-2 text-[10px] text-red-600">
                  {errors.checkoutMode}
                </p>
              )}

              {checkoutMode === null && !errors.checkoutMode && (
                <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-[#9a4f24]">
                  Continue with Google to place your order securely
                </p>
              )}
            </section>

            {/* Step 01 */}
            <section className="rounded-[2rem] border border-black/10 bg-white/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#4a4540]">
                  Step 01
                </p>

                <h2 className="mt-2 text-2xl font-light text-[#24211e]">
                  Contact Information
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#4a4540]">
                    Full Name
                  </span>

                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
                    placeholder="Your full name"
                    className={`w-full rounded-2xl border bg-white/30 px-4 py-3.5 text-sm text-[#292724] outline-none placeholder:text-[#6b625a]/50 transition focus:bg-white/45 ${
                      errors.fullName
                        ? "border-red-500/50"
                        : "border-black/10 focus:border-black/25"
                    }`}
                  />

                  {errors.fullName && (
                    <p className="mt-2 text-[10px] text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#4a4540]">
                    Phone Number
                  </span>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      )
                    }
                    placeholder="10-digit phone number"
                    className={`w-full rounded-2xl border bg-white/30 px-4 py-3.5 text-sm text-[#292724] outline-none placeholder:text-[#6b625a]/50 transition focus:bg-white/45 ${
                      errors.phone
                        ? "border-red-500/50"
                        : "border-black/10 focus:border-black/25"
                    }`}
                  />

                  {errors.phone && (
                    <p className="mt-2 text-[10px] text-red-600">
                      {errors.phone}
                    </p>
                  )}
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#4a4540]">
                    Email Address
                  </span>

                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="you@example.com"
                    className={`w-full rounded-2xl border bg-white/30 px-4 py-3.5 text-sm text-[#292724] outline-none placeholder:text-[#6b625a]/50 transition focus:bg-white/45 ${
                      errors.email
                        ? "border-red-500/50"
                        : "border-black/10 focus:border-black/25"
                    }`}
                  />

                  {errors.email && (
                    <p className="mt-2 text-[10px] text-red-600">
                      {errors.email}
                    </p>
                  )}
                </label>
              </div>
            </section>

            {/* Step 02 */}
            <section className="rounded-[2rem] border border-black/10 bg-white/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#4a4540]">
                  Step 02
                </p>

                <h2 className="mt-2 text-2xl font-light text-[#24211e]">
                  Delivery Details
                </h2>
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#4a4540]">
                    Address
                  </span>

                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    placeholder="House / building, street and locality"
                    className={`w-full resize-none rounded-2xl border bg-white/30 px-4 py-3.5 text-sm text-[#292724] outline-none placeholder:text-[#6b625a]/50 transition focus:bg-white/45 ${
                      errors.address
                        ? "border-red-500/50"
                        : "border-black/10 focus:border-black/25"
                    }`}
                  />

                  {errors.address && (
                    <p className="mt-2 text-[10px] text-red-600">
                      {errors.address}
                    </p>
                  )}
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#4a4540]">
                      City
                    </span>

                    <input
                      type="text"
                      value={formData.city}
                      onChange={(event) =>
                        updateField("city", event.target.value)
                      }
                      placeholder="City"
                      className={`w-full rounded-2xl border bg-white/30 px-4 py-3.5 text-sm text-[#292724] outline-none placeholder:text-[#6b625a]/50 transition focus:bg-white/45 ${
                        errors.city
                          ? "border-red-500/50"
                          : "border-black/10 focus:border-black/25"
                      }`}
                    />

                    {errors.city && (
                      <p className="mt-2 text-[10px] text-red-600">
                        {errors.city}
                      </p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#4a4540]">
                      PIN Code
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.pinCode}
                      onChange={(event) =>
                        updateField(
                          "pinCode",
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        )
                      }
                      placeholder="000000"
                      className={`w-full rounded-2xl border bg-white/30 px-4 py-3.5 text-sm text-[#292724] outline-none placeholder:text-[#6b625a]/50 transition focus:bg-white/45 ${
                        errors.pinCode
                          ? "border-red-500/50"
                          : "border-black/10 focus:border-black/25"
                      }`}
                    />

                    {errors.pinCode && (
                      <p className="mt-2 text-[10px] text-red-600">
                        {errors.pinCode}
                      </p>
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#4a4540]">
                    State
                  </span>

                  <input
                    type="text"
                    value={formData.state}
                    onChange={(event) =>
                      updateField("state", event.target.value)
                    }
                    placeholder="State"
                    className={`w-full rounded-2xl border bg-white/30 px-4 py-3.5 text-sm text-[#292724] outline-none placeholder:text-[#6b625a]/50 transition focus:bg-white/45 ${
                      errors.state
                        ? "border-red-500/50"
                        : "border-black/10 focus:border-black/25"
                    }`}
                  />

                  {errors.state && (
                    <p className="mt-2 text-[10px] text-red-600">
                      {errors.state}
                    </p>
                  )}
                </label>
              </div>
            </section>

            {/* Step 03 */}
            <section className="rounded-[2rem] border border-black/10 bg-white/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#4a4540]">
                  Step 03
                </p>

                <h2 className="mt-2 text-2xl font-light text-[#24211e]">
                  Payment
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#6b625a]">
                  Choose how you would like to pay for your order.
                </p>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full rounded-2xl border p-5 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-black/20 bg-black/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                      : "border-black/10 bg-white/20 hover:border-black/20 hover:bg-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#292724]">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#6b625a]">
                        Pay when your order is delivered.
                      </p>
                    </div>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        paymentMethod === "cod"
                          ? "border-[#292724] bg-[#292724]"
                          : "border-black/20 bg-transparent"
                      }`}
                    >
                      {paymentMethod === "cod" && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                </button>

                {/* UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`w-full rounded-2xl border p-5 text-left transition-all ${
                    paymentMethod === "upi"
                      ? "border-orange-500/40 bg-orange-500/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                      : "border-black/10 bg-white/20 hover:border-black/20 hover:bg-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#292724]">
                        UPI / GPay
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#6b625a]">
                        Pay securely using UPI or Google Pay.
                      </p>
                    </div>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        paymentMethod === "upi"
                          ? "border-orange-500 bg-orange-500"
                          : "border-black/20 bg-transparent"
                      }`}
                    >
                      {paymentMethod === "upi" && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                </button>
              </div>

              {paymentMethod === "upi" && (
                <div className="mt-5 rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-orange-600">
                    UPI Payment
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#6b625a]">
                    UPI payment is selected now; payment instructions and QR integration can be connected in the next payment step.
                  </p>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="mt-5 rounded-2xl border border-black/10 bg-black/[0.03] p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#4a4540]">
                    Cash on Delivery
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#6b625a]">
                    You will pay the delivery amount when your order arrives.
                  </p>
                </div>
              )}
            </section>
              </>
            ) : (
              <section className="rounded-[2rem] border border-black/10 bg-white/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#4a4540]">Step 04</p>
                    <h2 className="mt-2 text-2xl font-light text-[#24211e]">Review Order</h2>
                    <p className="mt-3 text-sm leading-6 text-[#6b625a]">Check your items, delivery details, and payment method before placing your order.</p>
                  </div>
                  <span className="hidden rounded-full border border-black/10 bg-white/25 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-[#4a4540] sm:inline-flex">Final Review</span>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="rounded-2xl border border-black/10 bg-white/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#4a4540]">Items</p>
                      <span className="text-[10px] text-[#6b625a]">{cart.reduce((count, item) => count + item.quantity, 0)} items</span>
                    </div>
                    <div className="mt-4 space-y-4">
                      {cart.map((item, index) => (
                        <div key={`review-${item.productId}-${item.size}-${item.color}-${index}`} className="flex gap-4 border-b border-black/10 pb-4 last:border-b-0 last:pb-0">
                          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-black/[0.05]">
                            {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-widest text-[#4a4540]/60">No Image</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#292724]">{item.name}</p>
                            <div className="mt-2 space-y-1 text-[9px] uppercase tracking-[0.14em] text-[#6b625a]">
                              {item.size && <p>Size · {item.size}</p>}
                              {item.color && <p>Colour · {item.color}</p>}
                              <p>Quantity · {item.quantity}</p>
                            </div>
                          </div>
                          <p className="shrink-0 text-xs font-medium text-[#292724]">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white/20 p-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#4a4540]">Delivery</p>
                    <div className="mt-4 space-y-2 text-sm text-[#292724]">
                      <p className="font-medium">{formData.fullName}</p>
                      <p>{formData.phone}</p>
                      <p>{formData.email}</p>
                      <p className="leading-6 text-[#4a4540]">{formData.address}, {formData.city}, {formData.state} · {formData.pinCode}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white/20 p-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#4a4540]">Payment</p>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#292724]">{paymentMethod === "cod" ? "Cash on Delivery" : "UPI / GPay"}</p>
                        <p className="mt-1 text-xs text-[#6b625a]">{paymentMethod === "cod" ? "Pay when your order is delivered." : "UPI payment is currently recorded as pending."}</p>
                      </div>
                      <span className="rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-[#4a4540]">{paymentMethod === "cod" ? "COD" : "UPI"}</span>
                    </div>
                  </div>

                  {errors.checkoutMode && <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] px-4 py-3 text-[10px] leading-5 text-red-600">{errors.checkoutMode}</p>}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => { setErrors((current) => ({ ...current, checkoutMode: "" })); setCheckoutStep("details"); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={orderCreating} className="w-full rounded-full border border-black/10 bg-white/20 px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-[#4a4540] transition hover:bg-white/35 hover:text-black disabled:cursor-not-allowed disabled:opacity-60">Edit Details</button>
                    <button type="button" onClick={handlePlaceOrder} disabled={orderCreating} className="w-full rounded-full bg-[#292724] px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70">
                      {orderCreating ? <span className="inline-flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />Placing Order...</span> : "Place Order"}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Order Summary */}
          <aside className="h-fit rounded-[2rem] border border-black/10 bg-white/25 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur-2xl lg:sticky lg:top-28">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#4a4540]">
              Your Order
            </p>

            <div className="mt-7 space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${index}`}
                  className="flex gap-4 border-b border-black/10 pb-4"
                >
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-black/[0.05]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-widest text-[#4a4540]/60">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-light text-[#24211e]">
                      {item.name}
                    </p>

                    <div className="mt-1 space-y-0.5 text-[9px] uppercase tracking-[0.14em] text-[#6b625a]">
                      {item.size && <p>Size · {item.size}</p>}
                      {item.color && <p>Colour · {item.color}</p>}
                      <p>Qty · {item.quantity}</p>
                    </div>
                  </div>

                  <p className="shrink-0 text-xs font-medium text-[#292724]">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-light text-[#4a4540]">
                  Subtotal
                </span>

                <span className="font-medium text-[#292724]">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-light text-[#4a4540]">
                  Shipping
                </span>

                <span className="text-xs text-[#6b625a]">
                  Calculated next
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-black/10 pt-5">
              <div className="flex items-end justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#4a4540]">
                  Total
                </span>

                <span className="text-2xl font-light text-[#24211e]">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {checkoutStep === "details" && (
              <button type="button" onClick={handleContinueToPayment} disabled={orderCreating} className="mt-7 w-full rounded-full bg-[#292724] px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70">
                Continue to Review
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="mt-3 w-full rounded-full border border-black/10 bg-white/20 px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-[#4a4540] transition hover:bg-white/35 hover:text-black"
            >
              Edit Cart
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}