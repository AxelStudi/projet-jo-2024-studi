// Configuration globale pour les tests
import axios from 'axios';

// Configuration de l'URL de base
export const API_BASE_URL = 'https://neighbouring-fina-axelstudi-848fdaf7.koyeb.app/api/v1';

// Informations d'identification pour les tests
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@paris2024.fr',
    password: 'Administration123!'
  },
  user: {
    email: 'user@test.fr',
    password: 'Utilisateur123!'
  }
};

// Fonction utilitaire pour obtenir un token JWT
export async function getAuthToken(credentials: { email: string, password: string }): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, credentials);
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur lors de l\'authentification :', error);
    throw error;
  }
}

// Fonction utilitaire pour créer des headers avec authentification
export async function getAuthHeaders(userType: 'admin' | 'user' = 'user'): Promise<{ Authorization: string }> {
  const token = await getAuthToken(TEST_CREDENTIALS[userType]);
  return { Authorization: `Bearer ${token}` };
}
