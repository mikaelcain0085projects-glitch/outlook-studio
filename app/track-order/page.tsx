"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type OrderItem = {
  id: string;
  product_name: string | null;
  product_image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number | null;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

const statusSteps = [
  { key: "pending", label: "Order placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function getStatusIndex(status: string) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");

  const aliases: Record<string, string> = {
    confirmed: "pending",
    packed: "processing",
    dispatched: "shipped",
  };

  const resolved = aliases[normalized] ?? normalized;
  const index = statusSteps.findIndex((step) => step.key === resolved);

  return index >= 0 ? index : 0;
}

function formatStatus(status: string) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");

  const labels: Record<string, string> = {
    pending: "Order placed",
    confirmed: "Order placed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    labels[normalized] ??
    normalized
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

export default function TrackOrderPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(
        currentUser
          ? {
              id: currentUser.id,
              email: currentUser.email,
            }
          : null,
      );
      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
            }
          : null,
      );
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setSelectedOrder(null);
      return;
    }

    const loadOrders = async () => {
      setOrdersLoading(true);
      setError("");

      const { data, error: ordersError } = await supabase
  .from("orders")
  .select(
    `
      id,
      order_number,
      status,
      payment_status,
      subtotal,
      total,
      created_at,
      order_items (
        id,
        product_name,
        product_image,
        size,
        color,
        quantity,
        unit_price
      )
    `,
  )
  .order("created_at", { ascending: false });

      if (ordersError) {
        setError("We couldn't load your orders. Please try again.");
        setOrdersLoading(false);
        return;
      }

      const customerOrders = (data ?? []) as Order[];

      setOrders(customerOrders);
      setSelectedOrder((current) => current ?? customerOrders[0] ?? null);
      setOrdersLoading(false);
    };

    loadOrders();
  }, [user, supabase]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/track-order`,
      },
    });

    if (authError) {
      setError("Unable to continue with Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  const isCancelled = selectedOrder?.status.toLowerCase() === "cancelled";

const currentStatusIndex = selectedOrder
  ? getStatusIndex(selectedOrder.status)
  : 0;
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f1ec] text-[#171717]">
      {/* Full-screen image */}
      <div className="fixed inset-0">
        <img
          src="/media/track-order/track-order.png"
          alt="OUTLOOK STUDIO track order"
          className="h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/[0.025]" />
      </div>

      {/* Navigation */}
      <header className="absolute left-0 right-0 top-0 z-30 px-4 pt-5 sm:px-6 md:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-normal tracking-[0.28em] text-[#171717] transition-all duration-500 hover:tracking-[0.4em]"
          >
            OUTLOOK <span className="text-[#171717]/55">STUDIO</span>
          </button>

          <div className="hidden items-center gap-8 text-xs tracking-wide md:flex">
            <a
              href="/#shop"
              className="text-[#171717]/75 transition hover:text-[#171717]"
            >
              SHOP
            </a>
            <a
              href="/collections"
              className="text-[#171717]/75 transition hover:text-[#171717]"
            >
              COLLECTIONS
            </a>
            <a
              href="/about"
              className="text-[#171717]/75 transition hover:text-[#171717]"
            >
              ABOUT
            </a>

            <span className="h-5 w-px bg-[#171717]/20" />

            <a
              href="/cart"
              aria-label="Cart"
              className="text-[#171717]/75 transition hover:text-[#171717]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.4 1.493m0 0L6.75 14.25a2.25 2.25 0 002.18 1.69h7.89a2.25 2.25 0 002.18-1.69l1.44-5.355a.75.75 0 00-.725-.945H5.123m0 0L4.5 5.25M9 20.25a.75.75 0 11-1.5 0 .75 0 011.5 0zm9.75 0a.75.75 0 11-1.5 0 .75 0 011.5 0z"
                />
              </svg>
            </a>
          </div>

          <a
            href="/account"
            className="rounded-full border border-white/30 bg-white/20 px-4 py-2 text-xs text-[#171717]/80 shadow-sm backdrop-blur-xl transition hover:bg-white/35"
          >
            ACCOUNT
          </a>
        </nav>
      </header>

      {/* Editorial content */}
      <section className="relative z-10 flex min-h-screen items-center px-6 pb-16 pt-28 sm:px-10 md:px-16 lg:px-24">
        <div className="w-full max-w-7xl">
          <div className="max-w-xl">
            <p className="mb-5 text-[10px] uppercase tracking-[0.38em] text-[#171717]/55">
              Track Order
            </p>

            <h1 className="max-w-2xl text-5xl font-light leading-[0.94] tracking-[-0.04em] text-[#171717] drop-shadow-[0_2px_12px_rgba(255,255,255,0.22)] sm:text-6xl md:text-7xl lg:text-8xl">
              YOUR ORDER,
              <br />
              WHEREVER IT GOES.
            </h1>

            {!user && !loading && (
              <>
                <p className="mt-7 max-w-md text-sm leading-6 text-[#f7f3ed]/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)] sm:text-base">
                  Sign in to view your orders and follow every update from
                  confirmation to delivery.
                </p>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="group mt-8 flex min-h-14 items-center gap-4 rounded-full border border-white/45 bg-[#f3d9dd]/65 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#7b4b53] shadow-[0_12px_45px_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all duration-500 hover:border-white/55 hover:bg-[#f3d9dd]/85 hover:text-[#171717] hover:shadow-[0_14px_55px_rgba(20,20,20,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-base">
                    G
                  </span>

                  <span>
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                  </span>

                  <span className="ml-2 text-lg transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>

                  {googleLoading && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#7b4b53]/25 border-t-[#7b4b53]" />
                  )}
                </button>
              </>
            )}

            {loading && (
              <p className="mt-8 text-sm text-[#f7f3ed]/90">
                Preparing your order space...
              </p>
            )}

            {user && (
              <div className="mt-9 max-w-xl">
                {ordersLoading ? (
                  <div className="rounded-3xl border border-white/30 bg-white/15 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
                    <div className="flex items-center gap-3 text-sm text-[#171717]/70">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#171717]/20 border-t-[#171717]" />
                      Loading your orders...
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-3xl border border-white/35 bg-white/15 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
                    <p className="text-sm text-[#171717]/70">
                      You don't have any orders yet.
                    </p>

                    <a
                      href="/#shop"
                      className="mt-5 inline-flex rounded-full border border-[#171717]/15 bg-white/30 px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-[#171717]/75 backdrop-blur-xl transition hover:bg-white/50"
                    >
                      Explore the collection
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#171717]/55">
                        Your orders
                      </p>

                      <span className="text-xs text-[#171717]/55">
                        {user.email}
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {orders.map((order) => {
                        const active = selectedOrder?.id === order.id;

                        return (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className={`w-full rounded-3xl border p-5 text-left backdrop-blur-2xl transition-all duration-300 ${
                              active
                                ? "border-white/55 bg-white/35 shadow-[0_18px_60px_rgba(0,0,0,0.15)]"
                                : "border-white/25 bg-white/15 hover:border-white/45 hover:bg-white/25"
                            }`}
                          >
                           
<div className="flex items-start justify-between gap-3">
  <div className="flex min-w-0 items-start gap-3">
    {order.order_items?.[0]?.product_image ? (
      <img
        src={order.order_items[0].product_image}
        alt={order.order_items[0].product_name || "Ordered product"}
        className="h-16 w-14 shrink-0 rounded-xl border border-white/40 object-cover"
      />
    ) : (
      <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl border border-white/40 bg-white/25 text-[9px] uppercase tracking-wider text-[#171717]/40">
        Item
      </div>
    )}

    <div className="min-w-0">
      <p className="text-[9px] uppercase tracking-[0.22em] text-[#171717]/45">
        Order
      </p>
      <p className="mt-1 break-all text-sm text-[#171717]/85">
        {order.order_number}
      </p>

      {order.order_items?.length > 0 && (
        <>
          <p className="mt-2 line-clamp-2 text-xs text-[#171717]/75">
            {order.order_items[0].product_name || "Product"}
            {order.order_items.length > 1
              ? ` + ${order.order_items.length - 1} more item(s)`
              : ""}
          </p>
          <p className="mt-1 text-[10px] text-[#171717]/50">
            {order.order_items.length} item(s) · Qty{" "}
            {order.order_items.reduce(
              (total, item) => total + Number(item.quantity || 0),
              0,
            )}
          </p>
        </>
      )}
    </div>
  </div>

  <span className="shrink-0 rounded-full border border-white/30 bg-white/25 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-[#171717]/70">
    {formatStatus(order.status)}
  </span>
</div>

                          </button>
                        );
                      })}
                    </div>

                    {selectedOrder && (
                      <div className="rounded-3xl border border-white/35 bg-white/18 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.14)] backdrop-blur-2xl">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.22em] text-[#171717]/45">
                              Current order
                            </p>
                            <h2 className="mt-2 text-lg font-light text-[#171717]">
                              {selectedOrder.order_number}
                            </h2>
                          </div>

                          <p className="text-sm text-[#171717]/65">
                            ₹{Number(selectedOrder.total).toLocaleString("en-IN")}
                          </p>
                        </div>
                        
{selectedOrder.order_items?.length > 0 && (
  <div className="mt-6 border-t border-[#171717]/10 pt-5">
    <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#171717]/50">
      Items in this order
    </p>

    <div className="space-y-4">
      {selectedOrder.order_items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-4 rounded-2xl border border-white/35 bg-white/20 p-3"
        >
          {item.product_image ? (
            <img
              src={item.product_image}
              alt={item.product_name || "Ordered product"}
              className="h-24 w-20 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-white/30 text-[9px] uppercase tracking-wider text-[#171717]/40">
              No image
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#171717]">
              {item.product_name || "Product"}
            </p>

            <div className="mt-2 space-y-1 text-xs text-[#171717]/55">
              {item.size && <p>Size: {item.size}</p>}
              {item.color && <p>Colour: {item.color}</p>}
              <p>Quantity: {item.quantity}</p>
              <p>
                Unit price: ₹
                {Number(item.unit_price ?? 0).toLocaleString("en-IN")}
              </p>
            </div>

            <p className="mt-3 text-sm text-[#171717]/80">
              Item total: ₹
              {(
                Number(item.unit_price ?? 0) * Number(item.quantity || 0)
              ).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


                        <div className="mt-7">
  {isCancelled ? (
    <div className="rounded-2xl border border-[#9A5963]/20 bg-[#F7E5E7]/55 px-5 py-4">
      <p className="text-xs font-medium text-[#7B4B53]">
        Order cancelled
      </p>

      <p className="mt-1 text-[10px] leading-5 text-[#7B4B53]/60">
        This order is no longer being processed.
      </p>
    </div>
  ) : (
    statusSteps.map((step, index) => {
                            const completed = index <= currentStatusIndex;
                            const current = index === currentStatusIndex;

                            return (
                              <div
                                key={step.key}
                                className="relative flex items-start gap-4"
                              >
                                {index < statusSteps.length - 1 && (
                                  <span
                                    className={`absolute left-[7px] top-5 h-9 w-px ${
                                      index < currentStatusIndex
                                        ? "bg-[#171717]/55"
                                        : "bg-[#171717]/15"
                                    }`}
                                  />
                                )}

                                <span
                                  className={`relative z-10 mt-1 h-3.5 w-3.5 rounded-full border ${
                                    completed
                                      ? "border-[#171717] bg-[#171717]"
                                      : "border-[#171717]/25 bg-white/25"
                                  } ${current ? "ring-4 ring-white/35" : ""}`}
                                />

                                <div className="pb-6">
                                  <p
                                    className={`text-xs ${
                                      completed
                                        ? "text-[#171717]/85"
                                        : "text-[#171717]/35"
                                    }`}
                                  >
                                    {step.label}
                                  </p>
                                </div>
                              </div>
                            );
                         })
                        )}
                          
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-[#171717]/10 pt-4 text-[10px] uppercase tracking-[0.15em] text-[#171717]/45">
                          <span>
                            Payment: {formatStatus(selectedOrder.payment_status)}
                          </span>
                          <span>
                            {new Date(selectedOrder.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
  type="button"
  onClick={() => router.push("/")}
  className="group mt-2 inline-flex min-h-12 items-center gap-3 rounded-full border border-white/15 bg-[#17191c]/90 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f7f3ed] shadow-[0_10px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-500 hover:border-[#9ee6b0]/40 hover:bg-[#17191c] hover:text-white hover:shadow-[0_0_30px_rgba(126,220,151,0.22),0_14px_45px_rgba(0,0,0,0.25)]"
>
  <span className="transition-transform duration-500 group-hover:-translate-x-1">
    ←
  </span>

  <span>
    Continue shopping
  </span>
</button>
                  </div>
                )}

                {error && (
                  <p className="mt-4 text-xs text-red-700">{error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
