import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import QRCodeTicket from '../components/tickets/QRCodeTicket';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { supabase } from '../supabase/supabaseClient';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';

interface TicketDetails {
  id: string;
  quantity: number;
  offers: {
    name: string;
    description: string;
    price: number;
    type: string;
    max_attendees: number;
  } | null;
  transactions: {
    id: string;
    status: string;
    created_at: string;
  } | null;
  e_tickets: {
    id: string;
    qr_code_url: string;
    is_used: boolean;
  }[];
}

const TicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id || !user) return;
      
      setIsLoading(true);
      try {
        // Get reservation with related data
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            offers(name, description, price, type, max_attendees),
            transactions(id, status, created_at),
            e_tickets(id, qr_code_url, is_used)
          `)
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          setError('Billet non trouvé');
          return;
        }
        
        setTicket(data as unknown as TicketDetails);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setError('Erreur lors du chargement du billet');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTicket();
  }, [id, user]);
  
  const handleDownload = () => {
    toast.info('Téléchargement du billet au format PDF');
    // In a real implementation, this would generate and download a PDF
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mon billet JO Paris 2024',
        text: `Mon billet pour ${ticket?.offers?.name}`,
        url: window.location.href,
      })
      .then(() => toast.success('Billet partagé avec succès'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner className="py-20" />;
  }
  
  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Billet non trouvé'}</p>
          <Link to="/historique" className="btn btn-primary">
            Retour à mes billets
          </Link>
        </div>
      </div>
    );
  }
  
  const eventDate = ticket.transactions ? new Date(ticket.transactions.created_at) : new Date();
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Link to="/historique" className="flex items-center text-primary-blue hover:underline">
          <ArrowLeft size={18} className="mr-2" />
          Retour à mes billets
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{ticket.offers?.name}</h1>
          <p className="text-gray-600 mb-6">{ticket.offers?.description}</p>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Détails du billet</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Réservation ID:</span>
                <span className="font-medium">{ticket.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Type d'offre:</span>
                <span className={`badge ${
                  ticket.offers?.type === 'solo' ? 'badge-blue' : 
                  ticket.offers?.type === 'duo' ? 'badge-red' : 'badge-gold'
                } capitalize`}>
                  {ticket.offers?.type}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Quantité:</span>
                <span className="font-medium">{ticket.quantity}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Prix total:</span>
                <span className="font-medium">{((ticket.offers?.price || 0) * ticket.quantity).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Date d'achat:</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut:</span>
                <span className={`badge ${ticket.e_tickets[0]?.is_used ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                  {ticket.e_tickets[0]?.is_used ? 'Utilisé' : 'Valide'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={handleDownload}
              className="btn btn-outline flex-1"
            >
              <Download size={18} className="mr-2" />
              Télécharger PDF
            </button>
            <button 
              onClick={handleShare}
              className="btn btn-primary flex-1"
            >
              <Share2 size={18} className="mr-2" />
              Partager
            </button>
          </div>
        </div>
        
        <div>
          <QRCodeTicket
            ticketId={ticket.id}
            eventName={ticket.offers?.name || ''}
            date={formattedDate}
            userName={`${user?.first_name} ${user?.last_name}`}
            offerType={ticket.offers?.type || ''}
            attendees={ticket.offers?.max_attendees || 0}
            qrValue={ticket.e_tickets[0]?.qr_code_url || ''}
          />
          
          <div className="bg-blue-50 p-4 rounded-md mt-6 text-sm">
            <p className="text-blue-800">
              <strong>Information importante :</strong> Ce billet est nominatif et ne peut être transféré.
              Veuillez présenter ce QR code ainsi qu'une pièce d'identité lors de l'entrée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
