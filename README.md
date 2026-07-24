# Content SaaS

Plateforme de génération de contenu assistée par IA, développée dans le cadre d'un Projet de Fin d'Année (PFA) / stage de fin d'études.

🔗 **Démo en ligne :** [https://content-saas-two.vercel.app](https://content-saas-two.vercel.app)

## Sommaire

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Déploiement](#déploiement)

## Présentation

Content SaaS permet à un utilisateur de générer, sauvegarder et exporter du contenu textuel (articles, titres, descriptions, hashtags, résumés, traductions...) à l'aide de l'intelligence artificielle, avec une gestion de projets, un historique complet, un mode chat conversationnel, et l'analyse de documents PDF/DOCX.

## Stack technique

- **Framework** : Next.js (App Router, Turbopack)
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **Authentification** : NextAuth v4 (Credentials Provider)
- **Base de données** : PostgreSQL (Neon), via Prisma ORM
- **IA** : OpenRouter (modèle `openai/gpt-oss-20b:free`)
- **Extraction de documents** : `pdf-parse` (PDF), `mammoth` (DOCX)
- **Génération de PDF côté client** : `jsPDF`
- **Déploiement** : Vercel

## Fonctionnalités

### Authentification & compte
- Inscription et connexion sécurisées (mots de passe hachés avec `bcryptjs`)
- Gestion du profil (modification du nom, changement de mot de passe)

### Gestion de projets
- Création, modification, suppression et recherche de projets

### Génération de contenu IA
- Types de contenu : texte, titres, description, hashtags, résumé, reformulation, traduction
- Choix du ton (professionnel, marketing, humoristique, décontracté)
- Paramètres avancés : longueur, langue, niveau de créativité

### Upload et analyse de documents
- Upload de fichiers PDF ou DOCX
- Extraction automatique du texte, réutilisable comme source de génération

### Historique et sauvegarde
- Chaque génération est automatiquement sauvegardée et liée à l'utilisateur (et optionnellement à un projet)
- Consultation, copie, export TXT, export PDF et suppression depuis l'historique

### Chat IA
- Conversations multiples par utilisateur, avec historique persistant
- Création, sélection et suppression de conversations

### Tableau de bord
- Statistiques et activité récente de l'utilisateur

## Installation locale

### Prérequis
- Node.js 18+
- Un compte [Neon](https://neon.tech) (ou toute base PostgreSQL)
- Une clé API [OpenRouter](https://openrouter.ai)

### Étapes

```bash
git clone https://github.com/ayaofd/content-saas.git
cd content-saas
npm install
```

Crée un fichier `.env.local` à la racine (voir la section [Variables d'environnement](#variables-denvironnement)).

Génère le client Prisma et pousse le schéma sur ta base :

```bash
npx prisma generate
npx prisma db push
```

Lance le serveur de développement :

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL (pooled, utilisée par l'application) |
| `DIRECT_URL` | URL de connexion directe PostgreSQL (utilisée par Prisma Migrate) |
| `NEXTAUTH_SECRET` | Clé secrète pour signer les sessions NextAuth |
| `NEXTAUTH_URL` | URL de base de l'application (`http://localhost:3000` en local, l'URL Vercel en production) |
| `OPENROUTER_API_KEY` | Clé API OpenRouter pour les appels IA |

## Structure du projet

```
content-saas/
├── app/
│   ├── api/              # Routes API (auth, user, projects, generate, history, chat, conversations, documents)
│   ├── chat/             # Interface de chat IA
│   ├── dashboard/        # Tableau de bord
│   ├── generate/         # Génération de contenu IA
│   ├── login/ register/  # Authentification
│   ├── profile/          # Profil utilisateur
│   └── projects/         # Gestion des projets
├── components/           # Composants réutilisables (Navbar, HistoryList...)
├── lib/                  # Utilitaires (auth, prisma, openrouter)
├── prisma/
│   └── schema.prisma     # Schéma de base de données
└── .env.local            # Variables d'environnement (non versionné)
```

## Déploiement

Le projet est déployé sur **Vercel**, connecté au dépôt GitHub. Chaque push sur la branche `main` déclenche un redéploiement automatique.

Les variables d'environnement doivent être configurées dans **Project Settings → Environments** sur Vercel, avec `NEXTAUTH_URL` pointant vers le domaine de production.

---

Projet réalisé dans le cadre d'un PFA / stage de fin d'études.
