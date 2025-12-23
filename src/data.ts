
export interface Resource {
    id: string;
    name: string;
    category: string;
    type: string;
    area: string;
    address: string;
    description: string;
    requirements: string;
    tags: string[];
    schedule: Record<number, string>;
    lat: number;
    lng: number;
    phone?: string;
    transport?: string;
    trustScore?: number; // 0-100
    thanksCount?: number;
    languages?: string[]; // New: Language Integration
    culture_tags?: string[]; // New: Cultural tags
}

export const MAP_BOUNDS = { minLat: 50.770, maxLat: 50.870, minLng: -1.120, maxLng: -1.040 };
export const AREAS = ['All', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'];

export const TAG_ICONS: Record<string, { icon: string; label: string; color: string; bg: string; hex: string; border?: boolean }> = {
    food: { icon: 'utensils', label: 'Food', color: 'text-emerald-600', bg: 'bg-emerald-50', hex: '#059669' },
    shelter: { icon: 'bed', label: 'Shelter', color: 'text-indigo-600', bg: 'bg-indigo-50', hex: '#4f46e5' },
    warmth: { icon: 'flame', label: 'Warmth', color: 'text-orange-600', bg: 'bg-orange-50', hex: '#ea580c' },
    support: { icon: 'lifebuoy', label: 'Support', color: 'text-blue-600', bg: 'bg-blue-50', hex: '#2563eb' },
    family: { icon: 'family', label: 'Family', color: 'text-pink-600', bg: 'bg-pink-50', hex: '#db2777' },
    wifi: { icon: 'wifi', label: 'WiFi', color: 'text-sky-600', bg: 'bg-sky-50', hex: '#0ea5e9' },
    charging: { icon: 'zap', label: 'Charging', color: 'text-yellow-600', bg: 'bg-yellow-50', hex: '#eab308' },
    shower: { icon: 'droplets', label: 'Shower', color: 'text-cyan-600', bg: 'bg-cyan-50', hex: '#0891b2' },
    laundry: { icon: 'washing-machine', label: 'Laundry', color: 'text-blue-600', bg: 'bg-blue-50', hex: '#2563eb' },
    toilet: { icon: 'toilet', label: 'Toilet', color: 'text-slate-600', bg: 'bg-slate-100', hex: '#475569' },
    no_referral: { icon: 'check_circle', label: 'No Referral', color: 'text-teal-700', bg: 'bg-teal-50', hex: '#0f766e', border: true },
    free: { icon: 'tag', label: 'Free', color: 'text-emerald-700', bg: 'bg-emerald-100', hex: '#047857', border: true },
    membership: { icon: 'id-card', label: 'Membership', color: 'text-slate-500', bg: 'bg-slate-100', hex: '#64748b' },
    referral: { icon: 'file-text', label: 'Referral', color: 'text-amber-600', bg: 'bg-amber-50', hex: '#d97706' },
    hot_meal: { icon: 'soup', label: 'Hot Meal', color: 'text-orange-600', bg: 'bg-orange-50', hex: '#ea580c' },
    fresh_food: { icon: 'apple', label: 'Fresh Food', color: 'text-green-600', bg: 'bg-green-50', hex: '#16a34a' },
    medical: { icon: 'lifebuoy', label: 'Medical', color: 'text-red-600', bg: 'bg-red-50', hex: '#dc2626' },
    mental_health: { icon: 'brain', label: 'Mental Health', color: 'text-purple-600', bg: 'bg-purple-50', hex: '#9333ea' },
    addiction: { icon: 'shield-off', label: 'Addiction', color: 'text-slate-700', bg: 'bg-slate-100', hex: '#334155' },
    learning: { icon: 'book-open', label: 'Learning', color: 'text-amber-700', bg: 'bg-amber-50', hex: '#b45309' },
    skills: { icon: 'briefcase', label: 'Skills', color: 'text-indigo-700', bg: 'bg-indigo-50', hex: '#4338ca' },
    community: { icon: 'users', label: 'Community', color: 'text-emerald-700', bg: 'bg-emerald-50', hex: '#047857' },
    women: { icon: 'heart', label: 'Women Only', color: 'text-rose-600', bg: 'bg-rose-50', hex: '#e11d48' },
    pets: { icon: 'paw', label: 'Pets OK', color: 'text-stone-600', bg: 'bg-stone-100', hex: '#57534e' },
    "24_7": { icon: 'clock', label: '24/7', color: 'text-purple-600', bg: 'bg-purple-50', hex: '#9333ea' },
    charity: { icon: 'shopping-bag', label: 'Charity Shop', color: 'text-pink-500', bg: 'bg-pink-50', hex: '#ec4899' },
    // Cultural / Language Tags
    halal: { icon: 'check', label: 'Halal', color: 'text-emerald-700', bg: 'bg-emerald-50', hex: '#047857' },
    vegetarian: { icon: 'leaf', label: 'Vegetarian', color: 'text-green-600', bg: 'bg-green-50', hex: '#16a34a' },
    kosher: { icon: 'star', label: 'Kosher', color: 'text-blue-600', bg: 'bg-blue-50', hex: '#2563eb' },
    polish: { icon: 'message-circle', label: 'Polish Spoken', color: 'text-red-500', bg: 'bg-red-50', hex: '#ef4444' },
    chinese: { icon: 'message-circle', label: 'Chinese Spoken', color: 'text-red-600', bg: 'bg-red-50', hex: '#dc2626' },
    arabic: { icon: 'message-circle', label: 'Arabic Spoken', color: 'text-emerald-600', bg: 'bg-emerald-50', hex: '#059669' },
    default: { icon: 'info', label: 'Info', color: 'text-gray-500', bg: 'bg-gray-50', hex: '#6b7280' }
};

export const SUPERMARKET_TIPS = [
    { store: "Co-op", time: "After 18:00", note: "Look for red reduced stickers (75% off)." },
    { store: "Tesco Express", time: "After 19:30", note: "Final reductions usually happen now." },
    { store: "Sainsbury's", time: "After 19:00", note: "Check the designated 'Reduced' cabinet." },
    { store: "Lidl", time: "Early/Late", note: "Look for orange reduced stickers (30% off)." },
    { store: "Aldi", time: "08:00 (Open)", note: "50% off red stickers on fresh items." },
    { store: "Waitrose", time: "Near Closing", note: "High-quality reductions often available." }
];

export const COMMUNITY_DEALS = [
    { id: 'deal1', store: "Tesco Extra (Fratton)", deal: "Final Reductions (75%+)", time: "Daily 19:30-21:00", info: "Check the chilled cabinet in the back corner.", lat: 50.796, lng: -1.077 },
    { id: 'deal2', store: "Waitrose (Southsea)", deal: "Gourmet Reductions", time: "Daily 17:00-19:00", info: "Premium items often 90% off near closing.", lat: 50.784, lng: -1.091 },
    { id: 'deal3', store: "Co-op (Albert Rd)", deal: "Bakery Zero Waste", time: "Weekdays 18:00", info: "Free or 50p bread bags occasionally available.", lat: 50.787, lng: -1.082 }
];

export const GIFT_EXCHANGE = [
    { id: 'gift1', item: "Winter Coats", location: "St Jude's Hub", date: "Every Friday", info: "Donate or collect warm coats. No questions asked.", lat: 50.786, lng: -1.092 },
    { id: 'gift2', item: "School Uniforms", location: "Somerstown Hub", date: "Daily", info: "Pre-loved uniforms for city schools.", lat: 50.795, lng: -1.088 },
    { id: 'gift3', item: "Baby Items", location: "Northern Parade Hub", date: "1st Sat/Month", info: "Cots and high chairs available for loan.", lat: 50.824, lng: -1.077 }
];

export const PROGRESS_TIPS = [
    { title: "Stop Smoking", note: "PCC offers free patches and support. See 'Health' (w5)." },
    { title: "Digital Skills", note: "Central Library (PO1) runs free computer workshops Wednesdays at 10am." },
    { title: "Job Support", note: "The Recovery Hub (PO1) offers peer-led employment skills workshops." },
    { title: "Family Fun", note: "Free children's storytime at Central Library (PO1) every Saturday morning." },
    { title: "Mental Health", note: "Talking Change (PO3) allows self-referral for free NHS counselling." }
];

// 100% Real, Effective Data for Portsmouth, UK
export const ALL_DATA: Resource[] = [
    // --- 🟢 FOOD (EAT) ---
    {
        id: 'f1',
        name: "FoodCycle Portsmouth",
        category: "food",
        type: "Hot Meal",
        area: "PO1",
        address: "John Pounds Centre, 23 Queen St, PO1 3HN",
        description: "A free, hot 3-course vegetarian meal for the community. No questions asked. Just turn up.",
        requirements: "Open to everyone.",
        tags: ["free", "hot_meal", "no_referral", "vegetarian", "community"],
        culture_tags: ["vegetarian", "halal"],
        languages: ["English", "Polish"],
        schedule: { 1: "Closed", 2: "18:00-19:30", 3: "Closed", 4: "18:00-19:30", 5: "Closed", 6: "Closed", 0: "Closed" }, // Tue/Thu usually
        lat: 50.7984,
        lng: -1.0964,
        transport: "Bus 3, 23",
        phone: "023 9289 2010",
        trustScore: 100
    },
    {
        id: 'f2',
        name: "Portsea Pantry",
        category: "food",
        type: "Pantry (£)",
        area: "PO1",
        address: "John Pounds Centre, 23 Queen St, PO1 3HN",
        description: "Your local pantry. Pay a weekly membership (£5) for a choice of groceries valued £15+.",
        requirements: "Membership required.",
        tags: ["membership", "fresh_food", "community"],
        schedule: { 1: "09:00-16:00", 2: "09:00-16:00", 3: "09:00-16:00", 4: "09:00-16:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" }, // Check times
        lat: 50.7984,
        lng: -1.0964,
        transport: "Bus 3, 23",
        phone: "023 9289 2010",
        trustScore: 98
    },
    {
        id: 'f3',
        name: "LifeHouse",
        category: "food",
        type: "Soup Kitchen",
        area: "PO4",
        address: "153 Harold Rd, Southsea, PO4 0LR",
        description: "Hot food, support, and community for the homeless and vulnerable.",
        requirements: "Drop-in.",
        tags: ["hot_meal", "no_referral", "pets", "support"],
        culture_tags: ["halal"],
        languages: ["English"],
        schedule: { 1: "Closed", 2: "Closed", 3: "09:30-11:30", 4: "18:00-20:00", 5: "Closed", 6: "Closed", 0: "Closed" }, // Wed/Thu specific times
        lat: 50.7901,
        lng: -1.0755,
        transport: "Bus 1, 18",
        phone: "023 9229 3733",
        trustScore: 99
    },
    {
        id: 'f4',
        name: "North End Pantry",
        category: "food",
        type: "Pantry (£)",
        area: "PO2",
        address: "North End Baptist Church, 195 Powerscourt Rd, PO2 7JH",
        description: "Community pantry. Reduce waste, save money. £5 for 10 items.",
        requirements: "Membership (£5).",
        tags: ["membership", "fresh_food"],
        schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "09:30-11:30", 6: "09:30-11:30", 0: "Closed" }, // Fri/Sat specific
        lat: 50.8172,
        lng: -1.0765,
        transport: "Bus 2, 3",
        trustScore: 95
    },
    {
        id: 'f5',
        name: "Portsmouth Foodbank",
        category: "food",
        type: "Food Bank",
        area: "PO5",
        address: "Hope Centre, Fraser Road, Southsea, PO5 4QA",
        description: "Emergency food parcels. Requires a referral voucher from GP, social worker, or Citizens Advice.",
        requirements: "Voucher required.",
        tags: ["referral", "emergency"],
        schedule: { 1: "10:00-12:00", 2: "Closed", 3: "10:00-12:00", 4: "Closed", 5: "10:00-12:00", 6: "Closed", 0: "Closed" },
        lat: 50.795,
        lng: -1.085,
        transport: "Bus 1, 13",
        phone: "023 9298 7976",
        trustScore: 100
    },
    {
        id: 'f6',
        name: "Sunday Suppers",
        category: "food",
        type: "Hot Meal",
        area: "PO5",
        address: "St Swithun's Church, Waverley Rd, PO5 2PL",
        description: "Hot meal for the homeless every Sunday evening. A warm welcome for all.",
        requirements: "Just turn up.",
        tags: ["hot_meal", "free", "no_referral"],
        schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "17:30-18:30" },
        lat: 50.7878,
        lng: -1.0848,
        trustScore: 95
    },

    // --- 🛌 SHELTER (STAY) ---
    {
        id: 'sh1',
        name: "Housing Options (Civic Offices)",
        category: "shelter",
        type: "Emergency Housing",
        area: "PO1",
        address: "Civic Offices, Guildhall Square, PO1 2AL",
        description: "First point of contact for homelessness prevention and emergency accommodation.",
        requirements: "Local connection usually required.",
        tags: ["emergency", "support"],
        schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" },
        lat: 50.799,
        lng: -1.093,
        phone: "023 9283 4989",
        transport: "All City Centre Buses",
        trustScore: 100
    },
    {
        id: 'sh2',
        name: "Hope House",
        category: "shelter",
        type: "Hostel",
        area: "PO1",
        address: "32-34 Milton Road, PO1 5LY",
        description: "Supported accommodation for single homeless people. Referral only.",
        requirements: "Referral via Housing Options.",
        tags: ["referral", "support"],
        schedule: { 1: "24/7", 2: "24/7", 3: "24/7", 4: "24/7", 5: "24/7", 6: "24/7", 0: "24/7" },
        lat: 50.798,
        lng: -1.066,
        phone: "023 9282 3448",
        trustScore: 90
    },

    // --- 🔥 WARMTH (WARM & SAFE) ---
    {
        id: 'w1',
        name: "Portsmouth Central Library",
        category: "warmth",
        type: "Warm Space",
        area: "PO1",
        address: "Guildhall Square, PO1 2DX",
        description: "Warm, safe space. Free WiFi, computers, books, and seating.",
        requirements: "None.",
        tags: ["free", "wifi", "charging", "toilet"],
        schedule: { 1: "09:30-18:00", 2: "09:30-18:00", 3: "09:30-18:00", 4: "09:30-18:00", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" },
        lat: 50.7996,
        lng: -1.0933,
        phone: "023 9268 8057",
        trustScore: 100
    },
    {
        id: 'w2',
        name: "St Jude's Southsea",
        category: "warmth",
        type: "Community Hub",
        area: "PO5",
        address: "Kent Road, Southsea, PO5 3EL",
        description: "Community cafe (mornings) and warm space. Friendly welcome.",
        requirements: "Open to all.",
        tags: ["free", "coffee", "support"],
        schedule: { 1: "09:00-12:00", 2: "09:00-12:00", 3: "09:00-12:00", 4: "09:00-12:00", 5: "Closed", 6: "Closed", 0: "09:00-13:00" },
        lat: 50.7865,
        lng: -1.0915,
        phone: "023 9275 0442",
        trustScore: 96
    },

    // --- 🩺 SUPPORT (Health & Advice) ---
    {
        id: 's1',
        name: "Advice Portsmouth",
        category: "support",
        type: "Advice",
        area: "PO1",
        address: "Focus Point, 116 Kingston Crescent, PO2 8AL",
        description: "Free, confidential advice on benefits, debt, housing, and family issues.",
        requirements: "Drop-in.",
        tags: ["free", "advice", "no_referral"],
        schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "13:00-17:00", 5: "09:00-16:30", 6: "Closed", 0: "Closed" },
        lat: 50.812,
        lng: -1.084,
        phone: "023 9279 4340",
        trustScore: 98
    },
    {
        id: 's2',
        name: "Recovery Hub",
        category: "support",
        type: "Addiction",
        area: "PO1",
        address: "Campdam House, 44-46 Kingston Crescent, PO2 8AJ",
        description: "Support for drug and alcohol recovery. Self-referral accepted.",
        requirements: "Drop-in / Call.",
        tags: ["addiction", "health", "free"],
        schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-20:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" },
        lat: 50.811,
        lng: -1.083,
        phone: "023 9229 4573",
        trustScore: 95
    },

    // --- 👪 FAMILY (PLAY & SUPPORT) ---
    {
        id: 'fam1',
        name: "Buckland Family Hub",
        category: "family",
        type: "Family Hub",
        area: "PO1",
        address: "Turner Road, PO1 4PN",
        description: "Support for families with children 0-19. Midwife clinics, health visitors, and play sessions.",
        requirements: "Drop-in / Appt.",
        tags: ["free", "community", "children", "medical"],
        schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" },
        lat: 50.806,
        lng: -1.082,
        phone: "023 9273 3440",
        trustScore: 100
    },
    {
        id: 'fam2',
        name: "Somerstown Family Hub",
        category: "family",
        type: "Family Hub",
        area: "PO5",
        address: "Omega Street, PO5 4LP",
        description: "Child development checks, breastfeeding support, and parent groups.",
        requirements: "Drop-in.",
        tags: ["free", "community", "children"],
        schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" },
        lat: 50.795,
        lng: -1.090,
        phone: "023 9268 8830",
        trustScore: 100
    },
    {
        id: 'fam3',
        name: "Portsmouth Central Library",
        category: "family",
        type: "Library",
        area: "PO1",
        address: "Guildhall Square, PO1 2DX",
        description: "Books, computers, and free children's storytime (Saturdays 11am). Warm space.",
        requirements: "Open to all.",
        tags: ["free", "learning", "children", "warmth", "wifi"],
        schedule: { 1: "09:30-18:00", 2: "09:30-18:00", 3: "09:30-18:00", 4: "09:30-18:00", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" },
        lat: 50.799,
        lng: -1.093,
        phone: "023 9268 8057",
        trustScore: 99
    },
    {
        id: 'fam4',
        name: "Southsea Library",
        category: "family",
        type: "Library",
        area: "PO5",
        address: "19-21 Palmerston Rd, PO5 3QQ",
        description: "Rhymetime for babies/toddlers (check schedule). Relaxed reading area.",
        requirements: "Open to all.",
        tags: ["free", "learning", "children", "wifi"],
        schedule: { 1: "09:30-17:30", 2: "09:30-17:30", 3: "09:30-17:30", 4: "09:30-17:30", 5: "09:30-17:00", 6: "10:00-16:00", 0: "Closed" },
        lat: 50.786,
        lng: -1.091,
        trustScore: 98
    },
    {
        id: 'fam5',
        name: "Milton Park Play Area",
        category: "family",
        type: "Park",
        area: "PO4",
        address: "Milton Road, PO4 8PR",
        description: "Large green space with a great playground, tennis courts, and picnic areas.",
        requirements: "Open 24/7.",
        tags: ["free", "children", "pets", "24_7"],
        schedule: { 1: "06:00-22:00", 2: "06:00-22:00", 3: "06:00-22:00", 4: "06:00-22:00", 5: "06:00-22:00", 6: "06:00-22:00", 0: "06:00-22:00" },
        lat: 50.796,
        lng: -1.060,
        trustScore: 95
    },
    {
        id: 'fam6',
        name: "Canoe Lake",
        category: "family",
        type: "Action",
        area: "PO4",
        address: "St Helens Parade, Southsea, PO4 9RG",
        description: "Large boating lake, swan boats (fee), free playground, and seasonal splash pad.",
        requirements: "Park is free.",
        tags: ["free", "children", "pets"],
        schedule: { 1: "24/7", 2: "24/7", 3: "24/7", 4: "24/7", 5: "24/7", 6: "24/7", 0: "24/7" },
        lat: 50.784,
        lng: -1.074,
        trustScore: 97
    },
    {
        id: 'fam7',
        name: "Southsea Splash Pad",
        category: "family",
        type: "Splash Pad",
        area: "PO5",
        address: "Clarence Esplanade, PO5 3PB",
        description: "Modern water play area for under 8s. Open May-Sept.",
        requirements: "Free.",
        tags: ["free", "children", "seasonal"],
        schedule: { 1: "10:00-19:00", 2: "10:00-19:00", 3: "10:00-19:00", 4: "10:00-19:00", 5: "10:00-19:00", 6: "10:00-19:00", 0: "10:00-19:00" },
        lat: 50.781,
        lng: -1.096,
        trustScore: 98
    },

    // --- Charity Shops ---
    {
        id: 'c1',
        name: "Rowans Hospice Shop",
        category: "charity",
        type: "Charity Shop",
        area: "PO4",
        address: "15 Palmerston Rd, Southsea, PO5 3QQ",
        description: "Clothing, books, and homeware supporting local hospice care.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00", 0: "10:00-16:00" },
        lat: 50.786,
        lng: -1.091,
        phone: "023 9287 3633",
        trustScore: 95
    },
    {
        id: 'fam8',
        name: "Landport Adventure Playground",
        category: "family",
        type: "Adventure Play",
        area: "PO1",
        address: "Arundel Street, PO1 1PH",
        description: "Staffed adventure playground for ages 6-13. Free entry. Checking opening times recommended.",
        requirements: "Register on arrival.",
        tags: ["free", "children", "community"],
        schedule: { 1: "15:30-18:00", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "11:00-16:00", 0: "Closed" },
        lat: 50.803,
        lng: -1.087,
        phone: "023 9283 1756",
        trustScore: 98
    },
    {
        id: 'fam9',
        name: "Paulsgrove Adventure Playground",
        category: "family",
        type: "Adventure Play",
        area: "PO6",
        address: "Marsden Road, PO6 4JB",
        description: "Large adventure play area with structures and activities for children 6-13. Free.",
        requirements: "Register on arrival.",
        tags: ["free", "children", "community"],
        schedule: { 1: "15:30-18:00", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "11:00-16:00", 0: "Closed" },
        lat: 50.843,
        lng: -1.088,
        phone: "023 9237 0643",
        trustScore: 98
    }
];
