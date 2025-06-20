import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, AlertTriangle, Search } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { supabase } from '../../supabase/supabaseClient';
import { toast } from 'react-toastify';

interface Offer {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  image_url: string | null;
  max_attendees: number;
  features: string[] | null;
}

const defaultOffer: Omit<Offer, 'id' | 'features'> & { features: string[] } = {
  name: '',
  description: '',
  price: 0,
  type: 'solo',
  image_url: 'https://images.pexels.com/photos/236937/pexels-photo-236937.jpeg',
  max_attendees: 1,
  features: ['Accès à tous les événements du jour', 'Programme officiel inclus']
};

const AdminOffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<Omit<Offer, 'id' | 'features'> & { features: string[] }>(defaultOffer);
  const [featureInput, setFeatureInput] = useState('');
  
  // Load offers
  useEffect(() => {
    const getOffers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .order('price');
          
        if (error) throw error;
        
        setOffers(data || []);
      } catch (error) {
        console.error('Error fetching offers:', error);
        toast.error('Erreur lors du chargement des offres');
      } finally {
        setIsLoading(false);
      }
    };
    
    getOffers();
  }, []);
  
  // Filter offers based on search term
  const filteredOffers = offers.filter(offer => 
    offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'max_attendees') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 1
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Add feature to list
  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };
  
  // Remove feature from list
  const removeFeature = (index: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };
  
  // Open modal to create new offer
  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData(defaultOffer);
    setIsModalOpen(true);
  };
  
  // Open modal to edit offer
  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description,
      price: offer.price,
      type: offer.type,
      image_url: offer.image_url,
      max_attendees: offer.max_attendees,
      features: offer.features || []
    });
    setIsModalOpen(true);
  };
  
  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };
  
  // Save offer (create or update)
  const saveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingOffer) {
        // Update existing offer
        const { error } = await supabase
          .from('offers')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            type: formData.type,
            image_url: formData.image_url,
            max_attendees: formData.max_attendees,
            features: formData.features
          })
          .eq('id', editingOffer.id);
          
        if (error) throw error;
        
        // Update local state
        setOffers(offers.map(o => 
          o.id === editingOffer.id ? { ...o, ...formData, id: o.id } : o
        ));
        
        toast.success('Offre mise à jour avec succès');
      } else {
        // Create new offer
        const { data, error } = await supabase
          .from('offers')
          .insert([formData])
          .select();
          
        if (error) throw error;
        
        // Update local state
        if (data) {
          setOffers([...offers, data[0]]);
        }
        
        toast.success('Offre créée avec succès');
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'offre');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete offer
  const deleteOffer = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return;
    }
    
    try {
      // Check if offer has any reservations
      const { count, error: countError } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('offer_id', id);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast.error('Cette offre ne peut pas être supprimée car elle a des réservations associées');
        return;
      }
      
      // Delete offer
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setOffers(offers.filter(offer => offer.id !== id));
      
      toast.success('Offre supprimée avec succès');
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Erreur lors de la suppression de l\'offre');
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner className="py-20" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des offres</h1>
          <p className="text-gray-600">
            Créez et gérez les offres de billets pour les JO Paris 2024
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une offre..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <button
            onClick={openCreateModal}
            className="btn btn-primary flex items-center justify-center sm:w-auto"
          >
            <Plus size={18} className="mr-2" />
            Ajouter une offre
          </button>
        </div>
      </div>
      
      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Aucune offre trouvée</h2>
          <p className="text-gray-600 mb-6">
            {searchTerm ? `Aucune offre ne correspond à "${searchTerm}"` : 'Aucune offre n\'a été créée.'}
          </p>
          <button
            onClick={openCreateModal}
            className="btn btn-primary"
          >
            Créer une nouvelle offre
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personnes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{offer.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {offer.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        offer.type === 'solo' ? 'badge-blue' : 
                        offer.type === 'duo' ? 'badge-red' : 'badge-gold'
                      } capitalize`}>
                        {offer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {offer.price.toLocaleString('fr-FR')} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {offer.max_attendees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(offer)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => deleteOffer(offer.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Modal for creating/editing offers */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingOffer ? 'Modifier l\'offre' : 'Créer une nouvelle offre'}
              </h2>
              
              <form onSubmit={saveOffer}>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'offre
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="input"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  {/* Type and Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                        Type d'offre
                      </label>
                      <select
                        id="type"
                        name="type"
                        className="input"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="solo">Solo</option>
                        <option value="duo">Duo</option>
                        <option value="family">Famille</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Prix (€)
                      </label>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        className="input"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Max Attendees and Image URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="max_attendees" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de personnes
                      </label>
                      <input
                        id="max_attendees"
                        name="max_attendees"
                        type="number"
                        min="1"
                        className="input"
                        value={formData.max_attendees}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                        URL de l'image
                      </label>
                      <input
                        id="image_url"
                        name="image_url"
                        type="url"
                        className="input"
                        value={formData.image_url || ''}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caractéristiques
                    </label>
                    <div className="flex mb-2">
                      <input
                        type="text"
                        className="input flex-grow mr-2"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="Ajouter une caractéristique"
                      />
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={addFeature}
                      >
                        Ajouter
                      </button>
                    </div>
                    <div className="mt-2">
                      {formData.features.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          Aucune caractéristique ajoutée
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {formData.features.map((feature, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span>{feature}</span>
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removeFeature(index)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeModal}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffersPage;
