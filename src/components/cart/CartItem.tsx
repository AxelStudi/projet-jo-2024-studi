import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore, CartItem as CartItemType } from '../../stores/cartStore';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();
  
  const handleIncrease = () => {
    updateQuantity(item.id, item.quantity + 1);
  };
  
  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };
  
  const handleRemove = () => {
    removeItem(item.id);
  };
  
  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <div className="flex-grow">
        <h3 className="font-medium text-gray-800">{item.name}</h3>
        <div className="flex items-center mt-1">
          <span className={`badge ${
            item.type === 'solo' ? 'badge-blue' : 
            item.type === 'duo' ? 'badge-red' : 'badge-gold'
          } capitalize`}>
            {item.type}
          </span>
          <span className="text-gray-500 text-sm ml-2">
            {item.maxAttendees} {item.maxAttendees > 1 ? 'personnes' : 'personne'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center border border-gray-300 rounded-md mr-4">
          <button 
            onClick={handleDecrease}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            <Minus size={16} />
          </button>
          <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
          <button 
            onClick={handleIncrease}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="w-24 text-right text-gray-800 font-medium">
          {(item.price * item.quantity).toLocaleString('fr-FR')} €
        </div>
        
        <button 
          onClick={handleRemove}
          className="ml-4 text-red-500 hover:text-red-700"
          aria-label="Supprimer l'article"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;