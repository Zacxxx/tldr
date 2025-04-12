# **App Name**: TL;DR – AI-Powered Summarizer

## Core Features:

- Intelligent URL Input: The user enters a URL (article, video, tweet, thread, etc.). The system automatically detects the type of content via an intelligent parsing layer.
- Contextual AI Summarization (Gemini): Uses Gemini (via Google AI Studio) to generate summaries adapted to the format of the detected content. Dynamic prompts depending on the tone and type of support: informative, synthetic, poetic, humorous... The LLM should use its tool to first determine the content type.
- Clean and Readable Display: Summary displayed in a clear, concise format optimized for quick reading. Option to reformat or customize the tone to come (MVP+).
- Support via Donations: Integration of a donation button (Ko-Fi, BuyMeACoffee). Transparent and free approach, without a premium model.

## Style Guidelines:

- Background: Pure white or very light gray for visual comfort.
- Text: Anthracite gray or black for high contrast.
- Accent: Teal #008080 for interactive elements (buttons, links, highlights).
- Single-column interface, focused on the reading experience. Summary displayed at the top, with source details at the bottom.
- Use of fluid micro-animations (loading, transitions).
- Minimalist vector icons to represent the types of content.

## Original User Request:
Fait l’architecture backend simple du site suivant : 

Tldr : un site ia qui résume tout en quelques lignes, articles, vidéos ou même threads et forum topics 

L’idée première du site est d’utiliser Gemini pour faire tout ça à moindre coût, gratuit mais fonctionnement en donations comme Wikipedia 


ChatGPT a dit :
Voici une architecture backend simple et évolutive pour ton site "Tldr", qui utilise Gemini pour résumer différents types de contenus (articles, vidéos, threads, forums), tout en étant optimisé pour un coût minimal et un fonctionnement basé sur les donations.

1. Stack technique suggérée
Backend : Node.js (Express) ou Fastify

Langage : TypeScript (robuste et propre)

Base de données : PostgreSQL (ou SQLite si MVP)

Queue de tâches : BullMQ (Redis) pour la gestion des résumés

Stockage : Supabase (Postgres + CDN pour les logs/fichiers)

Auth : Clerk, Supabase Auth ou OAuth minimaliste (email/token)

API IA : Gemini API (via Google AI Studio ou Vertex AI)

Serveur : Vercel, Railway ou Render (auto-scaling & low-cost)

2. Architecture générale (MVP)
2.1. Frontend (pour contexte)
Framework : Next.js

UI : TailwindCSS + shadcn/ui

Input : URL, texte brut, vidéo (YouTube), thread X/Twitter, topic de forum (Reddit, Discourse…)

Résultat : résumé de 3 à 5 lignes avec options (style, ton, etc.)

2.2. Backend - Vue simplifiée
plaintext
Copier
Modifier
[Client]
   |
   | POST /summarize (URL, texte ou ID vidéo/thread)
   |
[API Gateway / Next.js API route]
   |
   |--> Auth Middleware (optionnel)
   |
   |--> Rate Limiter (pour usage gratuit)
   |
   |--> Parser Service (extraction texte brut selon type de contenu)
   |
   |--> Gemini Service (résume via API)
   |
   |--> Store Résumé en base (PostgreSQL)
   |
   |--> Return Résumé au client
3. Modules Backend
A. Parser Service
Détecte automatiquement le type de contenu (URL YouTube, lien X, Reddit, texte brut…)

Utilise des extracteurs :

youtube-transcript API ou Puppeteer

unfurl.js / cheerio pour scraper les articles

API Twitter/X (si dispo) ou puppeteer

Reddit API ou scraping fallback

B. Résumeur (Gemini Service)
Appelle Gemini via gemini-pro (text-only) ou gemini-pro-vision (si multimodal nécessaire)

Prompt dynamique en fonction du type de contenu (thread, article, etc.)

Possibilité de personnaliser le prompt (humoristique, pro, poétique…)

C. Job Queue (BullMQ / Redis)
Permet de traiter les résumés en arrière-plan

Utile si tu veux scaler ou permettre des temps de réponse longs

D. Donation / Support Module
Intégration de Stripe ou Ko-Fi/BuyMeACoffee

Stocke les dons en base pour suivi et remerciements

4. Base de données (PostgreSQL)
sql
Copier
Modifier
users
- id (uuid)
- email (optionnel)
- created_at

summaries
- id (uuid)
- user_id (nullable)
- original_url
- original_text (optional)
- summary_text
- type (article, video, thread…)
- source_metadata (JSON)
- created_at

donations
- id
- user_id (nullable)
- amount
- currency
- created_at
5. Sécurité & Scalabilité
Rate Limiting : limiter les résumés par IP/jour

Caching : Varnish ou Redis pour éviter de résumer plusieurs fois le même contenu

Logs : Sentry ou LogRocket pour monitorer les erreurs

Monitoring : Upptime, Statuspage ou simple endpoint de healthcheck

6. Coût minimal / Optimisation
Utilise le tiers gratuit de Gemini

Stockage avec Supabase (généreux free tier)

Hébergement sur Render ou Railway

Auth facultative pour limiter friction

Donations visibles en public pour inspirer confiance (comme Wiki)

Souhaites-tu que je t’écrive un template d’API REST ou GraphQL pour ce backend ? Ou un prompt Gemini spécifique pour les résumés ?
  