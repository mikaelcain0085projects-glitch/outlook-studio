import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminNavButton from "../components/AdminNavButton";
import OrderActions from "./OrderActions";
import OrderExportControls from "./OrderExportControls";

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
  status: string | null;
  payment_method: string | null;
  payment_status: string | null;
  total: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_state: string | null;
  customer_pincode: string | null;
  created_at: string;
  order_items: OrderItem[];
};
function formatPrice(value: number | null) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusStyle(status: string | null) {
  switch (status) {
    case "Delivered":
      return "bg-[#E4F1E8] text-[#416A4D]";

    case "Out for delivery":
      return "bg-[#F3E8D8] text-[#8A6838]";

    case "Shipped":
      return "bg-[#E6EDF3] text-[#526A7D]";

    case "Processing":
      return "bg-[#F3D9DD] text-[#7B4B53]";

    case "Order placed":
      return "bg-[#ECE7E1] text-[#171717]/55";

    default:
      return "bg-[#ECE7E1] text-[#171717]/55";
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();

  const { page } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const ordersPerPage = 12;
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

  const from = (currentPage - 1) * ordersPerPage;
const to = from + ordersPerPage - 1;

const {
  data: orders,
  error: ordersError,
  count: totalOrders,
} = await supabase
  .from("orders")
  .select(
    `
      id,
      order_number,
      status,
      payment_method,
      payment_status,
      total,
      customer_name,
      customer_phone,
      customer_address,
      customer_city,
      customer_state,
      customer_pincode,
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
    { count: "exact" }
  )
  .order("created_at", { ascending: false })
  .range(from, to);

  if (ordersError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F1EDE7] px-6 py-12 text-[#171717]">
        <div className="w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white/80 p-8 text-center shadow-[0_24px_70px_rgba(40,35,30,0.08)] backdrop-blur-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7E5E7] text-[#8A4D57]">
            !
          </div>

          <h1 className="mt-5 text-xl font-light tracking-[-0.03em]">
            Orders couldn't load
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#171717]/50">
            There was a problem loading customer orders.
          </p>

          <Link
            href="/admin"
            className="mt-7 inline-flex rounded-full bg-[#171717] px-6 py-3 text-[9px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#292929]"
          >
            Return to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const orderList = (orders ?? []) as Order[];
  const totalOrderCount = totalOrders ?? 0;
const totalPages = Math.max(
  1,
  Math.ceil(totalOrderCount / ordersPerPage)
);
const hasPreviousPage = currentPage > 1;
const hasNextPage = currentPage < totalPages;

  return (
    <main className="min-h-screen bg-[#F1EDE7] text-[#171717]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-[#F1EDE7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/admin" className="group">
            <div className="text-[15px] font-normal tracking-[0.26em] transition-all duration-500 group-hover:tracking-[0.34em]">
              OUTLOOK{" "}
              <span className="text-[#171717]/45">STUDIO</span>
            </div>

            <div className="mt-1 text-[8px] uppercase tracking-[0.28em] text-[#171717]/35">
              Order Management
            </div>
          </Link>

          <AdminNavButton
            href="/admin"
            loadingText="Opening..."
            className="inline-flex h-9 items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 px-4 text-[9px] font-medium uppercase tracking-[0.16em] text-[#171717]/65 transition hover:border-black/[0.14] hover:bg-white"
          >
            <span>←</span>
            Dashboard
          </AdminNavButton>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-14">
        {/* Intro */}
        <section className="max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.34em] text-[#171717]/35">
            Customer Orders
          </p>

          <h1 className="mt-4 text-4xl font-light leading-[0.98] tracking-[-0.055em] sm:text-5xl">
            Orders,
            <br />
            <span className="text-[#171717]/45">
              beautifully organized.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-[#171717]/50 sm:text-[15px]">
            View customer orders, payment details, delivery information, and
            order progress from one place.
          </p>
        </section>

        {/* Summary */}
        <section className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <OrderStat
            label="Total orders"
            value={orderList.length}
            caption="Customer orders"
          />

          <OrderStat
            label="Processing"
            value={
  orderList.filter(
    (order) =>
      order.status === "processing" ||
      order.status === "pending"
  ).length
}
            caption="Needs fulfillment"
            accent="pink"
          />

          <OrderStat
            label="Delivered"
            value={
  orderList.filter((order) => order.status === "delivered")
    .length
}
            caption="Completed orders"
            accent="green"
          />
        </section>
       <OrderExportControls orders={orderList} />

        {/* Orders */}
        <section className="mt-8">

          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-[0.28em] text-[#171717]/35">
                Order list
              </p>

              <h2 className="mt-2 text-3xl font-light tracking-[-0.04em]">
                Customer orders
              </h2>
            </div>

            <p className="text-[9px] uppercase tracking-[0.16em] text-[#171717]/30">
              {orderList.length}{" "}
              {orderList.length === 1 ? "order" : "orders"}
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/75 shadow-[0_18px_50px_rgba(40,35,30,0.04)] backdrop-blur-xl">
            {orderList.length > 0 ? (
             <div className="divide-y-[4px] divide-black/[0.70]">
                {orderList.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 transition-colors duration-300 hover:bg-[#F8F5F1] sm:p-6"
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        {/* Order identity */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[12px] font-medium tracking-[0.02em]">
                              {order.order_number}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1.5 text-[7px] font-medium uppercase tracking-[0.12em] ${getStatusStyle(
                                order.status
                              )}`}
                            >
                              {order.status ?? "Order placed"}
                            </span>
                          </div>

                          <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-[#171717]/30">
                            {formatDate(order.created_at)}
                          </p>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {/* Customer */}
                            <div>
                              <p className="text-[8px] uppercase tracking-[0.24em] text-[#171717]/30">
                                Customer
                              </p>

                              <p className="mt-2 text-[11px] font-medium">
                                {order.customer_name || "—"}
                              </p>

                              <p className="mt-1 text-[10px] text-[#171717]/45">
                                {order.customer_phone || "No phone number"}
                              </p>
                            </div>

                            {/* Delivery */}
                            <div>
                              <p className="text-[8px] uppercase tracking-[0.24em] text-[#171717]/30">
                                Delivery
                              </p>

                              <p className="mt-2 max-w-md text-[10px] leading-5 text-[#171717]/55">
                                {order.customer_address || "—"}
                                {order.customer_city
                                  ? `, ${order.customer_city}`
                                  : ""}
                                {order.customer_state
                                  ? `, ${order.customer_state}`
                                  : ""}
                                {order.customer_pincode
                                  ? ` — ${order.customer_pincode}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment / total */}
                        <div className="flex shrink-0 items-end justify-between gap-8 border-t border-black/[0.05] pt-4 lg:min-w-[180px] lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                          <div className="text-left lg:text-right">
                            <p className="text-[8px] uppercase tracking-[0.24em] text-[#171717]/30">
                              Payment
                            </p>

                            <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[#171717]/55">
                              {order.payment_method || "—"}
                            </p>

                            <p className="mt-1 text-[9px] text-[#171717]/35">
                              {order.payment_status || "—"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[8px] uppercase tracking-[0.24em] text-[#171717]/30">
                              Total
                            </p>

                            <p className="mt-2 text-xl font-light tracking-[-0.04em]">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>
                      </div>

                                           {/* Order items */}
                      <div className="border-t border-black/[0.06] pt-5">
                        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/40">
                          Order Items
                        </p>

                        <div className="mt-4 space-y-3">
                          {order.order_items?.length ? (
                            order.order_items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 rounded-2xl bg-[#F8F5F1] p-3"
                              >
                                {item.product_image ? (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name ?? "Product"}
                                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-[9px] uppercase tracking-wider text-black/30">
                                    No image
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-[#171717]">
                                    {item.product_name ?? "Product"}
                                  </p>

                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-black/40">
                                    {item.size && (
                                      <span>Size: {item.size}</span>
                                    )}

                                    {item.color && (
                                      <span>Colour: {item.color}</span>
                                    )}

                                    <span>Qty: {item.quantity}</span>
                                  </div>
                                </div>

                                <div className="shrink-0 text-right">
                                  <p className="text-[9px] uppercase tracking-[0.16em] text-black/35">
                                    Price
                                  </p>

                                  <p className="mt-1 text-sm font-medium text-[#171717]">
                                    {formatPrice(
                                      (item.unit_price ?? 0) *
                                        item.quantity
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-black/40">
                              No item details available.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order actions */}
                                            <OrderActions
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ECE7E1] text-[#171717]/35">
                  <OrdersIcon />
                </div>

                <h2 className="mt-5 text-xl font-light tracking-[-0.04em]">
                  No customer orders yet.
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#171717]/40">
                  Orders placed through the storefront will appear here.
                </p>
              </div>
            )}
                    </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between rounded-[22px] border border-black/[0.06] bg-white/60 px-4 py-3 backdrop-blur-xl sm:px-5">
              <Link
                href={
                  hasPreviousPage
                    ? `/admin/orders?page=${currentPage - 1}`
                    : "#"
                }
                aria-disabled={!hasPreviousPage}
                className={`inline-flex h-9 items-center rounded-full px-4 text-[9px] font-medium uppercase tracking-[0.16em] transition ${
                  hasPreviousPage
                    ? "border border-black/[0.08] bg-white text-[#171717]/70 hover:border-black/[0.14] hover:bg-[#F8F5F1]"
                    : "pointer-events-none border border-black/[0.04] bg-black/[0.02] text-[#171717]/20"
                }`}
              >
                ← Previous
              </Link>

              <div className="text-center">
                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#171717]/55">
                  Page {currentPage} of {totalPages}
                </p>

                <p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-[#171717]/25">
                  {totalOrderCount} orders
                </p>
              </div>

              <Link
                href={
                  hasNextPage
                    ? `/admin/orders?page=${currentPage + 1}`
                    : "#"
                }
                aria-disabled={!hasNextPage}
                className={`inline-flex h-9 items-center rounded-full px-4 text-[9px] font-medium uppercase tracking-[0.16em] transition ${
                  hasNextPage
                    ? "border border-black/[0.08] bg-white text-[#171717]/70 hover:border-black/[0.14] hover:bg-[#F8F5F1]"
                    : "pointer-events-none border border-black/[0.04] bg-black/[0.02] text-[#171717]/20"
                }`}
              >
                Next →
              </Link>
            </div>
          )}
        </section>

      

        {/* Footer */}
        <footer className="mt-14 border-t border-black/[0.06] pt-6">
          <div className="flex flex-col gap-3 text-[8px] uppercase tracking-[0.2em] text-[#171717]/25 sm:flex-row sm:items-center sm:justify-between">
            <span>OUTLOOK STUDIO ADMIN</span>

            <AdminNavButton
              href="/admin"
              loadingText="Opening..."
              className="text-left text-black/90 text-xs transition hover:text-[#171717]/55"
            >
              Back to dashboard →
            </AdminNavButton>
          </div>
        </footer>
      </div>
    </main>
  );
}

function OrderStat({
  label,
  value,
  caption,
  accent = "neutral",
}: {
  label: string;
  value: number;
  caption: string;
  accent?: "neutral" | "pink" | "green";
}) {
  const iconBackground =
    accent === "pink"
      ? "bg-[#F3D9DD]"
      : accent === "green"
        ? "bg-[#E4F1E8]"
        : "bg-[#E9E4DE]";

  return (
    <div className="rounded-[24px] border border-black/[0.06] bg-white/65 p-5 shadow-[0_12px_35px_rgba(40,35,30,0.035)] backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.24em] text-[#171717]/35">
            {label}
          </p>

          <p className="mt-3 text-3xl font-light tracking-[-0.06em]">
            {value}
          </p>
        </div>

        <span className={`h-2.5 w-2.5 rounded-full ${iconBackground}`} />
      </div>

      <p className="mt-3 text-[9px] text-[#171717]/35">{caption}</p>
    </div>
  );
}

function OrdersIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L12 4L19 7.5V16.5L12 20L5 16.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M5.5 7.5L12 11L18.5 7.5M12 11V19.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}