import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../setup';

describe('API Offers', () => {
  // Tests pour récupérer toutes les offres
  describe('Get all offers', () => {
    it('should retrieve all offers', async () => {
      const response = await axios.get(`${API_BASE_URL}/offers/`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Vérifier que chaque offre a la structure attendue
      if (response.data.length > 0) {
        const offer = response.data[0];
        expect(offer).toHaveProperty('id');
        expect(offer).toHaveProperty('name');
        expect(offer).toHaveProperty('description');
        expect(offer).toHaveProperty('price');
        expect(offer).toHaveProperty('type');
        expect(offer).toHaveProperty('max_attendees');
      }
    });
  });

  // Tests pour récupérer une offre par ID
  describe('Get offer by ID', () => {
    let firstOfferId: string;
    
    beforeAll(async () => {
      // Récupérer l'ID de la première offre pour les tests
      const response = await axios.get(`${API_BASE_URL}/offers/`);
      if (response.data.length > 0) {
        firstOfferId = response.data[0].id;
      } else {
        console.warn('Aucune offre trouvée pour les tests');
      }
    });

    it('should retrieve a specific offer by ID', async () => {
      // Ignorer le test s'il n'y a pas d'offre disponible
      if (!firstOfferId) {
        console.warn('Test ignoré: aucune offre disponible');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/offers/${firstOfferId}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', firstOfferId);
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('description');
      expect(response.data).toHaveProperty('price');
      expect(response.data).toHaveProperty('type');
    });

    it('should return 404 for non-existent offer ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      try {
        await axios.get(`${API_BASE_URL}/offers/${nonExistentId}`);
        fail('Should have failed with 404');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should reject invalid offer ID format', async () => {
      const invalidId = 'not-a-valid-uuid';
      
      try {
        await axios.get(`${API_BASE_URL}/offers/${invalidId}`);
        fail('Should have rejected invalid UUID format');
      } catch (error: any) {
        expect(error.response.status).toBe(422);
      }
    });
  });

  // Tests pour les endpoints d'administration des offres
  describe('Admin offer operations', () => {
    let adminHeaders: { Authorization: string };
    let createdOfferId: string;

    // Configuration initiale pour obtenir les en-têtes d'authentification admin
    beforeAll(async () => {
      try {
        adminHeaders = await getAuthHeaders('admin');
      } catch (error) {
        console.error('Erreur lors de l\'authentification admin:', error);
      }
    });

    // Test de création d'une offre
    it('should create a new offer as admin', async () => {
      const newOffer = {
        name: 'Test Offer',
        description: 'Test offer description',
        price: 99.99,
        type: 'solo',
        max_attendees: 1,
        image_url: 'https://example.com/image.jpg',
        features: ['Feature 1', 'Feature 2']
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/admin/offers/`, 
          newOffer, 
          { headers: adminHeaders }
        );
        
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('name', newOffer.name);
        expect(response.data).toHaveProperty('description', newOffer.description);
        expect(response.data).toHaveProperty('price', newOffer.price);
        
        // Stocker l'ID pour les tests suivants
        createdOfferId = response.data.id;
        
      } catch (error: any) {
        console.error('Erreur lors de la création d\'offre:', error.response?.data || error.message);
        throw error;
      }
    });

    // Test de mise à jour d'une offre
    it('should update an existing offer as admin', async () => {
      // Ignorer le test si l'offre n'a pas été créée
      if (!createdOfferId) {
        console.warn('Test ignoré: offre non créée');
        return;
      }

      const updateData = {
        name: 'Updated Test Offer',
        price: 129.99
      };

      const response = await axios.put(
        `${API_BASE_URL}/admin/offers/${createdOfferId}`, 
        updateData, 
        { headers: adminHeaders }
      );
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', createdOfferId);
      expect(response.data).toHaveProperty('name', updateData.name);
      expect(response.data).toHaveProperty('price', updateData.price);
    });

    // Test de suppression d'une offre
    it('should delete an offer as admin', async () => {
      // Ignorer le test si l'offre n'a pas été créée
      if (!createdOfferId) {
        console.warn('Test ignoré: offre non créée');
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/admin/offers/${createdOfferId}`, 
        { headers: adminHeaders }
      );
      
      expect(response.status).toBe(204);

      // Vérifier que l'offre a bien été supprimée
      try {
        await axios.get(`${API_BASE_URL}/offers/${createdOfferId}`);
        fail('Offer should have been deleted');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    // Test d'accès non autorisé (utilisateur non admin)
    it('should reject non-admin user for admin operations', async () => {
      const userHeaders = await getAuthHeaders('user');
      const newOffer = {
        name: 'Unauthorized Offer',
        description: 'This should fail',
        price: 10,
        type: 'solo',
        max_attendees: 1
      };

      try {
        await axios.post(
          `${API_BASE_URL}/admin/offers/`, 
          newOffer, 
          { headers: userHeaders }
        );
        fail('Should have rejected non-admin user');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });
  });
});
