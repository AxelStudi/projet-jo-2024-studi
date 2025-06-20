import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, AlertTriangle, ChevronRight } from 'lucide-react';
import CartItem from '../components/cart/CartItem';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';

const CartPage: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/connexion', { state: { from: '/paiement' } });
    } else {
      navigate('/paiement');
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Votre panier est vide</h1>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore ajouté de billets à votre panier.
          </p>
          <Link to="/offres" className="btn btn-primary">
            Découvrir les offres
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Votre panier</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-xl font-semibold">Articles ({items.length})</h2>
              <button 
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Vider le panier
              </button>
            </div>
            
            <div>
              {items.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Récapitulatif</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{getTotalPrice().toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frais de service</span>
                <span className="font-medium">0,00 €</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold text-primary-blue">
                  {getTotalPrice().toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="btn btn-primary w-full mb-4"
            >
              {isAuthenticated ? 'Procéder au paiement' : 'Se connecter pour continuer'}
            </button>
            
            <div className="bg-blue-50 p-3 rounded-md text-sm flex items-start">
              <AlertTriangle size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-blue-800">
                Vos billets sont sécurisés avec notre technologie de QR code. Les billets sont nominatifs et ne peuvent être transférés.
              </p>
            </div>
            
            <Link
              to="/offres"
              className="flex items-center justify-center mt-4 text-primary-blue hover:underline"
            >
              <span>Continuer vos achats</span>
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;