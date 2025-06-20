import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import { AxiosError } from 'axios';

interface ApiError {
  detail: string;
}

// A simple card component for layout
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

const CheckoutPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const totalPrice = getTotalPrice();

  const handlePayment = async () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide.');
      return;
    }

    if (!token) {
      toast.error('Utilisateur non authentifié. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      const checkoutPayload = {
        items: items.map(item => ({
          offer_id: item.id,
          quantity: item.quantity,
        })),
      };

      // This now calls the secure backend endpoint
      await apiClient.post('/checkout/', checkoutPayload);

      clearCart();
      toast.success('Paiement réussi ! Vos billets ont été générés.');
      navigate('/historique');

    } catch (error) {
            const axiosError = error as AxiosError<ApiError>;
      console.error('Checkout failed:', error);
            const errorMessage = axiosError.response?.data?.detail || 'Une erreur est survenue lors du paiement.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Finaliser ma commande</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Payment Details Column */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Informations de paiement</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Numéro de carte</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" id="card-number" className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="0000 0000 0000 0000" />
                  </div>
                </div>
                {/* Other form fields can be added here */}
              </div>
              <div className="mt-6 flex items-center text-sm text-gray-500">
                <Shield className="h-5 w-5 text-green-500 mr-2" />
                <span>Paiement sécurisé. Vos informations sont protégées.</span>
              </div>
            </Card>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Résumé de la commande</h2>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessing || items.length === 0}
                className="w-full mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  `Payer ${totalPrice.toFixed(2)} €`
                )}
              </button>
              {items.length === 0 && (
                <p className="text-center text-xs text-red-500 mt-2">Votre panier est vide.</p>
              )}
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
            <Card className="bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                        Ceci est un projet de démonstration. Aucune transaction réelle ne sera effectuée.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
