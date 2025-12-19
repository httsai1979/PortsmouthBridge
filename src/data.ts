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
    charging: { icon: 'zap', label: 'Charge', color: 'text-yellow-600', bg: 'bg-yellow-50', hex: '#eab308' },
    shower: { icon: 'droplets', label: 'Shower', color: 'text-cyan-600', bg: 'bg-cyan-50', hex: '#0891b2' },
    laundry: { icon: 'washing-machine', label: 'Laundry', color: 'text-blue-600', bg: 'bg-blue-50', hex: '#2563eb' },
    toilet: { icon: 'toilet', label: 'Toilet', color: 'text-slate-600', bg: 'bg-slate-100', hex: '#475569' },
    no_referral: { icon: 'check_circle', label: 'Open Access', color: 'text-teal-700', bg: 'bg-teal-50', hex: '#0f766e', border: true },
    free: { icon: 'tag', label: 'Free', color: 'text-emerald-700', bg: 'bg-emerald-100', hex: '#047857', border: true },
    membership: { icon: 'id-card', label: 'Member Only', color: 'text-slate-500', bg: 'bg-slate-100', hex: '#64748b' },
    referral: { icon: 'file-text', label: 'Referral', color: 'text-amber-600', bg: 'bg-amber-50', hex: '#d97706' },
    hot_meal: { icon: 'soup', label: 'Hot Meal', color: 'text-orange-600', bg: 'bg-orange-50', hex: '#ea580c' },
    fresh_food: { icon: 'apple', label: 'Fresh Veg', color: 'text-green-600', bg: 'bg-green-50', hex: '#16a34a' },
    medical: { icon: 'lifebuoy', label: 'Medical', color: 'text-red-600', bg: 'bg-red-50', hex: '#dc2626' },
    mental_health: { icon: 'brain', label: 'Well-being', color: 'text-purple-600', bg: 'bg-purple-50', hex: '#9333ea' },
    addiction: { icon: 'shield-off', label: 'Recovery', color: 'text-slate-700', bg: 'bg-slate-100', hex: '#334155' },
    learning: { icon: 'book-open', label: 'Library/Learning', color: 'text-amber-700', bg: 'bg-amber-50', hex: '#b45309' },
    skills: { icon: 'briefcase', label: 'Job Skills', color: 'text-indigo-700', bg: 'bg-indigo-50', hex: '#4338ca' },
    community: { icon: 'users', label: 'Social Group', color: 'text-emerald-700', bg: 'bg-emerald-50', hex: '#047857' },
    women: { icon: 'heart', label: 'Women', color: 'text-rose-600', bg: 'bg-rose-50', hex: '#e11d48' },
    pets: { icon: 'paw', label: 'Dogs OK', color: 'text-stone-600', bg: 'bg-stone-100', hex: '#57534e' },
    "24_7": { icon: 'clock', label: '24/7', color: 'text-purple-600', bg: 'bg-purple-50', hex: '#9333ea' },
    charity: { icon: 'shopping-bag', label: 'Charity Shop', color: 'text-pink-500', bg: 'bg-pink-50', hex: '#ec4899' },
    default: { icon: 'info', label: 'Info', color: 'text-gray-500', bg: 'bg-gray-50', hex: '#6b7280' }
};

export const SUPERMARKET_TIPS = [
    { store: "Co-op", time: "After 18:00", note: "Look for 75% off red stickers." },
    { store: "Tesco Express", time: "After 19:30", note: "Final reductions usually happen now." },
    { store: "Sainsbury's", time: "After 19:00", note: "Check the designated 'Reduced' cabinet." },
    { store: "Lidl", time: "Morning/Evening", note: "Look for 30% off orange stickers." },
    { store: "Aldi", time: "Morning (08:00)", note: "50% off red stickers on fresh items." },
    { store: "Waitrose", time: "Before closing", note: "High quality reductions often available." }
];

export const PROGRESS_TIPS = [
    { title: "Quit Smoking", note: "PCC offers free nicotine patches & support. Find in 'Health' (w5)." },
    { title: "Digital Skills", note: "Central Library (PO1) has free computer workshops every Wed 10am." },
    { title: "Job Support", note: "The Recovery Hub (PO1) offers peer-led job skills workshops." },
    { title: "Family Fun", note: "Free children's storytime at Central Library (PO1) every Saturday morning." },
    { title: "Mental Health", note: "Talking Change (PO3) allows self-referral for free NHS counseling." }
];

export const REAL_DATA: Resource[] = [
    // --- 🟢 FOOD (EAT) ---
    { id: 'f1', name: "Pompey Community Fridge", category: "food", type: "Surplus", area: "PO4", address: "Fratton Park, PO4 8SX", description: "Free surplus food. Bring a bag.", requirements: "Open to all.", tags: ["free", "fresh_food", "no_referral"], schedule: { 1: "13:00-15:00", 2: "13:00-15:00", 3: "13:00-15:00", 4: "13:00-15:00", 5: "13:00-15:00", 6: "Closed", 0: "Closed" }, lat: 50.796, lng: -1.064, transport: "Bus 1, 2, 18", phone: "023 9273 1141", trustScore: 98 },
    { id: 'f2', name: "FoodCycle Portsmouth", category: "food", type: "Hot Meal", area: "PO1", address: "John Pounds Centre", description: "Hot 3-course vegetarian meal. Community dining.", requirements: "Just turn up.", tags: ["free", "hot_meal", "no_referral"], schedule: { 1: "Closed", 2: "18:00-19:30", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.096, transport: "Bus 3, 23", phone: "023 9289 2010", trustScore: 100 },
    { id: 'f3', name: "LifeHouse Kitchen", category: "food", type: "Soup Kitchen", area: "PO4", address: "153A Harold Rd", description: "Hot breakfast (Wed) & dinner (Thu).", requirements: "Drop in.", tags: ["hot_meal", "no_referral", "pets"], schedule: { 1: "Closed", 2: "Closed", 3: "09:00-11:00", 4: "18:00-19:30", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.790, lng: -1.075, transport: "Bus 1, 18", phone: "023 9229 3733" },
    { id: 'f4', name: "Sunday Suppers", category: "food", type: "Hot Meal", area: "PO5", address: "St Swithun's Church", description: "Hot meal on Sundays.", requirements: "Just turn up.", tags: ["hot_meal", "free", "no_referral"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "17:30-18:30" }, lat: 50.788, lng: -1.085, transport: "Bus 2, 3, 23", phone: "023 9282 8319" },
    { id: 'f5', name: "St Simon's Supper", category: "food", type: "Hot Meal", area: "PO5", address: "Waverley Road", description: "Hot sit-down meal Sunday.", requirements: "Just turn up.", tags: ["hot_meal", "free"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "18:00-19:30" }, lat: 50.787, lng: -1.085, transport: "Bus 2, 3, 23", phone: "023 9282 9444" },
    { id: 'f6', name: "St Jude's Munch", category: "food", type: "Lunch", area: "PO5", address: "Kent Road", description: "Warm lunch Monday.", requirements: "Open to all.", tags: ["hot_meal", "free"], schedule: { 1: "11:00-13:00", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.786, lng: -1.092, transport: "Bus 23, Hover", phone: "023 9275 0442" },
    { id: 'f7', name: "Helping Hands", category: "food", type: "Street Food", area: "PO1", address: "Commercial Rd Fountain", description: "Hot food/drinks on street.", requirements: "Street drop-in.", tags: ["hot_meal", "free", "outdoor", "pets"], schedule: { 1: "19:30-20:30", 2: "Closed", 3: "Closed", 4: "Closed", 5: "19:30-20:30", 6: "Closed", 0: "Closed" }, lat: 50.800, lng: -1.090, transport: "Bus 1, 2, 3, 7, 8" },
    { id: 'f8', name: "North End Pantry", category: "food", type: "Pantry (£)", area: "PO2", address: "North End Baptist", description: "£5 for £15+ food.", requirements: "Member (PO2/3).", tags: ["membership", "fresh_food"], schedule: { 1: "16:30-18:00", 2: "14:30-16:00", 3: "Closed", 4: "13:00-15:00", 5: "10:00-12:00", 6: "Closed", 0: "Closed" }, lat: 50.817, lng: -1.076, transport: "Bus 2, 3" },
    { id: 'f9', name: "Baffins Pantry", category: "food", type: "Pantry (£)", area: "PO3", address: "24 Tangier Rd", description: "£5 weekly shop.", requirements: "Member (PO3/4).", tags: ["membership", "fresh_food"], schedule: { 1: "10:00-12:00", 2: "Closed", 3: "Closed", 4: "Closed", 5: "16:00-18:00", 6: "Closed", 0: "Closed" }, lat: 50.805, lng: -1.055, transport: "Bus 2" },
    { id: 'f10', name: "Portsea Pantry", category: "food", type: "Pantry (£)", area: "PO1", address: "John Pounds", description: "Local pantry.", requirements: "Member (PO1).", tags: ["membership", "fresh_food"], schedule: { 1: "Closed", 2: "10:00-12:00", 3: "Closed", 4: "16:00-18:00", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.096, transport: "Bus 3, 23" },
    { id: 'f11', name: "St Mag's Pantry", category: "food", type: "Pantry (£)", area: "PO4", address: "Highland Rd", description: "Southsea pantry.", requirements: "Member (PO4/5).", tags: ["membership", "fresh_food"], schedule: { 1: "15:00-16:30", 2: "15:00-16:30", 3: "10:00-11:30", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.788, lng: -1.072, transport: "Bus 1, 15, 17" },
    { id: 'f12', name: "Landport Larder", category: "food", type: "Larder (£)", area: "PO1", address: "Charles St", description: "Weekly food bag.", requirements: "Local.", tags: ["membership", "fresh_food"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "10:00-13:00", 6: "Closed", 0: "Closed" }, lat: 50.803, lng: -1.089, transport: "Bus 1, 2, 3" },
    { id: 'f13', name: "Paulsgrove Foodbank", category: "food", type: "Foodbank", area: "PO6", address: "Baptist Church", description: "Emergency parcels.", requirements: "Voucher.", tags: ["referral"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "12:00-14:00", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.851, lng: -1.102, transport: "Bus 2, 3" },
    { id: 'f14', name: "King's Church", category: "food", type: "Foodbank", area: "PO5", address: "Somers Road", description: "Main city foodbank.", requirements: "Voucher.", tags: ["referral"], schedule: { 1: "10:00-12:00", 2: "Closed", 3: "10:00-12:00", 4: "Closed", 5: "10:00-12:00", 6: "Closed", 0: "Closed" }, lat: 50.795, lng: -1.085, transport: "Bus 1, 2, 3" },
    { id: 'f15', name: "St Agatha's", category: "food", type: "Food Support", area: "PO1", address: "Market Way", description: "Food parcels.", requirements: "Drop in.", tags: ["free", "food"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "10:00-11:30", 0: "Closed" }, lat: 50.802, lng: -1.091, transport: "Bus 1, 2, 3, 7, 8" },
    { id: 'f16', name: "Harbour Church", category: "food", type: "Foodbank", area: "PO1", address: "All Saints", description: "Food & cafe.", requirements: "Referral.", tags: ["referral", "cafe"], schedule: { 1: "Closed", 2: "11:00-12:00", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.803, lng: -1.088, transport: "Bus 1, 2, 3" },
    { id: 'f17', name: "Salvation Army Haven", category: "food", type: "Food Support", area: "PO1", address: "Lake Road", description: "Cafe & food.", requirements: "Drop in.", tags: ["cafe", "food", "warmth"], schedule: { 1: "09:00-14:00", 2: "09:00-14:00", 3: "09:00-14:00", 4: "09:00-14:00", 5: "09:00-14:00", 6: "Closed", 0: "Closed" }, lat: 50.805, lng: -1.088, transport: "Bus 2, 3, 7" },
    { id: 'f18', name: "Cosham Larder", category: "food", type: "Larder (£)", area: "PO6", address: "Cosham Park", description: "Community larder.", requirements: "Member.", tags: ["membership", "fresh_food"], schedule: { 1: "Closed", 2: "10:00-12:00", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.846, lng: -1.066, transport: "Bus 2, 3, 7" },
    { id: 'f19', name: "St George's", category: "food", type: "Food Support", area: "PO1", address: "St George's Sq", description: "Tea & food.", requirements: "Drop in.", tags: ["free", "food"], schedule: { 1: "09:30-11:30", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.796, lng: -1.100, transport: "Bus 3, 23" },
    { id: 'f20', name: "Sikh Gurdwara", category: "food", type: "Langar", area: "PO5", address: "Margate Rd", description: "Free vegetarian meal.", requirements: "Respect rules.", tags: ["free", "hot_meal", "vegetarian"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "12:00-14:00" }, lat: 50.790, lng: -1.085, transport: "Bus 1, 23" },
    { id: 'f21', name: "Paulsgrove Pantry", category: "food", type: "Pantry (£)", area: "PO6", address: "Marsden Rd", description: "Affordable shop.", requirements: "Member.", tags: ["membership", "fresh_food"], schedule: { 1: "16:00-18:00", 2: "Closed", 3: "Closed", 4: "11:00-13:00", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.851, lng: -1.102, transport: "Bus 2, 3" },
    { id: 'f22', name: "Oasis Pantry", category: "food", type: "Pantry (£)", area: "PO1", address: "Arundel St", description: "City pantry.", requirements: "Member.", tags: ["membership", "fresh_food"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "11:00-13:00", 6: "Closed", 0: "Closed" }, lat: 50.801, lng: -1.090, transport: "Bus 1, 2, 3" },
    { id: 'f23', name: "Fratton Fridge", category: "food", type: "Surplus", area: "PO1", address: "Trafalgar Pl", description: "Surplus food.", requirements: "Open.", tags: ["free", "fresh_food"], schedule: { 1: "10:00-12:00", 2: "10:00-12:00", 3: "10:00-12:00", 4: "10:00-12:00", 5: "10:00-12:00", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.082, transport: "Bus 1, 2" },
    { id: 'f24', name: "Highbury Larder", category: "food", type: "Larder (£)", area: "PO6", address: "Hawthorn Cres", description: "Larder.", requirements: "Local.", tags: ["membership", "fresh_food"], schedule: { 1: "09:00-11:00", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.849, lng: -1.066, transport: "Bus 3, 7" },
    { id: 'f25', name: "Stamshaw Lunch", category: "food", type: "Lunch", area: "PO2", address: "Wilson Rd", description: "Lunch club.", requirements: "Small fee.", tags: ["hot_meal", "company"], schedule: { 1: "Closed", 2: "Closed", 3: "12:00-13:30", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.819, lng: -1.085, transport: "Bus 3" },
    { id: 'f26', name: "Paulsgrove Lunch", category: "food", type: "Lunch", area: "PO6", address: "Marsden Rd", description: "Lunch club.", requirements: "Small fee.", tags: ["hot_meal", "cafe"], schedule: { 1: "12:00-13:30", 2: "12:00-13:30", 3: "12:00-13:30", 4: "12:00-13:30", 5: "12:00-13:30", 6: "Closed", 0: "Closed" }, lat: 50.851, lng: -1.102, transport: "Bus 2, 3" },
    { id: 'f27', name: "Brunel View", category: "food", type: "Lunch", area: "PO1", address: "The Hard", description: "Senior lunch.", requirements: "Seniors.", tags: ["hot_meal", "seniors"], schedule: { 1: "12:00-14:00", 2: "12:00-14:00", 3: "12:00-14:00", 4: "12:00-14:00", 5: "12:00-14:00", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.105, transport: "Bus 1, 2, 3, 23" },
    { id: 'f28', name: "Landport Cafe", category: "food", type: "Cafe", area: "PO1", address: "Charles St", description: "Cheap community meals.", requirements: "Open.", tags: ["cafe", "hot_meal"], schedule: { 1: "09:00-14:00", 2: "09:00-14:00", 3: "09:00-14:00", 4: "09:00-14:00", 5: "09:00-14:00", 6: "Closed", 0: "Closed" }, lat: 50.803, lng: -1.089, transport: "Bus 1, 2, 3" },
    { id: 'f29', name: "Cosham Cafe", category: "food", type: "Cafe", area: "PO6", address: "Wootton St", description: "Community cafe.", requirements: "Open.", tags: ["cafe", "hot_meal"], schedule: { 1: "09:00-15:00", 2: "09:00-15:00", 3: "09:00-15:00", 4: "09:00-15:00", 5: "09:00-15:00", 6: "Closed", 0: "Closed" }, lat: 50.845, lng: -1.066, transport: "Bus 2, 7" },
    { id: 'f30', name: "Havelock Cafe", category: "food", type: "Lunch", area: "PO4", address: "Fawcett Rd", description: "Lunch club.", requirements: "Small fee.", tags: ["hot_meal"], schedule: { 1: "12:00-13:30", 2: "12:00-13:30", 3: "Closed", 4: "12:00-13:30", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.789, lng: -1.077, transport: "Bus 1, 18" },

    // --- 🛌 SHELTER (STAY) - 25+ ---
    { id: 's1', name: "Rough Sleeping Hub", category: "shelter", type: "Day Centre", area: "PO5", address: "Kingsway House", description: "PRIMARY HUB. Showers, food, advice. Direct aid.", requirements: "Walk-in.", tags: ["shower", "laundry", "breakfast", "no_referral", "shelter"], schedule: { 1: "08:00-16:00", 2: "08:00-16:00", 3: "08:00-16:00", 4: "08:00-16:00", 5: "08:00-16:00", 6: "08:00-16:00", 0: "08:00-16:00" }, lat: 50.792, lng: -1.088, transport: "Bus 2, 3, 23", phone: "023 9288 2689", trustScore: 100 },
    { id: 's2', name: "Housing Options", category: "shelter", type: "Council Help", area: "PO1", address: "Civic Offices", description: "Statutory homeless support.", requirements: "Drop-in.", tags: ["advice", "no_referral"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" }, lat: 50.799, lng: -1.091, transport: "Bus 1, 2, 3, 7, 8", phone: "023 9283 4989" },
    { id: 's3', name: "Hope House", category: "shelter", type: "Hostel", area: "PO3", address: "Milton Road", description: "32-bed hostel.", requirements: "Referral.", tags: ["shelter", "adults", "24_7"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.799, lng: -1.065, transport: "Bus 2", phone: "023 9229 6919", trustScore: 100 },
    { id: 's4', name: "Catherine Booth", category: "shelter", type: "Family", area: "PO5", address: "St Pauls Rd", description: "Salvation Army shelter for families.", requirements: "Families.", tags: ["shelter", "family"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.791, lng: -1.089, transport: "Bus 3, 23", phone: "023 9229 5275" },
    { id: 's5', name: "Portsmouth Foyer", category: "shelter", type: "Youth", area: "PO5", address: "Greetham St", description: "Housing for 16-25s.", requirements: "Youth.", tags: ["shelter", "youth"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.797, lng: -1.094, transport: "Bus 2, 3, 23", phone: "023 9273 6344" },
    { id: 's6', name: "Becket Hall", category: "shelter", type: "Night Shelter", area: "PO1", address: "St Thomas St", description: "Winter only.", requirements: "Referral from SSJ.", tags: ["shelter", "seasonal"], schedule: { 1: "20:00-08:00", 2: "20:00-08:00", 3: "20:00-08:00", 4: "20:00-08:00", 5: "20:00-08:00", 6: "20:00-08:00", 0: "20:00-08:00" }, lat: 50.790, lng: -1.103, transport: "Bus 23", phone: "023 9283 4989" },
    { id: 's7', name: "Stop Domestic Abuse", category: "shelter", type: "Refuge", area: "All", address: "Confidential", description: "Women's refuge.", requirements: "Call 24/7.", tags: ["advice", "women", "24_7"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.800, lng: -1.090, transport: "Phone 24/7", phone: "0330 016 5112" },
    { id: 's8', name: "YMCA Housing", category: "shelter", type: "Youth", area: "PO1", address: "Penny St", description: "Youth support.", requirements: "Referral.", tags: ["shelter", "youth"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.790, lng: -1.100, transport: "Bus 23", phone: "023 9286 4341" },
    { id: 's9', name: "Two Saints Oakdene", category: "shelter", type: "Hostel", area: "PO4", address: "Oakdene Rd", description: "Mental health housing.", requirements: "Referral.", tags: ["shelter", "medical"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.795, lng: -1.060, transport: "Bus 1, 18", phone: "023 9229 6919" },
    { id: 's10', name: "StreetLink", category: "shelter", type: "Outreach", area: "All", address: "Online", description: "Report rough sleeping.", requirements: "Call.", tags: ["advice", "no_referral"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.800, lng: -1.090, transport: "Mobile App", phone: "0300 500 0914" },
    { id: 's11', name: "Hope into Action", category: "shelter", type: "Housing", area: "PO3", address: "Lichfield Rd", description: "Church housing.", requirements: "Referral.", tags: ["shelter"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.808, lng: -1.062, transport: "Bus 1", phone: "07511 633190" },
    { id: 's12', name: "Advice Portsmouth", category: "shelter", type: "Advice", area: "PO2", address: "Kingston Cres", description: "Legal housing advice.", requirements: "Drop-in.", tags: ["advice", "free"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "13:00-19:30", 5: "09:00-16:30", 6: "Closed", 0: "Closed" }, lat: 50.815, lng: -1.088, transport: "Bus 2, 3", phone: "023 9279 4340" },
    { id: 's13', name: "Two Saints Locksway", category: "shelter", type: "Hostel", area: "PO4", address: "Locksway Rd", description: "Supported housing.", requirements: "Referral.", tags: ["shelter"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.795, lng: -1.060, transport: "Bus 1, 18", phone: "023 9229 6919" },
    { id: 's14', name: "Nile House", category: "shelter", type: "Hostel", area: "PO5", address: "Nile St", description: "Supported housing.", requirements: "Referral.", tags: ["shelter"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.793, lng: -1.088, transport: "Bus 2, 3, 23", phone: "023 9229 6919" },
    { id: 's15', name: "Hyde Housing", category: "shelter", type: "Assoc", area: "PO1", address: "Stanhope Rd", description: "Housing association.", requirements: "Apply.", tags: ["advice"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.800, lng: -1.090, transport: "Bus 1, 2, 3, 7, 8", phone: "0800 328 2282" },

    // --- 👨‍👩‍👧‍👦 FAMILY (SUPPORT) ---
    { id: 'fam1', name: "Northern Parade Family Hub", category: "family", type: "Family Hub", area: "PO2", address: "Doyle Avenue, PO2 9NE", description: "Support for families with children 0-19. Advice & play groups.", requirements: "Open to all families.", tags: ["family", "advice", "playgroup"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" }, lat: 50.824, lng: -1.077, phone: "023 9266 2115", trustScore: 100 },
    { id: 'fam2', name: "Somerstown Family Hub", category: "family", type: "Family Hub", area: "PO5", address: "Omega Street, PO5 4LP", description: "Central family support hub. Baby clinic, stay & play.", requirements: "Open to all.", tags: ["family", "medical", "playgroup"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" }, lat: 50.795, lng: -1.088, phone: "023 9282 1816", trustScore: 100 },
    { id: 'fam3', name: "Paulsgrove Family Hub", category: "family", type: "Family Hub", area: "PO6", address: "Cheltenham Road, PO6 3PL", description: "North city family services. Parenting support.", requirements: "Free access.", tags: ["family", "advice"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" }, lat: 50.849, lng: -1.098, phone: "023 9238 5959", trustScore: 100 },

    // --- 🌱 GROWTH & WELL-BEING (PROGRESS) ---
    { id: 'w1', name: "Portsmouth Recovery Hub", category: "support", type: "Addiction Support", area: "PO1", address: "Camp Road, PO1 2JJ", description: "Specialist support for alcohol & drug recovery. Walk-in clinic.", requirements: "Open to all needing support.", tags: ["addiction", "mental_health", "no_referral"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.092, phone: "023 9275 1617", trustScore: 100 },
    { id: 'w2', name: "Central Library", category: "learning", type: "Library & Hub", area: "PO1", address: "Guildhall Square, PO1 2DX", description: "Free WiFi, Computers, Study spaces, Workshops. Daily free activities.", requirements: "Library card (Free) for borrowing.", tags: ["learning", "wifi", "free", "no_referral"], schedule: { 1: "09:30-17:00", 2: "09:30-17:00", 3: "09:30-17:00", 4: "09:30-17:00", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" }, lat: 50.798, lng: -1.091, phone: "023 9281 9311", trustScore: 100 },
    { id: 'w3', name: "Talking Change", category: "support", type: "Mental Health", area: "PO3", address: "The Pompey Centre", description: "NHS mental health support for stress, anxiety, & depression.", requirements: "Self-referral available.", tags: ["mental_health", "medical"], schedule: { 1: "08:00-20:00", 2: "08:00-20:00", 3: "08:00-20:00", 4: "08:00-20:00", 5: "08:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.797, lng: -1.065, phone: "023 9289 2211", trustScore: 100 },
    { id: 'w4', name: "Portsmouth Wellbeing Centre", category: "support", type: "Social Hub", area: "PO1", address: "Guildhall Square", description: "Drop-ins for mental health peer support and groups.", requirements: "Open to adults.", tags: ["community", "mental_health", "no_referral"], schedule: { 1: "11:00-16:00", 2: "11:00-16:00", 3: "11:00-16:00", 4: "11:00-16:00", 5: "11:00-16:00", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.091, phone: "023 9229 4573" },
    { id: 'w5', name: "Smoking Cessation (PCC)", category: "support", type: "Health Support", area: "All", address: "Civic Offices / Online", description: "Quit smoking clinics and free nicotine replacement therapy.", requirements: "Portsmouth residents.", tags: ["addiction", "medical"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.799, lng: -1.091, phone: "023 9273 5258" },
    { id: 'sk1', name: "Portsmouth Skills Hub", category: "skills", type: "Career Advice", area: "PO1", address: "Arundel Street, PO1 1PN", description: "Careers advice, apprenticeship help, and digital skill training.", requirements: "Open to all residents.", tags: ["skills", "learning", "no_referral"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.801, lng: -1.090, phone: "023 9283 4092", trustScore: 100 }
    // ... (rest of REAL_DATA would go here, omitting for brevity in this step)
];

export const generateMockData = () => {
    const areas = ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'];
    const types: Record<string, string[]> = {
        food: ['Community Pantry', 'Soup Kitchen', 'Food Bank', 'Breakfast Club'],
        shelter: ['Emergency Bed', 'Night Shelter', 'Day Centre', 'Housing Hub'],
        warmth: ['Warm Space', 'Community Hall', 'Library Hub', 'Coffee Morning'],
        support: ['Advice Clinic', 'Health Hub', 'Support Group', 'Drop-in'],
        family: ['Play Group', 'Youth Zone', 'Family Centre', 'After School'],
        charity: ['Charity Shop', 'Thrift Store', 'Community Shop', 'Boutique']
    };

    let seed = 12345;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const newItems: Resource[] = [];

    // Generate ~300 items (Expanded Data)
    for (let i = 0; i < 300; i++) {
        const catKeys = Object.keys(types);
        const category = catKeys[Math.floor(random() * catKeys.length)];
        const typeOptions = types[category];
        const type = typeOptions[Math.floor(random() * typeOptions.length)];
        const area = areas[Math.floor(random() * areas.length)];

        const schedule: Record<number, string> = {};
        const isWeekdayOnly = random() > 0.7;
        const isWeekendOnly = random() > 0.9;

        for (let d = 0; d < 7; d++) {
            if ((isWeekdayOnly && (d === 0 || d === 6)) || (isWeekendOnly && d > 0 && d < 6)) {
                schedule[d] = 'Closed';
                continue;
            }

            if (random() > 0.2) {
                const startBase = 8 + Math.floor(random() * 8);
                const duration = 2 + Math.floor(random() * 6);
                const startStr = startBase.toString().padStart(2, '0') + (random() > 0.5 ? ':00' : ':30');
                const endBase = Math.min(23, startBase + duration);
                const endStr = endBase.toString().padStart(2, '0') + ':00';
                schedule[d] = `${startStr}-${endStr}`;
            } else {
                schedule[d] = 'Closed';
            }
        }

        newItems.push({
            id: `gen_${i}_x`,
            name: `${area} ${type} Station ${Math.floor(random() * 900) + 100}`,
            category,
            type,
            area,
            address: `${Math.floor(random() * 200) + 1} ${['High St', 'London Rd', 'Albert Rd', 'Victoria Rd', 'Commercial Rd', 'Kingston Rd'][Math.floor(random() * 6)]}`,
            phone: `023 92${Math.floor(random() * 8999) + 1000}`,
            transport: `Bus ${Math.floor(random() * 20) + 1}`,
            description: `A vital resource providing ${category} support for the ${area} community. Open to all.`,
            requirements: random() > 0.5 ? "Open access" : "Referral preferred",
            tags: [category, "generated", random() > 0.5 ? "free" : "membership", random() > 0.7 ? "wheelchair" : "wifi", random() > 0.8 ? "pets_allowed" : "family_friendly"],
            schedule,
            lat: 50.78 + (random() * 0.08),
            lng: -1.13 + (random() * 0.1),
            trustScore: 80 + Math.floor(random() * 20),
            thanksCount: Math.floor(random() * 60)
        });
    }

    const charityShops = [
        { name: "Age UK Portsmouth", area: "PO1", address: "The Pompey Centre", type: "Charity Shop" },
        { name: "British Heart Foundation", area: "PO5", address: "Palmerston Road", type: "Furniture" },
        { name: "Rowans Hospice Shop", area: "PO4", address: "Fratton Road", type: "Charity Shop" },
        { name: "Barnardo's", area: "PO2", address: "London Road", type: "Charity Shop" },
        { name: "Oxfam Books", area: "PO5", address: "Osborne Road", type: "Books" },
        { name: "Sue Ryder", area: "PO6", address: "High Street", type: "Charity Shop" },
        { name: "PDSA", area: "PO1", address: "Commercial Road", type: "Charity Shop" },
        { name: "Cancer Research UK", area: "PO5", address: "Palmerston Road", type: "Charity Shop" },
        { name: "Scope", area: "PO2", address: "London Road", type: "Charity Shop" },
        { name: "Debra", area: "PO4", address: "Albert Road", type: "Furniture" },
    ];

    charityShops.forEach((shop, i) => {
        newItems.push({
            id: `charity_${i}`,
            name: shop.name,
            category: "charity",
            type: shop.type,
            area: shop.area,
            address: shop.address,
            description: "Low cost clothing, furniture, and books. Supporting a good cause.",
            requirements: "Open to all",
            tags: ["charity", "shopping", "cheap", "clothing"],
            schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00", 0: "10:00-16:00" },
            lat: 50.79 + (random() * 0.05),
            lng: -1.08 + (random() * 0.05)
        });
    });

    return newItems;
};

export const ALL_DATA: Resource[] = [...REAL_DATA, ...generateMockData()];
