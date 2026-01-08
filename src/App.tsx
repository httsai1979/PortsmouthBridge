import React, { useState, useEffect, useMemo } from 'react';
import { 
    Home, MapPin, Search, Menu, X, Heart, Coffee, Bed, Flame, 
    LifeBuoy, Users, Briefcase, BookOpen, Smile, 
    Navigation, Phone, Tag, Info, Calendar, Cloud, RefreshCw
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// --- 1. FIREBASE CONFIG & INIT ---
// 使用您的環境配置
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 2. LOCAL DATA (FALLBACK) ---
// 當網路斷線或資料庫為空時使用的本地備份 (51筆)
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
    trustScore?: number;
    capacityLevel?: 'high' | 'medium' | 'low' | 'unknown';
    eligibility?: 'open' | 'referral' | 'membership';
}

export const AREAS = ['All', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'];

export const TAG_ICONS: Record<string, { icon: any; label: string; color: string; bg: string }> = {
    food: { icon: Coffee, label: 'Food Support', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    shelter: { icon: Bed, label: 'Safe Sleeping', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    warmth: { icon: Flame, label: 'Warm Spaces', color: 'text-orange-600', bg: 'bg-orange-50' },
    support: { icon: LifeBuoy, label: 'Community Hub', color: 'text-blue-600', bg: 'bg-blue-50' },
    family: { icon: Users, label: 'Family & Play', color: 'text-pink-600', bg: 'bg-pink-50' },
    charity: { icon: Tag, label: 'Charity Shop', color: 'text-rose-600', bg: 'bg-rose-50' },
    mental_health: { icon: Smile, label: 'Wellbeing', color: 'text-purple-600', bg: 'bg-purple-50' },
    skills: { icon: Briefcase, label: 'Jobs & Skills', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    learning: { icon: BookOpen, label: 'Library', color: 'text-amber-600', bg: 'bg-amber-50' },
    default: { icon: Info, label: 'General', color: 'text-slate-600', bg: 'bg-slate-50' }
};

// 本地數據 (Local Data) - 51 筆 (作為備用)
export const LOCAL_DATA: Resource[] = [
    // --- 🟢 FOOD (EAT) ---
    {
        id: 'f1',
        name: "FoodCycle Portsmouth",
        category: "food",
        type: "Hot Meal",
        area: "PO1",
        address: "John Pounds Centre, 23 Queen St, Portsea, PO1 3HN",
        description: "A free, hot 3-course vegetarian meal for the community. No questions asked. Just turn up.",
        requirements: "Open to everyone. No referral needed.",
        tags: ["free", "hot_meal", "no_referral", "vegetarian", "community"],
        schedule: { 0: "Closed", 1: "Closed", 2: "Closed", 3: "18:00-19:00", 4: "Closed", 5: "Closed", 6: "Closed" },
        lat: 50.7993,
        lng: -1.1002,
        phone: "023 9289 2010",
        trustScore: 100,
        eligibility: 'open'
    },
    {
        id: 'f2',
        name: "Portsea Pantry",
        category: "food",
        type: "Pantry (£)",
        area: "PO1",
        address: "John Pounds Centre, 23 Queen St, Portsea, PO1 3HN",
        description: "Your local pantry. Pay a weekly membership (£5) for a choice of groceries valued £15+.",
        requirements: "Membership required (£5/week). Proof of address (PO1/PO2/PO3).",
        tags: ["membership", "fresh_food", "community"],
        schedule: { 0: "Closed", 1: "10:00-14:00", 2: "10:00-14:00", 3: "10:00-14:00", 4: "10:00-14:00", 5: "Closed", 6: "Closed" },
        lat: 50.7993,
        lng: -1.1002,
        phone: "023 9289 2010",
        trustScore: 98,
        eligibility: 'membership'
    },
    {
        id: 'f3',
        name: "LifeHouse Southsea",
        category: "food",
        type: "Soup Kitchen",
        area: "PO4",
        address: "153 Albert Rd, Southsea, PO4 0JW",
        description: "Hot food, support, and community for the homeless and vulnerable.",
        requirements: "Drop-in.",
        tags: ["hot_meal", "no_referral", "pets", "support", "free"],
        schedule: { 0: "Closed", 1: "Closed", 2: "Closed", 3: "09:00-11:30", 4: "18:00-20:00", 5: "Closed", 6: "Closed" },
        lat: 50.7853,
        lng: -1.0772,
        phone: "07800 933 983",
        trustScore: 100,
        eligibility: 'open'
    },
    {
        id: 'f4',
        name: "North End Pantry",
        category: "food",
        type: "Pantry (£)",
        area: "PO2",
        address: "North End Baptist Church, 195 Powerscourt Rd, PO2 7JH",
        description: "Community pantry. Reduce waste, save money. £5 for selection valued ~£20.",
        requirements: "Membership (£5/week). Open to PO2/PO3 residents.",
        tags: ["membership", "fresh_food"],
        schedule: { 0: "Closed", 1: "16:30-18:00", 2: "14:30-16:00", 3: "Closed", 4: "13:00-15:00", 5: "10:00-12:00", 6: "Closed" },
        lat: 50.8122,
        lng: -1.0712,
        phone: "07733 624248",
        trustScore: 95,
        eligibility: 'membership'
    },
    {
        id: 'f5',
        name: "Portsmouth Foodbank (Hope Church)",
        category: "food",
        type: "Food Bank",
        area: "PO5",
        address: "Hope Church, Somers Road, Southsea, PO5 4QA",
        description: "Emergency food parcels. Requires a referral voucher.",
        requirements: "E-referral voucher required + ID.",
        tags: ["referral", "emergency"],
        schedule: { 0: "Closed", 1: "11:00-13:00", 2: "Closed", 3: "11:00-13:00", 4: "Closed", 5: "11:00-13:00", 6: "Closed" },
        lat: 50.7935,
        lng: -1.0841,
        phone: "023 9298 7976",
        trustScore: 100,
        eligibility: 'referral'
    },
    {
        id: 'f5_b',
        name: "City Life Church (Foodbank)",
        category: "food",
        type: "Food Bank",
        area: "PO3",
        address: "85 Tangier Road, Baffins, PO3 6JH",
        description: "Satellite food bank location. Voucher required.",
        requirements: "Referral voucher required.",
        tags: ["referral", "emergency"],
        schedule: { 0: "Closed", 1: "Closed", 2: "10:00-11:00", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed" },
        lat: 50.8068,
        lng: -1.0595,
        trustScore: 95,
        eligibility: 'referral'
    },
    {
        id: 'f6',
        name: "Sunday Suppers",
        category: "food",
        type: "Hot Meal",
        area: "PO1",
        address: "All Saints Church, Commercial Road, PO1 4BT",
        description: "Hot meal for the homeless every Sunday evening.",
        requirements: "Just turn up.",
        tags: ["hot_meal", "free", "no_referral"],
        schedule: { 0: "17:00-18:00", 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed" },
        lat: 50.8035,
        lng: -1.0890,
        trustScore: 95,
        eligibility: 'open'
    },
    {
        id: 'f7',
        name: "St Mag's Pantry",
        category: "food",
        type: "Pantry (£)",
        area: "PO4",
        address: "St Margaret's Community Church, Highland Rd, Southsea, PO4 9DD",
        description: "Your local pantry. £5 weekly for £15-£20 of groceries.",
        requirements: "Membership required. PO4/PO5 residents.",
        tags: ["membership", "fresh_food"],
        schedule: { 0: "Closed", 1: "15:00-16:30", 2: "15:00-16:30", 3: "10:00-11:30", 4: "Closed", 5: "Closed", 6: "Closed" },
        lat: 50.7870,
        lng: -1.0658,
        trustScore: 98,
        eligibility: 'membership'
    },
    {
        id: 'f8',
        name: "Eastney Coffee Pot",
        category: "food",
        type: "Warm Space",
        area: "PO4",
        address: "21 Eastney Road, Portsmouth, PO4 9JA",
        description: "A warm welcome with free tea/coffee and a light meal.",
        requirements: "Free. Everyone welcome.",
        tags: ["free", "warmth", "hot_meal"],
        schedule: { 0: "Closed", 1: "Closed", 2: "Closed", 3: "Closed", 4: "Closed", 5: "10:00-12:00", 6: "Closed" },
        lat: 50.7925,
        lng: -1.0655,
        trustScore: 100,
        eligibility: 'open'
    },
    {
        id: 'f9',
        name: "Baffins Community Pantry",
        category: "food",
        type: "Pantry (£)",
        area: "PO3",
        address: "24 Tangier Road, Portsmouth, PO3 6JL",
        description: "£5 for a weekly shop. Open to residents of Baffins ward.",
        requirements: "Proof of address required.",
        tags: ["membership", "fresh_food"],
        schedule: { 0: "Closed", 1: "10:00-12:00", 2: "Closed", 3: "Closed", 4: "Closed", 5: "16:00-18:00", 6: "Closed" },
        lat: 50.8085,
        lng: -1.0610,
        trustScore: 98
    },
    {
        id: 'f10',
        name: "Paulsgrove Community Pantry",
        category: "food",
        type: "Pantry (£)",
        area: "PO6",
        address: "St Michael and All Angels Church, Hempsted Rd, Paulsgrove, PO6 4AS",
        description: "Membership pantry for Paulsgrove residents. £5 for approx £20 value.",
        requirements: "Membership required. PO6 residents.",
        tags: ["membership", "fresh_food", "community"],
        schedule: { 0: "Closed", 1: "Closed", 2: "09:30-11:30", 3: "Closed", 4: "Closed", 5: "Closed", 6: "Closed" },
        lat: 50.8490,
        lng: -1.0950,
        phone: "023 9237 8194",
        trustScore: 97,
        eligibility: 'membership'
    },
    {
        id: 'f11',
        name: "Spark Community Space",
        category: "support",
        type: "Community Hub",
        area: "PO4",
        address: "The Pompey Centre, Unit 12, Fratton Way, Southsea, PO4 8SL",
        description: "Safe place for those isolated. Pay-what-you-can cafe.",
        requirements: "Open to all.",
        tags: ["community", "coffee", "free", "support"],
        schedule: { 0: "Closed", 1: "Closed", 2: "11:00-14:00", 3: "11:00-14:00", 4: "11:00-14:00", 5: "Closed", 6: "11:00-14:00" },
        lat: 50.7965,
        lng: -1.0720,
        trustScore: 100,
        eligibility: 'open'
    },
    {
        id: 'f12',
        name: "Salvation Army Southsea",
        category: "food",
        type: "Food Support",
        area: "PO5",
        address: "84 Albert Rd, Southsea, PO5 2SN",
        description: "Emergency food support and advice.",
        requirements: "Referral / Call ahead.",
        tags: ["referral", "emergency"],
        schedule: { 0: "Closed", 1: "10:00-12:00", 2: "10:00-12:00", 3: "Closed", 4: "Closed", 5: "10:00-12:00", 6: "Closed" },
        lat: 50.7864,
        lng: -1.0820,
        phone: "023 9282 1164",
        trustScore: 98,
        eligibility: 'referral'
    },

    // --- 🛌 SHELTER (STAY) ---
    {
        id: 'sh1',
        name: "Housing Options (Civic Offices)",
        category: "shelter",
        type: "Emergency Housing",
        area: "PO1",
        address: "Civic Offices, Guildhall Square, PO1 2AL",
        description: "First point of contact for homelessness prevention.",
        requirements: "Local connection usually required.",
        tags: ["emergency", "support"],
        schedule: { 0: "Closed", 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:00", 6: "Closed" },
        lat: 50.7997,
        lng: -1.0934,
        phone: "023 9283 4989",
        trustScore: 100
    },
    {
        id: 'sh2',
        name: "Hope House",
        category: "shelter",
        type: "Hostel",
        area: "PO3",
        address: "32-34 Milton Road, Portsmouth, PO3 6BA",
        description: "Supported accommodation for single homeless people.",
        requirements: "Referral via Housing Options.",
        tags: ["referral", "support"],
        schedule: { 0: "24/7", 1: "24/7", 2: "24/7", 3: "24/7", 4: "24/7", 5: "24/7", 6: "24/7" },
        lat: 50.7981,
        lng: -1.0665,
        trustScore: 98
    },
    {
        id: 'sh3',
        name: "Portsmouth Rough Sleeping Hub",
        category: "shelter",
        type: "Day Service",
        area: "PO1",
        address: "6 Queen Street, Portsmouth, PO1 3HL",
        description: "Breakfast (8-12), showers, and housing advice. Closed 12-1pm daily.",
        requirements: "For rough sleepers.",
        tags: ["shower", "laundry", "hot_meal", "support"],
        schedule: { 0: "08:00-16:00", 1: "08:00-16:00", 2: "08:00-16:00", 3: "08:00-16:00", 4: "08:00-16:00", 5: "08:00-16:00", 6: "08:00-16:00" },
        lat: 50.7997,
        lng: -1.1025,
        phone: "023 9288 2689",
        trustScore: 100,
        eligibility: 'open'
    },

    // --- 🔥 WARMTH & LIBRARIES (FULL NETWORK) ---
    {
        id: 'w1',
        name: "Portsmouth Central Library",
        category: "warmth",
        type: "Library",
        area: "PO1",
        address: "Guildhall Square, PO1 2DX",
        description: "Warm, safe space. Free WiFi, computers, books.",
        requirements: "None.",
        tags: ["free", "wifi", "charging", "toilet", "learning", "digital_support"],
        schedule: { 0: "Closed", 1: "09:30-17:00", 2: "09:30-18:00", 3: "09:30-18:00", 4: "09:30-18:00", 5: "09:30-17:00", 6: "10:00-15:30" },
        lat: 50.7990,
        lng: -1.0933,
        trustScore: 100
    },
    {
        id: 'lib2',
        name: "Southsea Library",
        category: "warmth",
        type: "Library",
        area: "PO5",
        address: "19-21 Palmerston Rd, PO5 3QQ",
        description: "Community hub with WiFi and children's areas.",
        requirements: "Open to all.",
        tags: ["free", "wifi", "family", "learning"],
        schedule: { 0: "Closed", 1: "09:30-17:30", 2: "09:30-17:30", 3: "09:30-17:30", 4: "09:30-17:30", 5: "09:30-17:00", 6: "10:00-16:00" },
        lat: 50.7860,
        lng: -1.0910,
        trustScore: 98
    },
    {
        id: 'lib3',
        name: "North End Library",
        category: "warmth",
        type: "Library",
        area: "PO2",
        address: "Gladys Avenue, North End, PO2 9AX",
        description: "Large library with public computers and community events.",
        requirements: "Open to all.",
        tags: ["free", "wifi", "learning", "digital_support"],
        schedule: { 0: "Closed", 1: "09:30-17:00", 2: "09:30-17:00", 3: "09:30-17:00", 4: "09:30-17:00", 5: "09:30-17:00", 6: "10:00-15:30" },
        lat: 50.8125,
        lng: -1.0770,
        trustScore: 98
    },
    {
        id: 'lib4',
        name: "Cosham Library",
        category: "warmth",
        type: "Library",
        area: "PO6",
        address: "Spur Road, Cosham, PO6 3EB",
        description: "Key hub for the north of the city. WiFi and advice.",
        requirements: "Open to all.",
        tags: ["free", "wifi", "learning", "community"],
        schedule: { 0: "Closed", 1: "09:30-18:00", 2: "09:30-18:00", 3: "09:30-18:00", 4: "09:30-18:00", 5: "09:30-17:00", 6: "10:00-15:30" },
        lat: 50.8460,
        lng: -1.0660,
        trustScore: 98
    },
    {
        id: 'lib5',
        name: "Beddow Library",
        category: "warmth",
        type: "Library",
        area: "PO4",
        address: "Milton Road, Southsea, PO4 8PR",
        description: "Located within Milton Park. Peaceful space for reading and warmth.",
        requirements: "Open to all.",
        tags: ["free", "wifi", "learning"],
        schedule: { 0: "Closed", 1: "09:30-17:00", 2: "09:30-17:00", 3: "Closed", 4: "09:30-19:00", 5: "09:30-17:00", 6: "10:00-15:30" },
        lat: 50.7960,
        lng: -1.0600,
        trustScore: 96
    },
    {
        id: 'lib6',
        name: "Alderman Lacey Library",
        category: "warmth",
        type: "Library",
        area: "PO3",
        address: "Tangier Road, Baffins, PO3 6HU",
        description: "Community library near Baffins Pond.",
        requirements: "Open to all.",
        tags: ["free", "wifi", "learning"],
        schedule: { 0: "Closed", 1: "09:30-17:00", 2: "09:30-17:00", 3: "Closed", 4: "09:30-17:00", 5: "09:30-17:00", 6: "10:00-15:30" },
        lat: 50.8065,
        lng: -1.0590,
        trustScore: 96
    },
    {
        id: 'lib7',
        name: "Carnegie Library",
        category: "warmth",
        type: "Library",
        area: "PO1",
        address: "Fratton Road, Fratton, PO1 5EZ",
        description: "Historic library building offering warmth and digital access.",
        requirements: "Open to all.",
        tags: ["free", "wifi", "learning"],
        schedule: { 0: "Closed", 1: "Closed", 2: "09:30-17:00", 3: "09:30-17:00", 4: "09:30-17:00", 5: "09:30-17:00", 6: "10:00-15:30" },
        lat: 50.8015,
        lng: -1.0820,
        trustScore: 97
    },

    // --- 🏥 COMMUNITY & SUPPORT CENTERS (EXPANDED) ---
    {
        id: 'cc1',
        name: "Fratton Community Centre",
        category: "support",
        type: "Community Hub",
        area: "PO1",
        address: "Trafalgar Place, Fratton, PO1 5JJ",
        description: "Large centre with cafe, gym, and various support groups.",
        requirements: "Open to all.",
        tags: ["community", "activities", "learning"],
        schedule: { 0: "09:00-13:00", 1: "08:30-21:30", 2: "08:30-21:30", 3: "08:30-21:30", 4: "08:30-21:30", 5: "08:30-21:00", 6: "09:00-16:00" },
        lat: 50.7980,
        lng: -1.0850,
        trustScore: 98
    },
    {
        id: 'cc2',
        name: "Buckland Community Centre",
        category: "support",
        type: "Community Hub",
        area: "PO2",
        address: "Malins Road, Buckland, PO2 7BL",
        description: "Heart of the Buckland community. Senior clubs, bingo, and advice.",
        requirements: "Open to all.",
        tags: ["community", "activities", "senior"],
        schedule: { 0: "Closed", 1: "09:00-21:00", 2: "09:00-21:00", 3: "09:00-21:00", 4: "09:00-21:00", 5: "09:00-21:00", 6: "Closed" },
        lat: 50.8060,
        lng: -1.0880,
        trustScore: 97
    },
    {
        id: 'cc3',
        name: "Stacey Community Centre",
        category: "support",
        type: "Community Hub",
        area: "PO3",
        address: "Walsall Road, Copnor, PO3 6DN",
        description: "Vibrant centre with garden, library access, and play groups.",
        requirements: "Open to all.",
        tags: ["community", "family", "activities"],
        schedule: { 0: "Closed", 1: "09:00-22:00", 2: "09:00-22:00", 3: "09:00-22:00", 4: "09:00-22:00", 5: "09:00-22:00", 6: "Closed" },
        lat: 50.8140,
        lng: -1.0620,
        trustScore: 96
    },
    {
        id: 'cc4',
        name: "Eastney Community Centre",
        category: "support",
        type: "Community Hub",
        area: "PO4",
        address: "Bransbury Park, Bransbury Rd, PO4 9SU",
        description: "Located in the park. Cafe, dog friendly areas, and halls.",
        requirements: "Open to all.",
        tags: ["community", "pets", "activities"],
        schedule: { 0: "09:00-13:00", 1: "09:00-21:00", 2: "09:00-21:00", 3: "09:00-21:00", 4: "09:00-21:00", 5: "09:00-17:00", 6: "Closed" },
        lat: 50.7890,
        lng: -1.0550,
        trustScore: 97
    },
    {
        id: 'job1',
        name: "Jobcentre Plus (Arundel St)",
        category: "support",
        type: "Employment",
        area: "PO1",
        address: "Old Portsmouth Station, Arundel St, PO1 1LB",
        description: "Government employment advice and benefit support.",
        requirements: "Appointment usually required.",
        tags: ["support", "skills", "advice"],
        schedule: { 0: "Closed", 1: "09:00-17:00", 2: "09:00-17:00", 3: "10:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed" },
        lat: 50.8000,
        lng: -1.0890,
        trustScore: 100
    },
    {
        id: 'job2',
        name: "Jobcentre Plus (Cosham)",
        category: "support",
        type: "Employment",
        area: "PO6",
        address: "Wulfrun House, High St, Cosham, PO6 3AX",
        description: "Employment support for the north of the city.",
        requirements: "Appointment usually required.",
        tags: ["support", "skills", "advice"],
        schedule: { 0: "Closed", 1: "09:00-17:00", 2: "09:00-17:00", 3: "10:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed" },
        lat: 50.8470,
        lng: -1.0670,
        trustScore: 100
    },

    // --- 🩺 HEALTH & ADVICE ---
    {
        id: 's1',
        name: "Advice Portsmouth",
        category: "support",
        type: "Advice",
        area: "PO2",
        address: "Focus Point, 116 Kingston Crescent, Portsmouth, PO2 8AL",
        description: "Free, confidential advice on benefits, debt, housing.",
        requirements: "Drop-in.",
        tags: ["free", "advice", "no_referral"],
        schedule: { 0: "Closed", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "13:00-19:30", 5: "09:00-16:30", 6: "Closed" },
        lat: 50.8123,
        lng: -1.0840,
        trustScore: 98
    },
    {
        id: 's2',
        name: "Recovery Hub",
        category: "support",
        type: "Addiction",
        area: "PO2",
        address: "Campdam House, 44-46 Kingston Crescent, Portsmouth, PO2 8AJ",
        description: "Support for drug and alcohol recovery. Self-referral accepted.",
        requirements: "Drop-in / Call.",
        tags: ["addiction", "health", "free"],
        schedule: { 0: "Closed", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "Closed" },
        lat: 50.8123,
        lng: -1.0845,
        trustScore: 95
    },
    {
        id: 's3',
        name: "Positive Minds",
        category: "mental_health",
        type: "Support Hub",
        area: "PO5",
        address: "22 Middle St, Southsea, PO5 4BG",
        description: "Emotional support for residents facing difficult times.",
        requirements: "Drop-in or Appointment.",
        tags: ["mental_health", "free", "support"],
        schedule: { 0: "Closed", 1: "09:30-16:00", 2: "09:30-16:00", 3: "09:30-16:00", 4: "09:30-16:00", 5: "09:30-16:00", 6: "Closed" },
        lat: 50.7920,
        lng: -1.0925,
        phone: "023 9282 4795",
        trustScore: 100
    },
    {
        id: 's4',
        name: "Talking Change",
        category: "mental_health",
        type: "NHS Service",
        area: "PO3",
        address: "The Pompey Centre, Fratton Way, PO4 8TA",
        description: "NHS talking therapies. Self-referral via website/phone.",
        requirements: "Self-referral.",
        tags: ["mental_health", "medical", "free"],
        schedule: { 0: "Closed", 1: "08:00-17:00", 2: "08:00-17:00", 3: "08:00-17:00", 4: "08:00-17:00", 5: "08:00-16:30", 6: "Closed" },
        lat: 50.7970,
        lng: -1.0715,
        trustScore: 100
    },

    // --- 👪 FAMILY HUBS (COMPLETE) ---
    {
        id: 'fam1',
        name: "Buckland Family Hub",
        category: "family",
        type: "Family Hub",
        area: "PO1",
        address: "Turner Road, Portsmouth, PO1 4PN",
        description: "Support for families with children 0-19.",
        requirements: "Drop-in / Appt. Free.",
        tags: ["free", "community", "children", "medical"],
        schedule: { 0: "Closed", 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed" },
        lat: 50.8038,
        lng: -1.0877,
        trustScore: 100
    },
    {
        id: 'fam2',
        name: "Somerstown Family Hub",
        category: "family",
        type: "Family Hub",
        area: "PO5",
        address: "Omega Street, Somerstown, PO5 4LP",
        description: "Child development checks, breastfeeding support.",
        requirements: "Drop-in. Free.",
        tags: ["free", "community", "children"],
        schedule: { 0: "Closed", 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed" },
        lat: 50.7954,
        lng: -1.0905,
        trustScore: 100
    },
    {
        id: 'fam2_b',
        name: "Milton Park Family Hub",
        category: "family",
        type: "Family Hub",
        area: "PO4",
        address: "Perth Road, Southsea, PO4 8EU",
        description: "Support for families in Milton/Eastney area.",
        requirements: "Drop-in. Free.",
        tags: ["free", "community", "children"],
        schedule: { 0: "Closed", 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed" },
        lat: 50.7960,
        lng: -1.0605,
        trustScore: 100
    },
    {
        id: 'fam10',
        name: "Northern Parade Family Hub",
        category: "family",
        type: "Family Hub",
        area: "PO2",
        address: "Doyle Avenue, Portsmouth, PO2 9NE",
        description: "Support for families in Hilsea/North End.",
        requirements: "Drop-in.",
        tags: ["free", "children", "community", "medical"],
        schedule: { 0: "Closed", 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed" },
        lat: 50.8245,
        lng: -1.0770,
        trustScore: 99
    },
    {
        id: 'fam11',
        name: "Paulsgrove Family Hub",
        category: "family",
        type: "Family Hub",
        area: "PO6",
        address: "Cheltenham Road, Paulsgrove, PO6 3PL",
        description: "Integrated family support.",
        requirements: "Drop-in.",
        tags: ["free", "children", "community"],
        schedule: { 0: "Closed", 1: "08:30-17:00", 2: "08:30-17:00", 3: "08:30-17:00", 4: "08:30-17:00", 5: "08:30-16:30", 6: "Closed" },
        lat: 50.8495,
        lng: -1.0940,
        trustScore: 99
    },
    {
        id: 'fam8',
        name: "Landport Adventure Playground",
        category: "family",
        type: "Adventure Play",
        area: "PO1",
        address: "Arundel Street, PO1 1PH",
        description: "Staffed adventure playground for ages 6-13. Free entry.",
        requirements: "Register on arrival.",
        tags: ["free", "children", "community"],
        schedule: { 0: "Closed", 1: "15:30-18:00", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "11:00-16:00" },
        lat: 50.7993,
        lng: -1.0816,
        trustScore: 98
    },
    {
        id: 'fam9',
        name: "Paulsgrove Adventure Playground",
        category: "family",
        type: "Adventure Play",
        area: "PO6",
        address: "Marsden Road, Paulsgrove, PO6 4JB",
        description: "Large adventure play area with structures and activities for children 6-13.",
        requirements: "Register on arrival.",
        tags: ["free", "children", "community"],
        schedule: { 0: "Closed", 1: "15:30-18:00", 2: "15:30-18:00", 3: "15:30-18:00", 4: "15:30-18:00", 5: "15:30-18:00", 6: "11:00-16:00" },
        lat: 50.8482,
        lng: -1.0937,
        trustScore: 98
    },

    // --- 🛍️ CHARITY SHOPS (COMPLETE MERGE) ---
    {
        id: 'c1',
        name: "Rowans Hospice (Palmerston)",
        category: "charity",
        type: "Charity Shop",
        area: "PO5",
        address: "15 Palmerston Rd, Southsea, PO5 3QQ",
        description: "Clothing, books, and homeware.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 0: "10:00-16:00", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00" },
        lat: 50.7860,
        lng: -1.0910,
        trustScore: 95
    },
    {
        id: 'c2',
        name: "Oxfam Books & Music",
        category: "charity",
        type: "Charity Shop",
        area: "PO5",
        address: "47 Palmerston Rd, Southsea, PO5 3QQ",
        description: "Specialist charity shop focusing on second-hand books and vinyl.",
        requirements: "Open to all.",
        tags: ["charity", "shopping", "learning"],
        schedule: { 0: "11:00-16:00", 1: "09:30-17:30", 2: "09:30-17:30", 3: "09:30-17:30", 4: "09:30-17:30", 5: "09:30-17:30", 6: "09:30-17:30" },
        lat: 50.7858,
        lng: -1.0912,
        trustScore: 98
    },
    {
        id: 'c3',
        name: "British Heart Foundation",
        category: "charity",
        type: "Charity Shop",
        area: "PO5",
        address: "17 Palmerston Rd, Southsea, PO5 3QQ",
        description: "Clothing, shoes, and accessories.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 0: "10:00-16:00", 1: "09:30-17:00", 2: "09:30-17:00", 3: "09:30-17:00", 4: "09:30-17:00", 5: "09:30-17:00", 6: "09:30-17:00" },
        lat: 50.7861,
        lng: -1.0910,
        trustScore: 95
    },
    {
        id: 'c4',
        name: "Cancer Research UK",
        category: "charity",
        type: "Charity Shop",
        area: "PO5",
        address: "33 Palmerston Rd, Southsea, PO5 3QQ",
        description: "High-quality second-hand clothing and homeware.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 0: "10:00-16:00", 1: "09:00-17:30", 2: "09:00-17:30", 3: "09:00-17:30", 4: "09:00-17:30", 5: "09:00-17:30", 6: "09:00-17:30" },
        lat: 50.7859,
        lng: -1.0911,
        trustScore: 95
    },
    {
        id: 'c5',
        name: "Barnardo's Southsea",
        category: "charity",
        type: "Charity Shop",
        area: "PO4",
        address: "73 Albert Rd, Southsea, PO5 2SG",
        description: "Supporting vulnerable children. Clothing, bric-a-brac, and toys.",
        requirements: "Open to all.",
        tags: ["charity", "shopping", "family"],
        schedule: { 0: "10:00-16:00", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00" },
        lat: 50.7865,
        lng: -1.0830,
        trustScore: 94
    },
    {
        id: 'c5_b',
        name: "Salvation Army Shop",
        category: "charity",
        type: "Charity Shop",
        area: "PO4",
        address: "84-86 Albert Rd, Southsea, PO5 2SN",
        description: "Furniture and clothing.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 0: "Closed", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00" },
        lat: 50.7864,
        lng: -1.0820,
        trustScore: 95
    },
    {
        id: 'c6',
        name: "Debra",
        category: "charity",
        type: "Charity Shop",
        area: "PO4",
        address: "105 Albert Rd, Southsea, PO5 2SG",
        description: "Often has furniture and larger household items.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 0: "10:00-16:00", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00" },
        lat: 50.7863,
        lng: -1.0815,
        trustScore: 92
    },
    {
        id: 'c9',
        name: "PDSA Charity Shop",
        category: "charity",
        type: "Charity Shop",
        area: "PO2",
        address: "71 London Rd, North End, PO2 0BH",
        description: "Supporting veterinary care. Clothing and books.",
        requirements: "Open to all.",
        tags: ["charity", "shopping", "pets"],
        schedule: { 0: "10:00-16:00", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00" },
        lat: 50.8105,
        lng: -1.0838,
        trustScore: 95
    },
    {
        id: 'c10',
        name: "Scope (North End)",
        category: "charity",
        type: "Charity Shop",
        area: "PO2",
        address: "47 London Rd, North End, PO2 0BH",
        description: "Disability equality charity. Good range of clothing.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 0: "10:00-16:00", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00" },
        lat: 50.8110,
        lng: -1.0837,
        trustScore: 94
    },
    {
        id: 'c11',
        name: "British Red Cross (Cosham)",
        category: "charity",
        type: "Charity Shop",
        area: "PO6",
        address: "48 High St, Cosham, PO6 3AG",
        description: "Furniture and electrical items alongside clothing.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 0: "Closed", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00" },
        lat: 50.8465,
        lng: -1.0680,
        trustScore: 93
    },
    {
        id: 'c12',
        name: "Naomi House (Cosham)",
        category: "charity",
        type: "Charity Shop",
        area: "PO6",
        address: "68 High St, Cosham, PO6 3AJ",
        description: "Supporting hospices for children and young adults.",
        requirements: "Open to all.",
        tags: ["charity", "shopping"],
        schedule: { 0: "10:00-16:00", 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00", 6: "09:00-17:00" },
        lat: 50.8468,
        lng: -1.0675,
        trustScore: 95
    }
];

// --- 3. HELPERS ---
const checkStatus = (schedule: Record<number, string>) => {
    const now = new Date();
    const day = now.getDay();
    const timeStr = schedule[day];
    
    if (!timeStr || timeStr === "Closed") return { isOpen: false, text: "Closed" };
    if (timeStr === "24/7") return { isOpen: true, text: "Open 24/7" };

    const [start, end] = timeStr.split('-');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;
    const currentTime = currentH * 60 + currentM;
    
    const isOpen = currentTime >= startTime && currentTime < endTime;
    return { 
        isOpen, 
        text: isOpen ? `Open until ${end}` : `Opens ${start}` 
    };
};

// --- 4. SUB-COMPONENTS ---
const ResourceCard = ({ item, isSaved, onToggleSave, onNavigate }: any) => {
    const status = checkStatus(item.schedule);
    const TagIcon = TAG_ICONS[item.category]?.icon || TAG_ICONS.default.icon;
    const tagColor = TAG_ICONS[item.category]?.color || TAG_ICONS.default.color;
    const tagBg = TAG_ICONS[item.category]?.bg || TAG_ICONS.default.bg;

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all mb-4 relative group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tagBg} ${tagColor}`}>
                        <TagIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg leading-tight mb-1">{item.name}</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                            <span className={status.isOpen ? "text-emerald-600" : "text-rose-500"}>
                                {status.isOpen ? "● Open Now" : "● Closed"}
                            </span>
                            <span>•</span>
                            <span>{item.area}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                    className={`p-2 rounded-full transition-all ${isSaved ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:bg-slate-50'}`}
                >
                    <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                </button>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-4 pl-1">{item.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-md border border-slate-100">
                        {tag.replace('_', ' ')}
                    </span>
                ))}
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-50">
                <button onClick={() => onNavigate(item)} className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-colors">
                    <Navigation size={14} /> Directions
                </button>
                {item.phone && (
                    <a href={`tel:${item.phone}`} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                        <Phone size={16} />
                    </a>
                )}
            </div>
        </div>
    );
};

const SimpleMap = ({ data }: any) => {
    return (
        <div className="w-full h-64 bg-slate-100 rounded-[32px] flex items-center justify-center border-2 border-slate-200 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 to-slate-100" style={{ backgroundSize: '20px 20px', backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)' }}></div>
            <div className="text-center z-10 p-6">
                <MapPin size={40} className="text-indigo-600 mx-auto mb-3 animate-bounce" />
                <h3 className="font-black text-slate-800 text-lg">Map View Placeholder</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Displaying {data.length} locations</p>
                <div className="text-[10px] text-slate-400 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-200">
                    Map interactivity disabled in preview mode.<br/>Please use List View for details.
                </div>
            </div>
        </div>
    );
};

// --- 5. MAIN APP COMPONENT ---
const App = () => {
    const [view, setView] = useState<'home' | 'list' | 'map'>('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [appId, setAppId] = useState(typeof __app_id !== 'undefined' ? __app_id : 'default-app-id');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [firebaseData, setFirebaseData] = useState<Resource[]>([]);
    const [isSyncing, setIsSyncing] = useState(true);
    const [syncError, setSyncError] = useState<string | null>(null);
    
    // Auth & Data Sync
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Auth Error:", error);
                setSyncError("Auth Failed");
                setIsSyncing(false);
            }
        };
        initAuth();
        
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return () => unsubscribeAuth();
    }, []);

    // Sync Data (Cloud Priority) - Wait for User
    useEffect(() => {
        if (!currentUser) return;

        // 優先監聽雲端資料 (Firestore)
        const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'resources');
        const unsubscribeData = onSnapshot(collectionRef, (snapshot) => {
            if (!snapshot.empty) {
                const cloudResources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
                setFirebaseData(cloudResources);
                console.log(`☁️ Synced ${cloudResources.length} resources from Cloud`);
                setSyncError(null);
            } else {
                console.log("⚠️ Cloud empty, using Local Fallback");
            }
            setIsSyncing(false);
        }, (error) => {
            console.error("Sync Error:", error);
            setSyncError("Permission Denied");
            setIsSyncing(false);
        });

        return () => unsubscribeData();
    }, [appId, currentUser]);

    // Decide which data source to use
    // 如果雲端有資料，就用雲端的 (58筆)；否則用本地備份 (51筆)
    const activeData = firebaseData.length > 0 ? firebaseData : LOCAL_DATA;
    const [filteredData, setFilteredData] = useState(activeData);

    useEffect(() => {
        let res = activeData;
        
        if (filterCategory !== 'all') {
            res = res.filter(item => item.category === filterCategory);
        }

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            res = res.filter(item => 
                item.name.toLowerCase().includes(lowerQ) || 
                item.description.toLowerCase().includes(lowerQ) ||
                item.tags.some(tag => tag.includes(lowerQ))
            );
        }

        setFilteredData(res);
    }, [searchQuery, filterCategory, activeData]);

    const toggleSaved = (id: string) => {
        setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleNavigate = (item: Resource) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;
        window.open(url, '_blank');
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative pb-24 overflow-hidden font-sans text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 pt-4 pb-3 px-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
                        PB
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1">Portsmouth Bridge</h1>
                        <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase flex items-center gap-1">
                            {isSyncing ? (
                                <><RefreshCw size={8} className="animate-spin" /> Syncing...</>
                            ) : (
                                <><Cloud size={8} className={firebaseData.length > 0 ? "text-emerald-500" : "text-slate-400"} /> 
                                {firebaseData.length > 0 ? 'Cloud Data' : 'Local Mode'}
                                {syncError && <span className="text-rose-500 ml-1">({syncError})</span>}
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                    <Menu size={20} />
                </button>
            </header>

            {/* Main Content */}
            <div className="px-5 mt-6">
                {view === 'home' && (
                    <div className="animate-fade-in-up">
                        {/* Search Bar */}
                        <div className="mb-8 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search resources..." 
                                className="w-full py-4 pl-12 pr-4 bg-slate-50 rounded-[24px] border-2 border-slate-100 focus:border-indigo-600 outline-none text-sm font-bold text-slate-900 transition-all"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setView('list'); }}
                            />
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {Object.entries(TAG_ICONS).filter(([k]) => k !== 'default').map(([key, meta]) => (
                                <button 
                                    key={key}
                                    onClick={() => { setFilterCategory(key); setView('list'); }}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-active:scale-95 border-2 border-transparent group-hover:border-slate-100 ${meta.bg} ${meta.color}`}>
                                        <meta.icon size={20} />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight truncate w-full text-center group-hover:text-slate-600">
                                        {meta.label.replace(' Support', '').replace(' Hub', '')}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Stats Card */}
                        <div className="p-6 bg-slate-900 rounded-[32px] text-white relative overflow-hidden mb-8 shadow-xl shadow-slate-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
                            <h3 className="text-2xl font-black mb-1 relative z-10">{activeData.length} Locations</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 relative z-10">
                                {firebaseData.length > 0 ? 'Live Cloud Data Verified' : 'Local Database Active'}
                            </p>
                            <button onClick={() => setView('list')} className="px-6 py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                Browse All
                            </button>
                        </div>
                    </div>
                )}

                {(view === 'list' || view === 'map') && (
                    <div className="animate-fade-in-up">
                        {/* List Header */}
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
                                    {filterCategory === 'all' ? 'All Resources' : TAG_ICONS[filterCategory]?.label}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {filteredData.length} Results Found
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setView(view === 'list' ? 'map' : 'list')}
                                    className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors"
                                >
                                    {view === 'list' ? <MapPin size={20} /> : <Menu size={20} />}
                                </button>
                                {filterCategory !== 'all' && (
                                    <button 
                                        onClick={() => setFilterCategory('all')}
                                        className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {view === 'map' && <SimpleMap data={filteredData} />}

                        {/* Resource List */}
                        <div className="space-y-4">
                            {filteredData.map(item => (
                                <ResourceCard 
                                    key={item.id} 
                                    item={item} 
                                    isSaved={savedIds.includes(item.id)}
                                    onToggleSave={() => toggleSaved(item.id)}
                                    onNavigate={handleNavigate}
                                />
                            ))}
                        </div>
                        
                        {filteredData.length === 0 && (
                            <div className="text-center py-20 text-slate-400">
                                <Search size={40} className="mx-auto mb-4 opacity-20" />
                                <p className="font-bold">No results found.</p>
                                <button onClick={() => {setFilterCategory('all'); setSearchQuery('');}} className="mt-4 text-indigo-600 text-sm font-black uppercase tracking-wider">Clear Filters</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-full shadow-2xl flex items-center gap-8 z-50">
                <button 
                    onClick={() => setView('home')} 
                    className={`transition-colors ${view === 'home' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Home size={24} />
                </button>
                <button 
                    onClick={() => setView('map')} 
                    className={`transition-colors ${view === 'map' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <MapPin size={24} />
                </button>
                <div className="w-px h-6 bg-slate-200"></div>
                <button className="text-rose-500 hover:scale-110 transition-transform">
                    <LifeBuoy size={24} />
                </button>
            </div>

            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

export default App;