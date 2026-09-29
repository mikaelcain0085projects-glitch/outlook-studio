"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function updateProduct(formData: FormData) {
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
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const price = Number(formData.get("price"));

  const salePriceValue = String(
    formData.get("sale_price") ?? ""
  ).trim();

  const salePrice =
    salePriceValue === "" ? null : Number(salePriceValue);

  const categoryId = String(
    formData.get("category_id") ?? ""
  ).trim();

  const stock = Number(formData.get("stock"));

  const isActive = formData.get("is_active") === "on";

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

    // 5. Read image values

  const newFrontImageUrl = String(
    formData.get("front_image_url") ?? ""
  ).trim();

  const newFrontImagePublicId = String(
    formData.get("front_image_public_id") ?? ""
  ).trim();

  const existingFrontImageUrl = String(
    formData.get("existing_front_image_url") ?? ""
  ).trim();

  const existingFrontImagePublicId = String(
    formData.get("existing_front_image_public_id") ?? ""
  ).trim();

  const newBackImageUrl = String(
    formData.get("back_image_url") ?? ""
  ).trim();

  const newBackImagePublicId = String(
    formData.get("back_image_public_id") ?? ""
  ).trim();

  const existingBackImageUrl = String(
    formData.get("existing_back_image_url") ?? ""
  ).trim();

  const existingBackImagePublicId = String(
    formData.get("existing_back_image_public_id") ?? ""
  ).trim();
  // 6. Basic validation
  if (!id || !name || !slug || !categoryId) {
    throw new Error(
      "Product ID, name, slug, and category are required."
    );
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

  // 7. Verify category exists
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .single();

  if (categoryError || !category) {
    throw new Error("Invalid category.");
  }

    // 8. Build image data

  const frontImageUrl =
    newFrontImageUrl || existingFrontImageUrl;

  const frontImagePublicId =
    newFrontImagePublicId || existingFrontImagePublicId;

  const backImageUrl =
    newBackImageUrl || existingBackImageUrl;

  const backImagePublicId =
    newBackImagePublicId || existingBackImagePublicId;

  const images = [
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
  ];
  // 9. Update product
  const { error: productError } = await supabase
    .from("products")
    .update({
      name,
      slug,
      description: description || null,
      price,
      sale_price: salePrice,
      category_id: categoryId,
      stock,
      sizes,
      colors,
      is_active: isActive,
      images,
    })
    .eq("id", id);

  if (productError) {
    throw new Error(productError.message);
  }

  // 10. Return to products list
  redirect("/admin/products");
}