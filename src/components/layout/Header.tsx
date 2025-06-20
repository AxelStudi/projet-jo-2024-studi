import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown, Settings, BarChart3, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import olympicLogo from '../../assets/olympic-logo.svg';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsAdminMenuOpen(false);
  }, [location.pathname]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={olympicLogo || '/olympic-logo.svg'} 
              alt="Paris 2024 Logo" 
              className="h-10 md:h-12" 
            />
            <div className="ml-3">
              <span className="font-bold text-primary-dark text-lg md:text-xl">Paris 2024</span>
              <span className="hidden md:block text-xs text-gray-500">Jeux Olympiques</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-blue font-medium">
              Accueil
            </Link>
            <Link to="/offres" className="text-gray-700 hover:text-primary-blue font-medium">
              Billets
            </Link>
            
            {isAdmin && (
              <div className="relative">
                <button 
                  className="flex items-center text-gray-700 hover:text-primary-blue font-medium"
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  onBlur={() => setTimeout(() => setIsAdminMenuOpen(false), 200)}
                >
                  <span>Administration</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
                {isAdminMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <BarChart3 size={16} className="mr-2" />
                      Tableau de bord
                    </Link>
                    <Link to="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Users size={16} className="mr-2" />
                      Gestion des utilisateurs
                    </Link>
                    <Link to="/admin/offres" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Settings size={16} className="mr-2" />
                      Gestion des offres
                    </Link>
                    <Link to="/admin/transactions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <ShoppingCart size={16} className="mr-2" />
                      Transactions
                    </Link>
                    <Link to="/admin/ventes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <BarChart3 size={16} className="mr-2" />
                      Statistiques de ventes
                    </Link>
                    <Link to="/admin/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <BarChart3 size={16} className="mr-2" />
                      Rapports et analyses
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/panier" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            {/* User Menu (Desktop) */}
            {isAuthenticated ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                  className="flex items-center text-gray-700 hover:text-primary-blue"
                >
                  <User className="w-6 h-6 mr-1" />
                  <span className="font-medium">{user?.first_name}</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <Link to="/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mon Profil
                    </Link>
                    <Link to="/historique" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mes Billets
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/connexion" className="text-gray-700 hover:text-primary-blue font-medium">
                  Connexion
                </Link>
                <span className="text-gray-400">|</span>
                <Link to="/inscription" className="text-gray-700 hover:text-primary-blue font-medium">
                  Inscription
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <Link to="/" className="block py-2 text-gray-700">Accueil</Link>
            <Link to="/offres" className="block py-2 text-gray-700">Billets</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/profil" className="block py-2 text-gray-700">Mon Profil</Link>
                <Link to="/historique" className="block py-2 text-gray-700">Mes Billets</Link>
                {isAdmin && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Administration</p>
                      <Link to="/admin/dashboard" className="block py-2 text-gray-700 pl-4">Tableau de bord</Link>
                      <Link to="/admin/users" className="block py-2 text-gray-700 pl-4">Utilisateurs</Link>
                      <Link to="/admin/offres" className="block py-2 text-gray-700 pl-4">Offres</Link>
                      <Link to="/admin/transactions" className="block py-2 text-gray-700 pl-4">Transactions</Link>
                      <Link to="/admin/ventes" className="block py-2 text-gray-700 pl-4">Statistiques</Link>
                      <Link to="/admin/reports" className="block py-2 text-gray-700 pl-4">Rapports</Link>
                    </div>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-500 flex items-center border-t pt-2 mt-2"
                >
                  <LogOut size={16} className="mr-2" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="block py-2 text-gray-700">Connexion</Link>
                <Link to="/inscription" className="block py-2 text-gray-700">Inscription</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;