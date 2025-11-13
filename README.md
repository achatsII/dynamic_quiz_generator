<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dynamic Quiz Builder

Application de création et gestion de quiz interactifs avec liens partageables sécurisés.

View your app in AI Studio: https://ai.studio/apps/drive/1xJUhlLReM_6ZL38eoyerWEIS9UEVf7jl

## 🚀 Fonctionnalités

- ✅ Création de quiz via interface admin
- ✅ Liens partageables publics (embeddables en iframe)
- ✅ Soumission de résultats sécurisée
- ✅ Token API caché côté serveur (Vercel Serverless Functions)
- ✅ Tableau de bord des résultats

## 🏃 Run Locally

**Prerequisites:** Node.js, pnpm

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configurez les variables d'environnement dans [.env.local](.env.local):
   ```bash
   GEMINI_API_KEY=your_gemini_key
   API_BASE_URL=https://qa.gateway.intelligenceindustrielle.com/api/v1
   BEARER_TOKEN=your_secure_token
   QUIZ_DATA_TYPE=quizzes
   QUIZ_RESULT_DATA_TYPE=quiz-results
   APP_IDENTIFIER=quiz-app-dynamic-builder
   ```

3. Lancez le backend (développement local):
   ```bash
   node server.js
   ```

4. Dans un autre terminal, lancez le frontend:
   ```bash
   npm run dev:frontend
   ```

5. Ouvrez http://localhost:5174

## 🌐 Deploy to Vercel

### 1. Installez Vercel CLI (optionnel)
```bash
npm i -g vercel
```

### 2. Configurez les variables d'environnement dans Vercel Dashboard

Allez dans **Settings → Environment Variables** et ajoutez:

| Variable | Value |
|----------|-------|
| `API_BASE_URL` | `https://qa.gateway.intelligenceindustrielle.com/api/v1` |
| `BEARER_TOKEN` | Votre token secret (⚠️ SENSIBLE) |
| `QUIZ_DATA_TYPE` | `quizzes` |
| `QUIZ_RESULT_DATA_TYPE` | `quiz-results` |
| `APP_IDENTIFIER` | `quiz-app-dynamic-builder` |

### 3. Déployez

**Option A - Via Vercel Dashboard:**
1. Connectez votre repo GitHub à Vercel
2. Vercel détectera automatiquement Vite
3. Deploy!

**Option B - Via CLI:**
```bash
vercel --prod
```

### 4. C'est déployé! 🎉

Votre app sera disponible sur: `https://your-app.vercel.app`

Les liens partageables ressembleront à: `https://your-app.vercel.app/#/shared/{quizId}`

## 📁 Structure

```
├── api/                      # Vercel Serverless Functions (backend)
│   ├── quiz/
│   │   ├── [quizId].js      # GET quiz by ID
│   │   └── submit.js        # POST submit result
│   ├── quizzes.js           # GET/POST quizzes
│   └── results.js           # GET results
├── components/
│   ├── AdminPage.tsx        # Admin interface
│   ├── QuizPage.tsx         # Quiz interface (auth)
│   └── PublicQuiz.tsx       # Public quiz (iframe-embeddable)
├── services/
│   └── apiService.ts        # API client
├── server.js                # Express server (dev only)
└── vercel.json              # Vercel config
```

## 🔒 Sécurité

Le `BEARER_TOKEN` n'est **jamais exposé au client**. Toutes les requêtes passent par les Vercel Serverless Functions qui ajoutent le token côté serveur.

## 🎯 Liens partageables

Chaque quiz a un lien partageable accessible via:
- Admin → Liste des quiz → bouton "📋 Copier"
- Format: `https://your-app.vercel.app/#/shared/{quizId}`
- Aucune authentification requise
- Embeddable dans un iframe
