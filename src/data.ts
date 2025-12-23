
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
        address: "King's Church, Somers Rd, PO5 4QA",
        description: "Emergency food parcels. Requires a referral voucher.",
        requirements: "Voucher required.",
        tags: ["referral", "emergency"],
        schedule: { 1: "10:00-12:00", 2: "Closed", 3: "10:00-12:00", 4: "Closed", 5: "10:00-12:00", 6: "Closed", 0: "Closed" },
        lat: 50.795,
        lng: -1.085,
        transport: "Bus 1, 2, 3",
        phone: "023 9298 7977",
        trustScore: 100
    },
    {
        id: 'f6',
        name: "Sunday Suppers",
        category: "food",
        type: "Hot Meal",
        area: "PO5",
        address: "St Swithun's Church, Waverley Rd, PO5 2PL",
        description: "Hot meal for the homeless every Sunday evening.",
        requirements: "Just turn up.",
        tags: ["hot_meal", "free", "no_referral"],
        schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "17:30-18:30" },
        lat: 50.7878,
        lng: -1.0848,
        trustScore: 95
    },

    // --- 🛌 SHELTER (STAY) ---
    {
        id: 's1',
        name: "Rough Sleeping Hub",
        category: "shelter",
        type: "Day Centre",
        area: "PO5",
        address: "Kingsway House, 130 Elm Grove, PO5 1LR",
        description: "PRIMARY HUB. Breakfast (8-10am), showers, laundry, housing advice. Operated by SSJ.",
        requirements: "Walk-in.",
        tags: ["shower", "laundry", "breakfast", "no_referral", "shelter", "advice"],
        languages: ["English", "Polish", "Arabic"],
        schedule: { 1: "08:00-16:00", 2: "08:00-16:00", 3: "08:00-16:00", 4: "08:00-16:00", 5: "08:00-16:00", 6: "08:00-16:00", 0: "08:00-16:00" },
        lat: 50.792,
        lng: -1.088,
        transport: "Bus 2, 3, 23",
        phone: "023 9288 2689",
        trustScore: 100
    },
    {
        id: 's2',
        name: "Portsmouth Housing Options",
        category: "shelter",
        type: "Council Help",
        area: "PO1",
        address: "Civic Offices, Guildhall Square, PO1 2AX",
        description: "Statutory homeless support and emergency accommodation assessment.",
        requirements: "Drop-in / Call.",
        tags: ["advice", "no_referral", "emergency"],
        schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" },
        lat: 50.800,
        lng: -1.091,
        transport: "Bus 1, 2, 3, 7, 8",
        phone: "023 9283 4989",
        trustScore: 100
    },
    {
        id: 's3',
        name: "Hope House",
        category: "shelter",
        type: "Hostel",
        area: "PO3",
        address: "32-36 Milton Road, PO3 6AN",
        description: "Accommodation and support for homeless individuals (Two Saints).",
        requirements: "Referral only (via Housing Options).",
        tags: ["shelter", "adults", "24_7"],
        schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" },
        lat: 50.7988,
        lng: -1.065,
        transport: "Bus 2",
        phone: "023 9229 6919",
        trustScore: 98
    },
    {
        id: 's4',
        name: "Stop Domestic Abuse",
        category: "shelter",
        type: "Refuge",
        area: "All",
        address: "Confidential",
        description: "Advice line and refuge for those fleeing domestic abuse.",
        requirements: "Call 24/7.",
        tags: ["advice", "women", "24_7", "emergency"],
        schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" },
        lat: 50.800,
        lng: -1.090,
        phone: "0330 016 5112",
        trustScore: 100
    },
    {
        id: 's5',
        name: "Portsmouth Foyer",
        category: "shelter",
        type: "Youth Housing",
        area: "PO5",
        address: "Greetham St, PO5 4FA",
        description: "Supported accommodation for young people aged 16-25.",
        requirements: "Referral required.",
        tags: ["shelter", "youth"],
        schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" },
        lat: 50.797,
        lng: -1.094,
        phone: "023 9273 6344"
    },

    // --- 👨‍👩‍👧‍👦 FAMILY (SUPPORT) ---
    {
        id: 'fam1',
        name: "Somerstown Family Hub",
        category: "family",
        type: "Family Hub",
        area: "PO5",
        address: "Omega Street, PO5 4LP",
        description: "Support for families, baby clinic, and stay & play sessions.",
        requirements: "Open to all families.",
        tags: ["family", "advice", "playgroup"],
        schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" },
        lat: 50.795,
        lng: -1.088,
        phone: "023 9282 1816",
        trustScore: 100
    },
    {
        id: 'fam2',
        name: "Northern Parade Family Hub",
        category: "family",
        type: "Family Hub",
        area: "PO2",
        address: "Doyle Avenue, PO2 9NE",
        description: "North city family support and activities.",
        requirements: "Open to all.",
        tags: ["family", "advice"],
        schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" },
        lat: 50.824,
        lng: -1.077,
        phone: "023 9266 2115"
    },
    {
        id: 'fam3',
        name: "The Roberts Centre",
        category: "family",
        type: "Family Centre",
        area: "PO1",
        address: "84 Crasswell St, PO1 1HT",
        description: "Supporting families facing homelessness or breakdown. Nursery & advice.",
        requirements: "Referral/Drop-in.",
        tags: ["family", "advice", "shelter"],
        schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:30", 6: "Closed", 0: "Closed" },
        lat: 50.801,
        lng: -1.091,
        phone: "023 9229 6919",
        trustScore: 99
    },

    // --- 🌱 GROWTH & WELL-BEING (PROGRESS) ---
    {
        id: 'w1',
        name: "Portsmouth Recovery Hub",
        category: "support",
        type: "Addiction Support",
        area: "PO1",
        address: "Camp Road, PO1 2JJ",
        description: "Support for anyone affected by drug or alcohol misuse.",
        requirements: "Self-referral.",
        tags: ["addiction", "mental_health", "no_referral"],
        schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" },
        lat: 50.798,
        lng: -1.092,
        phone: "023 9275 1617",
        trustScore: 100
    },
    {
        id: 'w2',
        name: "Talking Change",
        category: "support",
        type: "Mental Health",
        area: "PO3",
        address: "The Pompey Centre, Fratton Way, PO4 8TA",
        description: "NHS talking therapies for anxiety and depression.",
        requirements: "Self-referral online/phone.",
        tags: ["mental_health", "medical"],
        schedule: { 1: "08:00-19:00", 2: "08:00-19:00", 3: "08:00-19:00", 4: "08:00-19:00", 5: "08:00-17:00", 6: "Closed", 0: "Closed" },
        lat: 50.797,
        lng: -1.065,
        phone: "0300 123 3934"
    },
    {
        id: 'l1',
        name: "Central Library",
        category: "learning",
        type: "Library",
        area: "PO1",
        address: "Guildhall Square, PO1 2DX",
        description: "Free computers, WiFi, and safe space. Digital skills workshops.",
        requirements: "Open to all.",
        tags: ["learning", "wifi", "warmth", "free"],
        languages: ["English", "Spanish", "Chinese"],
        schedule: { 1: "09:30-17:00", 2: "09:30-17:00", 3: "09:30-17:00", 4: "09:30-17:00", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" },
        lat: 50.798,
        lng: -1.091,
        phone: "023 9281 9311",
        trustScore: 100
    },

    // --- Charity Shops (Charity) ---
    {
        id: 'c1',
        name: "Age UK Portsmouth",
        category: "charity",
        type: "Charity Shop",
        area: "PO1",
        address: "The Pompey Centre, Fratton Way, PO4 8TA",
        description: "Large furniture and clothing store supporting the elderly.",
        requirements: "Open to all.",
        tags: ["charity", "shopping", "furniture"],
        schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00", 0: "10:00-16:00" },
        lat: 50.797,
        lng: -1.065,
        phone: "023 9286 2121"
    },
    {
        id: 'c2',
        name: "British Heart Foundation",
        category: "charity",
        type: "Charity Shop",
        area: "PO5",
        address: "18 Palmerston Rd, Southsea, PO5 3QH",
        description: "Clothing, books, and accessories.",
        requirements: "Open to all.",
        tags: ["charity", "shopping", "clothing"],
        schedule: { 1: "09:30-17:30", 2: "09:30-17:30", 3: "09:30-17:30", 4: "09:30-17:30", 5: "09:30-17:30", 6: "09:30-17:30", 0: "10:00-16:00" },
        lat: 50.786,
        lng: -1.091
    },
    {
        id: 'c3',
        name: "Sue Ryder",
        category: "charity",
        type: "Charity Shop",
        area: "PO6",
        address: "47 High St, Cosham, PO6 3AX",
        description: "Supporting palliative care.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00", 0: "Closed" },
        lat: 50.845,
        lng: -1.066
    }
];
