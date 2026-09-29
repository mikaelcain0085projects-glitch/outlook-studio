"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();

  // 1. Verify logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  // 2. Verify admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    throw new Error("Admin access required.");
  }

  // 3. Read product ID
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Product ID is required.");
  }

  // 4. Delete product
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  // 5. Return to products list
  redirect("/admin/products");
}