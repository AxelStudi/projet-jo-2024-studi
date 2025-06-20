
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Download, Info, Users, Search } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuthStore } from '../stores/authStore';
import { fetchUserReservations } from '../supabase/supabaseClient';
import { toast } from 'react-toastify';

interface TicketData {
  id: string;
  created_at: string | null;
  quantity: number;
  offers: {
    name: string;
    description: string;
    price: number;
  } | null;
  transactions: {
    id: string;
    status: string;
    created_at: string;
  } | null;
  e_tickets: {
    qr_code_url: string;
    is_used: boolean;
  }[];
}

const TicketHistoryPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  
  useEffect(() => {
    const loadTickets = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await fetchUserReservations(user.id);
        
        if (error) {
          console.error('Error fetching reservations:', error);
          toast.error('Erreur lors du chargement des billets');
          return;
        }
        
        if (data) {
          setTickets(data as unknown as TicketData[]);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, [user]);
  
  // Filter tickets based on search term
  const filteredTickets = tickets.filter(ticket => 
    ticket.offers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Generate PDF function (mock)
  const handleDownloadTicket = (ticketId: string) => {
    toast.info(`Téléchargement du billet #${ticketId}`);
    // In a real implementation, this would generate and download a PDF
  };
  
  if (isLoading) {
    return <LoadingSpinner className="py-20" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes billets</h1>
          <p className="text-gray-600">
            Retrouvez tous vos billets pour les Jeux Olympiques Paris 2024
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 relative">
          <input
            type="text"
            placeholder="Rechercher un billet..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>
      
      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Aucun billet trouvé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore acheté de billets pour les Jeux Olympiques.
          </p>
          <Link to="/offres" className="btn btn-primary">
            Découvrir les offres
          </Link>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Info className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h2>
          <p className="text-gray-600 mb-6">
            Aucun billet ne correspond à votre recherche "{searchTerm}".
          </p>
          <button
            className="btn btn-outline"
            onClick={() => setSearchTerm('')}
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{ticket.offers?.name}</h2>
                  <span className={`badge ${ticket.e_tickets[0]?.is_used ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                    {ticket.e_tickets[0]?.is_used ? 'Utilisé' : 'Valide'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{ticket.offers?.description}</p>
                
                <div className="space-y-2 mb-4">
                  {ticket.transactions && (
                    <div className="flex items-center text-gray-700">
                      <Calendar size={16} className="mr-2 text-gray-500" />
                      <span>
                        {new Date(ticket.transactions.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700">
                    <Users size={16} className="mr-2 text-gray-500" />
                    <span>Quantité: {ticket.quantity}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="font-semibold">
                    {( (ticket.offers?.price || 0) * ticket.quantity).toLocaleString('fr-FR')} €
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadTicket(ticket.id)}
                      className="btn btn-outline p-2"
                      aria-label="Télécharger le billet"
                    >
                      <Download size={18} />
                    </button>
                    <Link
                      to={`/billet/${ticket.id}`}
                      className="btn btn-primary"
                    >
                      Voir le billet
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketHistoryPage;
