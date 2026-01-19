
import { create } from 'zustand';
import { toast } from 'react-hot-toast';

// Simplified cart item for UI
export interface SimpleCartItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  quantity: number;
  totalPrice: number;
  gameUid?: string;
  server?: string;
  playerId?: string;
  category: string;
  discount?: number;
  denominationId?: string;
  productId?: string;
}

// Generate a consistent item ID based on item properties
const generateItemId = (name: string, price: number, category: string): string => {
  return `${name}-${price}-${category}`.replace(/\s+/g, '-').toLowerCase();
};

interface CartState {
  items: SimpleCartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;

  // Actions
  addItem: (item: Omit<SimpleCartItem, 'id' | 'totalPrice'>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,

  addItem: (itemData) => {
    try {
      set({ isLoading: true });

      // Generate consistent ID based on item properties
      const itemId = generateItemId(itemData.name, itemData.price, itemData.category);
      
      // Check if item already exists (same ID)
      const existingItemIndex = get().items.findIndex(
        item => item.id === itemId
      );

      let updatedItems: SimpleCartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = [...get().items];
        const currentItem = updatedItems[existingItemIndex];
        const newQuantity = currentItem.quantity + itemData.quantity;
        updatedItems[existingItemIndex] = {
          ...currentItem,
          quantity: newQuantity,
          totalPrice: newQuantity * itemData.price,
        };
      } else {
        // Add new item
        const newItem: SimpleCartItem = {
          id: itemId,
          ...itemData,
          quantity: itemData.quantity,
          totalPrice: itemData.quantity * itemData.price,
        };
        updatedItems = [...get().items, newItem];
      }

      set({ items: updatedItems });
      get().calculateTotals();
      toast.success('Item added to cart');
    } catch (error: any) {
      toast.error('Failed to add item to cart');
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        get().removeItem(itemId);
        return;
      }

      const updatedItems = get().items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            totalPrice: quantity * item.price,
          };
        }
        return item;
      });

      set({ items: updatedItems });
      get().calculateTotals();
    } catch (error: any) {
      toast.error('Failed to update cart item');
    }
  },

  removeItem: (itemId: string) => {
    try {
      const updatedItems = get().items.filter(item => item.id !== itemId);
      set({ items: updatedItems });
      get().calculateTotals();
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error('Failed to remove cart item');
    }
  },

  clearCart: () => {
    try {
      set({ items: [], totalItems: 0, totalPrice: 0 });
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error('Failed to clear cart');
    }
  },

  calculateTotals: () => {
    const { items } = get();
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    set({ totalItems, totalPrice });
  },
}));

