# Tests API pour l'application JO 2024

Ce dossier contient des tests automatisés pour tous les endpoints de l'API de l'application JO 2024. Les tests couvrent l'ensemble des fonctionnalités, y compris l'authentification, la gestion des offres, les réservations et les billets électroniques.

## Structure

- `setup.ts` - Configuration globale pour les tests, incluant les URLs et identifiants de test
- `api/auth.test.ts` - Tests pour l'authentification (inscription, connexion, profil)
- `api/offers.test.ts` - Tests pour la gestion des offres
- `api/reservations.test.ts` - Tests pour les réservations et le processus de checkout
- `api/etickets.test.ts` - Tests pour les billets électroniques
- `api/admin-users.test.ts` - Tests pour les opérations d'administration des utilisateurs

## Prérequis

- Node.js v18 ou supérieur
- npm ou yarn

## Installation

Les dépendances nécessaires sont :
- Jest - Framework de test JavaScript
- Supertest - Tests HTTP
- Axios - Client HTTP pour les requêtes d'API
- ts-jest - Support TypeScript pour Jest

Elles sont déjà installées dans le projet. Si vous avez besoin de les réinstaller :

```bash
npm install
```

## Exécution des tests

### Exécuter tous les tests

```bash
npm test
```

### Mode watch (développement)

```bash
npm run test:watch
```

### Générer un rapport de couverture

```bash
npm run test:coverage
```

Le rapport sera disponible dans le dossier `coverage/`.

## Intégration continue

Les tests sont automatiquement exécutés à chaque push sur GitHub via GitHub Actions. Le workflow est défini dans `.github/workflows/api-tests.yml`.

Le workflow :
1. Exécute tous les tests
2. Génère un rapport de couverture
3. Publie les résultats sur GitHub

Pour voir les résultats des tests dans GitHub Actions, allez dans l'onglet "Actions" de votre dépôt GitHub.

## Notes importantes

- Ces tests utilisent une API distante réelle et ne modifient pas la structure de la base de données.
- Les tests utilisent des comptes de test prédéfinis (un utilisateur standard et un administrateur).
- Certains tests peuvent être ignorés s'ils nécessitent des données spécifiques qui ne sont pas disponibles.
- Pour les tests de checkout, des offres existantes sont utilisées sans modifier la base de données.

## Credentials de test

Les comptes suivants sont utilisés pour les tests :

- **Admin** : admin@paris2024.fr / Administration123!
- **Utilisateur** : user@test.fr / Utilisateur123!

## URL de l'API

L'API est disponible à l'adresse : `https://neighbouring-fina-axelstudi-848fdaf7.koyeb.app/api/v1`
