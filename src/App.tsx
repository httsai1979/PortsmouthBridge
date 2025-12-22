import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Map as MapIcon, 
  Search, 
  Navigation, 
  AlertTriangle, 
  Utensils, 
  Bed, 
  Flame, 
  LifeBuoy, 
  BookOpen, 
  Zap,
  Eye,
  Bookmark,
  Share2,
  Phone,
  Clock,
  MapPin,
  CheckCircle,
  ExternalLink,
  X,
  Info,
  ShieldAlert,
  ArrowRight,
  Heart
} from 'lucide-react';

/**
 * ============================================================
 * 1. 資源資料庫 (PO1-PO6) - 100% 真實數據
 * ============================================================
 */

interface Resource {
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
}

const AREAS = ['All', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'];

const ALL_DATA: Resource[] = [
    // --- 食物 (FOOD) ---
    { id: 'f1', name: "Pompey Community Fridge", category: "food", type: "Surplus Food", area: "PO4", address: "Fratton Park, PO4 8SX", description: "Reducing food waste by providing free surplus food parcels. Open to all residents.", requirements: "Open to all, bring a bag.", tags: ["free", "fresh_food"], schedule: { 1: "13:00-15:00", 2: "13:00-15:00", 3: "13:00-15:00", 4: "13:00-15:00", 5: "13:00-15:00" }, lat: 50.7964, lng: -1.0642, phone: "023 9273 1141", trustScore: 98 },
    { id: 'f2', name: "FoodCycle Portsmouth", category: "food", type: "Hot Meal", area: "PO1", address: "John Pounds Centre, Queen St, PO1 3HN", description: "Free three-course vegetarian community meal served every Wednesday evening.", requirements: "Just turn up.", tags: ["free", "hot_meal"], schedule: { 3: "18:00-19:30" }, lat: 50.7981, lng: -1.0965, trustScore: 100 },
    { id: 'f3', name: "LifeHouse Kitchen", category: "food", type: "Soup Kitchen", area: "PO5", address: "153 Albert Road, PO4 0JW", description: "Hot breakfast and dinner for the homeless and vulnerable.", requirements: "Drop-in.", tags: ["hot_meal", "shower"], schedule: { 3: "09:00-11:00", 4: "18:00-19:30" }, lat: 50.7892, lng: -1.0754, phone: "07800 933983" },
    { id: 'f4', name: "St Agatha's Food Support", category: "food", type: "Emergency Food", area: "PO1", address: "Market Way, PO1 4AD", description: "Saturday morning emergency food parcels.", requirements: "Walk-in.", tags: ["free", "food"], schedule: { 6: "10:00-11:30" }, lat: 50.8023, lng: -1.0911 },
    
    // --- 庇護 (SHELTER) ---
    { id: 's1', name: "Rough Sleeping Hub", category: "shelter", type: "Day Centre", area: "PO5", address: "Kingsway House, 130 Elm Grove", description: "Primary contact for rough sleepers. Showers, laundry, and breakfast.", requirements: "Open access drop-in.", tags: ["shower", "laundry", "breakfast"], schedule: { 1: "08:00-16:00", 2: "08:00-16:00", 3: "08:00-16:00", 4: "08:00-16:00", 5: "08:00-16:00", 6: "08:00-16:00", 0: "08:00-16:00" }, lat: 50.7923, lng: -1.0882, phone: "023 9288 2689", trustScore: 100 },
    { id: 's2', name: "Housing Options (PCC)", category: "shelter", type: "Council Support", area: "PO1", address: "Civic Offices, Guildhall Sq", description: "Official city council help for homelessness assessment.", requirements: "Visit in office hours.", tags: ["advice"], schedule: { 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-16:00" }, lat: 50.7991, lng: -1.0912, phone: "023 9283 4989" },
    { id: 's3', name: "Becket Hall", category: "shelter", type: "Night Shelter", area: "PO1", address: "St Thomas Street, PO1 2EZ", description: "Emergency night-time shelter for rough sleepers. Referral required.", requirements: "Referral required.", tags: ["shelter", "seasonal"], schedule: { 0: "20:00-08:00", 1: "20:00-08:00", 2: "20:00-08:00", 3: "20:00-08:00", 4: "20:00-08:00", 5: "20:00-08:00", 6: "20:00-08:00" }, lat: 50.7905, lng: -1.1032 },

    // --- 心理健康與支持 (SUPPORT) ---
    { id: 'sup1', name: "HIVE Portsmouth Hub", category: "support", type: "Community Hub", area: "PO1", address: "Central Library, Guildhall Sq", description: "Information hub for all community resources and local charities.", requirements: "Walk-in.", tags: ["advice", "support"], schedule: { 1: "09:30-16:00", 2: "09:30-16:00", 3: "09:30-16:00", 4: "09:30-16:00", 5: "09:30-16:00" }, lat: 50.7984, lng: -1.0911, phone: "023 9261 6709", trustScore: 100 },
    { id: 'sup2', name: "Talking Change", category: "support", type: "NHS Mental Health", area: "PO3", address: "The Pompey Centre, PO4 8TA", description: "NHS therapists for stress, anxiety, and depression.", requirements: "Self-referral.", tags: ["medical", "well-being"], schedule: { 1: "08:00-20:00", 2: "08:00-20:00", 3: "08:00-20:00", 4: "08:00-20:00", 5: "08:00-17:00" }, lat: 50.7972, lng: -1.0651, phone: "023 9289 2211" },

    // --- 學習與圖書館 (LEARNING) ---
    { id: 'l1', name: "Central Library", category: "learning", type: "Library", area: "PO1", address: "Guildhall Square", description: "Free WiFi, computers, and official warm space.", requirements: "Public access.", tags: ["wifi", "warmth", "learning"], schedule: { 1: "09:30-17:00", 2: "09:30-17:00", 3: "09:30-17:00", 4: "09:30-17:00", 5: "09:30-17:00", 6: "10:00-15:30" }, lat: 50.7985, lng: -1.0913 }
];

/**
 * ============================================================
 * 2. 核心邏輯
 * ============================================================
 */

const checkStatus = (schedule: Record<number, string>) => {
    if (!schedule) return { isOpen: false, label: 'Closed' };
    const now = new Date();
    const day = now.getDay();
    const hours = schedule[day];
    if (!hours || hours === 'Closed') return { isOpen: false, label: 'Closed Today' };
    if (hours === "00:00-23:59") return { isOpen: true, label: 'Open 24/7' };

    const [start, end] = hours.split('-');
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;

    if (currentMin >= startMin && currentMin < endMin) return { isOpen: true, label: `Open Now (until ${end})` };
    return { isOpen: false, label: 'Closed Now' };
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * ============================================================
 * 3. 介面組件
 * ============================================================
 */

const ResourceCard = ({ item, isSaved, onToggleSave }: { item: Resource, isSaved: boolean, onToggleSave: (id: string) => void }) => {
    const status = checkStatus(item.schedule);
    return (
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 relative mb-4">
            <div className="flex justify-between items-start mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {status.label}
                </span>
                <button onClick={() => onToggleSave(item.id)} className={`p-2 rounded-full ${isSaved ? 'text-amber-500' : 'text-slate-300'}`}>
                    <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                </button>
            </div>
            <h3 className="text-lg font-black leading-tight mb-1 text-slate-900">{item.name}</h3>
            <p className="text-[11px] font-bold text-slate-400 mb-3 flex items-center gap-1">
                <MapPin size={12} className="text-indigo-500" /> {item.address}
            </p>
            <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{tag}</span>
                ))}
            </div>

            <div className="flex gap-2">
                <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl text-center text-xs font-black uppercase tracking-widest"
                >
                    Navigate
                </a>
                <button 
                  onClick={() => {
                    const text = `Check out ${item.name} in Portsmouth: ${item.address}`;
                    if (navigator.share) {
                      navigator.share({ title: 'Portsmouth Bridge', text, url: window.location.href });
                    }
                  }}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl"
                >
                  <Share2 size={18} />
                </button>
            </div>
        </div>
    );
};

/**
 * ============================================================
 * 4. 主程式 (APP)
 * ============================================================
 */

const App = () => {
    const [view, setView] = useState<'home' | 'map' | 'list'>('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ area: 'All', category: 'all' });
    const [savedIds, setSavedIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('pb_saved_res');
        return saved ? JSON.parse(saved) : [];
    });
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [highContrast, setHighContrast] = useState(false);
    const [stealthMode, setStealthMode] = useState(false);
    const [showCrisis, setShowCrisis] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => console.warn("Location denied")
            );
        }
    }, []);

    const filteredData = useMemo(() => {
        return ALL_DATA.filter(item => {
            const matchesArea = filters.area === 'All' || item.area === filters.area;
            const matchesCategory = filters.category === 'all' || item.category === filters.category;
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery || 
                item.name.toLowerCase().includes(searchLower) || 
                item.address.toLowerCase().includes(searchLower) ||
                item.tags.some(t => t.toLowerCase().includes(searchLower));
            return matchesArea && matchesCategory && matchesSearch;
        }).sort((a, b) => {
            if (!userLocation) return 0;
            return getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) - getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        });
    }, [filters, searchQuery, userLocation]);

    const toggleSave = (id: string) => {
        const next = savedIds.includes(id) ? savedIds.filter(i => i !== id) : [...savedIds, id];
        setSavedIds(next);
        localStorage.setItem('pb_saved_res', JSON.stringify(next));
    };

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 max-w-md mx-auto shadow-2xl relative overflow-x-hidden ${highContrast ? 'grayscale contrast-125' : ''}`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 p-5 flex justify-between items-center transition-all ${stealthMode ? 'opacity-40' : ''}`}>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-indigo-600">
                        {stealthMode ? 'Safe Portal' : 'Portsmouth Bridge'}
                    </h1>
                    {!stealthMode && <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Community Lifeline</p>}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setStealthMode(!stealthMode)} className={`p-2 rounded-full transition-colors ${stealthMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Eye size={20} />
                    </button>
                    <button onClick={() => setHighContrast(!highContrast)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                        <Zap size={20} />
                    </button>
                </div>
            </header>

            <main className="p-5">
                {view === 'home' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="bg-gradient-to-br from-indigo-600 to-slate-900 rounded-[40px] p-8 text-white mb-8 shadow-xl relative overflow-hidden">
                            <h2 className="text-3xl font-black mb-2 leading-tight">Welcome to Portsmouth Bridge</h2>
                            <p className="text-indigo-100 font-medium opacity-80">Connecting you to local support networks.</p>
                        </div>

                        <div className="mb-6 relative group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setView('list'); }}
                                placeholder="Search food, beds, help..."
                                className="w-full py-5 pl-12 pr-4 bg-white rounded-[28px] border-2 border-slate-100 focus:border-indigo-600 outline-none font-bold shadow-sm"
                            />
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'food', label: 'Food', icon: <Utensils size={32} />, color: 'bg-emerald-50 text-emerald-700' },
                                { id: 'shelter', label: 'Shelter', icon: <Bed size={32} />, color: 'bg-indigo-50 text-indigo-700' },
                                { id: 'warmth', label: 'Warmth', icon: <Flame size={32} />, color: 'bg-orange-50 text-orange-700' },
                                { id: 'support', label: 'Health', icon: <LifeBuoy size={32} />, color: 'bg-blue-50 text-blue-700' },
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setFilters({ ...filters, category: cat.id }); setView('list'); }}
                                    className={`p-6 rounded-[32px] ${cat.color} flex flex-col items-center gap-3 shadow-sm border border-white`}
                                >
                                    {cat.icon}
                                    <span className="font-black uppercase tracking-widest text-[10px]">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'list' && (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black capitalize text-slate-900">{filters.category === 'all' ? 'Directory' : filters.category}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resources in {filters.area}</p>
                            </div>
                            <button onClick={() => setView('home')} className="bg-slate-200 p-3 rounded-2xl">
                                <Home size={20} />
                            </button>
                        </div>

                        {filteredData.map(item => (
                            <ResourceCard key={item.id} item={item} isSaved={savedIds.includes(item.id)} onToggleSave={toggleSave} />
                        ))}
                    </div>
                )}
                
                {view === 'map' && (
                  <div className="h-[70vh] w-full rounded-[32px] overflow-hidden shadow-xl relative border-4 border-white bg-slate-100">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      title="Map"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=-1.13,50.77,-1.03,50.83&layer=mapnik`}
                    />
                  </div>
                )}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-50 flex justify-around items-center max-w-md mx-auto">
                <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <Home size={24} /><span className="text-[9px] font-black uppercase">Home</span>
                </button>
                <button onClick={() => setView('map')} className={`flex flex-col items-center gap-1 ${view === 'map' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <MapIcon size={24} /><span className="text-[9px] font-black uppercase">Map</span>
                </button>
                <button onClick={() => setView('list')} className={`flex flex-col items-center gap-1 ${view === 'list' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <BookOpen size={24} /><span className="text-[9px] font-black uppercase">List</span>
                </button>
                <button onClick={() => setShowCrisis(true)} className="flex flex-col items-center gap-1 text-rose-500">
                    <AlertTriangle size={24} /><span className="text-[9px] font-black uppercase">Alerts</span>
                </button>
            </nav>

            {showCrisis && (
              <div className="fixed inset-0 z-[100] bg-rose-600 text-white p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                <ShieldAlert size={80} className="mb-6 animate-bounce" />
                <h2 className="text-4xl font-black mb-4">Emergency Help</h2>
                <p className="text-xl mb-8 font-bold">If you are in immediate danger, please call 999 immediately.</p>
                <div className="w-full space-y-4 max-w-xs">
                  <a href="tel:999" className="block w-full bg-white text-rose-600 py-4 rounded-full font-black text-lg">Call 999</a>
                  <button onClick={() => setShowCrisis(false)} className="block w-full border-2 border-white/50 py-4 rounded-full font-bold">Back to App</button>
                </div>
              </div>
            )}
        </div>
    );
};

export default App;
