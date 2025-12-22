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
    learning: { icon: 'book-open', label: 'Learning', color: 'text-amber-700', bg: 'bg-amber-50', hex: '#b45309' },
    skills: { icon: 'briefcase', label: 'Skills', color: 'text-indigo-700', bg: 'bg-indigo-50', hex: '#4338ca' },
    charity: { icon: 'shopping-bag', label: 'Charity', color: 'text-pink-500', bg: 'bg-pink-50', hex: '#ec4899' },
    default: { icon: 'info', label: 'Info', color: 'text-gray-500', bg: 'bg-gray-50', hex: '#6b7280' }
};

export const REAL_DATA: Resource[] = [
    // --- 🟢 FOOD ---
    { id: 'f_hive_1', name: "Pompey Community Fridge", category: "food", type: "Surplus Food", area: "PO4", address: "Fratton Park, PO4 8SX", description: "Reducing food waste by providing free surplus food parcels. Please bring your own bag.", requirements: "Open to all.", tags: ["free", "fresh_food", "no_referral"], schedule: { 1: "13:00-15:00", 2: "13:00-15:00", 3: "13:00-15:00", 4: "13:00-15:00", 5: "13:00-15:00" }, lat: 50.796, lng: -1.064, phone: "023 9273 1141", trustScore: 98 },
    { id: 'f_hive_2', name: "FoodCycle Portsmouth", category: "food", type: "Hot Meal", area: "PO1", address: "John Pounds Centre, Queen St, PO1 3HN", description: "Providing a free three-course vegetarian meal in a community setting.", requirements: "No booking required, just turn up.", tags: ["free", "hot_meal", "no_referral"], schedule: { 3: "18:00-19:30" }, lat: 50.798, lng: -1.096, trustScore: 100 },
    { id: 'f_hive_3', name: "LifeHouse Kitchen", category: "food", type: "Soup Kitchen", area: "PO5", address: "153 Albert Road, PO4 0JW", description: "Hot breakfast and dinner for the homeless and vulnerable. Advice and clothing also available.", requirements: "Drop-in.", tags: ["hot_meal", "shower", "no_referral"], schedule: { 3: "09:00-11:00", 4: "18:00-19:30" }, lat: 50.789, lng: -1.075, phone: "07800 933983" },
    { id: 'f_hive_4', name: "St Agatha's Food Support", category: "food", type: "Emergency Food", area: "PO1", address: "Market Way, PO1 4AD", description: "Saturday morning emergency food parcel distribution.", requirements: "Drop-in.", tags: ["free", "food"], schedule: { 6: "10:00-11:30" }, lat: 50.802, lng: -1.091 },
    { id: 'f_hive_5', name: "Portsea Pantry", category: "food", type: "Social Supermarket", area: "PO1", address: "John Pounds Centre", description: "Pay £5 to choose £15-£20 worth of groceries.", requirements: "Member-based (PO1 residents).", tags: ["membership", "fresh_food"], schedule: { 2: "10:00-12:00", 4: "16:00-18:00" }, lat: 50.798, lng: -1.096 },
    { id: 'f_hive_6', name: "North End Pantry", category: "food", type: "Social Supermarket", area: "PO2", address: "North End Baptist Church, Powerscourt Rd", description: "High-quality food at affordable prices for PO2/3 residents.", requirements: "Membership required.", tags: ["membership", "fresh_food"], schedule: { 1: "16:30-18:00", 2: "14:30-16:00", 4: "13:00-15:00", 5: "10:00-12:00" }, lat: 50.817, lng: -1.076 },

    // --- 🛌 SHELTER ---
    { id: 's_hive_1', name: "Rough Sleeping Hub", category: "shelter", type: "Day Centre", area: "PO5", address: "Kingsway House, 130 Elm Grove", description: "Central hub for homeless support. Showers, laundry, breakfast and housing advice.", requirements: "Open access drop-in.", tags: ["shower", "laundry", "breakfast", "no_referral", "shelter"], schedule: { 1: "08:00-16:00", 2: "08:00-16:00", 3: "08:00-16:00", 4: "08:00-16:00", 5: "08:00-16:00", 6: "08:00-16:00", 0: "08:00-16:00" }, lat: 50.792, lng: -1.088, phone: "023 9288 2689", trustScore: 100 },
    { id: 's_hive_2', name: "Housing Options (PCC)", category: "shelter", type: "Council Help", area: "PO1", address: "Civic Offices, Guildhall Sq", description: "Official statutory homelessness assistance and housing register assessment.", requirements: "Visit during office hours.", tags: ["advice", "no_referral"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:00" }, lat: 50.799, lng: -1.091, phone: "023 9283 4989" },
    { id: 's_hive_3', name: "Becket Hall Night Shelter", category: "shelter", type: "Night Shelter", area: "PO1", address: "St Thomas St", description: "Winter emergency shelter. Referral required via SSJ or PCC.", requirements: "Referral only.", tags: ["shelter", "seasonal"], schedule: { 0: "20:00-08:00", 1: "20:00-08:00", 2: "20:00-08:00", 3: "20:00-08:00", 4: "20:00-08:00", 5: "20:00-08:00", 6: "20:00-08:00" }, lat: 50.790, lng: -1.103 },
    { id: 's_hive_4', name: "Catherine Booth House", category: "shelter", type: "Family Hostel", area: "PO5", address: "St Pauls Rd, PO5 4AQ", description: "High-support hostel for families experiencing homelessness.", requirements: "Via Council referral.", tags: ["shelter", "family"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.791, lng: -1.089, phone: "023 9229 5275" },

    // --- 👨‍👩‍👧‍👦 FAMILY ---
    { id: 'fam_hive_1', name: "Northern Parade Family Hub", category: "family", type: "Family Hub", area: "PO2", address: "Doyle Avenue, PO2 9NE", description: "Support for families with children aged 0-19. Health and development advice.", requirements: "Open to all families.", tags: ["family", "advice", "playgroup"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30" }, lat: 50.824, lng: -1.077, phone: "023 9266 2115" },
    { id: 'fam_hive_2', name: "Somerstown Family Hub", category: "family", type: "Family Hub", area: "PO5", address: "Omega Street, PO5 4LP", description: "Central family support. Clinics, stay & play, and consultation.", requirements: "Open to all families.", tags: ["family", "medical", "playgroup"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30" }, lat: 50.795, lng: -1.088, phone: "023 9282 1816" },

    // --- 🧠 SUPPORT ---
    { id: 'sup_hive_1', name: "HIVE Portsmouth Hub", category: "support", type: "Community Hub", area: "PO1", address: "Central Library, Guildhall Sq", description: "Information, volunteer opportunities, and social resource referrals.", requirements: "Drop-in.", tags: ["advice", "support", "no_referral"], schedule: { 1: "09:30-16:00", 2: "09:30-16:00", 3: "09:30-16:00", 4: "09:30-16:00", 5: "09:30-16:00" }, lat: 50.798, lng: -1.091, phone: "023 9261 6709", trustScore: 100 },
    { id: 'sup_hive_2', name: "PositiveMinds", category: "support", type: "Well-being Hub", area: "PO5", address: "2235-2241 Melbourne Pl, PO5 4EW", description: "Emotional support, stress management, and mental health guidance.", requirements: "Drop-in or phone.", tags: ["mental_health", "advice"], schedule: { 1: "09:30-16:00", 2: "09:30-16:00", 3: "09:30-16:00", 4: "09:30-16:00", 5: "09:30-16:00" }, lat: 50.792, lng: -1.085, phone: "023 9282 4795" },

    // --- 📖 LEARNING & WARMTH ---
    { id: 'l_hive_1', name: "Central Library", category: "learning", type: "Library", area: "PO1", address: "Guildhall Square, PO1 2DX", description: "WiFi, computer access, study spaces, and hot drinks. Official warm space.", requirements: "Open to all.", tags: ["learning", "wifi", "warmth"], schedule: { 1: "09:30-17:00", 2: "09:30-17:00", 3: "09:30-17:00", 4: "09:30-17:00", 5: "09:30-17:00", 6: "10:00-15:30" }, lat: 50.798, lng: -1.091 },
    { id: 'l_hive_2', name: "Southsea Library", category: "learning", type: "Library", area: "PO5", address: "19-21 Palmerston Rd, PO5 3QQ", description: "Features a HIVE service desk for community resource queries.", requirements: "Public access.", tags: ["learning", "wifi", "warmth"], schedule: { 1: "09:30-17:30", 2: "09:30-17:30", 3: "09:30-17:30", 4: "09:30-17:30", 5: "09:30-17:30", 6: "10:00-16:00" }, lat: 50.785, lng: -1.091 },

    // --- 🛍️ CHARITY ---
    { id: 'ch_hive_1', name: "Rowans Hospice Charity Shop", category: "charity", type: "Charity Shop", area: "PO4", address: "145 Fratton Road", description: "Low-cost clothing and books. Proceeds support local hospice care.", requirements: "Public shopping.", tags: ["clothing", "charity"], schedule: { 1: "09:30-16:30", 2: "09:30-16:30", 3: "09:30-16:30", 4: "09:30-16:30", 5: "09:30-16:30", 6: "09:30-16:30" }, lat: 50.803, lng: -1.082 }
];

export const ALL_DATA: Resource[] = [...REAL_DATA];

export const SUPERMARKET_TIPS = [
    { store: "Co-op", time: "After 18:00", note: "Look for 75% red sticker reductions before closing." },
    { store: "Tesco Express", time: "After 19:30", note: "Final markdown for sandwiches and fresh produce." },
    { store: "Waitrose Southsea", time: "17:00-19:00", note: "High-quality deli items are often significantly discounted." }
];

export const COMMUNITY_DEALS = [
    { id: 'deal1', store: "Tesco Extra (Fratton)", deal: "Final Reductions (75%+)", time: "Daily 19:30-21:00", info: "Check the chilled cabinet at the back of the store.", lat: 50.796, lng: -1.077 },
    { id: 'deal2', store: "Co-op (Albert Rd)", deal: "Surplus Bread Bags", time: "Weekdays 18:00", info: "Often have 50p bread mix bags available.", lat: 50.787, lng: -1.082 }
];

export const GIFT_EXCHANGE = [
    { id: 'gift1', item: "Winter Coat Exchange", location: "St Jude's Hub", date: "Every Friday", info: "Pick up or drop off clean winter coats.", lat: 50.786, lng: -1.092 },
    { id: 'gift2', item: "School Uniform Swap", location: "Somerstown Hub", date: "Daily", info: "Gently used, clean uniforms for local schools.", lat: 50.795, lng: -1.088 }
];

export const PROGRESS_TIPS = [
    { title: "Digital Skills Workshops", note: "Free computer sessions every Wednesday 10am at Central Library." },
    { title: "Stop Smoking Support", note: "Council provided nicotine patches and consultation (w5)." },
    { title: "Talking Change", note: "Free NHS counseling for mental health, self-referral available." }
];
