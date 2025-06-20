import React, { useState, useEffect } from 'react';
import OfferCard from '../components/offers/OfferCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { fetchOffers } from '../supabase/supabaseClient';
import { toast } from 'react-toastify';

// Types (would typically be in a separate types file)
interface Offer {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  image_url: string | null;
  max_attendees: number;
  features: string[];
}

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const getOffers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await fetchOffers();
        
        if (error) {
          toast.error("Erreur lors du chargement des offres");
          return;
        }
        
        if (data) {
          // The fetched data is Tables<'offers'>[] which might have null features.
          // We need to ensure it matches the local Offer type.
          const formattedOffers = data.map(o => ({
            ...o,
            features: o.features || [], // Fallback for null features
          }));
          setOffers(formattedOffers as Offer[]);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        toast.error("Erreur lors du chargement des offres");
      } finally {
        setIsLoading(false);
      }
    };
    
    getOffers();
  }, []);

  // Handle filter change
  const handleFilterChange = (type: string | null) => {
    setActiveFilter(type);
  };

  // Filter offers based on active filter
  const filteredOffers = activeFilter
    ? offers.filter(offer => offer.type === activeFilter)
    : offers;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Nos offres de billets</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choisissez parmi nos différentes formules pour vivre les Jeux Olympiques de Paris 2024
          selon vos besoins. Des billets solo aux forfaits familiaux, nous avons l'offre qu'il vous faut.
        </p>
      </div>
      
      {/* Filter buttons */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => handleFilterChange(null)}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              activeFilter === null
                ? 'bg-primary-blue text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => handleFilterChange('solo')}
            className={`px-4 py-2 text-sm font-medium ${
              activeFilter === 'solo'
                ? 'bg-primary-blue text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Solo
          </button>
          <button
            onClick={() => handleFilterChange('duo')}
            className={`px-4 py-2 text-sm font-medium ${
              activeFilter === 'duo'
                ? 'bg-primary-blue text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Duo
          </button>
          <button
            onClick={() => handleFilterChange('family')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              activeFilter === 'family'
                ? 'bg-primary-blue text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Famille
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune offre disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              id={offer.id}
              name={offer.name}
              description={offer.description}
              price={offer.price}
              type={offer.type}
              imageUrl={offer.image_url || 'https://images.pexels.com/photos/236937/pexels-photo-236937.jpeg'}
              maxAttendees={offer.max_attendees}
              features={offer.features || [
                'Accès à tous les événements du jour',
                'Programme officiel inclus',
                'Accès prioritaire'
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPage;
