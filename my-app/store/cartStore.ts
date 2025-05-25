import {create} from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  slug: string;
  // Add other relevant attributes like selectedColor, selectedSize if needed later
}

interface CartState {
  cartItems: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void; // Allow adding with or without initial quantity
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getCartTotalItems: () => number;
  getCartSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  addItem: (itemToAdd) =>
    set((state) => {
      const existingItem = state.cartItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.id === itemToAdd.id
              ? { ...item, quantity: item.quantity + (itemToAdd.quantity || 1) }
              : item
          ),
        };
      } else {
        return { cartItems: [...state.cartItems, { ...itemToAdd, quantity: itemToAdd.quantity || 1 }] };
      }
    }),
  removeItem: (itemId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== itemId),
    })),
  updateQuantity: (itemId, newQuantity) =>
    set((state) => {
      if (newQuantity <= 0) {
        // If new quantity is 0 or less, remove the item
        return { cartItems: state.cartItems.filter((item) => item.id !== itemId) };
      }
      return {
        cartItems: state.cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      };
    }),
  clearCart: () => set({ cartItems: [] }),
  getCartTotalItems: () => {
    return get().cartItems.reduce((total, item) => total + item.quantity, 0);
  },
  getCartSubtotal: () => {
    return get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
