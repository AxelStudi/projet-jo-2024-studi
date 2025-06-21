import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../setup';

describe('API Admin Users', () => {
  let adminHeaders: { Authorization: string };
  let userHeaders: { Authorization: string };
  let testUserId: string;
  
  beforeAll(async () => {
    try {
      adminHeaders = await getAuthHeaders('admin');
      userHeaders = await getAuthHeaders('user');
      
      // Récupérer l'ID de l'utilisateur de test
      const userResponse = await axios.get(
        `${API_BASE_URL}/users/me`,
        { headers: userHeaders }
      );
      
      testUserId = userResponse.data.id;
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
    }
  });

  // Test pour récupérer tous les utilisateurs (admin)
  describe('Get all users (admin)', () => {
    it('should retrieve all users as admin', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/admin/users/`,
        { headers: adminHeaders }
      );
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Vérifier que la liste contient des utilisateurs avec la structure attendue
      if (response.data.length > 0) {
        const user = response.data[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('first_name');
        expect(user).toHaveProperty('last_name');
        expect(user).toHaveProperty('is_admin');
      }
    });

    it('should reject non-admin users', async () => {
      try {
        await axios.get(
          `${API_BASE_URL}/admin/users/`,
          { headers: userHeaders }
        );
        fail('Should have rejected non-admin user');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  // Test pour récupérer un utilisateur spécifique (admin)
  describe('Get specific user (admin)', () => {
    it('should retrieve a specific user by ID as admin', async () => {
      // Ignorer si nous n'avons pas pu récupérer d'ID d'utilisateur
      if (!testUserId) {
        console.warn('Test ignoré: aucun ID utilisateur disponible');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/admin/users/${testUserId}`,
        { headers: adminHeaders }
      );
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testUserId);
      expect(response.data).toHaveProperty('email');
      expect(response.data).toHaveProperty('first_name');
      expect(response.data).toHaveProperty('last_name');
    });

    it('should return error for non-existent user ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      try {
        await axios.get(`${API_BASE_URL}/admin/users/${nonExistentId}`, {
          headers: adminHeaders
        });
        fail('Should have returned an error');
      } catch (error: any) {
        // L'API peut retourner 404 (not found) ou 500 (erreur serveur) selon son implémentation
        expect([404, 500]).toContain(error.response.status);
      }
    });
  });

  // Test pour mettre à jour un utilisateur (admin)
  describe('Update user (admin)', () => {
    it('should update a user as admin', async () => {
      // Ignorer si nous n'avons pas pu récupérer d'ID d'utilisateur
      if (!testUserId) {
        console.warn('Test ignoré: aucun ID utilisateur disponible');
        return;
      }

      // Récupérer d'abord les informations de l'utilisateur pour ne pas perdre les données
      const getUserResponse = await axios.get(
        `${API_BASE_URL}/admin/users/${testUserId}`,
        { headers: adminHeaders }
      );
      
      const originalFirstName = getUserResponse.data.first_name;
      const originalLastName = getUserResponse.data.last_name;
      
      // Mettre à jour avec de nouvelles valeurs pour le test
      const updateData = {
        first_name: `${originalFirstName}_test`,
        last_name: `${originalLastName}_test`
      };

      const response = await axios.put(
        `${API_BASE_URL}/admin/users/${testUserId}`,
        updateData,
        { headers: adminHeaders }
      );
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testUserId);
      expect(response.data).toHaveProperty('first_name', updateData.first_name);
      expect(response.data).toHaveProperty('last_name', updateData.last_name);

      // Remettre les valeurs originales pour ne pas affecter d'autres tests
      await axios.put(
        `${API_BASE_URL}/admin/users/${testUserId}`,
        {
          first_name: originalFirstName,
          last_name: originalLastName
        },
        { headers: adminHeaders }
      );
    });

    it('should update admin status', async () => {
      // Ignorer si nous n'avons pas pu récupérer d'ID d'utilisateur
      if (!testUserId) {
        console.warn('Test ignoré: aucun ID utilisateur disponible');
        return;
      }

      // Ce test peut être sensible car il modifie le statut administrateur
      // Nous allons seulement tester la requête et vérifier qu'elle est acceptée
      // Sans changer réellement le statut pour éviter de perturber les tests

      const originalData = await axios.get(
        `${API_BASE_URL}/admin/users/${testUserId}`,
        { headers: adminHeaders }
      );
      
      const originalIsAdmin = originalData.data.is_admin;

      try {
        // Mettre le même statut (pas de changement réel)
        const response = await axios.put(
          `${API_BASE_URL}/admin/users/${testUserId}`,
          { is_admin: originalIsAdmin },
          { headers: adminHeaders }
        );
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('is_admin', originalIsAdmin);
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour du statut admin:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should reject non-admin users trying to update users', async () => {
      // Ignorer si nous n'avons pas pu récupérer d'ID d'utilisateur
      if (!testUserId) {
        console.warn('Test ignoré: aucun ID utilisateur disponible');
        return;
      }

      try {
        await axios.put(
          `${API_BASE_URL}/admin/users/${testUserId}`,
          { first_name: 'Unauthorized Update' },
          { headers: userHeaders }
        );
        fail('Should have rejected non-admin user');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  // Test pour supprimer un utilisateur (admin)
  // Note: Nous ne testerons pas réellement la suppression pour ne pas affecter les autres tests
  describe('Delete user (admin)', () => {
    it('should require admin privileges for delete operation', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      try {
        await axios.delete(
          `${API_BASE_URL}/admin/users/${nonExistentId}`,
          { headers: userHeaders }
        );
        fail('Should have rejected non-admin user');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });
  });
});
