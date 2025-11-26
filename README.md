# Taskzz - Sayan Lakhoua

## GitHub
Accès au GitHub via: 

Application React permettant de gérer des listes de tâches (Taskzz) avec authentification et synchronisation via l'API `https://2502.ict-expert.ch/api`.

## Aperçu
- Connexion / inscription pour accéder à ses rappels.
- Création, édition, suppression et visualisation détaillée des tâches.
- Listes personnalisées avec couleurs, filtres par priorité/statut/date et archive.
- Interface bilingue (EN/FR) avec mémorisation de la langue dans le navigateur.

## Prérequis
- Accès à l'API distante (jeton retour d'authentification).

## Installation
```bash
npm install
```

## Scripts utiles
- `npm start` : lance l'app en développement sur `http://localhost:3000`.
- `npm run build` : génère la version production dans le dossier `build/`.
- `npm test` : exécute la suite de tests fournie par `react-scripts`.

## Déploiement
1. Exécuter `npm run build`.
2. Déployer le contenu du dossier `build/` sur l'hébergement statique de votre choix.
3. Vérifier que le serveur API autorise l'origine de production (CORS) et que la variable `API_BASE_URL` pointe vers l'API correcte.

## Structure rapide
- `src/App.js` : logique principale (listes, tâches, modales, filtres).
- `src/Login.js` : écran d'authentification.
- `src/translations.js` : dictionnaire bilingue.
- `public/.htaccess` : configuration CORS exemple pour l'API Apache.

Pour toute question ou amélioration, ouvrez une issue ou contactez le mainteneur.

