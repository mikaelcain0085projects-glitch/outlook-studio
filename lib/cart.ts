export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
};

const CART_KEY = "outlook-studio-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CART_KEY, JSON.stringify(items));

  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();

  const existingIndex = cart.findIndex(
    (cartItem) =>
      cartItem.productId === item.productId &&
      cartItem.size === item.size &&
      cartItem.color === item.color
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}