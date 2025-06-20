# Plateforme de Billetterie Électronique - JO 2024

![React](https://img.shields.io/badge/React-18-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100-green?logo=fastapi) ![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python) ![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)

> **Note** : Ce projet est un projet d'étude et n'est pas une application officielle pour les Jeux Olympiques de Paris 2024.

Ce projet est une application web full-stack développée dans le cadre d'un cursus scolaire. Il s'agit d'une plateforme non-officielle de billetterie électronique pour les Jeux Olympiques de Paris 2024, dotée d'une interface utilisateur moderne et responsive, d'une authentification sécurisée et d'un backend administratif complet.

## 🌟 Fonctionnalités Principales

-   **Authentification Utilisateur** : Inscription, connexion et gestion de session sécurisées avec Supabase Auth.
-   **Achat de Billets** : Les utilisateurs peuvent parcourir les événements, ajouter des billets à leur panier et finaliser leur commande.
-   **Design Responsive** : Entièrement optimisé pour les ordinateurs de bureau, tablettes et appareils mobiles.
-   **Profils Utilisateurs** : Les utilisateurs authentifiés peuvent consulter leur profil et l'historique de leurs achats.
-   **Tableau de Bord Administrateur** : Une interface dédiée pour que les administrateurs puissent gérer les événements, les utilisateurs et consulter les statistiques de vente.
-   **E-Tickets avec QR Codes** : Génération de QR codes uniques pour chaque billet afin de faciliter la validation.
-   **Contrôle d'Accès Basé sur les Rôles** :
    -   **Visiteur** : Peut parcourir les événements et les offres de billets.
    -   **Utilisateur** : Peut acheter des billets et gérer son compte.
    -   **Admin** : A un contrôle total sur les données de la plateforme.

## 🛠️ Stack Technique

### Frontend
-   **Framework** : [React 18](https://reactjs.org/) avec [TypeScript](https://www.typescriptlang.org/)
-   **Outil de Build** : [Vite](https://vitejs.dev/)
-   **Styling** : [Tailwind CSS](https://tailwindcss.com/) avec des composants [Shadcn/ui](https://ui.shadcn.com/)
-   **Gestion d'État** : [Zustand](https://github.com/pmndrs/zustand)
-   **Routage** : [React Router](https://reactrouter.com/)
-   **UI/UX** : [Lucide React](https://lucide.dev/guide/packages/lucide-react) pour les icônes, [React Toastify](https://fkhadra.github.io/react-toastify/introduction) pour les notifications.

### Backend
-   **Framework** : [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11)
-   **Base de Données** : [PostgreSQL](https://www.postgresql.org/) gérée par [Supabase](https://supabase.com/)
-   **Authentification** : [Supabase Auth](https://supabase.com/docs/guides/auth) avec Row Level Security (RLS)

## 🚀 Démarrage

### Prérequis

-   [Node.js](https://nodejs.org/en/) (v18 ou supérieure)
-   [Python](https://www.python.org/downloads/) (v3.10 ou supérieure)
-   Un compte [Supabase](https://supabase.com/) pour obtenir vos clés d'API.
-   `pip` pour la gestion des paquets Python.

### Installation & Configuration

1.  **Clonez le dépôt :**
    ```bash
    git clone https://github.com/AxelStudi/projet-jo-2024-studi
    cd projet-jo-2024-main
    ```

2.  **Configurez le Frontend :**
    ```bash
    # Installez les dépendances
    npm install

    # Créez un fichier .env à la racine du projet et ajoutez vos variables Supabase
    touch .env
    ```
    Votre fichier `.env` pour le frontend doit contenir :
    ```env
    VITE_SUPABASE_URL="VOTRE_URL_SUPABASE"
    VITE_SUPABASE_ANON_KEY="VOTRE_CLE_ANON_SUPABASE"
    ```

3.  **Configurez le Backend :**
    Naviguez vers le dossier du backend et créez un environnement virtuel.
    ```bash
    cd backend-jo
    python -m venv venv
    source venv/bin/activate  # Sur Windows, utilisez `venv\Scripts\activate`

    # Installez les dépendances Python
    pip install -r requirements.txt

    # Créez un fichier .env dans le dossier `backend-jo`
    touch .env
    ```
    Votre fichier `.env` pour le backend doit contenir vos identifiants Supabase :
    ```env
    SUPABASE_URL="VOTRE_URL_SUPABASE"
    SUPABASE_KEY="VOTRE_CLE_SERVICE_ROLE_SUPABASE"
    DATABASE_URL="VOTRE_URL_DATABASE_SUPABASE"
    SECRET_KEY="VOTRE_CLE_SECRETE_JWT" # Générez une clé secrète robuste
    ```

### Lancement de l'Application

1.  **Démarrez le Frontend (serveur de développement Vite) :**
    Depuis le dossier racine :
    ```bash
    npm run dev
    ```
    Le frontend sera accessible à l'adresse `http://localhost:5173`. (ou sur le port 8080 si le port 5173 est occupé)

2.  **Démarrez le Backend (serveur FastAPI) :**
    Depuis le dossier `backend-jo` (avec l'environnement virtuel activé) :
    ```bash
    uvicorn main:app --reload
    ```
    L'API backend sera accessible à l'adresse `http://localhost:8000`.

## 🏗️ Structure du Projet

```
.
├── backend-jo/         # Code source du backend FastAPI
│   ├── app/
│   ├── venv/
│   ├── .env            # Variables d'environnement du backend
│   └── requirements.txt
├── public/             # Fichiers statiques pour le frontend
├── src/                # Code source du frontend React
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── stores/         # État global (Zustand)
│   ├── supabase/       # Configuration du client Supabase
│   └── main.tsx        # Point d'entrée de l'application
├── supabase/           # Configuration pour le développement local Supabase
│   └── migrations/
├── .env                # Variables d'environnement du frontend
├── package.json
└── README.md
```

## 🔐 Authentification & Sécurité

L'application s'appuie sur **Supabase** pour un système d'authentification robuste et sécurisé.
-   **Sessions JWT** : Gestion de session sécurisée à l'aide de JSON Web Tokens.
-   **Hachage de Mots de Passe** : Les mots de passe des utilisateurs sont automatiquement hachés.
-   **Row Level Security (RLS)** : Des politiques de sécurité au niveau des lignes de la base de données PostgreSQL sont appliquées pour garantir que les utilisateurs ne peuvent accéder qu'à leurs propres données. Ceci est configuré directement dans le tableau de bord Supabase.

---

N'hésitez pas à contribuer à ce projet en ouvrant des issues ou des pull requests.
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

