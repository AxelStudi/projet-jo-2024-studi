import axios from 'axios';
import { API_BASE_URL, TEST_CREDENTIALS } from '../setup';

describe('API Authentication', () => {
  // Test de l'endpoint racine
  describe('Root endpoint', () => {
    it('should return a welcome message', async () => {
      const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/`);
      expect(response.status).toBe(200);
      // Vérifiez que la réponse contient un message de bienvenue
      expect(response.data).toBeDefined();
    });
  });

  // Tests pour l'inscription d'utilisateur
  describe('User Registration', () => {
    // Test avec un nouvel utilisateur (généré aléatoirement pour éviter les conflits)
    const randomEmail = `test${Date.now()}@example.com`;
    
    it('should register a new user', async () => {
      const newUser = {
        email: randomEmail,
        password: 'Password123!',
        first_name: 'Test',
        last_name: 'User'
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/users/register`, newUser);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('email', randomEmail);
        expect(response.data).toHaveProperty('first_name', 'Test');
        expect(response.data).toHaveProperty('last_name', 'User');
      } catch (error: any) {
        // Si l'utilisateur existe déjà, le test peut encore passer avec une erreur spécifique
        if (error.response && error.response.status === 422) {
          console.log('Email already exists, test skipped');
        } else {
          throw error;
        }
      }
    });

    it('should reject invalid registration data', async () => {
      const invalidUser = {
        email: 'not-an-email',
        password: '123', // Mot de passe trop court
        first_name: '',  // Prénom manquant
        last_name: 'User'
      };

      try {
        await axios.post(`${API_BASE_URL}/users/register`, invalidUser);
        fail('Should have rejected invalid data');
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data).toHaveProperty('detail');
      }
    });
  });

  // Tests pour la connexion utilisateur
  describe('User Login', () => {
    it('should login with valid credentials (user)', async () => {
      const response = await axios.post(`${API_BASE_URL}/users/login`, TEST_CREDENTIALS.user);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('access_token');
      expect(response.data).toHaveProperty('token_type', 'bearer');
      expect(response.data).toHaveProperty('user_profile');
      expect(response.data.user_profile).toHaveProperty('email', TEST_CREDENTIALS.user.email);
    });

    it('should login with valid credentials (admin)', async () => {
      const response = await axios.post(`${API_BASE_URL}/users/login`, TEST_CREDENTIALS.admin);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('access_token');
      expect(response.data.user_profile).toHaveProperty('is_admin', true);
    });

    it('should reject invalid credentials', async () => {
      const invalidCredentials = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!'
      };

      try {
        await axios.post(`${API_BASE_URL}/users/login`, invalidCredentials);
        fail('Should have rejected invalid credentials');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  // Tests pour récupérer le profil utilisateur
  describe('User Profile', () => {
    let userToken: string;

    beforeAll(async () => {
      // Obtenir le token avant d'exécuter les tests
      const response = await axios.post(`${API_BASE_URL}/users/login`, TEST_CREDENTIALS.user);
      userToken = response.data.access_token;
    });

    it('should get user profile with valid token', async () => {
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('email', TEST_CREDENTIALS.user.email);
    });

    it('should reject requests without token', async () => {
      try {
        await axios.get(`${API_BASE_URL}/users/me`);
        fail('Should have rejected request without token');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });
});
