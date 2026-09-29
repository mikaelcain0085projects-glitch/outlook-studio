"use client";

import { useState, useTransition } from "react";
import {
  deleteOrder,
  updateOrderStatus,
} from "./actions";

const ORDER_STATUSES = [
  "Order placed",
  "Processing",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

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
  }).format(new Date(value));
}

function getStatusLabel(status: string | null) {
  return status || "Order placed";
}

export default function OrderManagement({
  orders,
}: {
  orders: Order[];
}) {
  const [pendingOrder, setPendingOrder] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "status" | "delete" | null
  >(null);

  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (
    orderId: string,
    status: string
  ) => {
    setPendingOrder(orderId);
    setPendingAction("status");

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status);
      } finally {
        setPendingOrder(null);
        setPendingAction(null);
      }
    });
  };

  const handleDelete = (orderId: string) => {
    const confirmed = window.confirm(
      "Delete this order permanently?"
    );

    if (!confirmed) return;

    setPendingOrder(orderId);
    setPendingAction("delete");

    startTransition(async () => {
      try {
        await deleteOrder(orderId);
      } finally {
        setPendingOrder(null);
        setPendingAction(null);
      }
    });
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/75 shadow-[0_18px_50px_rgba(40,35,30,0.04)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-black/[0.06] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-[8px] uppercase tracking-[0.28em] text-[#171717]/35">
            Orders
          </p>

          <h2 className="mt-2 text-xl font-light tracking-[-0.04em]">
            Order management
          </h2>

          <p className="mt-1 text-[10px] text-[#171717]/35">
            {orders.length} recent{" "}
            {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>

        <div className="text-[8px] uppercase tracking-[0.18em] text-[#171717]/30">
          Update delivery status
        </div>
      </div>

      {/* Orders */}
      {orders.length > 0 ? (
        <div className="divide-y divide-black/[0.05]">
          {orders.map((order) => {
            const isThisOrderPending =
              isPending && pendingOrder === order.id;

            return (
              <div
                key={order.id}
                className="px-5 py-5 sm:px-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Order information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[11px] font-medium tracking-[0.02em]">
                        {order.order_number}
                      </p>

                      <span className="h-1 w-1 rounded-full bg-[#171717]/15" />

                      <p className="text-[9px] uppercase tracking-[0.12em] text-[#171717]/35">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <p className="mt-2 text-[11px] text-[#171717]/65">
                      {order.customer_name || "Customer"}
                    </p>

                    <p className="mt-1 text-[9px] text-[#171717]/35">
                      {order.customer_city || "—"}
                      {order.customer_state
                        ? `, ${order.customer_state}`
                        : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="text-[9px] uppercase tracking-[0.12em] text-[#171717]/40">
                        {order.payment_method || "Payment"}
                      </span>

                      <span className="text-[9px] text-[#171717]/25">
                        /
                      </span>

                      <span className="text-[10px] font-medium">
                        {formatPrice(order.total)}
                      </span>

                      <span className="text-[9px] uppercase tracking-[0.12em] text-[#171717]/40">
                        {order.payment_status || "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
                    <div className="relative">
                      <select
                        value={getStatusLabel(order.status)}
                        onChange={(event) =>
                          handleStatusChange(
                            order.id,
                            event.target.value
                          )
                        }
                        disabled={isThisOrderPending}
                        className="h-10 min-w-[175px] appearance-none rounded-full border border-black/[0.08] bg-[#F7F3EF] px-4 pr-9 text-[9px] font-medium uppercase tracking-[0.1em] text-[#171717]/70 outline-none transition hover:border-black/[0.16] focus:border-black/[0.2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#171717]/35">
                        ↓
                      </span>

                      {isThisOrderPending &&
                        pendingAction === "status" && (
                          <span className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2">
                            <span className="block h-3 w-3 animate-spin rounded-full border-[1.5px] border-[#171717]/15 border-t-[#171717]/70" />
                          </span>
                        )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      disabled={isThisOrderPending}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-[#9A5963]/15 bg-[#F8EEF0] px-4 text-[9px] font-medium uppercase tracking-[0.12em] text-[#9A5963] transition hover:border-[#9A5963]/30 hover:bg-[#F5E4E7] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isThisOrderPending &&
                      pendingAction === "delete" ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-[#9A5963]/20 border-t-[#9A5963]" />
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EBE6] text-[#171717]/30">
            ○
          </div>

          <h3 className="mt-5 text-sm font-medium">
            No orders yet
          </h3>

          <p className="mt-2 text-[10px] leading-5 text-[#171717]/35">
            Customer orders will appear here once they are placed.
          </p>
        </div>
      )}
    </section>
  );
}