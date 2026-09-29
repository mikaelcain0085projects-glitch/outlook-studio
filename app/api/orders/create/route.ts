import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

type OrderRequestItem = {
  productId: string;
  size: string | null;
  color: string | null;
  quantity: number;
};

type OrderRequest = {
  items: OrderRequestItem[];
  customer: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
  };
  paymentMethod: "cod" | "upi";
};

type ProductRecord = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  stock: number;
  images: Array<{
    url: string;
    type?: string;
  }> | null;
  sizes: string[] | null;
  colors: string[] | null;
};

function createOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `OS-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    // Verify the customer's authenticated session first.
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be signed in with Google to place an order.",
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as OrderRequest;

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 },
      );
    }

    if (!body.customer) {
      return NextResponse.json(
        { error: "Customer details are required." },
        { status: 400 },
      );
    }

    if (!["cod", "upi"].includes(body.paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method." },
        { status: 400 },
      );
    }

    const {
      fullName,
      phone,
      email,
      address,
      city,
      state,
      pinCode,
    } = body.customer;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !email?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pinCode?.trim()
    ) {
      return NextResponse.json(
        { error: "Please complete all delivery details." },
        { status: 400 },
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid Indian phone number." },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(pinCode.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit PIN code." },
        { status: 400 },
      );
    }

    for (const item of body.items) {
      if (
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          { error: "Invalid cart item." },
          { status: 400 },
        );
      }
    }

    // Use the server-only secret key for database operations.
    const admin = createAdminClient();

    const productIds = [
      ...new Set(body.items.map((item) => item.productId)),
    ];

    const { data: products, error: productsError } = await admin
      .from("products")
      .select(
        "id, name, price, sale_price, stock, images, sizes, colors, is_active",
      )
      .in("id", productIds);

    if (productsError) {
      console.error("Product lookup failed:", productsError);

      return NextResponse.json(
        { error: "Unable to verify your products." },
        { status: 500 },
      );
    }

    const productMap = new Map<string, ProductRecord>();

    for (const product of products ?? []) {
      productMap.set(product.id, product as ProductRecord);
    }

    let subtotal = 0;

    const orderItems: Array<{
      product_id: string;
      product_name: string;
      product_image: string | null;
      size: string | null;
      color: string | null;
      quantity: number;
      unit_price: number;
    }> = [];

    const quantitiesByProduct = new Map<string, number>();

    for (const item of body.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: "One of the products in your cart no longer exists." },
          { status: 400 },
        );
      }

      const activeCheck = (product as ProductRecord & {
        is_active?: boolean;
      }).is_active;

      if (activeCheck === false) {
        return NextResponse.json(
          {
            error: `"${product.name}" is no longer available.`,
          },
          { status: 400 },
        );
      }

      const currentQuantity =
        (quantitiesByProduct.get(product.id) ?? 0) + item.quantity;

      quantitiesByProduct.set(product.id, currentQuantity);

      if (currentQuantity > product.stock) {
        return NextResponse.json(
          {
            error: `"${product.name}" does not have enough stock.`,
          },
          { status: 400 },
        );
      }

      if (product.sizes?.length && !item.size) {
        return NextResponse.json(
          {
            error: `Please select a size for "${product.name}".`,
          },
          { status: 400 },
        );
      }

      if (
        product.sizes?.length &&
        item.size &&
        !product.sizes.includes(item.size)
      ) {
        return NextResponse.json(
          {
            error: `The selected size for "${product.name}" is no longer available.`,
          },
          { status: 400 },
        );
      }

      if (product.colors?.length && !item.color) {
        return NextResponse.json(
          {
            error: `Please select a colour for "${product.name}".`,
          },
          { status: 400 },
        );
      }

      if (
        product.colors?.length &&
        item.color &&
        !product.colors.includes(item.color)
      ) {
        return NextResponse.json(
          {
            error: `The selected colour for "${product.name}" is no longer available.`,
          },
          { status: 400 },
        );
      }

      const unitPrice =
        product.sale_price !== null &&
        product.sale_price !== undefined &&
        product.sale_price > 0
          ? Number(product.sale_price)
          : Number(product.price);

      const frontImage =
        product.images?.find((image) => image?.type === "front")?.url ??
        product.images?.[0]?.url ??
        null;

      subtotal += unitPrice * item.quantity;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: frontImage,
        size: item.size ?? null,
        color: item.color ?? null,
        quantity: item.quantity,
        unit_price: unitPrice,
      });
    }

    // The current checkout has no shipping charge.
    const total = subtotal;

    const orderNumber = createOrderNumber();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        payment_method: body.paymentMethod,
        payment_status: "pending",
        subtotal,
        total,
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim(),
        customer_city: city.trim(),
        customer_state: state.trim(),
        customer_pincode: pinCode.trim(),
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order creation failed:", orderError);

      return NextResponse.json(
        { error: "Unable to create your order." },
        { status: 500 },
      );
    }

    const { error: itemsError } = await admin.from("order_items").insert(
      orderItems.map((item) => ({
        order_id: order.id,
        ...item,
      })),
    );

    if (itemsError) {
      console.error("Order items creation failed:", itemsError);

      // Prevent an incomplete order from remaining in the database.
      await admin.from("orders").delete().eq("id", order.id);

      return NextResponse.json(
        { error: "Unable to save your order items." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      subtotal,
      total,
      paymentMethod: body.paymentMethod,
    });
  } catch (error) {
  console.error("Order creation request failed:", error);

  return NextResponse.json(
    { error: "Unable to process the order request." },
    { status: 500 },
  );
}
}