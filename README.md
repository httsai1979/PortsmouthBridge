Portsmouth Bridge 🌉

Bridging the Gap for the Working Poor. Empowering Communities. Zero Cost.
A hyper-localized, AI-powered, offline-first Progressive Web App designed to tackle the Cost of Living crisis. It provides immediate, dignified access to food, warmth, and shelter in Portsmouth.

🎯 The Mission: Tackling "Hidden Poverty"

Traditional charity directories fail because they ignore the reality of Time Poverty and Stigma. Portsmouth Bridge is built specifically for the exhausted dual-income family, the night-shift worker, and the vulnerable.

Zero Cognitive Load: "Open Now" and "After 5PM" filters replace tedious manual searching, serving those who need help outside of traditional 9-to-5 NGO hours.

Dignity by Design: De-stigmatized language (e.g., "Community Market" instead of "Charity"). The app acts as a local lifestyle guide, not a handout directory.

Absolute Stealth: Built for domestic violence survivors and those valuing absolute discretion. Features a "Panic Button," cache-wiping mechanisms, and dynamic image blocking to prevent digital footprints.

🧠 Powered by Google Gemini AI

We utilize the free tier of the Google Gemini API to transform how people ask for help. Instead of clicking through rigid dropdowns, users can type natural phrases like:

"I just finished my night shift, I have my kids with me, and it's freezing. Where can we go?"

Gemini's NLU (Natural Language Understanding) processes this into a structured JSON intent, immediately matching the user with Family Shelters and Warm Spaces that are currently open, acting as a digital, real-time social worker.

🏛️ Why Policymakers & NGOs Love It

Zero-Cost Architecture: Operates 100% on free tiers (Netlify, Firebase Free, Google Sheets, Gemini Free Tier). No recurring server, database, or API costs for local councils.

Zero-Admin Maintenance: NGOs don't need to learn a new dashboard. They update their status on a shared Google Sheet, and the App syncs automatically. Issue reporting routes directly to Google Forms.

Real-Time Data: Live "Capacity" flags prevent "Phantom Referrals" (sending people to food banks that are already empty, destroying trust).

🛠️ Technical Architecture

Frontend: React 18, TypeScript, Vite, Tailwind CSS. (Optimized to run smoothly on older budget smartphones).

Data Layer (Hybrid Cache):

Google Sheets (CSV) for volunteer-friendly updates.

Firebase Firestore with an aggressive 15-minute localStorage TTL to guarantee zero-cost scalability without hitting read limits, even during high-traffic crisis events.

Offline-First: PWA Service Workers (vite-plugin-pwa) ensure the directory is accessible even without a data plan. Map views gracefully fallback to List Views when offline to prevent UI crashes.

Maps: Leaflet + OpenStreetMap (No API key bottlenecks).

🚀 Getting Started

Prerequisites

Node.js 18+

A Firebase Project (Free Tier)

Google Gemini API Key (Free Tier)

Installation

```bash

1. Clone the repository

git clone https://www.google.com/search?q=https://github.com/httsai1979/PortsmouthBridge.git
cd PortsmouthBridge

2. Install dependencies

npm install

3. Setup Environment Variables

Copy .env.example to .env and add your Firebase & Gemini keys

cp .env.example .env

4. Start Development Server

npm run dev
```

🛡️ Privacy & Stealth Implementation

App Manifest: Installs to the home screen as "City Guide" with a neutral icon to avoid suspicion.

No Image Caching: When Stealth Mode is activated, the app strips all <img> tags to prevent sensitive locations from being stored in the browser's hidden cache layer.

No Accounts Required: 100% anonymous usage for end-users. No tracking pixels.

🤝 Contributing

We welcome civic hackers, social workers, and developers. Please look at our issues for:

Enhancing accessibility (a11y) for screen readers.

Expanding localized data for the wider Hampshire area.

📄 License

MIT License. Built for the community, by the community. Free to fork for any city worldwide.