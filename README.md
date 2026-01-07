# Portsmouth Bridge 🌉

> **Connecting Community • Restoring Hope**  
> A Digital Public Infrastructure for community support services in Portsmouth, UK.

[![Built with React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

## 🎯 Overview

Portsmouth Bridge is a zero-cost digital ecosystem connecting vulnerable residents with food banks, shelters, warm hubs, and community support services. The app features real-time status updates, partner coordination tools, and analytics for identifying unmet community needs.

## ✨ Features

### Core Features
- 🗺️ **Interactive Map** - Leaflet/OpenStreetMap integration with live service locations
- 🔍 **Smart Search** - Fuzzy search with Fuse.js across all resources
- 📱 **PWA Support** - Install as native app, works offline
- 🌙 **Stealth Mode** - Discreet interface for privacy-sensitive situations
- ♿ **Accessibility** - High contrast mode, screen reader support

### B2B Partner Layer (Phase 2-3)
- 🔐 **Firebase Authentication** - Secure partner login
- 📊 **Partner Dashboard** - Real-time status updates for services
- 📡 **Live Status** - Open/Closed, Capacity, Queue status
- 📢 **Broadcast System** - Emergency announcements to users

### Analytics Engine (Phase 4)
- 📈 **PulseMap** - Live visualization of community demand
- 🚨 **Gap Detection** - Automatic tracking of unmet search needs
- 📍 **Area Insights** - Geographic demand patterns

### Navigation (Phase 5)
- 🚶 **Journey Planner** - Multi-stop route optimization
- 🧭 **Real Navigation** - Google Maps deep link for walking directions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/httsai1979/PortsmouthBridge.git
cd PortsmouthBridge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📂 Project Structure

```
src/
├── components/           # React components
│   ├── PartnerDashboard.tsx   # B2B partner control center
│   ├── PartnerLogin.tsx       # Partner authentication
│   ├── PulseMap.tsx           # Analytics visualization
│   ├── DataMigration.tsx      # Firebase sync tools
│   ├── JourneyPlanner.tsx     # Route optimization
│   └── ...
├── contexts/
│   └── AuthContext.tsx   # Firebase auth state management
├── lib/
│   └── firebase.ts       # Firebase initialization
├── services/
│   ├── AnalyticsService.ts    # Search analytics
│   └── LiveStatusService.ts   # Real-time data
├── types/
│   └── schema.ts         # TypeScript definitions
└── utils/
    └── migrate.ts        # Data migration script
```

## 🔒 Security

### Firestore Rules
Security rules are defined in `firestore.rules`:
- **Public Read**: Anyone can read basic service info
- **Partner Write**: Only authenticated partners can update services
- **B2B Protection**: Sensitive inter-agency data is protected
- **Analytics**: Write-only for anonymous users, read for partners

### Deploying Rules
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

## 🧪 Partner Access

For testing partner features:
1. Create an account at the Firebase Console
2. Or use the whitelist email: `test@test.org`

Partners can access:
- **Agency Dashboard** - Update service status in real-time
- **Analytics Pulse** - View community demand patterns
- **Data Migration** - Sync static data to Firebase

## 📱 PWA Installation

The app is fully PWA-enabled:
- **Chrome/Edge**: Click "Install" in the address bar
- **iOS Safari**: Share → Add to Home Screen
- **Android**: Banner prompt or menu → Install app

Offline features:
- Cached map tiles (OpenStreetMap)
- Local Firestore persistence
- All static resources cached

## 🔧 Development

```bash
# Development server
npm run dev

# Type checking
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed for public benefit. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Portsmouth City Council** - Data sources and partnership
- **Local Charities** - Service information and collaboration
- **OpenStreetMap** - Free map tiles
- **Firebase** - Zero-cost backend infrastructure

---

**Built with ❤️ for the Portsmouth Community**
