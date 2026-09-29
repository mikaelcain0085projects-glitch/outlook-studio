"use client";

import { useState, useTransition } from "react";
import { deleteOrder, updateOrderStatus } from "./actions";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

type OrderActionsProps = {
  orderId: string;
  currentStatus: string | null;
};

export default function OrderActions({
  orderId,
  currentStatus,
}: OrderActionsProps) {
  const [status, setStatus] = useState(
    currentStatus || "pending"
  );

  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<
    "status" | "delete" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nextStatus = event.target.value;
    const previousStatus = status;

    if (nextStatus === previousStatus || isPending) {
      return;
    }

    setStatus(nextStatus);
    setErrorMessage("");
    setPendingAction("status");

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, nextStatus);
      } catch (error) {
        setStatus(previousStatus);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to update order status."
        );
      } finally {
        setPendingAction(null);
      }
    });
  };

  const handleDelete = () => {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setPendingAction("delete");

    startTransition(async () => {
      try {
        await deleteOrder(orderId);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to delete this order."
        );
      } finally {
        setPendingAction(null);
      }
    });
  };

  return (
    <div className="border-t border-black/[0.05] pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[8px] uppercase tracking-[0.22em] text-[#171717]/30">
            Update status
          </span>

          <div className="relative">
            <select
              value={status}
              onChange={handleStatusChange}
              disabled={isPending}
              className="h-9 min-w-[170px] appearance-none rounded-full border border-black/[0.08] bg-white/70 px-4 pr-9 text-[9px] font-medium uppercase tracking-[0.1em] text-[#171717]/65 outline-none transition hover:border-black/[0.14] focus:border-black/[0.2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {ORDER_STATUSES.map((orderStatus) => (
                <option
                  key={orderStatus.value}
                  value={orderStatus.value}
                >
                  {orderStatus.label}
                </option>
              ))}
            </select>

            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#171717]/35"
              aria-hidden="true"
            >
              ↓
            </span>
          </div>

          {isPending && pendingAction === "status" && (
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#171717]/15 border-t-[#171717]/70"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#9A5963]/20 bg-[#F7E5E7]/45 px-4 text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A4D57] transition-all duration-300 hover:border-[#9A5963]/35 hover:bg-[#F3D9DD] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && pendingAction === "delete" ? (
            <>
              <span
                className="h-3 w-3 animate-spin rounded-full border-2 border-[#8A4D57]/20 border-t-[#8A4D57]"
                aria-hidden="true"
              />
              Deleting...
            </>
          ) : (
            <>
              <span
                className="text-xs leading-none"
                aria-hidden="true"
              >
                ×
              </span>
              Delete order
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-3 text-[9px] leading-5 text-[#8A4D57]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}