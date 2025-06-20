
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useMfa } from '../hooks/useMfa';
import { useAuthStore } from '../stores/authStore';

const MfaVerificationPage: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { verifyMfa, isLoading } = useMfa();
  const { checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      const result = await verifyMfa(verificationCode);
      
      if (result.success) {
        // Recharger les données utilisateur après vérification MFA
        await checkAuth();
        navigate(from);
      } else {
        setErrorMessage(result.error || 'Code de vérification incorrect');
      }
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de la vérification');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <KeyRound className="h-12 w-12 text-primary-blue mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Vérification en deux étapes</h1>
              <p className="text-gray-600 mt-1">
                Veuillez saisir le code généré par votre application d'authentification
              </p>
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Code de vérification
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  className="input text-center text-xl tracking-wide"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  autoComplete="one-time-code"
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full mb-4"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? 'Vérification...' : 'Vérifier'}
              </button>
              
              <button
                type="button"
                className="btn btn-outline w-full"
                onClick={() => navigate('/connexion')}
              >
                Retour à la connexion
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MfaVerificationPage;
