import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Award, Users } from 'lucide-react';

const featuredEvents = [
  {
    id: 1,
    name: 'Natation',
    description: 'Finales 100m et 200m',
    image: 'https://images.pexels.com/photos/260598/pexels-photo-260598.jpeg',
    date: '28 juillet 2024',
    location: 'Centre Aquatique Olympique'
  },
  {
    id: 2,
    name: 'Athlétisme',
    description: 'Sprint et saut en longueur',
    image: 'https://images.pexels.com/photos/3764014/pexels-photo-3764014.jpeg',
    date: '3 août 2024',
    location: 'Stade de France'
  },
  {
    id: 3,
    name: 'Gymnastique',
    description: 'Finales individuelles',
    image: 'https://images.pexels.com/photos/3917684/pexels-photo-3917684.jpeg',
    date: '7 août 2024',
    location: 'Bercy Arena'
  }
];

const highlights = [
  {
    icon: <Calendar className="w-12 h-12 text-primary-blue" />,
    title: 'Du 26 juillet au 11 août 2024',
    description: '17 jours de compétitions exceptionnelles dans la ville lumière'
  },
  {
    icon: <MapPin className="w-12 h-12 text-primary-red" />,
    title: '35 sites de compétition',
    description: 'Répartis dans Paris et sa région pour profiter pleinement de l\'expérience'
  },
  {
    icon: <Award className="w-12 h-12 text-gold" />,
    title: '329 épreuves',
    description: 'Des performances sportives d\'exception dans 32 sports différents'
  },
  {
    icon: <Users className="w-12 h-12 text-primary-dark" />,
    title: '10 500 athlètes',
    description: 'Venant de plus de 200 pays pour participer à cette fête du sport mondial'
  }
];

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Réservez vos <span className="gold-text">billets officiels</span> pour les Jeux Olympiques de Paris 2024
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Une expérience unique pour assister aux plus grands événements sportifs du monde
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/offres" className="btn btn-primary text-lg px-8 py-3">
              Voir les offres
            </Link>
            <a href="#featured" className="btn btn-outline text-lg px-8 py-3 text-white border-white hover:bg-white/10">
              Découvrir les événements
            </a>
          </div>
        </div>
      </section>
      
      {/* Highlights Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Les Jeux Olympiques en chiffres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Events */}
      <section id="featured" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Événements phares</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Découvrez les compétitions les plus attendues des Jeux Olympiques de Paris 2024 et réservez vos billets dès maintenant.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div key={event.id} className="card overflow-hidden group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-gray-700 mb-4">{event.description}</p>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar size={16} className="mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/offres" className="btn btn-primary">
              Voir toutes les offres de billets
            </Link>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-primary-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à vivre l'expérience olympique ?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Réservez dès maintenant vos e-billets sécurisés pour les Jeux Olympiques de Paris 2024.
          </p>
          <Link to="/offres" className="btn bg-white text-primary-blue hover:bg-gray-100 text-lg px-8 py-3">
            Réserver maintenant
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;