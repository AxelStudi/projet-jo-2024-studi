
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Info, RefreshCw, Copy, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMfa } from '../hooks/useMfa';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const SetupMfaPage: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  const { user } = useAuth();
  const { 
    qrCodeUrl, 
    secret, 
    isLoading, 
    error,
    setupMfa, 
    enableMfa,
    reset 
  } = useMfa();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    
    if (user.mfa_enabled) {
      navigate('/profil');
      return;
    }
    
    // Initialiser la configuration MFA
    setupMfa();
    
    return () => reset();
  }, [user, navigate, setupMfa, reset]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await enableMfa(verificationCode);
    
    if (result.success) {
      toast.success('Authentification à deux facteurs activée avec succès !');
      navigate('/profil');
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast.success('Clé secrète copiée dans le presse-papier');
    }
  };

  const retrySetup = () => {
    reset();
    setupMfa();
  };
  
  if (isLoading && !qrCodeUrl && !secret) {
    return <LoadingSpinner className="py-20" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <Shield className="h-16 w-16 text-primary-blue mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Activer l'authentification à deux facteurs</h1>
            <p className="text-gray-600 mt-2">
              Ajoutez une couche de sécurité supplémentaire à votre compte
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Erreur de configuration MFA</p>
                  <p className="text-sm mt-1">{error}</p>
                  <button
                    onClick={retrySetup}
                    className="inline-flex items-center mt-3 text-sm text-red-600 hover:text-red-800"
                  >
                    <RefreshCw size={16} className="mr-1" />
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {secret && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Étape 1: Scanner le code QR</h2>
                <p className="text-gray-600 mb-4">
                  Utilisez une application d'authentification comme Google Authenticator, Authy ou Microsoft Authenticator.
                </p>
                
                {qrCodeUrl ? (
                  <div className="flex flex-col items-center bg-gray-50 p-4 rounded-md mb-4">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code MFA" 
                      className="w-48 h-48 mb-3"
                      onError={() => setShowManualEntry(true)}
                    />
                    <button
                      onClick={() => setShowManualEntry(!showManualEntry)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showManualEntry ? 'Masquer la clé manuelle' : 'Afficher la clé manuelle'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
                    <p className="text-yellow-800 text-sm mb-2">
                      Le QR code n'a pas pu être généré. Utilisez la clé manuelle ci-dessous.
                    </p>
                    <button
                      onClick={() => setShowManualEntry(true)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Afficher la clé manuelle
                    </button>
                  </div>
                )}
                
                {(showManualEntry || !qrCodeUrl) && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-blue-800">Clé secrète:</p>
                      <button
                        onClick={copySecret}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Copy size={16} className="mr-1" />
                        Copier
                      </button>
                    </div>
                    <p className="font-mono text-sm bg-white p-2 rounded border break-all">
                      {secret}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      Saisissez cette clé manuellement dans votre application d'authentification.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Étape 2: Vérifier le code</h2>
                <p className="text-gray-600 mb-4">
                  Entrez le code à 6 chiffres généré par votre application d'authentification.
                </p>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
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
                    {isLoading ? 'Vérification...' : 'Activer l\'authentification à deux facteurs'}
                  </button>
                </form>
              </div>
            </>
          )}
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <div className="flex items-start">
              <Info size={20} className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Important</h3>
                <p className="text-sm text-yellow-700">
                  Conservez votre clé secrète dans un endroit sûr. En cas de perte de votre téléphone, 
                  vous en aurez besoin pour reconfigurer l'authentification à deux facteurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupMfaPage;
