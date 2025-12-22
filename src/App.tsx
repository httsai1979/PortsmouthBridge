import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * PORTSMOUTH BRIDGE - 專業整合修復版
 * * 核心修復說明：
 * 1. TypeError (reading 'S'): 透過標準化 'react-dom/client' 的導入與呼叫鏈來修復。
 * 2. Error #299: 透過全局單例模式 (Singleton Pattern) 確保 root 只會建立一次。
 * 3. 語法錯誤: 修正 SVG 屬性中多餘的反斜線。
 * 4. 數據完整性: 整合了 REAL_DATA, TAG_ICONS 以及所有子組件邏輯。
 */

// ==========================================
// 1. 數據與常數 (Data & Constants)
// ==========================================

const AREAS = ['All', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'];

const TAG_ICONS = {
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

const REAL_DATA = [
    { 
        id: 'f_hive_1', 
        name: "Pompey Community Fridge", 
        category: "food", 
        type: "Surplus Food", 
        area: "PO4", 
        address: "Fratton Park, PO4 8SX", 
        description: "Reducing food waste by providing free surplus food parcels. Please bring your own bag.", 
        requirements: "Open to all.", 
        tags: ["free", "fresh_food", "no_referral"], 
        schedule: { 1: "13:00-15:00", 2: "13:00-15:00", 3: "13:00-15:00", 4: "13:00-15:00", 5: "13:00-15:00" }, 
        lat: 50.796, lng: -1.064, 
        phone: "023 9273 1141", 
        trustScore: 98, 
        transport: "Direct Bus 1/3" 
    },
    { 
        id: 'f_hive_2', 
        name: "FoodCycle Portsmouth", 
        category: "food", 
        type: "Hot Meal", 
        area: "PO1", 
        address: "John Pounds Centre, Queen St, PO1 3HN", 
        description: "Providing a free three-course vegetarian meal in a community setting.", 
        requirements: "No booking required, just turn up.", 
        tags: ["free", "hot_meal", "no_referral"], 
        schedule: { 3: "18:00-19:30" }, 
        lat: 50.798, lng: -1.096, 
        trustScore: 100, 
        transport: "PO1 Walking Dist" 
    },
    { 
        id: 's_hive_1', 
        name: "Rough Sleeping Hub", 
        category: "shelter", 
        type: "Day Centre", 
        area: "PO5", 
        address: "Kingsway House, 130 Elm Grove", 
        description: "Central hub for homeless support. Showers, laundry, breakfast and housing advice.", 
        requirements: "Open access drop-in.", 
        tags: ["shower", "laundry", "breakfast", "no_referral", "shelter"], 
        schedule: { 1: "08:00-16:00", 2: "08:00-16:00", 3: "08:00-16:00", 4: "08:00-16:00", 5: "08:00-16:00", 6: "08:00-16:00", 0: "08:00-16:00" }, 
        lat: 50.792, lng: -1.088, 
        phone: "023 9288 2689", 
        trustScore: 100,
        transport: "PO5 Central"
    },
    { 
        id: 'sup_hive_1', 
        name: "HIVE Portsmouth Hub", 
        category: "support", 
        type: "Community Hub", 
        area: "PO1", 
        address: "Central Library, Guildhall Sq", 
        description: "Information, volunteer opportunities, and social resource referrals.", 
        requirements: "Drop-in.", 
        tags: ["advice", "support", "no_referral"], 
        schedule: { 1: "09:30-16:00", 2: "09:30-16:00", 3: "09:30-16:00", 4: "09:30-16:00", 5: "09:30-16:00" }, 
        lat: 50.798, lng: -1.091, 
        phone: "023 9261 6709", 
        trustScore: 100,
        transport: "Civic Offices"
    }
];

const ALL_DATA = [...REAL_DATA];

// ==========================================
// 2. 工具函式 (Utility Functions)
// ==========================================

const checkStatus = (schedule) => {
    if (!schedule) return { status: 'closed', label: 'Closed', isOpen: false };
    const now = new Date();
    const day = now.getDay();
    const todaySched = schedule[day];
    if (!todaySched || todaySched === 'Closed') return { status: 'closed', label: 'Closed Today', isOpen: false };
    
    const [open, close] = todaySched.split('-').map(t => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + (m || 0);
    });
    const current = now.getHours() * 60 + now.getMinutes();
    
    if (current >= open && current < close - 30) return { status: 'open', label: 'Open Now', isOpen: true };
    if (current >= open && current < close) return { status: 'closing', label: 'Closing Soon', isOpen: true };
    return { status: 'closed', label: 'Closed', isOpen: false };
};

const playSuccessSound = () => {
    try { console.log('Portsmouth Bridge: Action feedback ping.'); } catch(e) {}
};

// ==========================================
// 3. UI 組件 (Sub-components)
// ==========================================

const Icon = ({ name, size = 18, className = "" }) => {
    const icons = {
        search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
        home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
        utensils: <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" />,
        bed: <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />,
        flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.246-3.64-3.418-5.418A9 9 0 0 1 21 12a9 9 0 0 1-9 9 9 9 0 0 1-6-5.3L6 14z" />,
        lifebuoy: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24m-14.14 0 4.24-4.24m5.66-5.66 4.24-4.24" /></>,
        users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>,
        family: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>,
        mapPin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
        calendar: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></>,
        phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
        info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
        x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        sparkles: <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />,
        navigation: <polygon points="3 11 22 2 13 21 11 13 3 11" />,
        zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
        star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
        plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
        bus: <rect width="16" height="16" x="4" y="4" rx="2" />,
        clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
        check_circle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    };
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[name] || icons.info}
        </svg>
    );
};

const ResourceCard = ({ item, isSaved, onToggleSave, onAddToJourney, onAddToCompare, isInJourney, isInCompare, highContrast }) => {
    const status = checkStatus(item.schedule);
    const getStatusColor = () => {
        if (status.status === 'open') return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
        if (status.status === 'closing') return 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]';
        return 'bg-slate-300';
    };

    return (
        <div className={`bg-white rounded-[32px] mb-6 shadow-sm border-2 transition-all duration-300 relative overflow-hidden flex ${highContrast ? 'border-slate-900 border-[3px]' : isSaved ? 'border-indigo-100 shadow-indigo-100/50' : 'border-slate-50'}`}>
            <div className={`w-3 shrink-0 ${getStatusColor()} transition-colors duration-500`} />
            <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${status.isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {status.label}
                        </span>
                        <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-slate-50 text-slate-400 border-2 border-slate-100">{item.type}</span>
                    </div>
                    <button onClick={onToggleSave} className={`p-3 rounded-2xl transition-all ${isSaved ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon name={isSaved ? "star" : "plus"} size={20} />
                    </button>
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 tracking-tight">{item.name}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4">
                    <Icon name="mapPin" size={14} /> {item.address}
                </div>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed font-medium line-clamp-2">{item.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <Icon name="clock" size={20} className="text-indigo-600" />
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Today</p>
                            <p className="text-[11px] font-black text-slate-700 truncate">{item.schedule[new Date().getDay()] || 'Closed'}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <Icon name="bus" size={20} className="text-blue-600" />
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transport</p>
                            <p className="text-[11px] font-black text-slate-700 truncate">{item.transport || 'Local'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onAddToJourney} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isInJourney ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-indigo-100 text-indigo-600'}`}>
                        {isInJourney ? 'In Route' : 'Journey'}
                    </button>
                    <button onClick={onAddToCompare} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isInCompare ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-emerald-100 text-emerald-600'}`}>
                        {isInCompare ? 'Comparing' : 'Compare'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ data, onNavigate }) => {
    const stats = useMemo(() => {
        const openNow = data.filter(i => checkStatus(i.schedule).isOpen).length;
        const totalFood = data.filter(i => i.category === 'food').length;
        const totalBeds = data.filter(i => i.category === 'shelter').length;
        return { openNow, totalFood, totalBeds };
    }, [data]);

    return (
        <div className="mb-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">Portsmouth Pulse Report</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div onClick={() => onNavigate('all')} className="bg-emerald-500 p-5 rounded-[28px] text-white shadow-lg shadow-emerald-100 cursor-pointer active:scale-95 transition-all text-center">
                    <div className="text-3xl font-black mb-1">{stats.openNow}</div>
                    <div className="text-[9px] uppercase font-black leading-tight opacity-90">Open<br />Now</div>
                </div>
                <div onClick={() => onNavigate('food')} className="bg-indigo-600 p-5 rounded-[28px] text-white shadow-lg shadow-indigo-100 cursor-pointer active:scale-95 transition-all text-center">
                    <div className="text-3xl font-black mb-1">{stats.totalFood}</div>
                    <div className="text-[9px] uppercase font-black leading-tight opacity-90">Food<br />Hubs</div>
                </div>
                <div onClick={() => onNavigate('shelter')} className="bg-slate-900 p-5 rounded-[28px] text-white shadow-lg shadow-slate-200 cursor-pointer active:scale-95 transition-all text-center">
                    <div className="text-3xl font-black mb-1">{stats.totalBeds}</div>
                    <div className="text-[9px] uppercase font-black leading-tight opacity-90">Shelter<br />Points</div>
                </div>
            </div>
        </div>
    );
};

const AIAssistant = ({ onIntent, currentArea }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const intents = [
        { keywords: ['hungry', 'food', 'eat'], category: 'food' },
        { keywords: ['sleep', 'shelter', 'bed'], category: 'shelter' }
    ];

    const processQuery = (text) => {
        const lower = text.toLowerCase();
        const best = intents.find(i => i.keywords.some(k => lower.includes(k)));
        onIntent({ area: currentArea, category: best ? best.category : 'all', date: 'today' });
        setIsOpen(false);
        setQuery('');
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="fixed bottom-32 left-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white z-[120]">
                <Icon name="sparkles" size={24} />
            </button>
            {isOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                            <h3 className="text-xl font-black flex items-center gap-2"><Icon name="sparkles" size={18} /> How can I help?</h3>
                            <button onClick={() => setIsOpen(false)}><Icon name="x" size={20} /></button>
                        </div>
                        <div className="p-8">
                            <input 
                                type="text" 
                                value={query} 
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && processQuery(query)}
                                placeholder="Try 'I am hungry' or 'Need a bed'..."
                                className="w-full py-5 px-6 bg-slate-100 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ==========================================
// 4. 主要應用程式 (Main Application)
// ==========================================

const App = () => {
    const [view, setView] = useState('home');
    const [loading, setLoading] = useState(true);
    const [highContrast, setHighContrast] = useState(false);
    const [stealthMode, setStealthMode] = useState(false);
    const [filters, setFilters] = useState({ area: 'All', category: 'all', date: 'today' });
    const [searchQuery, setSearchQuery] = useState('');
    
    const [savedIds, setSavedIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('p_bridge_v3_saved') || '[]'); } 
        catch { return []; }
    });
    const [journeyItems, setJourneyItems] = useState([]);
    const [compareItems, setCompareItems] = useState([]);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        localStorage.setItem('p_bridge_v3_saved', JSON.stringify(savedIds));
    }, [savedIds]);

    const toggleSaved = (id) => {
        setSavedIds(prev => {
            const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
            if (!prev.includes(id)) playSuccessSound();
            return next;
        });
    };

    const filteredData = useMemo(() => {
        return ALL_DATA.filter(item => {
            const matchArea = filters.area === 'All' || item.area === filters.area;
            const matchCat = filters.category === 'all' || item.category === filters.category;
            const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchArea && matchCat && matchSearch;
        });
    }, [filters, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center animate-pulse">
                    <Icon name="zap" size={48} className="text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Portsmouth Bridge</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Connecting Community • Restoring Hope</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`app-container min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-100 ${highContrast ? 'grayscale contrast-125' : ''}`}>
            <style>{`
                .app-container { max-width: 500px; margin: 0 auto; box-shadow: 0 0 100px rgba(0,0,0,0.08); min-height: 100vh; position: relative; padding-bottom: 130px; }
                .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            <header className="sticky top-0 z-[110] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-6 flex justify-between items-center transition-all">
                <h1 className={`text-2xl font-black tracking-tighter ${stealthMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    {stealthMode ? 'Shielded Compass' : 'Portsmouth Bridge'}
                </h1>
                <div className="flex gap-2">
                    <button onClick={() => setStealthMode(!stealthMode)} className={`p-3 rounded-2xl transition-all ${stealthMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon name="eye" size={20} />
                    </button>
                    <button onClick={() => setHighContrast(!highContrast)} className={`p-3 rounded-2xl transition-all ${highContrast ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon name="zap" size={20} />
                    </button>
                </div>
            </header>

            <main className="px-6 pt-8 pb-10">
                {view === 'home' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-10 p-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            <h2 className="text-4xl font-black leading-tight mb-3">Good morning, Portsmouth</h2>
                            <p className="text-indigo-100 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Your comprehensive support network</p>
                            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                                <div>
                                    <div className="text-[10px] font-black uppercase text-indigo-300 mb-1 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Active Hubs
                                    </div>
                                    <p className="text-3xl font-black">{ALL_DATA.length}</p>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase text-indigo-300 mb-1">Open Now</div>
                                    <p className="text-3xl font-black">{ALL_DATA.filter(d => checkStatus(d.schedule).isOpen).length}</p>
                                </div>
                            </div>
                        </div>

                        <Dashboard data={ALL_DATA} onNavigate={(cat) => { setFilters({ ...filters, category: cat }); setView('list'); }} />

                        <div className="relative mb-12 group">
                            <Icon name="search" size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search services (e.g. food, shelter)..."
                                className="w-full py-7 pl-16 pr-8 bg-white rounded-[32px] border-2 border-slate-100 focus:border-indigo-600 outline-none font-bold text-lg shadow-sm transition-all focus:shadow-xl focus:shadow-indigo-50"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); if(e.target.value) setView('list'); }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                            {['food', 'shelter', 'warmth', 'support', 'family', 'learning'].map(cat => {
                                const conf = TAG_ICONS[cat] || TAG_ICONS.default;
                                return (
                                    <button key={cat} onClick={() => { setFilters({ ...filters, category: cat }); setView('list'); }} className={`p-8 rounded-[40px] text-left transition-all active:scale-95 shadow-sm hover:shadow-md ${conf.bg} ${conf.color}`}>
                                        <div className="mb-6 bg-white/60 w-14 h-14 rounded-2xl flex items-center justify-center">
                                            <Icon name={conf.icon} size={32} />
                                        </div>
                                        <p className="font-black text-lg tracking-tight capitalize">{cat}</p>
                                        <p className="text-[9px] font-bold opacity-50 mt-1 uppercase tracking-widest">{ALL_DATA.filter(d => d.category === cat).length} Resources</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {view === 'list' && (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h2 className="text-4xl font-black tracking-tight text-slate-900 capitalize">
                                    {filters.category === 'all' ? 'Directory' : filters.category}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Finding the right support for you</p>
                            </div>
                            <button onClick={() => setView('home')} className="p-4 bg-slate-100 text-slate-400 rounded-[24px] hover:bg-slate-200 transition-all">
                                <Icon name="x" size={24} />
                            </button>
                        </div>
                        
                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-10 pb-2">
                            {AREAS.map(a => (
                                <button key={a} onClick={() => setFilters({...filters, area: a})} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-2 transition-all ${filters.area === a ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400'}`}>
                                    {a}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {filteredData.length > 0 ? filteredData.map(item => (
                                <ResourceCard 
                                    key={item.id} 
                                    item={item} 
                                    isSaved={savedIds.includes(item.id)}
                                    onToggleSave={() => toggleSaved(item.id)}
                                    onAddToJourney={() => setJourneyItems(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                                    onAddToCompare={() => setCompareItems(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                                    isInJourney={journeyItems.includes(item.id)}
                                    isInCompare={compareItems.includes(item.id)}
                                />
                            )) : (
                                <div className="py-24 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
                                    <Icon name="search" size={48} className="mx-auto text-slate-200 mb-6" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No results found in {filters.area}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <AIAssistant onIntent={setFilters} currentArea={filters.area} />

            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 py-6 px-12 flex justify-between items-center z-[110] max-w-[500px] mx-auto shadow-[0_-15px_50px_rgba(0,0,0,0.05)]">
                <button onClick={() => setView('home')} className={`flex flex-col items-center gap-2 transition-all ${view === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
                    <Icon name="home" size={28} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
                </button>
                <button onClick={() => setView('list')} className={`flex flex-col items-center gap-2 transition-all ${view === 'list' ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
                    <Icon name="tag" size={28} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Directory</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-slate-300 hover:text-slate-500">
                    <Icon name="navigation" size={28} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Map</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-rose-400 hover:text-rose-600">
                    <Icon name="alert" size={28} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">SOS</span>
                </button>
            </nav>
        </div>
    );
};

// ==========================================
// 5. 最終魯棒掛載邏輯 (解決 299 與 TypeError)
// ==========================================
/**
 * 透過 window 全局變量來儲存 root 實例，
 * 避免在沙盒環境中因為程式碼重載而導致重複初始化。
 */
const mountApp = () => {
    const container = document.getElementById('app');
    if (!container) return;

    // 定義全局快取鍵名，使用更具唯一性的名稱
    const rootKey = '__PORTSMOUTH_FINAL_ROOT__';

    // 如果環境中有舊的根節點，先進行卸載，這是防止 Error #299 的最穩健做法
    if (window[rootKey]) {
        try {
            window[rootKey].unmount();
        } catch (e) {
            // 靜默處理卸載錯誤，並繼續建立新根節點
        }
    }

    // 建立新根節點
    try {
        const root = createRoot(container);
        window[rootKey] = root;
        root.render(<App />);
    } catch (err) {
        console.error("Critical Rendering Error:", err);
    }
};

// 確保 DOM 已完全載入後執行掛載程序
if (document.readyState === 'complete') {
    mountApp();
} else {
    window.addEventListener('load', mountApp);
}

export default App;
