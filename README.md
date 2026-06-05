# Supervote

**Turn product reactions into research signals.**

Supervote is a mobile-first AI feedback testing tool for founders, product managers, and researchers. It helps teams validate product concepts, features, copy, and user preferences through fast swipe interactions, Supervote signals, AI-assisted follow-up prompts, respondent persona cards, and researcher insight dashboards.

## Core Features

- Mobile-first respondent experience
- Swipe right to like, swipe left to skip
- Star-based Supervote for strong preference
- AI profile extraction from a one-sentence self-description
- Lightweight follow-up cards for missing profile fields or strong/unclear reactions
- Reason bubbles confirmed by users instead of invented by AI
- Personalized feedback persona card
- Researcher dashboard with preference ratios, strong-vote distribution, segments, and AI insights

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set `GEMINI_API_KEY` in `.env.local` if you want to use live AI responses. You can copy `.env.example` as a starting point.
3. Run the app:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```
