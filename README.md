# Aurora: AI companion and peer community for mental health

**The problem:** many people who struggle with their mental health have nobody to talk to at
2 a.m., and most never reach a therapist. Aurora combines three things for them: an AI
companion for text and voice conversations, a peer community with themed groups, and
personal tools such as a mood journal and a calendar.

**What made it hard:** this is the most sensitive data a person has. Every feature had to
answer two questions. *Does this help the user?* *What happens if it goes wrong?*

Aurora was built and run as a real product: an iOS app on the App Store, an API on Railway,
subscriptions through RevenueCat.

> This is a portfolio copy. API keys, SDK IDs, accounts and personal data are removed and
> read from environment variables. Third-party logos and stock photos are replaced with a
> placeholder image. The full product documentation is in [`AURORA.md`](AURORA.md).

## Safety by design

The part I'm proudest of is not the chat but what sits around it:

- **Risk detection before every reply** (`backend/src/services/riskDetection.service.ts`).
  Each message is classified (suicide, self-harm, abuse, eating disorders, substance use)
  in English and Dutch. At high risk the reply includes crisis resources for the user's
  country.
- **Content moderation** of posts and messages before they reach the community or a model.
- **Explicit consent** before the AI may use journal entries, health notes or calendar
  items. Without consent, the AI sees none of it.
- **No false promises:** Aurora is positioned as supportive conversation, not as a
  replacement for a therapist or emergency services.

## How the AI companion works

```
message → moderation → risk detection ──(high risk)──→ crisis resources
                              │
             context assembly: consented journal snippets, health notes,
             calendar, and long-term memories retrieved by embedding search
                              │
             therapeutic system prompt (reflect → name → explore)
                              │
             streamed reply (text) or speech (voice)
```

- **Memory:** conversations are summarised into memories and stored as embeddings
  (`memoryEmbedding.service.ts`), so the companion remembers what matters without the user
  repeating it, and without "announcing" what it knows.
- **Two model providers** (`claudeClient.ts`, `openaiClient.ts`), and the user picks which
  one to talk to.
- **Voice** with listening, processing and speaking states, and a consent gate in front.

## The rest of the product

Feed with posts and comments, themed groups, direct messages over WebSockets, push
notifications, journals with mood and symptom tracking plus insights, a calendar, an ideas
board for feature requests, subscriptions, four languages (English, Spanish, Arabic, Japanese), and an onboarding flow.

## Stack

| Layer | Technology |
| --- | --- |
| Mobile | Expo / React Native (Expo Router), TypeScript, Zustand |
| API | Node.js, Express, TypeScript, MongoDB (Mongoose), WebSockets |
| AI | Anthropic and OpenAI APIs, embeddings for long-term memory |
| Services | RevenueCat (subscriptions), Resend (email), Cloudflare Stream (video), Expo push |
| Delivery | EAS builds and over-the-air updates, Railway (API) |

## Layout

```
backend/    Express API: controllers, models, services (AI, risk, moderation, memory)
frontend/   Expo app: app/ (screens, file-based routing), src/ (components, stores, services)
AURORA.md   Product and technical overview: every feature and every API area
```

## Run it

```bash
cd backend && npm install && cp .env.example .env && npm run dev   # needs MongoDB and an AI key
cd frontend && npm install && cp .env.example .env && npx expo start
```

Built with AI coding assistants. The product decisions, the safety design and the trade-offs
are mine.
