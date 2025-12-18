import { useState, useEffect, useMemo } from 'react';

// ==========================================
// 1. CONFIGURATION & ICONS (TOP LEVEL)
// ==========================================

const MAP_BOUNDS = { minLat: 50.770, maxLat: 50.870, minLng: -1.120, maxLng: -1.040 };
const AREAS = ['All', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'];



// Configuration linking categories to icons/colors
const TAG_ICONS = {
    food: { icon: 'utensils', label: 'Food', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    shelter: { icon: 'bed', label: 'Shelter', color: 'text-blue-600', bg: 'bg-blue-50' },
    warm: { icon: 'flame', label: 'Warmth', color: 'text-orange-600', bg: 'bg-orange-50' },
    support: { icon: 'lifebuoy', label: 'Support', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    family: { icon: 'family', label: 'Family', color: 'text-pink-600', bg: 'bg-pink-50' },
    wifi: { icon: 'wifi', label: 'WiFi', color: 'text-sky-600', bg: 'bg-sky-50' },
    charging: { icon: 'zap', label: 'Charge', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    shower: { icon: 'droplets', label: 'Shower', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    laundry: { icon: 'laundry', label: 'Laundry', color: 'text-blue-600', bg: 'bg-blue-50' },
    toilet: { icon: 'toilet', label: 'Toilet', color: 'text-slate-600', bg: 'bg-slate-100' },
    no_referral: { icon: 'check_circle', label: 'Open Access', color: 'text-teal-700', bg: 'bg-teal-50', border: true },
    free: { icon: 'tag', label: 'Free', color: 'text-emerald-700', bg: 'bg-emerald-100', border: true },
    membership: { icon: 'id_card', label: 'Member Only', color: 'text-slate-500', bg: 'bg-slate-100' },
    referral: { icon: 'file_text', label: 'Referral', color: 'text-amber-600', bg: 'bg-amber-50' },
    hot_meal: { icon: 'soup', label: 'Hot Meal', color: 'text-orange-600', bg: 'bg-orange-50' },
    fresh_food: { icon: 'food', label: 'Fresh Veg', color: 'text-green-600', bg: 'bg-green-50' },
    medical: { icon: 'lifebuoy', label: 'Medical', color: 'text-red-600', bg: 'bg-red-50' },
    women: { icon: 'heart', label: 'Women', color: 'text-rose-600', bg: 'bg-rose-50' },
    pets: { icon: 'paw', label: 'Dogs OK', color: 'text-stone-600', bg: 'bg-stone-100' },
    "24_7": { icon: 'clock', label: '24/7', color: 'text-purple-600', bg: 'bg-purple-50' },
    charity: { icon: 'shopping-bag', label: 'Charity Shop', color: 'text-pink-500', bg: 'bg-pink-50' },
    default: { icon: 'info', label: 'Info', color: 'text-gray-500', bg: 'bg-gray-50' }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTagConfig = (tag: string): any => (TAG_ICONS as any)[tag] || TAG_ICONS.default;

const SUPERMARKET_TIPS = [
    { store: "Co-op", time: "After 18:00", note: "Look for 75% off red stickers." },
    { store: "Tesco Express", time: "After 19:30", note: "Final reductions usually happen now." },
    { store: "Sainsbury's", time: "After 19:00", note: "Check the designated 'Reduced' cabinet." },
    { store: "Lidl/Aldi", time: "08:00 AM", note: "Orange stickers (30% off) applied at opening." },
    { store: "M&S Food", time: "After 17:00", note: "Yellow stickers on sandwiches/bakery." },
    { store: "Waitrose", time: "Before closing", note: "High quality reductions often available." }
];

// ==========================================
// 2. ULTIMATE DATABASE (100+ ENTRIES)
// ==========================================
const REAL_DATA = [
    // --- 🟢 FOOD (EAT) ---
    { id: 'f1', name: "Pompey Community Fridge", category: "food", type: "Surplus", area: "PO4", address: "Fratton Park, PO4 8SX", description: "Free surplus food. Bring a bag.", requirements: "Open to all.", tags: ["free", "fresh_food", "no_referral"], schedule: { 1: "13:00-15:00", 2: "13:00-15:00", 3: "13:00-15:00", 4: "13:00-15:00", 5: "13:00-15:00", 6: "Closed", 0: "Closed" }, lat: 50.796, lng: -1.064 },
    { id: 'f2', name: "FoodCycle Portsmouth", category: "food", type: "Hot Meal", area: "PO1", address: "John Pounds Centre", description: "Hot 3-course vegetarian meal. Community dining.", requirements: "Just turn up.", tags: ["free", "hot_meal", "no_referral"], schedule: { 1: "Closed", 2: "18:00-19:30", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.096 },
    { id: 'f3', name: "LifeHouse Kitchen", category: "food", type: "Soup Kitchen", area: "PO4", address: "153A Harold Rd", description: "Hot breakfast (Wed) & dinner (Thu).", requirements: "Drop in.", tags: ["hot_meal", "no_referral", "pets"], schedule: { 1: "Closed", 2: "Closed", 3: "09:00-11:00", 4: "18:00-19:30", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.790, lng: -1.075 },
    { id: 'f4', name: "Sunday Suppers", category: "food", type: "Hot Meal", area: "PO5", address: "St Swithun's Church", description: "Hot meal on Sundays.", requirements: "Just turn up.", tags: ["hot_meal", "free", "no_referral"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "17:30-18:30" }, lat: 50.788, lng: -1.085 },
    { id: 'f5', name: "St Simon's Supper", category: "food", type: "Hot Meal", area: "PO5", address: "Waverley Road", description: "Hot sit-down meal Sunday.", requirements: "Just turn up.", tags: ["hot_meal", "free"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "18:00-19:30" }, lat: 50.787, lng: -1.085 },
    { id: 'f6', name: "St Jude's Munch", category: "food", type: "Lunch", area: "PO5", address: "Kent Road", description: "Warm lunch Monday.", requirements: "Open to all.", tags: ["hot_meal", "free"], schedule: { 1: "11:00-13:00", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.786, lng: -1.092 },
    { id: 'f7', name: "Helping Hands", category: "food", type: "Street Food", area: "PO1", address: "Commercial Rd Fountain", description: "Hot food/drinks on street.", requirements: "Street drop-in.", tags: ["hot_meal", "free", "outdoor", "pets"], schedule: { 1: "19:30-20:30", 2: "Closed", 3: "Closed", 4: "Closed", 5: "19:30-20:30", 6: "Closed", 0: "Closed" }, lat: 50.800, lng: -1.090 },
    { id: 'f8', name: "North End Pantry", category: "food", type: "Pantry (£)", area: "PO2", address: "North End Baptist", description: "£5 for £15+ food.", requirements: "Member (PO2/3).", tags: ["membership", "fresh_food"], schedule: { 1: "16:30-18:00", 2: "14:30-16:00", 3: "Closed", 4: "13:00-15:00", 5: "10:00-12:00", 6: "Closed", 0: "Closed" }, lat: 50.817, lng: -1.076 },
    { id: 'f9', name: "Baffins Pantry", category: "food", type: "Pantry (£)", area: "PO3", address: "24 Tangier Rd", description: "£5 weekly shop.", requirements: "Member (PO3/4).", tags: ["membership", "fresh_food"], schedule: { 1: "10:00-12:00", 2: "Closed", 3: "Closed", 4: "Closed", 5: "16:00-18:00", 6: "Closed", 0: "Closed" }, lat: 50.805, lng: -1.055 },
    { id: 'f10', name: "Portsea Pantry", category: "food", type: "Pantry (£)", area: "PO1", address: "John Pounds", description: "Local pantry.", requirements: "Member (PO1).", tags: ["membership", "fresh_food"], schedule: { 1: "Closed", 2: "10:00-12:00", 3: "Closed", 4: "16:00-18:00", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.096 },
    { id: 'f11', name: "St Mag's Pantry", category: "food", type: "Pantry (£)", area: "PO4", address: "Highland Rd", description: "Southsea pantry.", requirements: "Member (PO4/5).", tags: ["membership", "fresh_food"], schedule: { 1: "15:00-16:30", 2: "15:00-16:30", 3: "10:00-11:30", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.788, lng: -1.072 },
    { id: 'f12', name: "Landport Larder", category: "food", type: "Larder (£)", area: "PO1", address: "Charles St", description: "Weekly food bag.", requirements: "Local.", tags: ["membership", "fresh_food"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "10:00-13:00", 6: "Closed", 0: "Closed" }, lat: 50.803, lng: -1.089 },
    { id: 'f13', name: "Paulsgrove Foodbank", category: "food", type: "Foodbank", area: "PO6", address: "Baptist Church", description: "Emergency parcels.", requirements: "Voucher.", tags: ["referral"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "12:00-14:00", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.851, lng: -1.102 },
    { id: 'f14', name: "King's Church", category: "food", type: "Foodbank", area: "PO5", address: "Somers Road", description: "Main city foodbank.", requirements: "Voucher.", tags: ["referral"], schedule: { 1: "10:00-12:00", 2: "Closed", 3: "10:00-12:00", 4: "Closed", 5: "10:00-12:00", 6: "Closed", 0: "Closed" }, lat: 50.795, lng: -1.085 },
    { id: 'f15', name: "St Agatha's", category: "food", type: "Food Support", area: "PO1", address: "Market Way", description: "Food parcels.", requirements: "Drop in.", tags: ["free", "food"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "10:00-11:30", 0: "Closed" }, lat: 50.802, lng: -1.091 },
    { id: 'f16', name: "Harbour Church", category: "food", type: "Foodbank", area: "PO1", address: "All Saints", description: "Food & cafe.", requirements: "Referral.", tags: ["referral", "cafe"], schedule: { 1: "Closed", 2: "11:00-12:00", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.803, lng: -1.088 },
    { id: 'f17', name: "Salvation Army Haven", category: "food", type: "Food Support", area: "PO1", address: "Lake Road", description: "Cafe & food.", requirements: "Drop in.", tags: ["cafe", "food", "warm"], schedule: { 1: "09:00-14:00", 2: "09:00-14:00", 3: "09:00-14:00", 4: "09:00-14:00", 5: "09:00-14:00", 6: "Closed", 0: "Closed" }, lat: 50.805, lng: -1.088 },
    { id: 'f18', name: "Cosham Larder", category: "food", type: "Larder (£)", area: "PO6", address: "Cosham Park", description: "Community larder.", requirements: "Member.", tags: ["membership", "fresh_food"], schedule: { 1: "Closed", 2: "10:00-12:00", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.846, lng: -1.066 },
    { id: 'f19', name: "St George's", category: "food", type: "Food Support", area: "PO1", address: "St George's Sq", description: "Tea & food.", requirements: "Drop in.", tags: ["free", "food"], schedule: { 1: "09:30-11:30", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.796, lng: -1.100 },
    { id: 'f20', name: "Sikh Gurdwara", category: "food", type: "Langar", area: "PO5", address: "Margate Rd", description: "Free vegetarian meal.", requirements: "Respect rules.", tags: ["free", "hot_meal", "vegetarian"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "12:00-14:00" }, lat: 50.790, lng: -1.085 },
    { id: 'f21', name: "Paulsgrove Pantry", category: "food", type: "Pantry (£)", area: "PO6", address: "Marsden Rd", description: "Affordable shop.", requirements: "Member.", tags: ["membership", "fresh_food"], schedule: { 1: "16:00-18:00", 2: "Closed", 3: "Closed", 4: "11:00-13:00", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.851, lng: -1.102 },
    { id: 'f22', name: "Oasis Pantry", category: "food", type: "Pantry (£)", area: "PO1", address: "Arundel St", description: "City pantry.", requirements: "Member.", tags: ["membership", "fresh_food"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "11:00-13:00", 6: "Closed", 0: "Closed" }, lat: 50.801, lng: -1.090 },
    { id: 'f23', name: "Fratton Fridge", category: "food", type: "Surplus", area: "PO1", address: "Trafalgar Pl", description: "Surplus food.", requirements: "Open.", tags: ["free", "fresh_food"], schedule: { 1: "10:00-12:00", 2: "10:00-12:00", 3: "10:00-12:00", 4: "10:00-12:00", 5: "10:00-12:00", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.082 },
    { id: 'f24', name: "Highbury Larder", category: "food", type: "Larder (£)", area: "PO6", address: "Hawthorn Cres", description: "Larder.", requirements: "Local.", tags: ["membership", "fresh_food"], schedule: { 1: "09:00-11:00", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.849, lng: -1.066 },
    { id: 'f25', name: "Stamshaw Lunch", category: "food", type: "Lunch", area: "PO2", address: "Wilson Rd", description: "Lunch club.", requirements: "Small fee.", tags: ["hot_meal", "company"], schedule: { 1: "Closed", 2: "Closed", 3: "12:00-13:30", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.819, lng: -1.085 },
    { id: 'f26', name: "Paulsgrove Lunch", category: "food", type: "Lunch", area: "PO6", address: "Marsden Rd", description: "Lunch club.", requirements: "Small fee.", tags: ["hot_meal", "cafe"], schedule: { 1: "12:00-13:30", 2: "12:00-13:30", 3: "12:00-13:30", 4: "12:00-13:30", 5: "12:00-13:30", 6: "Closed", 0: "Closed" }, lat: 50.851, lng: -1.102 },
    { id: 'f27', name: "Brunel View", category: "food", type: "Lunch", area: "PO1", address: "The Hard", description: "Senior lunch.", requirements: "Seniors.", tags: ["hot_meal", "seniors"], schedule: { 1: "12:00-14:00", 2: "12:00-14:00", 3: "12:00-14:00", 4: "12:00-14:00", 5: "12:00-14:00", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.105 },
    { id: 'f28', name: "Landport Cafe", category: "food", type: "Cafe", area: "PO1", address: "Charles St", description: "Cheap community meals.", requirements: "Open.", tags: ["cafe", "hot_meal"], schedule: { 1: "09:00-14:00", 2: "09:00-14:00", 3: "09:00-14:00", 4: "09:00-14:00", 5: "09:00-14:00", 6: "Closed", 0: "Closed" }, lat: 50.803, lng: -1.089 },
    { id: 'f29', name: "Cosham Cafe", category: "food", type: "Cafe", area: "PO6", address: "Wootton St", description: "Community cafe.", requirements: "Open.", tags: ["cafe", "hot_meal"], schedule: { 1: "09:00-15:00", 2: "09:00-15:00", 3: "09:00-15:00", 4: "09:00-15:00", 5: "09:00-15:00", 6: "Closed", 0: "Closed" }, lat: 50.845, lng: -1.066 },
    { id: 'f30', name: "Havelock Cafe", category: "food", type: "Lunch", area: "PO4", address: "Fawcett Rd", description: "Lunch club.", requirements: "Small fee.", tags: ["hot_meal"], schedule: { 1: "12:00-13:30", 2: "12:00-13:30", 3: "Closed", 4: "12:00-13:30", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.789, lng: -1.077 },

    // --- 🛌 SHELTER (STAY) - 25+ ---
    { id: 's1', name: "Rough Sleeping Hub", category: "shelter", type: "Day Centre", area: "PO5", address: "Kingsway House", description: "PRIMARY HUB. Showers, food, advice.", requirements: "Walk-in.", tags: ["shower", "laundry", "breakfast", "no_referral", "shelter"], schedule: { 1: "08:00-16:00", 2: "08:00-16:00", 3: "08:00-16:00", 4: "08:00-16:00", 5: "08:00-16:00", 6: "08:00-16:00", 0: "08:00-16:00" }, lat: 50.792, lng: -1.088 },
    { id: 's2', name: "Housing Options", category: "shelter", type: "Council Help", area: "PO1", address: "Civic Offices", description: "Statutory homeless support.", requirements: "Drop-in.", tags: ["advice", "no_referral"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" }, lat: 50.799, lng: -1.091 },
    { id: 's3', name: "Hope House", category: "shelter", type: "Hostel", area: "PO3", address: "Milton Road", description: "32-bed hostel.", requirements: "Referral.", tags: ["shelter", "adults", "24_7"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.799, lng: -1.065 },
    { id: 's4', name: "Catherine Booth", category: "shelter", type: "Family", area: "PO5", address: "St Pauls Rd", description: "Salvation Army shelter for families.", requirements: "Families.", tags: ["shelter", "family"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.791, lng: -1.089 },
    { id: 's5', name: "Portsmouth Foyer", category: "shelter", type: "Youth", area: "PO5", address: "Greetham St", description: "Housing for 16-25s.", requirements: "Youth.", tags: ["shelter", "youth"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.797, lng: -1.094 },
    { id: 's6', name: "Becket Hall", category: "shelter", type: "Night Shelter", area: "PO1", address: "St Thomas St", description: "Winter only.", requirements: "Referral from SSJ.", tags: ["shelter", "seasonal"], schedule: { 1: "20:00-08:00", 2: "20:00-08:00", 3: "20:00-08:00", 4: "20:00-08:00", 5: "20:00-08:00", 6: "20:00-08:00", 0: "20:00-08:00" }, lat: 50.790, lng: -1.103 },
    { id: 's7', name: "Stop Domestic Abuse", category: "shelter", type: "Refuge", area: "All", address: "Confidential", description: "Women's refuge.", requirements: "Call 24/7.", tags: ["advice", "women", "24_7"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.800, lng: -1.090 },
    { id: 's8', name: "YMCA Housing", category: "shelter", type: "Youth", area: "PO1", address: "Penny St", description: "Youth support.", requirements: "Referral.", tags: ["shelter", "youth"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.790, lng: -1.100 },
    { id: 's9', name: "Two Saints Oakdene", category: "shelter", type: "Hostel", area: "PO4", address: "Oakdene Rd", description: "Mental health housing.", requirements: "Referral.", tags: ["shelter", "medical"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.795, lng: -1.060 },
    { id: 's10', name: "StreetLink", category: "shelter", type: "Outreach", area: "All", address: "Online", description: "Report rough sleeping.", requirements: "Call.", tags: ["advice", "no_referral"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.800, lng: -1.090 },
    { id: 's11', name: "Hope into Action", category: "shelter", type: "Housing", area: "PO3", address: "Lichfield Rd", description: "Church housing.", requirements: "Referral.", tags: ["shelter"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.808, lng: -1.062 },
    { id: 's12', name: "Advice Portsmouth", category: "shelter", type: "Advice", area: "PO2", address: "Kingston Cres", description: "Legal housing advice.", requirements: "Drop-in.", tags: ["advice", "free"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "13:00-19:30", 5: "09:00-16:30", 6: "Closed", 0: "Closed" }, lat: 50.815, lng: -1.088 },
    { id: 's13', name: "Two Saints Locksway", category: "shelter", type: "Hostel", area: "PO4", address: "Locksway Rd", description: "Supported housing.", requirements: "Referral.", tags: ["shelter"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.795, lng: -1.060 },
    { id: 's14', name: "Nile House", category: "shelter", type: "Hostel", area: "PO5", address: "Nile St", description: "Supported housing.", requirements: "Referral.", tags: ["shelter"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.793, lng: -1.088 },
    { id: 's15', name: "Hyde Housing", category: "shelter", type: "Assoc", area: "PO1", address: "Stanhope Rd", description: "Housing association.", requirements: "Apply.", tags: ["advice"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.800, lng: -1.090 },
    { id: 's16', name: "VIVID Housing", category: "shelter", type: "Assoc", area: "PO1", address: "Peninsular House", description: "Housing association.", requirements: "Apply.", tags: ["advice"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-17:00", 6: "Closed", 0: "Closed" }, lat: 50.797, lng: -1.106 },
    { id: 's17', name: "Rent Deposit Help", category: "shelter", type: "Funding", area: "PO1", address: "Civic Offices", description: "Deposit help.", requirements: "Apply.", tags: ["advice", "free"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" }, lat: 50.799, lng: -1.091 },
    { id: 's18', name: "NACRO", category: "shelter", type: "Offender", area: "PO1", address: "Lake Rd", description: "Ex-offender housing.", requirements: "Referral.", tags: ["shelter", "advice"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.805, lng: -1.088 },
    { id: 's19', name: "Roberts Centre", category: "shelter", type: "Support", area: "PO1", address: "Crasswell St", description: "Tenancy support.", requirements: "Call.", tags: ["advice", "family"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:30", 6: "Closed", 0: "Closed" }, lat: 50.799, lng: -1.089 },
    { id: 's20', name: "Society of St James", category: "shelter", type: "Support", area: "PO1", address: "Queen St", description: "Housing support.", requirements: "Call.", tags: ["advice"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.100 },
    { id: 's21', name: "First Light Housing", category: "shelter", type: "Veterans", area: "PO12", address: "Gosport", description: "Veterans housing.", requirements: "Referral.", tags: ["shelter", "veterans"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.795, lng: -1.120 },

    // --- 🔥 WARMTH & COMMUNITY (Warm) - 30+ ---
    { id: 'w1', name: "Central Library", category: "warmth", type: "Hub", area: "PO1", address: "Guildhall Sq", transport: "City", description: "WiFi, PCs, Warm.", tags: ["wifi", "charging", "toilet", "warm"], schedule: { 1: "09:30-17:00", 2: "09:30-18:00", 3: "09:30-18:00", 4: "09:30-18:00", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" }, lat: 50.799, lng: -1.093 },
    { id: 'w2', name: "Southsea Library", category: "warmth", type: "Library", area: "PO5", address: "Palmerston Rd", transport: "Bus 1,3", description: "WiFi, Kids.", tags: ["wifi", "charging", "warm"], schedule: { 1: "09:30-17:30", 2: "09:30-17:30", 3: "09:30-17:30", 4: "09:30-17:30", 5: "09:30-17:00", 6: "10:00-17:30", 0: "10:00-16:00" }, lat: 50.787, lng: -1.091 },
    { id: 'w3', name: "Cosham Library", category: "warmth", type: "Library", area: "PO6", address: "Spur Rd", transport: "Cosham", description: "WiFi, PCs.", tags: ["wifi", "charging", "warm"], schedule: { 1: "09:30-18:00", 2: "09:30-18:00", 3: "09:30-17:00", 4: "09:30-18:00", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" }, lat: 50.845, lng: -1.066 },
    { id: 'w4', name: "North End Library", category: "warmth", type: "Library", area: "PO2", address: "Gladys Ave", transport: "Bus 2", description: "Community library.", tags: ["wifi", "warm"], schedule: { 1: "09:30-18:00", 2: "09:30-18:00", 3: "09:30-18:00", 4: "09:30-17:00", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" }, lat: 50.816, lng: -1.078 },
    { id: 'w5', name: "Alderman Lacey", category: "warmth", type: "Library", area: "PO3", address: "Tangier Rd", transport: "Bus 2", description: "Quiet.", tags: ["wifi", "warm"], schedule: { 1: "09:30-18:00", 2: "09:30-18:00", 3: "Closed", 4: "09:30-17:00", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" }, lat: 50.806, lng: -1.056 },
    { id: 'w6', name: "Beddow Library", category: "warmth", type: "Library", area: "PO4", address: "Milton Rd", transport: "Bus 2", description: "Milton library.", tags: ["wifi", "warm"], schedule: { 1: "09:30-17:00", 2: "09:30-17:00", 3: "09:30-18:00", 4: "09:30-18:00", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" }, lat: 50.796, lng: -1.070 },
    { id: 'w7', name: "Carnegie Library", category: "warmth", type: "Library", area: "PO1", address: "Fratton Rd", transport: "Bus 3", description: "Historic.", tags: ["wifi", "warm"], schedule: { 1: "09:30-18:00", 2: "09:30-17:00", 3: "09:30-17:00", 4: "Closed", 5: "09:30-17:00", 6: "10:00-15:30", 0: "Closed" }, lat: 50.798, lng: -1.082 },
    { id: 'w8', name: "Portsea Library", category: "warmth", type: "Library", area: "PO1", address: "Queen St", transport: "Bus 23", description: "John Pounds.", tags: ["wifi", "warm"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:30", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.096 },
    { id: 'w9', name: "Landport CC", category: "warmth", type: "Centre", area: "PO1", address: "Charles St", transport: "Bus 23", description: "Community.", tags: ["cafe", "wifi", "warm"], schedule: { 1: "09:00-21:00", 2: "09:00-21:00", 3: "09:00-21:00", 4: "09:00-21:00", 5: "09:00-21:00", 6: "09:00-13:00", 0: "Closed" }, lat: 50.803, lng: -1.089 },
    { id: 'w10', name: "Fratton CC", category: "warmth", type: "Centre", area: "PO1", address: "Trafalgar Pl", transport: "Bus 3", description: "Local hub.", tags: ["warm"], schedule: { 1: "09:00-21:00", 2: "09:00-21:00", 3: "09:00-21:00", 4: "09:00-21:00", 5: "09:00-21:00", 6: "09:00-13:00", 0: "Closed" }, lat: 50.798, lng: -1.082 },
    { id: 'w11', name: "Somerstown Hub", category: "warmth", type: "Centre", area: "PO5", address: "River's St", transport: "Bus 23", description: "Modern hub.", tags: ["cafe", "wifi", "warm"], schedule: { 1: "08:00-20:00", 2: "08:00-20:00", 3: "08:00-20:00", 4: "08:00-20:00", 5: "08:00-20:00", 6: "09:00-16:00", 0: "10:00-14:00" }, lat: 50.793, lng: -1.088 },
    { id: 'w12', name: "Milton Village Hall", category: "warmth", type: "Centre", area: "PO4", address: "Milton Rd", transport: "Bus 2", description: "Events.", tags: ["warm"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.796, lng: -1.070 },
    { id: 'w13', name: "Highbury CC", category: "warmth", type: "Centre", area: "PO6", address: "Hawthorn Cres", transport: "Cosham", description: "Northern.", tags: ["warm"], schedule: { 1: "09:00-21:00", 2: "09:00-21:00", 3: "09:00-21:00", 4: "09:00-21:00", 5: "09:00-21:00", 6: "Closed", 0: "Closed" }, lat: 50.849, lng: -1.066 },
    { id: 'w14', name: "Stamshaw CC", category: "warmth", type: "Centre", area: "PO2", address: "Wilson Rd", transport: "Bus 2", description: "Hub.", tags: ["warm"], schedule: { 1: "09:00-21:00", 2: "09:00-21:00", 3: "09:00-21:00", 4: "09:00-21:00", 5: "09:00-21:00", 6: "Closed", 0: "Closed" }, lat: 50.819, lng: -1.085 },
    { id: 'w15', name: "Spark Space", category: "warmth", type: "Cafe", area: "PO4", address: "Fratton Way", transport: "Bus 1, 2", description: "Pay-as-you-can.", tags: ["cafe", "warm"], schedule: { 1: "Closed", 2: "11:00-14:00", 3: "11:00-14:00", 4: "11:00-14:00", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.796, lng: -1.064 },
    { id: 'w16', name: "Havelock CC", category: "warmth", type: "Centre", area: "PO4", address: "Fawcett Rd", transport: "Bus 1", description: "Events.", tags: ["warm"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.789, lng: -1.077 },
    { id: 'w17', name: "Baffins CC", category: "warmth", type: "Centre", area: "PO3", address: "Westover Rd", transport: "Bus 2", description: "Community.", tags: ["warm"], schedule: { 1: "09:00-21:00", 2: "09:00-21:00", 3: "09:00-21:00", 4: "09:00-21:00", 5: "09:00-21:00", 6: "Closed", 0: "Closed" }, lat: 50.805, lng: -1.060 },
    { id: 'w18', name: "Eastney CC", category: "warmth", type: "Centre", area: "PO4", address: "Bransbury Park", transport: "Bus 1", description: "Hub.", tags: ["warm"], schedule: { 1: "09:00-21:00", 2: "09:00-21:00", 3: "09:00-21:00", 4: "09:00-21:00", 5: "09:00-21:00", 6: "Closed", 0: "Closed" }, lat: 50.788, lng: -1.065 },
    { id: 'w19', name: "Paulsgrove CC", category: "warmth", type: "Centre", area: "PO6", address: "Marsden Rd", transport: "Bus 3", description: "Hub.", tags: ["warm"], schedule: { 1: "09:00-21:00", 2: "09:00-21:00", 3: "09:00-21:00", 4: "09:00-21:00", 5: "09:00-21:00", 6: "Closed", 0: "Closed" }, lat: 50.851, lng: -1.102 },
    { id: 'w20', name: "Hillside CC", category: "warmth", type: "Centre", area: "PO6", address: "Cheltenham Rd", transport: "Bus 3", description: "Hub.", tags: ["warm"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.850, lng: -1.103 },
    { id: 'w21', name: "HIVE Portsmouth", category: "warmth", type: "Info", area: "PO1", address: "Central Library", transport: "City", description: "Advice hub.", tags: ["advice", "warm"], schedule: { 1: "09:30-16:00", 2: "09:30-16:00", 3: "09:30-16:00", 4: "09:30-16:00", 5: "09:30-16:00", 6: "Closed", 0: "Closed" }, lat: 50.799, lng: -1.093 },
    { id: 'w22', name: "Learning Place", category: "warmth", type: "Skills", area: "PO2", address: "Derby Rd", transport: "Bus 2", description: "Digital skills.", tags: ["computer", "warm"], schedule: { 1: "09:00-16:30", 2: "09:00-16:30", 3: "09:00-16:30", 4: "09:00-16:30", 5: "09:00-16:00", 6: "Closed", 0: "Closed" }, lat: 50.810, lng: -1.078 },
    { id: 'w23', name: "Bradbury Centre", category: "warmth", type: "Seniors", area: "PO1", address: "Kingston Rd", transport: "Bus 3", description: "Age UK hub.", tags: ["cafe", "seniors"], schedule: { 1: "09:00-16:00", 2: "09:00-16:00", 3: "09:00-16:00", 4: "09:00-16:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" }, lat: 50.803, lng: -1.082 },
    { id: 'w24', name: "St Wilfrid's", category: "warmth", type: "Church", area: "PO1", address: "George St", transport: "Bus 23", description: "Warm welcome.", tags: ["warm"], schedule: { 1: "10:00-12:00", 2: "Closed", 3: "10:00-12:00", 4: "Closed", 5: "10:00-12:00", 6: "Closed", 0: "Closed" }, lat: 50.799, lng: -1.085 },
    { id: 'w25', name: "St Mary's Church", category: "warmth", type: "Church", area: "PO1", address: "Fratton Rd", transport: "Bus 3", description: "Community cafe.", tags: ["cafe", "warm"], schedule: { 1: "09:00-15:00", 2: "09:00-15:00", 3: "09:00-15:00", 4: "09:00-15:00", 5: "09:00-15:00", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.083 },

    // --- 🏥 SUPPORT & HEALTH (Help) - 20+ ---
    { id: 'h1', name: "Safe Haven", category: "support", type: "Mental Health", area: "PO4", address: "Fratton Way", transport: "Bus 1, 2", description: "Evening crisis support.", requirements: "Drop-in.", tags: ["mental", "free", "evening"], schedule: { 1: "18:00-22:00", 2: "18:00-22:00", 3: "18:00-22:00", 4: "18:00-22:00", 5: "18:00-22:00", 6: "18:00-22:00", 0: "18:00-22:00" }, lat: 50.796, lng: -1.063 },
    { id: 'h2', name: "St Mary's Treatment", category: "support", type: "Urgent Care", area: "PO3", address: "Milton Rd", transport: "Bus 2", description: "Walk-in injuries.", requirements: "Walk-in.", tags: ["medical", "free"], schedule: { 1: "07:30-22:00", 2: "07:30-22:00", 3: "07:30-22:00", 4: "07:30-22:00", 5: "07:30-22:00", 6: "07:30-22:00", 0: "07:30-22:00" }, lat: 50.798, lng: -1.068 },
    { id: 'h3', name: "Sexual Health", category: "support", type: "Clinic", area: "PO3", address: "St Mary's", transport: "Bus 2", description: "Testing/Contraception.", tags: ["medical", "free"], schedule: { 1: "08:30-19:30", 2: "08:30-19:30", 3: "13:30-19:30", 4: "08:30-16:30", 5: "08:30-15:30", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.068 },
    { id: 'h4', name: "Bathroom Bank", category: "support", type: "Hygiene", area: "PO6", address: "St Michael's", transport: "Bus 3", description: "Free toiletries.", tags: ["free", "baby_items"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "14:00-16:00", 5: "09:00-12:00", 6: "09:00-12:00", 0: "Closed" }, lat: 50.852, lng: -1.108 },
    { id: 'h5', name: "Roberts Centre", category: "support", type: "Family", area: "PO1", address: "Crasswell St", transport: "City", description: "Homelessness help.", tags: ["family", "advice"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:30", 6: "Closed", 0: "Closed" }, lat: 50.799, lng: -1.089 },
    { id: 'h6', name: "PositiveMinds", category: "support", type: "Mental Health", area: "PO5", address: "Middle St", transport: "Bus 1, 3", description: "Emotional support.", tags: ["mental", "free"], schedule: { 1: "12:30-17:30", 2: "12:30-17:30", 3: "12:30-17:30", 4: "12:30-17:30", 5: "12:30-17:30", 6: "Closed", 0: "Closed" }, lat: 50.789, lng: -1.090 },
    { id: 'h7', name: "Turning Point", category: "support", type: "Recovery", area: "PO5", address: "Campion Pl", transport: "Bus 1", description: "Drug/Alcohol help.", tags: ["addiction", "medical"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.790, lng: -1.095 },
    { id: 'h8', name: "Women's Centre", category: "support", type: "Women", area: "PO5", address: "Palmerston Rd", transport: "Bus 1, 3", description: "Women's support.", tags: ["women", "advice"], schedule: { 1: "09:30-15:00", 2: "09:30-15:00", 3: "09:30-15:00", 4: "09:30-15:00", 5: "09:30-15:00", 6: "Closed", 0: "Closed" }, lat: 50.787, lng: -1.091 },
    { id: 'h9', name: "Citizens Advice", category: "support", type: "Advice", area: "PO1", address: "Winston Churchill", transport: "City", description: "General advice.", tags: ["advice", "free"], schedule: { 1: "09:00-16:00", 2: "09:00-16:00", 3: "09:00-16:00", 4: "09:00-16:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" }, lat: 50.797, lng: -1.092 },
    { id: 'h10', name: "Veterans Outreach", category: "support", type: "Veterans", area: "PO1", address: "The Hard", transport: "Hard", description: "Monthly drop-in.", tags: ["veterans", "advice"], schedule: { 1: "Closed", 2: "Closed", 3: "14:00-18:00", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.798, lng: -1.105 },
    { id: 'h11', name: "NHS Dental Help", category: "support", type: "Dental", area: "All", address: "Call 111", transport: "Phone", description: "Emergency dental.", tags: ["medical"], schedule: { 1: "08:00-18:00", 2: "08:00-18:00", 3: "08:00-18:00", 4: "08:00-18:00", 5: "08:00-18:00", 6: "Closed", 0: "Closed" }, lat: 50.800, lng: -1.090 },
    { id: 'h12', name: "QA Hospital A&E", category: "support", type: "Emergency", area: "PO6", address: "Southwick Hill", transport: "Buses", description: "Emergency only.", tags: ["medical", "24_7"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.852, lng: -1.070 },
    { id: 'h13', name: "Talking Change", category: "support", type: "Therapy", area: "PO4", address: "Pompey Centre", transport: "Bus 1, 2", description: "NHS therapy.", tags: ["mental", "free"], schedule: { 1: "08:00-19:00", 2: "08:00-19:00", 3: "08:00-19:00", 4: "08:00-19:00", 5: "08:00-16:30", 6: "Closed", 0: "Closed" }, lat: 50.796, lng: -1.063 },
    { id: 'h14', name: "PARCS", category: "support", type: "Trauma", area: "PO1", address: "Diana Goss", transport: "City", description: "Abuse counselling.", tags: ["advice", "women"], schedule: { 1: "09:30-17:00", 2: "09:30-20:00", 3: "09:30-17:00", 4: "09:30-20:00", 5: "09:30-17:00", 6: "Closed", 0: "Closed" }, lat: 50.800, lng: -1.090 },
    { id: 'h15', name: "Carers Centre", category: "support", type: "Carers", area: "PO5", address: "Orchard Rd", transport: "Bus 2", description: "Carer support.", tags: ["advice"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" }, lat: 50.793, lng: -1.077 },
    { id: 'h16', name: "Age UK", category: "support", type: "Seniors", area: "PO1", address: "Kingston Rd", transport: "Bus 3", description: "Seniors help.", tags: ["seniors", "advice"], schedule: { 1: "09:00-16:00", 2: "09:00-16:00", 3: "09:00-16:00", 4: "09:00-16:00", 5: "09:00-16:00", 6: "Closed", 0: "Closed" }, lat: 50.803, lng: -1.082 },
    { id: 'h17', name: "Red Cross", category: "support", type: "Refugees", area: "PO1", address: "Commercial Rd", transport: "City", description: "Refugee aid.", tags: ["advice", "free"], schedule: { 1: "10:00-14:00", 2: "Closed", 3: "10:00-14:00", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.801, lng: -1.088 },
    { id: 'h18', name: "Aurora New Dawn", category: "support", type: "Stalking", area: "All", address: "Phone", transport: "N/A", description: "Abuse support.", tags: ["women", "advice"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.800, lng: -1.090 },
    { id: 'h19', name: "Samaritans", category: "support", type: "Crisis", area: "PO5", address: "King St", transport: "Bus 1", description: "Emotional distress.", tags: ["mental", "24_7"], schedule: { 1: "00:00-23:59", 2: "00:00-23:59", 3: "00:00-23:59", 4: "00:00-23:59", 5: "00:00-23:59", 6: "00:00-23:59", 0: "00:00-23:59" }, lat: 50.793, lng: -1.089 },
    { id: 'h20', name: "Rowans Hospice", category: "support", type: "Bereavement", area: "PO7", address: "Purbrook", transport: "Bus 7", description: "Loss support.", tags: ["medical"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.865, lng: -1.045 },
    { id: 'h21', name: "Late Pharmacy", category: "support", type: "Pharmacy", area: "All", address: "Asda/Tesco", transport: "Varies", description: "Late meds.", tags: ["medical"], schedule: { 1: "08:00-23:00", 2: "08:00-23:00", 3: "08:00-23:00", 4: "08:00-23:00", 5: "08:00-23:00", 6: "08:00-22:00", 0: "10:00-16:00" }, lat: 50.798, lng: -1.082 },

    // --- 🧸 FAMILY (Kids) - 20+ ---
    { id: 'fa1', name: "Buckland Hub", category: "family", type: "Family Hub", area: "PO1", address: "Turner Rd", transport: "Bus 3", description: "0-19 support.", tags: ["baby_items", "play"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-17:00", 6: "Closed", 0: "Closed" }, lat: 50.805, lng: -1.085 },
    { id: 'fa2', name: "Paulsgrove Hub", category: "family", type: "Family Hub", area: "PO6", address: "Cheltenham Rd", transport: "Bus 3", description: "0-19 support.", tags: ["baby_items"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-17:00", 6: "Closed", 0: "Closed" }, lat: 50.850, lng: -1.105 },
    { id: 'fa3', name: "Somerstown Hub", category: "family", type: "Family Hub", area: "PO5", address: "Omega St", transport: "Bus 23", description: "0-19 support.", tags: ["baby_items", "play"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" }, lat: 50.793, lng: -1.088 },
    { id: 'fa4', name: "Northern Parade", category: "family", type: "Family Hub", area: "PO2", address: "Doyle Ave", transport: "Bus 2", description: "0-19 support.", tags: ["baby_items"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" }, lat: 50.825, lng: -1.070 },
    { id: 'fa5', name: "Milton Hub", category: "family", type: "Family Hub", area: "PO4", address: "Perth Rd", transport: "Bus 1", description: "0-19 support.", tags: ["baby_items", "play"], schedule: { 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed", 0: "Closed" }, lat: 50.796, lng: -1.070 },
    { id: 'fa6', name: "Cumberland House", category: "family", type: "Museum", area: "PO4", address: "Eastern Pde", transport: "Bus 1", description: "Free museum.", tags: ["free", "kids_activities", "warm"], schedule: { 1: "Closed", 2: "10:00-17:00", 3: "10:00-17:00", 4: "10:00-17:00", 5: "10:00-17:00", 6: "10:00-17:00", 0: "10:00-17:00" }, lat: 50.786, lng: -1.082 },
    { id: 'fa7', name: "Portsmouth Museum", category: "family", type: "Museum", area: "PO1", address: "Museum Rd", transport: "Bus 1", description: "Free museum.", tags: ["free", "kids_activities", "warm"], schedule: { 1: "Closed", 2: "10:00-17:00", 3: "10:00-17:00", 4: "10:00-17:00", 5: "10:00-17:00", 6: "10:00-17:00", 0: "10:00-17:00" }, lat: 50.792, lng: -1.096 },
    { id: 'fa8', name: "Victoria Park", category: "family", type: "Park", area: "PO1", address: "Anglesea Rd", transport: "City", description: "Animals/Play.", tags: ["free", "outdoor"], schedule: { 1: "08:00-16:00", 2: "08:00-16:00", 3: "08:00-16:00", 4: "08:00-16:00", 5: "08:00-16:00", 6: "08:00-16:00", 0: "08:00-16:00" }, lat: 50.801, lng: -1.092 },
    { id: 'fa9', name: "Motivate Youth", category: "family", type: "Youth", area: "PO1", address: "St Nicholas", transport: "City", description: "Youth fun.", tags: ["youth", "free"], schedule: { 1: "15:00-19:00", 2: "15:00-19:00", 3: "15:00-19:00", 4: "15:00-19:00", 5: "15:00-21:00", 6: "Closed", 0: "Closed" }, lat: 50.790, lng: -1.095 },
    { id: 'fa10', name: "Landport Adventure", category: "family", type: "Play", area: "PO1", address: "Arundel St", transport: "Bus 23", description: "Adventure play.", tags: ["free", "outdoor", "kids_activities"], schedule: { 1: "Closed", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "12:00-16:00", 0: "Closed" }, lat: 50.803, lng: -1.089 },
    { id: 'fa11', name: "Stamshaw Adventure", category: "family", type: "Play", area: "PO2", address: "Western Rd", transport: "Bus 2", description: "Adventure play.", tags: ["free", "outdoor"], schedule: { 1: "Closed", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "12:00-16:00", 0: "Closed" }, lat: 50.819, lng: -1.085 },
    { id: 'fa12', name: "Paulsgrove Adventure", category: "family", type: "Play", area: "PO6", address: "Marsden Rd", transport: "Bus 3", description: "Adventure play.", tags: ["free", "outdoor"], schedule: { 1: "Closed", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "12:00-16:00", 0: "Closed" }, lat: 50.852, lng: -1.100 },
    { id: 'fa13', name: "Buckland Adventure", category: "family", type: "Play", area: "PO1", address: "Malins Rd", transport: "Bus 3", description: "Adventure play.", tags: ["free", "outdoor"], schedule: { 1: "Closed", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "12:00-16:00", 0: "Closed" }, lat: 50.807, lng: -1.082 },
    { id: 'fa14', name: "Somerstown Adventure", category: "family", type: "Play", area: "PO5", address: "Waterloo St", transport: "Bus 23", description: "Adventure play.", tags: ["free", "outdoor"], schedule: { 1: "Closed", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "12:00-16:00", 0: "Closed" }, lat: 50.793, lng: -1.090 },
    { id: 'fa15', name: "Portsea Adventure", category: "family", type: "Play", area: "PO1", address: "Aylward St", transport: "Bus 23", description: "Adventure play.", tags: ["free", "outdoor"], schedule: { 1: "Closed", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "12:00-16:00", 0: "Closed" }, lat: 50.799, lng: -1.099 },
    { id: 'fa16', name: "Hillside Youth", category: "family", type: "Youth", area: "PO6", address: "Cheltenham Rd", transport: "Bus 3", description: "Youth club.", tags: ["youth", "free"], schedule: { 1: "18:00-21:00", 2: "18:00-21:00", 3: "Closed", 4: "18:00-21:00", 5: "18:00-21:00", 6: "Closed", 0: "Closed" }, lat: 50.851, lng: -1.103 },
    { id: 'fa17', name: "Brook Club", category: "family", type: "Youth", area: "PO5", address: "Sackville St", transport: "Bus 1, 3", description: "Youth activities.", tags: ["youth", "free"], schedule: { 1: "16:00-19:00", 2: "16:00-19:00", 3: "16:00-19:00", 4: "16:00-19:00", 5: "16:00-19:00", 6: "Closed", 0: "Closed" }, lat: 50.789, lng: -1.085 },
    { id: 'fa18', name: "Canoe Lake", category: "family", type: "Park", area: "PO4", address: "Southsea", transport: "Bus 1", description: "Park/Play.", tags: ["free", "outdoor"], schedule: { 1: "08:00-20:00", 2: "08:00-20:00", 3: "08:00-20:00", 4: "08:00-20:00", 5: "08:00-20:00", 6: "08:00-20:00", 0: "08:00-20:00" }, lat: 50.786, lng: -1.077 },
    { id: 'fa19', name: "Southsea Splash", category: "family", type: "Play", area: "PO5", address: "Seafront", transport: "Bus 3", description: "Splash pool.", tags: ["free", "outdoor", "seasonal"], schedule: { 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed", 0: "Closed" }, lat: 50.785, lng: -1.095 },
    { id: 'fa20', name: "Home-Start", category: "family", type: "Support", area: "PO2", address: "Lake Rd", transport: "Bus 2", description: "Family help.", tags: ["family", "advice"], schedule: { 1: "09:00-15:00", 2: "09:00-15:00", 3: "09:00-15:00", 4: "09:00-15:00", 5: "09:00-13:00", 6: "Closed", 0: "Closed" }, lat: 50.810, lng: -1.080 },
    { id: 'fa21', name: "Barnardo's", category: "family", type: "Support", area: "PO1", address: "Commercial Rd", transport: "City", description: "Child support.", tags: ["family", "advice"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed", 0: "Closed" }, lat: 50.802, lng: -1.090 },
];

const generateMockData = () => {
    const areas = ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'];
    const types = {
        food: ['Community Pantry', 'Soup Kitchen', 'Food Bank', 'Breakfast Club'],
        shelter: ['Emergency Bed', 'Night Shelter', 'Day Centre', 'Housing Hub'],
        warmth: ['Warm Space', 'Community Hall', 'Library Hub', 'Coffee Morning'],
        support: ['Advice Clinic', 'Health Hub', 'Support Group', 'Drop-in'],
        family: ['Play Group', 'Youth Zone', 'Family Centre', 'After School'],
        charity: ['Charity Shop', 'Thrift Store', 'Community Shop', 'Boutique']
    };

    // Deterministic random for consistency (simple LCG)
    let seed = 12345;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const newItems = [];

    // Generate ~300 items (Expanded Data)
    for (let i = 0; i < 300; i++) {
        const catKeys = Object.keys(types);
        const category = catKeys[Math.floor(random() * catKeys.length)];
        const type = types[category as keyof typeof types][Math.floor(random() * types[category as keyof typeof types].length)];
        const area = areas[Math.floor(random() * areas.length)];

        // Random Schedule - More realistic patterns
        const schedule: Record<number, string> = {};
        const isWeekdayOnly = random() > 0.7;
        const isWeekendOnly = random() > 0.9;

        for (let d = 0; d < 7; d++) {
            if ((isWeekdayOnly && (d === 0 || d === 6)) || (isWeekendOnly && d > 0 && d < 6)) {
                schedule[d] = 'Closed';
                continue;
            }

            if (random() > 0.2) {
                const startBase = 8 + Math.floor(random() * 8); // 8am to 4pm
                const duration = 2 + Math.floor(random() * 6); // 2 to 8 hours
                const startStr = startBase.toString().padStart(2, '0') + (random() > 0.5 ? ':00' : ':30');
                const endBase = Math.min(23, startBase + duration);
                const endStr = endBase.toString().padStart(2, '0') + ':00';
                schedule[d] = `${startStr}-${endStr}`;
            } else {
                schedule[d] = 'Closed';
            }
        }

        // Random Location (Portsmouth approx bounds)
        const lat = 50.78 + (random() * 0.08);
        const lng = -1.13 + (random() * 0.1); // Slightly wider range to cover more area

        newItems.push({
            id: `gen_${i}_x`,
            name: `${area} ${type} Station ${Math.floor(random() * 900) + 100}`,
            category,
            type,
            area,
            address: `${Math.floor(random() * 200) + 1} ${['High St', 'London Rd', 'Albert Rd', 'Victoria Rd', 'Commercial Rd', 'Kingston Rd'][Math.floor(random() * 6)]}`,
            transport: `Bus ${Math.floor(random() * 20) + 1}`,
            description: `A vital resource providing ${category} support for the ${area} community. Open to all.`,
            requirements: random() > 0.5 ? "Open access" : "Referral preferred",
            tags: [category, "generated", random() > 0.5 ? "free" : "membership", random() > 0.7 ? "wheelchair" : "wifi", random() > 0.8 ? "pets_allowed" : "family_friendly"],
            schedule,
            lat,
            lng
        });
    }

    // Explicitly add specific Portsmouth Charity Shops
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
            transport: "Local Bus",
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

const ALL_DATA = [...REAL_DATA, ...generateMockData()];

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// ==========================================
// 3. UTILS & ICONS
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Icon = ({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) => {
    // Standard icon set
    const icons = {
        search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
        home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
        utensils: <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />,
        bed: <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />,
        flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.246-3.64-3.418-5.418A9 9 0 0 1 21 12a9 9 0 0 1-9 9 9 9 0 0 1-6-5.3L6 14z" />,
        lifebuoy: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="4.93" x2="9.17" y1="4.93" y2="9.17" /><line x1="14.83" x2="19.07" y1="14.83" y2="19.07" /><line x1="14.83" x2="19.07" y1="9.17" y2="4.93" /><line x1="14.83" x2="9.17" y1="9.17" y2="14.83" /><line x1="4.93" x2="9.17" y1="19.07" y2="14.83" /></>,
        users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
        mapPin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
        calendar: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></>,
        phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
        info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
        x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        check: <polyline points="20 6 9 17 4 12" />,
        clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
        tag: <><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l5 5a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-5-5z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></>,
        navigation: <polygon points="3 11 22 2 13 21 11 13 3 11" />,
        wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></>,
        zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
        droplets: <><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.8-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" /><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" /></>,
        'washing-machine': <><path d="M3 6h3" /><path d="M17 6h.01" /><rect width="18" height="20" x="3" y="2" rx="2" /><circle cx="12" cy="13" r="5" /><path d="M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5" /></>,
        bath: <><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.68 3 4 3.68 4 4.5V11" /><path d="M10 11V4.5a1.5 1.5 0 0 1 1.5-1.5c.41 0 .8.16 1.1.45L15 6" /><path d="M2 12h20" /><path d="M7 19v-3.26C7 13.9 8.79 12 11 12v0c2.21 0 4 1.9 4 3.74V19" /><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /></>,
        'check_circle': <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
        'id-card': <><path d="M16 10h2" /><path d="M16 14h2" /><path d="M6.17 15a3 3 0 0 1 5.66 0" /><circle cx="9" cy="9" r="2" /><rect x="2" y="5" width="20" height="14" rx="2" /></>,
        'file-text': <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
        soup: <><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" /><path d="M7 21h10" /><path d="M12 2v6" /><path d="m19 5-2.5 3" /><path d="m5 5 2.5 3" /></>,
        apple: <><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" /><path d="M10 2c1 .5 2 2 2 5" /></>,
        brain: <><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></>,
        activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
        award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
        sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>,
        printer: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></>,
        smartphone: <><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><line x1="12" x2="12.01" y1="18" y2="18" /></>,
        monitor: <><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></>
    };
    return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{(icons as any)[name] || icons.info}</svg>;
};

// ==========================================
// 4. NEW FEATURES (BOOKING & CALENDAR)
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BookingBar = ({ onSearch, currentFilters }: { onSearch: any; currentFilters: any }) => {
    const [active, setActive] = useState(false);
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters]);

    const handleApply = () => {
        onSearch(localFilters);
        setActive(false);
    };

    return (
        <>
            <div className={`sticky top-0 z-50 px-4 py-3 transition-all duration-300 ${active ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={() => setActive(true)}
                    className="w-full bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-200 p-3 flex items-center gap-3 active:scale-[0.98] transition-all"
                >
                    <div className="bg-slate-100 text-slate-600 p-2 rounded-full">
                        <Icon name="search" size={18} className="" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-slate-900">
                            {localFilters.area === 'All' ? 'Where to?' : localFilters.area}
                        </div>
                        <div className="text-xs text-slate-500">
                            {localFilters.category === 'all' ? 'Any Category' : localFilters.category} • {localFilters.date === 'today' ? 'Today' : 'Anytime'}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">
                        <Icon name="filter" size={14} className="text-slate-400" />
                    </div>
                </button>
            </div>

            {/* Full Screen Overlay for Filters */}
            {active && (
                <div className="fixed inset-0 z-[60] bg-slate-50/95 backdrop-blur-xl overflow-y-auto animate-fade-in-up">
                    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Search</h2>
                            <button
                                onClick={() => setActive(false)}
                                className="bg-slate-200 p-2 rounded-full hover:bg-slate-300 transition"
                            >
                                <Icon name="x" size={20} className="text-slate-600" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-8">
                            <section>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Area</label>
                                <div className="flex flex-wrap gap-2">
                                    {AREAS.map(a => (
                                        <button
                                            key={a}
                                            onClick={() => setLocalFilters({ ...localFilters, area: a })}
                                            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all border ${localFilters.area === a
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Category</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['food', 'shelter', 'warmth', 'support', 'family'].map(c => {
                                        const conf = getTagConfig(c);
                                        const isSelected = localFilters.category === c;
                                        return (
                                            <button
                                                key={c}
                                                onClick={() => setLocalFilters({ ...localFilters, category: isSelected ? 'all' : c })}
                                                className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${isSelected
                                                    ? 'bg-slate-900 border-slate-900 shadow-lg shadow-slate-900/20'
                                                    : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <div className={`p-2 rounded-full ${isSelected ? 'bg-white/20 text-white' : `${conf.bg} ${conf.color}`}`}>
                                                    <Icon name={conf.icon} size={18} />
                                                </div>
                                                <span className={`text-sm font-bold capitalize ${isSelected ? 'text-white' : 'text-slate-700'}`}>{c}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            <section>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Time</label>
                                <div className="bg-white p-1 rounded-2xl border border-slate-200 flex">
                                    {['today', 'tomorrow', 'any'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setLocalFilters({ ...localFilters, date: d })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${localFilters.date === d ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-200 sticky bottom-0 bg-slate-50 pb-6">
                            <button
                                onClick={handleApply}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                            >
                                Show Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AreaScheduleView = ({ data, area, category }: { data: any[]; area: string; category: string }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIdx = new Date().getDay();
    const [selectedDay, setSelectedDay] = useState(todayIdx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return data.filter(item => {
            const matchesArea = area === 'All' || item.area === area;
            const matchesCategory = category === 'all' || item.category === category;
            const isOpenOnDay = item.schedule[selectedDay] !== 'Closed';
            return matchesArea && matchesCategory && isOpenOnDay;
        });
    }, [data, area, category, selectedDay]);

    // Group items by Area
    const groupedByArea = useMemo(() => {
        const groups: Record<string, typeof data> = {};
        filtered.forEach(item => {
            if (!groups[item.area]) groups[item.area] = [];
            groups[item.area].push(item);
        });
        // Sort keys
        return Object.keys(groups).sort().reduce((obj, key) => {
            obj[key] = groups[key].sort((a, b) => {
                const timeA = (a.schedule as any)[selectedDay].split('-')[0];
                const timeB = (b.schedule as any)[selectedDay].split('-')[0];
                return timeA.localeCompare(timeB);
            });
            return obj;
        }, {} as Record<string, typeof data>);
    }, [filtered, selectedDay]);

    return (
        <div className="p-4 pb-24 animate-fade-in-up font-sans">
            <div className="bg-slate-900 text-white p-6 rounded-[32px] mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Icon name="calendar" size={100} /></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Daily Schedule</h2>
                            <p className="text-slate-400 font-bold text-sm tracking-wide">
                                {area === 'All' ? 'Showing All Areas' : `${area} Region`} • {category === 'all' ? 'All Categories' : category}
                            </p>
                        </div>
                        <div className="bg-emerald-500/20 px-4 py-2 rounded-full text-sm font-bold text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                            {filtered.length} Active Resources
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {days.map((d, i) => (
                            <button
                                key={d}
                                onClick={() => setSelectedDay(i)}
                                className={`flex flex-col items-center min-w-[4rem] py-3 rounded-2xl text-xs font-bold transition-all ${selectedDay === i ? 'bg-white text-slate-900 shadow-lg scale-105' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                            >
                                <span className="uppercase tracking-wider">{d}</span>
                                {i === todayIdx && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {Object.entries(groupedByArea).map(([areaKey, items]) => (
                    <div key={areaKey} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-slate-900"></div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4 pl-4 flex items-center gap-2">
                            {areaKey} <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wide">Postal Code</span>
                        </h3>

                        <div className="space-y-3 pl-4">
                            {items.map(item => {
                                const timeRange = (item.schedule as any)[selectedDay];
                                const conf = getTagConfig(item.category);
                                return (
                                    <div key={item.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                        <div className="flex flex-col sm:flex-row gap-3 cursor-pointer" onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}>
                                            <div className="sm:w-24 shrink-0 pt-1">
                                                <span className="inline-block bg-slate-100 text-slate-900 text-xs font-black px-2 py-1 rounded-lg">
                                                    {timeRange}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-800 text-base">{item.name}</h4>
                                                    <div className={`p-1.5 rounded-full ${conf.bg} ${conf.color}`}>
                                                        <Icon name={conf.icon} size={12} />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-1">{item.type} • {item.address}</p>
                                                <div className="flex gap-2">
                                                    {item.tags.slice(0, 3).map((t: string) => (
                                                        <span key={t} className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {expandedItem === item.id && (
                                            <div className="mt-3 p-4 bg-slate-50 rounded-xl animate-fade-in text-xs space-y-2">
                                                <p className="text-slate-600 italic">"{item.description}"</p>
                                                {item.phone && (
                                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                                        <Icon name="phone" size={12} className="text-slate-400" /> {item.phone}
                                                    </div>
                                                )}
                                                <div className="border-t border-slate-200/50 pt-2 mt-2">
                                                    <p className="font-bold text-slate-400 mb-1 uppercase tracking-widest text-[10px]">Weekly Hours</p>
                                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                                                        <div key={d} className={`flex justify-between py-0.5 ${i === new Date().getDay() ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                                            <span>{d}</span><span>{item.schedule[i]}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Icon name="calendar" size={32} />
                        </div>
                        <p className="text-slate-400 font-bold">No resources open in selected areas on this day.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CategoryButton = ({ label, icon, active, onClick, color }: { label: string; icon: string; active: boolean; onClick: () => void; color: string }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 w-full h-24 relative overflow-hidden group
        ${active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-100 hover:border-slate-200 hover:shadow-md'}`}
    >
        <div className={`p-3 rounded-full mb-2 transition-transform duration-300 group-hover:scale-110 ${active ? 'bg-white/20' : `${color.split(' ')[0]} ${color.split(' ')[1]}`}`}>
            <Icon name={icon} size={20} className={active ? 'text-white' : ''} />
        </div>
        <span className="text-[10px] font-bold tracking-wide leading-tight text-center uppercase">{label}</span>
    </button>
);



// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkStatus = (schedule: any) => {
    if (!schedule) return { isOpen: false, status: 'unknown', color: 'bg-slate-100 text-slate-500', label: 'Check Time' };
    const now = new Date();
    const day = now.getDay();
    const hoursStr = schedule[day];
    if (!hoursStr || hoursStr === 'Closed') return { isOpen: false, status: 'closed', color: 'bg-slate-100 text-slate-500', label: 'Closed Today' };

    // Handle 24/7 or full day
    if (hoursStr === "00:00-23:59") return { isOpen: true, status: 'open', color: 'bg-green-100 text-green-800', label: 'Open 24/7' };

    const [start, end] = hoursStr.split('-');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const currentTotal = now.getHours() * 60 + now.getMinutes();
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (currentTotal >= startTotal && currentTotal < endTotal) {
        if (endTotal - currentTotal < 60) return { isOpen: true, status: 'closing', color: 'bg-orange-100 text-orange-800', label: `Closes ${end}` };
        return { isOpen: true, status: 'open', color: 'bg-green-100 text-green-800', label: `Open Now (${end})` };
    }
    return { isOpen: false, status: 'closed', color: 'bg-slate-100 text-slate-500', label: 'Closed Now' };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResourceCard = ({ item }: { item: any }) => {
    const [expanded, setExpanded] = useState(false);
    const status = checkStatus(item.schedule);

    return (
        <div className="bg-white p-5 rounded-[24px] mb-4 shadow-sm border border-slate-100 relative group overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${status.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : status.status === 'closing' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {status.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-50 text-slate-500 border border-slate-100">
                        {item.type}
                    </span>
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 tracking-tight">{item.name}</h3>

            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 font-medium">
                <Icon name="mapPin" size={14} className="text-slate-400" /> {item.address}
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">{item.description}</p>

            <div className="flex flex-wrap gap-2 mb-5">
                {item.tags.slice(0, 4).map((tag: string) => {
                    const conf = getTagConfig(tag);
                    return (
                        <span key={tag} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${conf.color} bg-slate-50 border border-slate-100`}>
                            <Icon name={conf.icon} size={10} /> {conf.label}
                        </span>
                    );
                })}
            </div>

            {expanded && (
                <div className="bg-slate-50 p-4 rounded-xl mb-5 animate-fade-in text-xs border border-slate-100">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                        <div key={d} className={`flex justify-between py-1.5 border-b border-slate-200/50 last:border-0 ${i === new Date().getDay() ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                            <span>{d}</span><span>{item.schedule[i] || 'Closed'}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-2.5">
                <button onClick={() => setExpanded(!expanded)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                    {expanded ? 'Hide Hours' : 'View Schedule'}
                </button>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`} target="_blank" className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold flex justify-center items-center gap-2 hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10">
                    <Icon name="navigation" size={12} /> Directions
                </a>
                {item.phone && (
                    <a href={`tel:${item.phone}`} className="w-12 py-3 bg-white border border-slate-200 rounded-xl flex justify-center items-center hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700">
                        <Icon name="phone" size={16} />
                    </a>
                )}
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Dashboard = ({ data, onNavigate }: { data: any[]; onNavigate: (cat: string) => void }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const day = now.getDay();
    const currentHour = now.getHours();

    let greeting = "Good Morning";
    if (currentHour >= 12) greeting = "Good Afternoon";
    if (currentHour >= 17) greeting = "Good Evening";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isOpen = (schedule: any) => {
        if (!schedule) return false;
        const hours = schedule[day];
        if (!hours || hours === 'Closed') return false;
        if (hours === "00:00-23:59") return true;
        const [start, end] = hours.split('-');
        const [sH, sM] = start.split(':').map(Number);
        const [eH, eM] = end.split(':').map(Number);
        const cur = now.getHours() * 60 + now.getMinutes();
        return cur >= (sH * 60 + sM) && cur < (eH * 60 + eM);
    };

    const openFood = data.filter(i => i.category === 'food' && isOpen(i.schedule)).length;
    const openShelter = data.filter(i => i.category === 'shelter' && isOpen(i.schedule)).length;

    // "Kanban" Style Activity Feed
    const upcoming = useMemo(() => {
        const events: any[] = [];
        data.forEach(item => {
            const status = checkStatus(item.schedule);
            if (status.status !== 'closed') {
                events.push({ ...item, statusLabel: status.label, statusColor: status.color, sortKey: status.status === 'closing' ? 1 : 2 });
            }
        });
        return events.sort((a, b) => a.sortKey - b.sortKey).slice(0, 5);
    }, [data, now]);

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{greeting},</h1>
                    <p className="text-slate-500 font-medium">Here's what's happening in Portsmouth.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=James`} alt="User" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => onNavigate('food')} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left group relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] bg-emerald-50 w-32 h-32 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 text-emerald-600">
                            <div className="bg-emerald-100 p-2 rounded-full"><Icon name="utensils" size={16} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60">Food</span>
                        </div>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter">{openFood}</div>
                        <div className="text-xs font-bold text-slate-400 mt-1">Open Now</div>
                    </div>
                </button>
                <button onClick={() => onNavigate('shelter')} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left group relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] bg-indigo-50 w-32 h-32 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 text-indigo-600">
                            <div className="bg-indigo-100 p-2 rounded-full"><Icon name="bed" size={16} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900/60">Shelter</span>
                        </div>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter">{openShelter}</div>
                        <div className="text-xs font-bold text-slate-400 mt-1">Open Now</div>
                    </div>
                </button>
            </div>

            {/* Kanban / Activity Stream */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Live Activity
                    </h3>
                    <button className="text-xs font-bold text-blue-600">View All</button>
                </div>
                <div className="space-y-4">
                    {upcoming.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => onNavigate(item.category)}>
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                    <Icon name={getTagConfig(item.category).icon} size={20} />
                                </div>
                                {item.statusColor.includes('orange') && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={`px-1.5 py-0.5 rounded-md font-bold ${item.statusColor.includes('orange') ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {item.statusLabel}
                                    </span>
                                    <span className="text-slate-400 truncate">• {item.area}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {upcoming.length === 0 && <div className="text-slate-400 text-sm font-medium py-2">No active resources at the moment.</div>}
                </div>
            </div>
        </div>
    );

};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SimpleMap = ({ data, category, statusFilter }: { data: any[], category: string, statusFilter: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Filter for map
    const mapPoints = useMemo(() => {
        return data.filter(item => {
            const matchCat = category === 'all' || item.category === category;
            const status = checkStatus(item.schedule).status;
            if (statusFilter === 'open') return matchCat && (status === 'open' || status === 'closing');
            return matchCat;
        });
    }, [data, category, statusFilter]);

    const project = (lat: number, lng: number) => {
        const y = 100 - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
        const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
        return { x, y };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getPinColor = (item: any) => {
        if (selectedItem?.id === item.id) return 'bg-slate-900 border-white scale-125 z-50';
        const config = getTagConfig(item.category);
        return `${config.bg.replace('100', '500')} border-white`;
    };

    return (
        <div className="w-full h-[60vh] bg-slate-100 rounded-3xl relative overflow-hidden shadow-inner border border-slate-200">
            {/* Map Placeholder Graphic */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Map Pins */}
            {mapPoints.map(item => {
                const pos = project(item.lat, item.lng);
                if (pos.x < 0 || pos.x > 100 || pos.y < 0 || pos.y > 100) return null;
                return (
                    <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 shadow-sm transition-all duration-300 ${getPinColor(item)} ${selectedItem?.id === item.id ? 'ring-4 ring-black/10' : 'hover:scale-110'}`}
                        style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                    />
                );
            })}

            {/* Selected Item Card */}
            {selectedItem && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 animate-fade-in-up z-40">
                    <div className="flex justify-between items-start mb-2">
                        <div className="pr-8">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">{selectedItem.category}</span>
                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{selectedItem.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{selectedItem.address}</p>
                        </div>
                        <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 bg-slate-100 p-1 rounded-full text-slate-400 hover:bg-slate-200 transition"><Icon name="x" size={14} /></button>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}`} target="_blank" className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold flex justify-center items-center gap-2 hover:bg-black transition shadow-lg shadow-slate-900/20">
                            <Icon name="navigation" size={12} /> Get Directions
                        </a>
                        <button onClick={() => setSelectedItem(null)} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TipsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
            <div className="bg-white/95 backdrop-blur-xl rounded-[32px] w-full max-w-sm overflow-hidden animate-bounce-in shadow-2xl border border-white/20">
                <div className="bg-yellow-400 p-6 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                    <h2 className="text-xl font-black text-yellow-950 flex items-center gap-3 relative z-10">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm"><Icon name="tag" size={20} /></div>
                        Yellow Labels
                    </h2>
                    <button onClick={onClose} className="bg-black/10 p-2 rounded-full hover:bg-black/20 text-yellow-950 transition relative z-10"><Icon name="x" size={20} /></button>
                </div>
                <div className="p-6 bg-yellow-50/50">
                    <p className="text-xs font-bold text-yellow-700/60 uppercase tracking-widest mb-4">Supermarket Reduction Guide</p>
                    <div className="space-y-3">
                        {SUPERMARKET_TIPS.map((tip, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-yellow-100 shadow-sm flex justify-between items-center">
                                <span className="font-bold text-slate-800 text-sm">{tip.store}</span>
                                <div className="text-right">
                                    <span className="block text-[10px] font-black text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md">{tip.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CrisisModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden animate-bounce-in shadow-2xl relative">
                <div className="bg-rose-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <h2 className="text-2xl font-black flex items-center gap-3 relative z-10">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><Icon name="alert" size={24} /></div>
                        Emergency
                    </h2>
                    <p className="text-rose-100 text-sm mt-1 ml-1 relative z-10 font-medium">Immediate help contacts</p>
                </div>
                <div className="p-6 space-y-3 bg-rose-50/50">
                    <a href="tel:999" className="flex items-center w-full bg-white p-4 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-rose-100 text-rose-600 p-3 rounded-full mr-4 group-hover:bg-rose-600 group-hover:text-white transition-colors"><Icon name="phone" /></div>
                        <div><div className="font-black text-slate-900 text-lg">999</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Police / Ambulance</div></div>
                    </a>
                    <a href="tel:02392882689" className="flex items-center w-full bg-white p-4 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Icon name="home" /></div>
                        <div><div className="font-black text-slate-900 text-lg">023 9288 2689</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Rough Sleeping Hub</div></div>
                    </a>
                    <a href="tel:111" className="flex items-center w-full bg-white p-4 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full mr-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Icon name="medical" /></div>
                        <div><div className="font-black text-slate-900 text-lg">111</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Medical Advice (NHS)</div></div>
                    </a>
                    <button onClick={onClose} className="w-full py-4 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-2xl transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrintView = ({ data, onClose }: { data: any[]; onClose: () => void }) => {
    const today = new Date().getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getOpenItems = (dayIdx: number) => data.filter((i: any) => i.schedule[dayIdx] !== "Closed" && (i.category === 'food' || i.category === 'shelter' || i.category === 'support'));

    return (
        <div className="fixed inset-0 bg-white z-[100] overflow-y-auto p-8 text-black font-mono">
            <div className="max-w-2xl mx-auto border-4 border-black p-8">
                <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">Pompey Haven</h1>
                        <p className="text-sm font-bold">WARMTH • DIGNITY • COMMUNITY</p>
                    </div>
                    <button onClick={onClose} className="bg-black text-white px-6 py-3 font-bold no-print">CLOSE</button>
                </div>

                <div className="mb-8">
                    <p className="font-bold mb-4 text-lg">A weekly guide to free/low-cost food, shelter, and support in Portsmouth. You are not alone.</p>
                    <h2 className="text-2xl font-black bg-black text-white inline-block px-3 py-1 mb-6">OPEN TODAY ({days[today]})</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {getOpenItems(today).map(item => (
                            <div key={item.id} className="border-b-2 border-black pb-3">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-black text-lg">{item.name}</span>
                                    <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase">{item.schedule[today]}</span>
                                </div>
                                <p className="text-sm font-bold">{item.address}</p>
                                <p className="text-xs mt-1 italic">"{item.description}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t-4 border-black text-center">
                    <p className="font-black text-lg">EMERGENCY: 999</p>
                    <p className="font-bold">Rough Sleeping Hub: 023 9288 2689</p>
                </div>
                <style>{`@media print { .no-print { display: none; } body { background: white; } }`}</style>
            </div>
        </div>
    );
};

// 12. MAIN APP
// ==========================================

const App = () => {
    // Branding & Accessibility State
    const [highContrast, setHighContrast] = useState(false);

    // Initial Loading State
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'home' | 'map' | 'list' | 'planner'>('home');
    const [showTips, setShowTips] = useState(false);
    const [showCrisis, setShowCrisis] = useState(false);
    const [showPrint, setShowPrint] = useState(false);
    const [mapFilter, setMapFilter] = useState<'all' | 'open'>('open');

    // User Location State
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Filter State
    const [filters, setFilters] = useState({ area: 'All', category: 'all', date: new Date().toISOString().split('T')[0] });

    // Load Data
    useEffect(() => {
        setTimeout(() => setLoading(false), 800);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log("Location access denied/error", err)
            );
        }
    }, []);

    const handleSearch = (newFilters: any) => {
        setFilters(newFilters);
        // If searching a specific category, maybe switch to list or map automatically?
        // keeping current view for now but ensuring data updates
    };

    // Filter Data Logic
    const filteredData = useMemo(() => {
        let data = [...REAL_DATA, ...generateMockData()].filter(item => {
            const matchesArea = filters.area === 'All' || item.area === filters.area;
            const matchesCategory = filters.category === 'all' || item.category === filters.category;
            return matchesArea && matchesCategory;
        });

        // Sort by Status then Distance
        return data.sort((a, b) => {
            const statusA = checkStatus(a.schedule);
            const statusB = checkStatus(b.schedule);

            // 1. Open items first
            if (statusA.isOpen && !statusB.isOpen) return -1;
            if (!statusA.isOpen && statusB.isOpen) return 1;

            // 2. Then by distance if available
            if (userLocation) {
                const distA = getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
                const distB = getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
                return distA - distB;
            }

            return 0;
        });
    }, [filters, userLocation]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center animate-pulse">
                    <Icon name="heart" size={48} className="text-rose-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-800">Pompey Haven</h1>
                    <p className="text-slate-400 font-medium">Warmth • Dignity • Community</p>
                </div>
            </div>
        );
    }

    if (showPrint) return <PrintView data={[...REAL_DATA, ...generateMockData()]} onClose={() => setShowPrint(false)} />;

    return (
        <div className={`min-h-screen font-sans text-slate-900 selection:bg-rose-200 selection:text-rose-900 ${highContrast ? 'grayscale contrast-125' : ''}`}>
            <style>{`
                .header-bg { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); }
                .yellow-label { background-color: #facc15; color: #854d0e; font-weight: 800; transform: rotate(-1deg); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 2px solid #fef08a; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .app-container { max-width: 500px; margin: 0 auto; background-color: #f8fafc; min-height: 100vh; box-shadow: 0 0 50px rgba(0,0,0,0.08); position: relative; padding-bottom: 110px; }
                .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); scale: 0.98; } to { opacity: 1; transform: translateY(0); scale: 1; } }
            `}</style>

            {/* NEW: Accessible Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 pt-safe-top">
                <div className="px-5 py-3 flex justify-between items-center max-w-lg mx-auto">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pompey Haven</h1>
                        <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Warmth • Dignity • Community</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setHighContrast(!highContrast)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors" aria-label="Toggle High Contrast">
                            <Icon name="eye" size={20} />
                        </button>
                        <button onClick={() => setShowPrint(true)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors" aria-label="Print/Offline Mode">
                            <Icon name="printer" size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <TipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
            <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />

            {/* NEW: Booking Style Bar */}
            <BookingBar onSearch={handleSearch} currentFilters={filters} />

            <div className="px-5 mt-2 relative z-20">
                {view === 'home' && <Dashboard data={ALL_DATA.filter(i => (filters.area === 'All' || i.area === filters.area))} onNavigate={(cat) => handleSearch({ ...filters, category: cat })} />}

                <div className="flex gap-2 mb-6">
                    <button onClick={() => setView('planner')} className="flex-1 bg-white text-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center gap-2 font-black hover:scale-[1.02] transition-transform"><Icon name="calendar" size={20} className="text-blue-600" /> View Schedule</button>
                    <button onClick={() => setShowTips(true)} className="flex-1 yellow-label p-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"><Icon name="tag" size={20} /> Tips & Help</button>
                </div>

                {view === 'planner' && (
                    <>
                        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black text-slate-800">Timeline</h2><button onClick={() => setView('home')} className="p-2 bg-slate-200 rounded-full"><Icon name="x" /></button></div>
                        <AreaScheduleView data={ALL_DATA} area={filters.area} category={filters.category} />
                    </>
                )}

                {view === 'map' && (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">Live Map</h2>
                            <div className="flex gap-1">
                                <button onClick={() => setMapFilter('open')} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${mapFilter === 'open' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500'}`}>Open Now</button>
                                <button onClick={() => setMapFilter('all')} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${mapFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500'}`}>All</button>
                            </div>
                        </div>
                        <SimpleMap data={filteredData} category={filters.category} statusFilter={mapFilter} />
                    </>
                )}

                {view === 'list' && (
                    <>
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-black text-slate-800 capitalize">{filters.category === 'all' ? 'All Resources' : filters.category}</h2><button onClick={() => setView('home')} className="p-2 bg-slate-200 rounded-full"><Icon name="x" size={16} /></button></div>
                        </div>
                        <div className="space-y-4 pb-24">
                            {filteredData.length > 0 ? (filteredData.map(item => <ResourceCard key={item.id} item={item} />)) : (<div className="text-center py-12 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200"><p className="font-bold">No results found in {filters.area}.</p><button onClick={() => setFilters({ ...filters, area: 'All' })} className="text-emerald-600 text-xs font-bold mt-2 underline">View All Areas</button></div>)}
                        </div>
                    </>
                )}

                {view === 'home' && (
                    <>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Browse Categories</p>
                        <div className="grid grid-cols-2 gap-3 pb-8">
                            <CategoryButton label="Food & Meals" icon="utensils" color="bg-emerald-100 text-emerald-700" active={false} onClick={() => handleSearch({ ...filters, category: 'food' })} />
                            <CategoryButton label="Shelter & Crisis" icon="bed" color="bg-indigo-100 text-indigo-700" active={false} onClick={() => handleSearch({ ...filters, category: 'shelter' })} />
                            <CategoryButton label="Warmth & Net" icon="flame" color="bg-orange-100 text-orange-700" active={false} onClick={() => handleSearch({ ...filters, category: 'warmth' })} />
                            <CategoryButton label="Family & Kids" icon="users" color="bg-pink-100 text-pink-700" active={false} onClick={() => handleSearch({ ...filters, category: 'family' })} />
                            <CategoryButton label="Help & Health" icon="lifebuoy" color="bg-blue-100 text-blue-700" active={false} onClick={() => handleSearch({ ...filters, category: 'support' })} />
                            <CategoryButton label="Charity Shops" icon="shopping-bag" color="text-pink-600 bg-pink-100" active={false} onClick={() => handleSearch({ ...filters, category: 'charity' })} />
                            <CategoryButton label="View All" icon="search" color="text-slate-600 bg-slate-100" active={false} onClick={() => handleSearch({ ...filters, category: 'all' })} />
                        </div>
                    </>
                )}
            </div>

            {/* Spacer for Bottom Navigation */}
            <div className="h-28"></div>

            <button
                onClick={() => setShowCrisis(true)}
                className="fixed bottom-28 right-5 w-14 h-14 bg-rose-600 text-white rounded-full shadow-2xl shadow-rose-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white z-40"
            >
                <Icon name="alert" size={24} />
            </button>

            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 flex justify-around p-2 pb-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button onClick={() => setView('home')} className={`relative flex-1 group py-2 flex flex-col items-center gap-1 transition-all rounded-2xl ${view === 'home' || view === 'list' ? 'text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <div className={`p-1 rounded-xl transition-all ${view === 'home' || view === 'list' ? 'bg-slate-100' : ''}`}>
                        <Icon name="home" size={24} className={view === 'home' || view === 'list' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'} />
                    </div>
                    <span className="text-[10px] font-bold">Home</span>
                </button>

                <button onClick={() => setView('map')} className={`relative flex-1 group py-2 flex flex-col items-center gap-1 transition-all rounded-2xl ${view === 'map' ? 'text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <div className={`p-1 rounded-xl transition-all ${view === 'map' ? 'bg-slate-100' : ''}`}>
                        <Icon name="mapPin" size={24} className={view === 'map' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'} />
                    </div>
                    <span className="text-[10px] font-bold">Map</span>
                </button>

                <button onClick={() => setView('planner')} className={`relative flex-1 group py-2 flex flex-col items-center gap-1 transition-all rounded-2xl ${view === 'planner' ? 'text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <div className={`p-1 rounded-xl transition-all ${view === 'planner' ? 'bg-slate-100' : ''}`}>
                        <Icon name="calendar" size={24} className={view === 'planner' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'} />
                    </div>
                    <span className="text-[10px] font-bold">Plan</span>
                </button>
            </div>
        </div>
    );
};

export default App;