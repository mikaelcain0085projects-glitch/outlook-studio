
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

const CANCELLABLE_STATUSES = [
  "pending",
  "confirmed",
  "processing",
] as const;

export async function cancelCustomerOrder(
  orderId: string,
  reason: string,
) {
  if (!orderId) {
    return { success: false, message: "Order ID is required." };
  }

  const cancellationReason = reason?.trim();

  if (!cancellationReason) {
    return {
      success: false,
      message: "Please provide a reason for cancelling your order.",
    };
  }

  if (cancellationReason.length > 1000) {
    return {
      success: false,
      message: "Your cancellation reason must be 1000 characters or fewer.",
    };
  }

  // Verify the signed-in customer.
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Please sign in to cancel your order.",
    };
  }

  // Use the admin client only after verifying the customer.
  const admin = createAdminClient();

  // Confirm ownership and check the current status.
  const { data: order, error: lookupError } = await admin
    .from("orders")
    .select("id, user_id, status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError || !order) {
    return {
      success: false,
      message: "We couldn't find this order in your account.",
    };
  }

  if (
    !CANCELLABLE_STATUSES.includes(
      order.status as (typeof CANCELLABLE_STATUSES)[number],
    )
  ) {
    return {
      success: false,
      message:
        order.status === "shipped"
          ? "This order has been shipped and can no longer be cancelled."
          : order.status === "delivered"
            ? "Delivered orders cannot be cancelled."
            : order.status === "cancelled"
              ? "This order has already been cancelled."
              : "This order can no longer be cancelled.",
    };
  }

  // Update only if the order still has a cancellable status.
  const { data: updatedOrder, error: updateError } = await admin
    .from("orders")
    .update({
      status: "cancelled",
      cancellation_reason: cancellationReason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .in("status", [...CANCELLABLE_STATUSES])
    .select("id")
    .maybeSingle();

  if (updateError) {
    return {
      success: false,
      message: "Unable to cancel your order. Please try again.",
    };
  }

  if (!updatedOrder) {
    return {
      success: false,
      message:
        "Your order status has changed. Please refresh and check again.",
    };
  }

  revalidatePath("/track-order");
  revalidatePath("/account");
  revalidatePath("/admin/orders");

  return {
    success: true,
    message: "Your order has been cancelled successfully.",
  };
}
