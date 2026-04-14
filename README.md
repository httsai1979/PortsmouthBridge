# Portsmouth Bridge 🌉: The Survival Copilot

> **Not a directory. A pragmatic triage tool for the Cost of Living Crisis.**
> A hyper-localized, offline-first Progressive Web App built to provide brutally practical, immediate survival logistics for exhausted parents, new immigrants, youth in debt, and the elderly in Portsmouth.

## 🎯 The Reality We Are Building For

Tech solutions often fail the vulnerable because they assume users have time, energy, and cognitive bandwidth. Portsmouth Bridge strips away the "tech utopian" fluff. We focus on **Immediate Survival Logistics**.

### 🔥 Core Real-World Triage Modules:

#### 1. The Exhaustion & Lost-Wage Bypass (For Parents)
* **Hot Meals Tonight Radar**: Filters out raw-food pantries and shows ONLY places serving *ready-to-eat* hot meals or active "Kids Eat Free" deals right now.
* **Emergency Leave Shield**: Generates a legally robust SMS invoking "Statutory Time Off for Dependants" rights so parents can text their bosses immediately when a child falls sick.

#### 2. The NRPF & Bureaucracy Shield (For Immigrants/Refugees)
* **"No Questions Asked" Hubs**: Explicitly flags community kitchens that have a strict "No ID, No Visa Checks" policy for those with NRPF conditions.
* **Translation Copilot**: Uses Google Gemini AI to scan threatening official letters, answering only three things: *Does this need money? When is the deadline? Who do I call?*

#### 3. The Digital Starvation Deflector (For Youth)
* **Free SIM Locator**: Connects to the National Databank to map out libraries handing out free 20GB O2/Vodafone SIM cards.

#### 4. The Dignity & Warmth Protocol (For The Elderly)
* **Social Warmth**: Reframes "Warm Spaces" as social events ("Community Bingo") so the isolated elderly can secretly receive free heating all day with dignity.

## 🏛️ Zero-Cost, Brutal Pragmatism

1. **Zero Server Costs**: Runs entirely on Netlify, Firebase Free Tier, and Google Sheets.
2. **Aggressive Caching**: A strict 15-minute `localStorage` TTL ensures the app never hits Firebase read limits.
3. **Zero NGO Admin**: NGOs update a simple Google Sheet. The app syncs automatically. 

## 🛠️ Offline-First & Extreme Safety

* **Dead-Zone Survival**: Core crisis resources are hardcoded into IndexedDB, rendering instantly in a low-power List View when mobile data runs out.
* **Absolute Stealth**: Features a **True Panic Button** that instantly wipes all `localStorage` and redirects to BBC Weather. The app dynamically blocks ALL image downloads in Stealth Mode to prevent safe-house photos from hiding in the phone's system cache.

## 🚀 Getting Started

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/httsai1979/PortsmouthBridge.git

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
# Copy .env.example to .env and add your VITE_GEMINI_API_KEY
cp .env.example .env

# 4. Start Development Server
npm run dev
\`\`\`

## 🤝 License & Contributing
Built for reality, not for pitch decks. MIT License. Free to fork for any city worldwide.