# Portsmouth Bridge - Community Support Network

Portsmouth Bridge is a high-performance, accessibility-first web application designed to connect vulnerable residents in Portsmouth, UK, with essential community resources.

## 🚀 Core Features

### 1. Unified Resource Directory
- **Comprehensive Listings**: Detailed information on food banks, soup kitchens, emergency shelters, warm spaces, and family support hubs.
- **Smart Search**: Powered by `Fuse.js` for fast, fuzzy search across names, tags, and descriptions.
- **Dynamic Filtering**: Filter by area (PO1-PO6), category, and specific needs (e.g., "No Referral", "Free").

### 2. Live Status & Real-time Data
- **Dual-Source Sync**: Integrates real-time data from **Google Sheets** (volunteer-maintained) and **Firebase Firestore** (agency-maintained).
- **Capacity Alerts**: Visual indicators for stock levels (Urgent Need vs. Good Stock).
- **Opening Status**: Automatically calculates current status (Open, Closing Soon, Closed) based on complex weekly schedules.

### 3. Progressive Navigation
- **Interactive Map**: Custom Leaflet-based explorer with status-aware markers and "Near Me" geolocation support.
- **Journey Planner**: Build an optimized route through multiple support points with automated Google Maps navigation.
- **Smart Compare**: Side-by-side comparison for up to 3 resources to help users make informed choices.

### 4. Smart Alerts & Notifications
- **Proactive Notifications**: Reminders for bookmarked resource opening times and city-wide emergency alerts (e.g., Cold Weather shelter activation).
- **Community Bulletin**: A dynamic dashboard for urgent announcements and verified daily market deals.

### 5. Accessibility & Safety
- **Stealth Mode**: One-tap "Safe Compass" disguise for users in sensitive domestic situations.
- **High Contrast Mode**: Enhanced visibility for users with visual impairments.
- **Dynamic Font Sizing**: Adjust text size for readability.
- **Offline First**: PWA support ensuring critical data is accessible even without an active data connection.
- **Print View**: Generate simplified, PDF-friendly versions of resource lists for offline distribution.

### 6. Partner & Agency Portal
- **Dashboard**: Specialized view for verified partners to manage their service's live status.
- **Analytics Pulse**: Visual data on resource gaps and community needs.
- **Data Migration**: Automated tools to sync static local data with the live Firestore database.

### 7. AI Assistant
- **Intent Recognition**: Natural language interface to help users find support through simple conversational queries.

---

## 🛠 Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 4
- **Database/Auth**: Firebase Firestore & Firebase Auth
- **Mapping**: Leaflet + React Leaflet
- **Search**: Fuse.js
- **Icons**: Custom SVG-based Icon system
- **Deployment**: Netlify / Firebase Hosting

## 📦 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` (see `.env.example`)
4. Start development server: `npm run dev`
5. Build for production: `npm run build`
