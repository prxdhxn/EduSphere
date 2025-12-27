<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This repository contains everything you need to run the app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ummIkOigFWK0A2_5nvyA0jvSB7zUsClh

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env` file in the project root and set your Gemini API key:

```
GEN_API_KEY=your_api_key_here
```

3. Run both the Express proxy server and Vite together (recommended):

```
npm run dev:all
```

This runs the server proxy at `http://localhost:4000` and the frontend via Vite (port chosen automatically).

Alternatives:

- Run server only: `npm run server:watch`
- Run frontend only: `npm run dev`

Notes:
- Login drafts and the logged-in user are persisted in `localStorage`.
- You must set `GEN_API_KEY` to use the AI quiz generator.
