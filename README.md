# 🌿 MyLocal Mate — Malaysia Travel & Transit Companion

An all-in-one local discovery and transit companion web application featuring AI travel recommendations, Klang Valley rail transit navigation (MRT, LRT, Monorail, KTM), personalized itinerary planning, phrase translation, and interactive maps.

---

## 🚀 Deploying to Vercel (vercel.app)

This project is pre-configured for full-stack deployment on [Vercel](https://vercel.com) using **Vite** for the frontend and **Serverless Functions** for the Express backend.

### Method 1: Deploy via GitHub (Recommended)

1. Push this repository to your GitHub account.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** > **"Project"**.
3. Import your GitHub repository.
4. Vercel will automatically detect the settings from `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add the following keys:
   - `GEMINI_API_KEY`: Your Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/apikey)).
   - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps JavaScript API Key (with Transit, Maps JavaScript, and Geocoding APIs enabled).
   - `GOOGLE_MAPS_API_KEY`: Same Google Maps API key (for server-side operations if needed).
6. Click **Deploy**. Your app will be live at `https://your-project-name.vercel.app`!

---

### Method 2: Deploy via Vercel CLI

1. Install the Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Deploy the application:
   ```bash
   vercel
   ```
4. Follow the terminal prompts. When deploying to production:
   ```bash
   vercel --prod
   ```
5. Set environment variables in the Vercel dashboard under **Project Settings > Environment Variables**:
   - `GEMINI_API_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`
   - `GOOGLE_MAPS_API_KEY`

---

## 🛠️ Architecture & Configuration

- **`vercel.json`**:
  - Automatically routes API requests (`/api/*`) to `/api/index.ts` serverless function.
  - Automatically routes all frontend page requests to `dist/index.html` for React Single Page Application (SPA) client routing.
- **`/api/index.ts`**:
  - Serverless function wrapper that runs the Express backend on Vercel Node.js runtime.
- **`server.ts`**:
  - Works both in local development (`npm run dev` with Vite middleware) and in production as a serverless backend.
  - Automatically uses `/tmp/data` on Vercel for ephemeral file storage, avoiding read-only filesystem restrictions.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
