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

- Le joueur commence avec 10 vies.
- Un pays cible est tiré aléatoirement et affiché ("Trouve : France").
- Le joueur clique sur la carte :
  - Bon pays → il passe en vert, on tire un nouveau pays cible.
  - Mauvais pays → perte d'une vie + feedback "chaud/froid".
- Fin de partie à 0 vie. Score = nombre de pays trouvés.

### Feedback chaud/froid

À chaque erreur, on calcule la distance (Haversine) entre le centroïde du
pays cliqué et celui du pays cible, et on affiche un niveau :
Brûlant (<500km) / Chaud (<1500km) / Tiède (<3000km) / Froid (<6000km) / Glacé (>6000km).
Affichage : texte + emoji + une jauge visuelle qui se remplit selon la proximité.

## Fonctionnalités prévues (roadmap)

1. [FAIT] Carte du monde affichée, cliquable, colorée (océan bleu, terres sable).
2. [FAIT] Zoom + déplacement (pan) via ZoomableGroup.
3. [EN COURS] Boucle de jeu : vies, cible aléatoire, feedback chaud/froid.
4. [À FAIRE] Écran de configuration : choisir zone (Europe, Asie...),
   nombre de pays, filtres spéciaux (pays enclavés, îles...).
5. [À FAIRE] Comptes utilisateurs + sauvegarde des stats/scores.
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
- **Base de données** (à venir) : PostgreSQL + Prisma, via Neon ou Supabase.
- **Auth** (à venir) : NextAuth.
- **IA** (à venir) : API Anthropic (pay-as-you-go).
- **Déploiement** : Vercel (déploiement auto à chaque push sur main).
- **Repo** : GitHub, compte perso `vleo-dev` (⚠️ pas le compte pro `fs-leo`).

## Conventions & organisation

- Couleurs JS (dynamiques selon l'état du jeu) : `lib/theme.ts`.
- Couleurs CSS (statiques) : variables CSS dans `app/globals.css` (--color-\*).
- Fonctions géo (distance, niveaux de feedback) : `lib/geo.ts`.
- Alias d'import `@/` pointe vers la racine.

## Contraintes / notes

- react-simple-maps n'est pas officiellement compatible React 19 :
  `.npmrc` contient `legacy-peer-deps=true` pour que l'install passe (local + Vercel).
- Workflow : dev en local (`npm run dev` → localhost:3000), puis commit + push,
  Vercel redéploie automatiquement.
