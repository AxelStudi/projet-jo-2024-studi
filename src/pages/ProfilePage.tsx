import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, Ticket, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth, useAuthActions } from '../hooks/useAuth';
import { useMfa } from '../hooks/useMfa';
import { toast } from 'react-toastify';

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { logout } = useAuthActions();
  const { disableMfa, isLoading: mfaLoading } = useMfa();
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDisableMfaForm, setShowDisableMfaForm] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Mock password update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Mot de passe mis à jour avec succès');
    setIsPasswordFormVisible(false);
    setIsUpdating(false);
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await disableMfa(mfaCode);
    
    if (result.success) {
      setShowDisableMfaForm(false);
      setMfaCode('');
      // Forcer le rechargement des données utilisateur
      window.location.reload();
    } else {
      toast.error(result.error || 'Code invalide');
    }
  };

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, afficher un message d'erreur
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h1>
              <p className="text-gray-600 mb-4">Impossible de charger vos informations de profil.</p>
              <Link to="/connexion" className="btn btn-primary">
                Se reconnecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-primary-blue text-white p-6">
            <div className="flex items-center">
              <div className="bg-white p-3 rounded-full mr-4">
                <User size={32} className="text-primary-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mon profil</h1>
                <p className="opacity-90">Gérez vos informations personnelles et vos préférences</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left column - User info */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Information personnelles</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        className="input bg-gray-50"
                        value={user.first_name || ''}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        className="input bg-gray-50"
                        value={user.last_name || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input bg-gray-50"
                      value={user.email || ''}
                      readOnly
                    />
                  </div>
                </div>
                
                {isPasswordFormVisible ? (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">Modifier le mot de passe</h3>
                    <form onSubmit={handleUpdatePassword}>
                      <div className="space-y-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setIsPasswordFormVisible(false)}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button
                    className="btn btn-outline mb-6"
                    onClick={() => setIsPasswordFormVisible(true)}
                  >
                    Modifier le mot de passe
                  </button>
                )}
                
                {/* Two-factor authentication */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <Shield size={24} className={user.mfa_enabled ? 'text-green-500' : 'text-gray-400'} />
                    <div className="ml-4 flex-grow">
                      <h3 className="text-lg font-semibold">Authentification à deux facteurs</h3>
                      <p className="text-gray-600 mb-4">
                        {user.mfa_enabled
                          ? 'L\'authentification à deux facteurs est activée sur votre compte.'
                          : 'L\'authentification à deux facteurs ajoute une couche de sécurité supplémentaire.'}
                      </p>
                      
                      {user.mfa_enabled ? (
                        <div className="space-y-4">
                          <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-md">
                            <CheckCircle size={18} className="mr-2" />
                            <span>2FA activée</span>
                          </div>
                          
                          {!showDisableMfaForm ? (
                            <button
                              onClick={() => setShowDisableMfaForm(true)}
                              className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Désactiver la 2FA
                            </button>
                          ) : (
                            <div className="bg-red-50 p-4 rounded-md">
                              <h4 className="font-medium text-red-800 mb-2">Désactiver l'authentification à deux facteurs</h4>
                              <p className="text-red-700 text-sm mb-4">
                                Entrez le code de votre application d'authentification pour confirmer.
                              </p>
                              <form onSubmit={handleDisableMfa} className="space-y-3">
                                <input
                                  type="text"
                                  className="input text-center"
                                  value={mfaCode}
                                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  placeholder="000000"
                                  maxLength={6}
                                  required
                                />
                                <div className="flex space-x-3">
                                  <button
                                    type="submit"
                                    className="btn btn-primary bg-red-600 hover:bg-red-700"
                                    disabled={mfaLoading || mfaCode.length !== 6}
                                  >
                                    {mfaLoading ? 'Désactivation...' : 'Désactiver'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                      setShowDisableMfaForm(false);
                                      setMfaCode('');
                                    }}
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link to="/configuration-mfa" className="btn btn-primary">
                          Activer la 2FA
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Quick actions */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
                
                <div className="space-y-4">
                  <Link
                    to="/historique"
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Ticket size={20} className="text-primary-blue mr-3" />
                    <div>
                      <h3 className="font-medium">Mes billets</h3>
                      <p className="text-sm text-gray-600">Voir tous vos billets</p>
                    </div>
                  </Link>
                  
                  <Link
                    to="/offres"
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Ticket size={20} className="text-primary-red mr-3" />
                    <div>
                      <h3 className="font-medium">Acheter des billets</h3>
                      <p className="text-sm text-gray-600">Découvrir les offres disponibles</p>
                    </div>
                  </Link>
                  
                  <button
                    onClick={() => logout()}
                    className="flex items-center p-4 bg-red-50 rounded-lg w-full text-left hover:bg-red-100 transition-colors"
                  >
                    <AlertTriangle size={20} className="text-red-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-red-700">Déconnexion</h3>
                      <p className="text-sm text-red-600">Quitter votre session</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
