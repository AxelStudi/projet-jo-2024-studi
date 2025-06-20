import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, FacebookIcon, TwitterIcon, InstagramIcon } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary-dark text-white mt-12">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">Paris 2024</h3>
            <p className="text-gray-300 mb-4">
              Les Jeux Olympiques de Paris 2024 sont l'événement sportif le plus attendu de l'année. Réservez vos billets officiels dès maintenant !
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-300 hover:text-white">
                <FacebookIcon size={20} />
              </a>
              <a href="https://twitter.com" className="text-gray-300 hover:text-white">
                <TwitterIcon size={20} />
              </a>
              <a href="https://instagram.com" className="text-gray-300 hover:text-white">
                <InstagramIcon size={20} />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Accueil</Link>
              </li>
              <li>
                <Link to="/offres" className="text-gray-300 hover:text-white">Billets</Link>
              </li>
              <li>
                <Link to="/panier" className="text-gray-300 hover:text-white">Panier</Link>
              </li>
              <li>
                <Link to="/connexion" className="text-gray-300 hover:text-white">Connexion</Link>
              </li>
              <li>
                <Link to="/inscription" className="text-gray-300 hover:text-white">Inscription</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">96 Boulevard Kellermann, 75013 Paris, France</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 flex-shrink-0" />
                <span className="text-gray-300">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 flex-shrink-0" />
                <span className="text-gray-300">contact@paris2024-tickets.fr</span>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-4">Informations légales</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Conditions générales</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Politique de confidentialité</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Mentions légales</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Politique de cookies</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} Paris 2024 - Jeux Olympiques. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;