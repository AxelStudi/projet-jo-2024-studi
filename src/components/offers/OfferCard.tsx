import React from 'react';
import { ShoppingCart, Users, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { toast } from 'react-toastify';

interface OfferProps {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  imageUrl: string;
  maxAttendees: number;
  features: string[];
}

const OfferCard: React.FC<OfferProps> = ({
  id,
  name,
  description,
  price,
  type,
  imageUrl,
  maxAttendees,
  features
}) => {
  const { addItem } = useCartStore();
  
  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      type,
      maxAttendees
    });
    toast.success(`${name} ajouté au panier`);
  };
  
  return (
    <div className="card h-full flex flex-col">
      <div 
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="h-full w-full bg-black bg-opacity-30 flex items-center justify-center">
          <span className={`badge ${
            type === 'solo' ? 'badge-blue' : 
            type === 'duo' ? 'badge-red' : 'badge-gold'
          } text-sm uppercase tracking-wider font-bold px-4 py-1`}>
            {type}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          <div className="badge badge-blue flex items-center">
            <Users size={14} className="mr-1" />
            <span>{maxAttendees}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mt-2 mb-4 flex-grow">{description}</p>
        
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-700">
              <ArrowRight size={14} className="mr-2 text-primary-blue" />
              {feature}
            </li>
          ))}
        </ul>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-bold text-gray-800">{price.toLocaleString('fr-FR')} €</span>
          <button 
            onClick={handleAddToCart}
            className="btn btn-primary flex items-center"
          >
            <ShoppingCart size={18} className="mr-2" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;