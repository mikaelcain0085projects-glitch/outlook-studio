"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function createProduct(formData: FormData) {
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

  // 3. Read form values
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const price = Number(formData.get("price"));
  const salePriceValue = String(formData.get("sale_price") ?? "").trim();
  const salePrice = salePriceValue === "" ? null : Number(salePriceValue);

  const categoryId = String(formData.get("category_id") ?? "").trim();

  const stock = Number(formData.get("stock"));

  const isActive = formData.get("is_active") === "on";

  const frontImageUrl = String(
  formData.get("front_image_url") ?? ""
).trim();

const frontImagePublicId = String(
  formData.get("front_image_public_id") ?? ""
).trim();

const backImageUrl = String(
  formData.get("back_image_url") ?? ""
).trim();

const backImagePublicId = String(
  formData.get("back_image_public_id") ?? ""
).trim();

console.log("FRONT IMAGE URL:", frontImageUrl);
console.log("FRONT IMAGE PUBLIC ID:", frontImagePublicId);
console.log("BACK IMAGE URL:", backImageUrl);
console.log("BACK IMAGE PUBLIC ID:", backImagePublicId);

  // 4. Collect selected sizes and colours

const sizes = formData.getAll("sizes").map(String);

const colors = formData.getAll("colors").map(String);

const customSize = String(
  formData.get("custom_size") ?? ""
).trim();

if (customSize) {
  sizes.push(customSize);
}

const customColor = String(
  formData.get("custom_color") ?? ""
).trim();

if (customColor) {
  colors.push(customColor);
}
  // 5. Basic validation
  if (!name || !slug || !categoryId) {
    throw new Error("Name, slug, and category are required.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid price.");
  }

  if (
    salePrice !== null &&
    (!Number.isFinite(salePrice) || salePrice < 0)
  ) {
    throw new Error("Invalid sale price.");
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Invalid stock.");
  }

  // 6. Verify category exists
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .single();

  if (categoryError || !category) {
    throw new Error("Invalid category.");
  }

  // 7. Create product
  const { error: productError } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description: description || null,
      price,
      sale_price: salePrice,
      category_id: categoryId,
     images: [
  ...(frontImageUrl
    ? [
        {
          url: frontImageUrl,
          publicId: frontImagePublicId,
          type: "front",
        },
      ]
    : []),
  ...(backImageUrl
    ? [
        {
          url: backImageUrl,
          publicId: backImagePublicId,
          type: "back",
        },
      ]
    : []),
],
      stock,
      sizes,
      colors,
      is_active: isActive,
    });

  if (productError) {
    throw new Error(productError.message);
  }
  redirect("/admin/products");
}