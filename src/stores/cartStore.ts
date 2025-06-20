import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: string;
  maxAttendees: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
        
        if (existingItemIndex >= 0) {
          // Item exists, update quantity
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += 1;
          return { items: updatedItems };
        } else {
          // Add new item with quantity 1
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(item => item.id !== id) };
        }
        
        return {
          items: state.items.map(item => 
            item.id === id ? { ...item, quantity } : item
          )
        };
      }),
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'olympics-cart-storage'
    }
  )
);