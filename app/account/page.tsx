"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { getCart, type CartItem } from "@/lib/cart";

type AccountOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
};

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  } | null>(null);

  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadAccount = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (currentUser) {
        const metadata = currentUser.user_metadata ?? {};

        setUser({
          id: currentUser.id,
          email: currentUser.email,
          name:
            metadata.full_name ??
            metadata.name ??
            currentUser.email?.split("@")[0],
          avatar: metadata.avatar_url ?? metadata.picture,
        });
      } else {
        setUser(null);
      }

      setCart(getCart());
      setLoading(false);
    };

    loadAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const currentUser = session?.user;

      if (!currentUser) {
        setUser(null);
        setOrders([]);
        return;
      }

      const metadata = currentUser.user_metadata ?? {};

      setUser({
        id: currentUser.id,
        email: currentUser.email,
        name:
          metadata.full_name ??
          metadata.name ??
          currentUser.email?.split("@")[0],
        avatar: metadata.avatar_url ?? metadata.picture,
      });
    });

    const handleCartUpdate = () => {
      setCart(getCart());
    };

    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const loadOrders = async () => {
      setOrdersLoading(true);
      setActionError("");

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, payment_status, total, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        setActionError("We couldn't load your orders.");
        setOrdersLoading(false);
        return;
      }

      setOrders((data ?? []) as AccountOrder[]);
      setOrdersLoading(false);
    };

    loadOrders();
  }, [user, supabase]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setActionError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/account`,
      },
    });

    if (error) {
      setActionError("Unable to continue with Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    setActionError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setActionError("Unable to log out. Please try again.");
      setLogoutLoading(false);
      return;
    }

    router.push("/");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f1ede7] text-[#171717]">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#171717]/55">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#171717]/15 border-t-[#171717]" />
          Preparing your account
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f1ede7] text-[#171717]">
      {/* Navigation */}
      <header className="border-b border-[#171717]/10 bg-[#f1ede7]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 md:px-12">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-normal tracking-[0.28em] transition-all duration-500 hover:tracking-[0.4em]"
          >
            OUTLOOK{" "}
            <span className="text-[#171717]/50">
              STUDIO
            </span>
          </button>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="text-xs uppercase tracking-[0.16em] text-[#171717]/65 transition hover:text-[#171717]"
            >
              Cart
              {cartCount > 0 && (
                <span className="ml-2 text-[#171717]/40">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/track-order")}
              className="hidden text-xs uppercase tracking-[0.16em] text-[#171717]/65 transition hover:text-[#171717] sm:block"
            >
              Track Order
            </button>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 md:px-12 lg:py-24">
        {!user ? (
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[10px] uppercase tracking-[0.38em] text-[#171717]/45">
              Account
            </p>

            <h1 className="mt-5 text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-6xl md:text-7xl">
              YOUR OUTLOOK.
            </h1>

            <p className="mx-auto mt-7 max-w-md text-sm leading-6 text-[#171717]/60">
              Sign in to view your orders, manage your cart, and continue
              your shopping journey.
            </p>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="group mx-auto mt-9 flex min-h-14 items-center gap-4 rounded-full border border-white/15 bg-[#17191c]/90 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#f7f3ed] shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-500 hover:border-[#8fc9ff]/45 hover:bg-[#17191c] hover:shadow-[0_0_32px_rgba(111,190,255,0.28),0_14px_55px_rgba(0,0,0,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm">
                G
              </span>

              <span>
                {googleLoading
                  ? "Connecting..."
                  : "Continue with Google"}
              </span>

              <span className="text-lg text-[#dce8f5] transition-all duration-500 group-hover:translate-x-1 group-hover:text-[#9ed3ff]">
                →
              </span>

              {googleLoading && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              )}
            </button>

            {actionError && (
              <p className="mt-5 text-xs text-red-700">
                {actionError}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Account introduction */}
            <div className="flex flex-col gap-7 border-b border-[#171717]/10 pb-12 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.38em] text-[#171717]/45">
                  My Account
                </p>

                <h1 className="mt-5 text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-6xl md:text-7xl">
                  WELCOME BACK
                  {user.name ? "," : ""}
                  <br />
                  {user.name?.split(" ")[0] ?? "TO OUTLOOK"}.
                </h1>

                <p className="mt-5 text-sm text-[#171717]/50">
                  {user.email}
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#171717]/10 bg-[#e8e2da] text-sm font-medium text-[#171717]/70 shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
  {user.avatar ? (
    <img
      src={user.avatar}
      alt={user.name || "Your profile"}
      className="h-full w-full object-cover"
      referrerPolicy="no-referrer"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <span>
      {(user.name || user.email || "U")
        .charAt(0)
        .toUpperCase()}
    </span>
  )}
</div>            </div>

            {/* Dashboard */}
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {/* Orders */}
              <section className="rounded-[2rem] border border-white/60 bg-white/35 p-6 shadow-[0_20px_70px_rgba(40,35,30,0.06)] backdrop-blur-xl sm:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#171717]/40">
                      Your orders
                    </p>

                    <h2 className="mt-3 text-2xl font-light tracking-[-0.02em]">
                      My Orders
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/track-order")}
                    className="text-[10px] uppercase tracking-[0.18em] text-[#171717]/50 transition hover:text-[#171717]"
                  >
                    Track →
                  </button>
                </div>

                <div className="mt-7">
                  {ordersLoading ? (
                    <div className="flex items-center gap-3 py-8 text-xs text-[#171717]/50">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#171717]/15 border-t-[#171717]" />
                      Loading orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="rounded-2xl border border-[#171717]/8 bg-white/30 p-5">
                      <p className="text-sm text-[#171717]/55">
                        You haven't placed an order yet.
                      </p>

                      <button
                        type="button"
                        onClick={() => router.push("/#shop")}
                        className="mt-5 text-[10px] uppercase tracking-[0.18em] text-[#171717]/65 transition hover:text-[#171717]"
                      >
                        Explore the collection →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() =>
                            router.push("/track-order")
                          }
                          className="group w-full rounded-2xl border border-[#171717]/8 bg-white/30 p-5 text-left transition-all duration-300 hover:border-[#171717]/15 hover:bg-white/55"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-[9px] uppercase tracking-[0.2em] text-[#171717]/35">
                                {formatDate(order.created_at)}
                              </p>

                              <p className="mt-1 text-sm text-[#171717]/80">
                                {order.order_number}
                              </p>
                            </div>

                            <span className="rounded-full border border-[#171717]/10 bg-white/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#171717]/60">
                              {formatStatus(order.status)}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-[#171717]/8 pt-3">
                            <span className="text-xs text-[#171717]/45">
                              Payment:{" "}
                              {formatStatus(order.payment_status)}
                            </span>

                            <span className="text-sm text-[#171717]/75">
                              ₹
                              {Number(order.total).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          </div>

                          <span className="mt-4 block text-[9px] uppercase tracking-[0.18em] text-[#171717]/40 transition group-hover:text-[#171717]/70">
                            View order →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Cart */}
              <section className="rounded-[2rem] border border-white/60 bg-white/35 p-6 shadow-[0_20px_70px_rgba(40,35,30,0.06)] backdrop-blur-xl sm:p-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#171717]/40">
                    Your selection
                  </p>

                  <h2 className="mt-3 text-2xl font-light tracking-[-0.02em]">
                    My Cart
                  </h2>
                </div>

                {cart.length === 0 ? (
                  <div className="mt-7 rounded-2xl border border-[#171717]/8 bg-white/30 p-5">
                    <p className="text-sm text-[#171717]/55">
                      Your cart is currently empty.
                    </p>

                    <button
                      type="button"
                      onClick={() => router.push("/#shop")}
                      className="mt-5 text-[10px] uppercase tracking-[0.18em] text-[#171717]/65 transition hover:text-[#171717]"
                    >
                      Start shopping →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-7 space-y-3">
                      {cart.slice(0, 3).map((item) => (
                        <div
                          key={`${item.productId}-${item.size}-${item.color}`}
                          className="flex gap-4 rounded-2xl border border-[#171717]/8 bg-white/30 p-3"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#ddd7cf]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-[#171717]/80">
                              {item.name}
                            </p>

                            <p className="mt-1 text-[10px] text-[#171717]/40">
                              Qty {item.quantity}
                              {item.size ? ` · ${item.size}` : ""}
                              {item.color ? ` · ${item.color}` : ""}
                            </p>

                            <p className="mt-2 text-xs text-[#171717]/65">
                              ₹
                              {Number(
                                item.price * item.quantity,
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {cart.length > 3 && (
                      <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-[#171717]/40">
                        + {cart.length - 3} more item
                        {cart.length - 3 === 1 ? "" : "s"}
                      </p>
                    )}

                    <div className="mt-6 flex items-end justify-between border-t border-[#171717]/10 pt-5">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[#171717]/40">
                        Cart total
                      </span>

                      <span className="text-xl font-light">
                        ₹{cartTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => router.push("/cart")}
                        className="flex-1 rounded-full border border-[#171717]/15 bg-white/35 px-5 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#171717]/70 transition hover:bg-white/60 hover:text-[#171717]"
                      >
                        View Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/checkout")}
                        className="group flex flex-1 items-center justify-center gap-3 rounded-full border border-[#171717]/10 bg-[#17191c] px-5 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#f7f3ed] shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-500 hover:bg-[#24272b] hover:shadow-[0_0_28px_rgba(111,190,255,0.12),0_12px_38px_rgba(0,0,0,0.22)]"
                      >
                        Proceed to Checkout
                        <span className="transition-transform duration-500 group-hover:translate-x-1">
                          →
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* Bottom actions */}
            <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-[#171717]/10 pt-8 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => router.push("/track-order")}
                className="text-xs uppercase tracking-[0.18em] text-[#171717]/55 transition hover:text-[#171717]"
              >
                Track an order →
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-[#171717]/10 bg-[#17191c]/90 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f7f3ed] shadow-[0_10px_35px_rgba(0,0,0,0.14)] transition-all duration-500 hover:border-red-300/30 hover:bg-[#17191c] hover:text-white hover:shadow-[0_0_28px_rgba(220,100,100,0.16),0_12px_40px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logoutLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Logging out...
                  </>
                ) : (
                  <>
                    Log out
                    <span className="transition-transform duration-500 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>

            {actionError && (
              <p className="mt-5 text-xs text-red-700">
                {actionError}
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}