
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAuthActions } from '../hooks/useAuth';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { register, clearError } = useAuthActions();
  const { isLoading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirige si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profil', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Nettoyer les erreurs en quittant la page
  useEffect(() => {
    return () => {
      if (useAuthStore.getState().error) {
        clearError();
      }
    };
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const passwordCriteria = [
    { label: 'Au moins 12 caractères', met: formData.password.length >= 12 },
    { label: 'Au moins une lettre majuscule', met: /[A-Z]/.test(formData.password) },
    { label: 'Au moins un chiffre', met: /[0-9]/.test(formData.password) },
    { label: 'Au moins un caractère spécial', met: /[!@#$%^&*]/.test(formData.password) }
  ];

  const isPasswordValid = passwordCriteria.every(criterion => criterion.met);
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError('');

    if (!isPasswordValid) {
      setPasswordError('Votre mot de passe ne respecte pas les critères de sécurité.');
      return;
    }

    if (!doPasswordsMatch) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    const success = await register(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );

    if (success) {
      // La redirection est maintenant gérée par le retour de la fonction register
      // On ajoute un petit délai pour que le toast de succès soit visible par l'utilisateur
      setTimeout(() => {
        navigate('/connexion', { replace: true });
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Créer un compte</h1>
              <p className="text-gray-600 mt-1">
                Inscrivez-vous pour réserver vos billets des JO
              </p>
            </div>

            {(error || passwordError) && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                {error || passwordError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="input"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Prénom"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="input"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Nom"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {passwordCriteria.map((criterion, index) => (
                    <div key={index} className="flex items-center text-sm">
                      {criterion.met ? (
                        <CheckCircle size={16} className="text-green-500 mr-2" />
                      ) : (
                        <XCircle size={16} className="text-gray-400 mr-2" />
                      )}
                      <span>{criterion.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input pr-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password.length > 0 && formData.confirmPassword.length > 0 && (
                  <div className="flex items-center text-sm mt-2">
                    {doPasswordsMatch ? (
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                    ) : (
                      <XCircle size={16} className="text-red-500 mr-2" />
                    )}
                    <span>Les mots de passe correspondent</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
              >
                {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link to="/connexion" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Connectez-vous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
