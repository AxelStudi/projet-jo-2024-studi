# Paris 2024 Olympics E-Ticketing Platform

### !!!! Projet scorlaire !!!!

Application non-officielle de billetterie électronique pour les Jeux Olympiques de Paris 2024.

## 🌟 Fonctionnalités

- 🎫 Achat de billets sécurisé
- 👥 Gestion des comptes utilisateurs
- 🔒 Authentification à deux facteurs (2FA)
- 📱 Interface responsive
- 🎯 Différentes offres (Solo, Duo, Famille)
- 📊 Tableau de bord administrateur
- 🔍 Recherche et filtrage des offres
- 🛒 Panier d'achat
- 📱 E-tickets avec QR codes

## 🛠️ Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase (PostgreSQL)
- Lucide React
- React Router
- Zustand
- React Toastify

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase

## 🚀 Installation

1. Cloner le repository :
```bash
git clone [url-du-repo]
cd paris-olympics-eticket
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

## 🏗️ Structure du Projet

```
paris-olympics-eticket/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/         # Pages de l'application
│   ├── stores/        # État global (Zustand)
│   ├── supabase/      # Configuration Supabase
│   └── assets/        # Images et ressources
├── supabase/
│   └── migrations/    # Migrations de base de données (PostgreSQL)
└── public/           # Fichiers statiques
```

## 🔐 Authentification

L'application utilise Supabase pour l'authentification avec :
- Connexion par email/mot de passe
- Support 2FA (TOTP)
- Gestion des sessions
- Politiques de sécurité (RLS)

## 👥 Rôles Utilisateurs

- **Visiteur** : Consultation des offres
- **Utilisateur** : Achat de billets, gestion du profil
- **Administrateur** : Gestion des offres, statistiques

## 🎫 Gestion des Billets

- Génération de QR codes uniques
- Validation des billets
- Historique des achats
- Export PDF

## 📱 Interface Responsive

L'application est optimisée pour :
- Ordinateurs de bureau
- Tablettes
- Smartphones

## 🔄 État Global

Gestion de l'état avec Zustand pour :
- Authentification
- Panier d'achat
- Préférences utilisateur

## 🛡️ Sécurité

- Protection CSRF
- Validation des données
- Authentification à deux facteurs
- Politiques RLS Supabase
- Tokens JWT

## 📦 Production

Pour construire l'application pour la production :

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.


## Note importante

Ce site a été réalisé dans le cadre d’un projet scolaire. Toutes les informations qu’il contient sont fictives et ont été volontairement modifiées afin d’éviter toute confusion avec des sources officielles.
Les droits relatifs au contenu original appartiennent exclusivement aux propriétaires du site officiel des Jeux Olympiques.
Pour toute information authentique, veuillez consulter le site officiel des Jeux Olympiques de Paris 2024 (déjà passés) : https://www.olympics.com/cio/paris-2024

