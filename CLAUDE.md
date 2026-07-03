# GeoClic — Jeu de géographie interactif

## Contexte du projet

Projet portfolio pour une recherche d'emploi de développeur full-stack.
Objectif : démontrer des compétences modernes (React, TypeScript, full-stack,
intégration IA) au-delà de mon expérience actuelle en WordPress/Drupal.
Le projet doit être complet, soigné, et démontrable en ligne pour des recruteurs.

## Concept du jeu

Jeu de géographie sur carte du monde interactive. Le joueur doit cliquer
au bon endroit sur la carte pour localiser un pays demandé.

### Boucle de jeu

- Le joueur choisit une difficulté (Facile 20 vies / Moyen 10 / Difficile 5)
  et une zone (Monde entier ou un continent) via le menu réglages (roue crantée,
  en haut à droite).
- Un pays cible est tiré aléatoirement dans la zone choisie et affiché dans une
  carte flottante ("pop-in") en haut de l'écran, avec drapeau + nom en français.
- Le joueur clique sur la carte :
  - Bon pays → il passe en vert, on tire un nouveau pays cible.
  - Mauvais pays → perte d'une vie + feedback "chaud/froid".
- Fin de partie à 0 vie, ou quand tous les pays de la zone sont trouvés.
  Score = nombre de pays trouvés.
- Changer la difficulté ou la zone relance une nouvelle partie.

### Feedback chaud/froid

À chaque erreur, on calcule la distance (Haversine) entre le centroïde du
pays cliqué et celui du pays cible, et on affiche un niveau :
Brûlant (<500km) / Chaud (<1500km) / Tiède (<3000km) / Froid (<6000km) / Glacé (>6000km).
Affichage : texte + emoji + une jauge visuelle qui se remplit selon la proximité.

### Thèmes & habillage

- 3 thèmes visuels (Classique / Sombre / Pastel) sélectionnables via le menu
  burger en haut à gauche : océan (dégradé), palette de 5 couleurs de terres,
  couleurs d'accent (survol, trouvé, erreur, pin).
- Les pays sont coloriés avec 5 couleurs par thème via un algorithme de
  coloration de graphe (deux pays adjacents n'ont jamais la même couleur).
- Les micro-États trop petits pour apparaître sur la carte 110m (Vatican,
  Monaco, Andorre, Saint-Marin, Liechtenstein, Malte, Singapour...) sont
  ajoutés sous forme de pins cliquables (28 au total).

### Comptes & historique

- Connexion par OAuth (GitHub, Google) ou email/mot de passe (NextAuth v5 /
  Auth.js), avec sessions JWT (nécessaire pour faire cohabiter Credentials
  et les providers OAuth avec un adapter).
- Bouton compte flottant en bas à droite (`components/AccountButton`) :
  connexion si déconnecté, avatar + menu (historique, déconnexion) sinon.
- Chaque partie terminée (victoire ou 0 vie) est enregistrée pour
  l'utilisateur connecté (date, score, difficulté, zone, durée) et
  consultable sur `/historique`.

## Fonctionnalités prévues (roadmap)

1. [FAIT] Carte du monde affichée, cliquable, colorée, thèmes visuels.
2. [FAIT] Zoom + déplacement (pan) via ZoomableGroup.
3. [FAIT] Boucle de jeu : vies, cible aléatoire, feedback chaud/froid.
4. [FAIT] Écran de configuration : difficulté (nombre de vies) + zone
   (continent). [À FAIRE] filtres spéciaux (pays enclavés, îles...).
5. [FAIT] Comptes utilisateurs (OAuth + email/mdp) + historique complet
   des parties.
6. [À FAIRE] Intégration IA (API Anthropic) :
   - Génération de défis thématiques dynamiques ("pays méditerranéens"...).
   - Indices contextuels si le joueur bloque.
   - Anecdotes générées après avoir trouvé un pays.

## Stack technique

- **Framework** : Next.js (App Router) + TypeScript
- **Styles** : CSS Modules en SCSS (.module.scss). Tailwind dispo mais non utilisé pour l'instant.
- **Carte** : react-simple-maps (ComposableMap, Geographies, Geography, ZoomableGroup)
  - d3-geo (geoCentroid) + topojson-client.
- **Données géo** : TopoJSON world-atlas via CDN jsdelivr (pour l'instant, à rapatrier en local plus tard).
- **Base de données** : PostgreSQL via Neon + Prisma (v6.x — pas v7, qui
  exige Node ≥20.19 alors que la machine de dev tourne en 20.10).
- **Auth** : NextAuth v5 / Auth.js (`next-auth@beta`), `@auth/prisma-adapter`,
  `bcryptjs` pour les mots de passe.
- **IA** (à venir) : API Anthropic (pay-as-you-go).
- **Déploiement** : Vercel (déploiement auto à chaque push sur main).
- **Repo** : GitHub, compte perso `vleo-dev` (⚠️ pas le compte pro `fs-leo`).

## Conventions & organisation

- Couleurs JS (thèmes, dynamiques selon l'état du jeu) : `lib/theme.ts`.
- Fonctions géo (distance, niveaux de feedback) : `lib/geo.ts`.
- Coloration de la carte (graph coloring) : `lib/mapColoring.ts`.
- Micro-États hors dataset 110m (pins) : `lib/microStates.ts`.
- Noms français + drapeaux par pays (généré offline, pas de dépendance
  runtime) : `lib/countryInfo.ts`.
- Continent par pays (généré offline) : `lib/continents.ts`.
- Difficulté / zones sélectionnables : `lib/difficulty.ts`, `lib/zones.ts`.
- Composants UI flottants : `components/BurgerMenu` (thèmes, haut gauche),
  `components/SettingsMenu` (difficulté/zone, haut droit),
  `components/CountryCard` (pays cible + vies + feedback, pop-in en haut).
- Alias d'import `@/` pointe vers la racine.
- Données statiques générées offline (noms FR, drapeaux, continents) : script
  ponctuel avec `i18n-iso-countries`/`countries-list` installés puis
  désinstallés — ne pas les laisser en dépendance runtime (poids bundle).
- Auth/DB : `auth.ts` (config NextAuth), `prisma/schema.prisma` (modèles
  User/Account/Session/VerificationToken/GameHistory), `lib/prisma.ts`
  (singleton PrismaClient). Routes : `app/api/auth/[...nextauth]`,
  `app/api/register`, `app/api/games`. Pages : `app/login`, `app/register`,
  `app/historique`. `components/Providers` englobe l'app dans un
  `SessionProvider` (branché dans `app/layout.tsx`).

## Contraintes / notes

- react-simple-maps n'est pas officiellement compatible React 19 :
  `.npmrc` contient `legacy-peer-deps=true` pour que l'install passe (local + Vercel).
- Workflow : dev en local (`npm run dev` → localhost:3000), puis commit + push,
  Vercel redéploie automatiquement.
- Auth/DB nécessitent des credentials externes non fournis par Claude :
  `.env.local` (voir `.env.example`) avec `DATABASE_URL` (projet Neon),
  `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_GITHUB_ID/SECRET` et
  `AUTH_GOOGLE_ID/SECRET` (apps OAuth GitHub/Google, callback
  `http://localhost:3000/api/auth/callback/{github,google}` en local).
  Une fois renseigné : `npx prisma migrate dev --name init` pour créer les
  tables. Penser à ajouter les mêmes variables (avec les callback URLs de
  prod) dans les env vars Vercel avant déploiement.
