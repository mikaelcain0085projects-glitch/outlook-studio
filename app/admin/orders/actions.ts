"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) {
    throw new Error("Unauthorized");
  }

  return supabase;
}

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Invalid order status");
  }

  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const supabase = await verifyAdmin();

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/track-order");
}

export async function deleteOrder(orderId: string) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const supabase = await verifyAdmin();

  const { error: itemsError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const { error: orderError } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (orderError) {
    throw new Error(orderError.message);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/track-order");
}