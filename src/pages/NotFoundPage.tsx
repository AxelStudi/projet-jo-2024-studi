import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Search className="w-24 h-24 text-gray-300" />
            <div className="absolute top-0 right-0 rounded-full bg-red-500 text-white w-8 h-8 flex items-center justify-center font-bold text-lg">
              ?
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Page non trouvée</h1>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary flex items-center justify-center">
            <HomeIcon size={18} className="mr-2" />
            Retour à l'accueil
          </Link>
          <Link to="/offres" className="btn btn-outline">
            Voir les offres
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;