# Revision App - Spaced Repetition

Une app de révision basée sur la technique du spaced repetition (10m → 1j → 7j → 1m → 3m → 1an → 2ans → 5ans → completed).

### Setup

```bash
# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env.local
# Remplir DATABASE_URL avec ta connection string Supabase

# Générer le schema Prisma depuis Supabase
npx prisma db pull

# Pousser les schémas better-auth
npx prisma migrate dev --name init
```

### Lancer le serveur dev

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## Stack

- **Framework:** Next.js 15 + TypeScript
- **Auth:** better-auth
- **DB:** Supabase + Prisma
- **Validation:** Zod
- **CSS:** Tailwind CSS
- **Notifications:** ntfy

## Features

- ⏳ Authentification (email/password)
- ⏳ Créer des notes=
- ⏳ Réviser avec 3 actions: weak/again/good
- ⏳ Historique de révisions
- ⏳ Notifications de révision
