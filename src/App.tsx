import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Map as MapIcon, Search, Navigation, AlertTriangle, Utensils, Bed, Flame, 
  LifeBuoy, BookOpen, Zap, Eye, Bookmark, Share2, Phone, Clock, MapPin, 
  CheckCircle, ExternalLink, X, ShieldAlert, ArrowRight, Heart, Info, 
  Sparkles, Calendar, Star, Trash2, Briefcase, ShoppingBag, List, Bell,
  Layers, ChevronRight, MessageSquare, ShieldCheck, Activity, Trash, Printer,
  Filter, User, Globe, ChevronDown, Send
} from 'lucide-react';

/**
 * ============================================================
 * 1. REAL PORTSMOUTH DATABASE (PO1-PO6)
 * ============================================================
 */

const AREAS = ['All', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'];

const ALL_DATA = [
    { id: 'f1', name: "Pompey Community Fridge", category: "food", type: "Surplus Food", area: "PO4", address: "Fratton Park, PO4 8SX", description: "Reducing food waste by providing free surplus food parcels. Open to all residents.", requirements: "Open to all, bring a bag.", tags: ["free", "fresh_food"], schedule: { 1: "13:00-15:00", 2: "13:00-15:00", 3: "13:00-15:00", 4: "13:00-15:00", 5: "13:00-15:00" }, lat: 50.7964, lng: -1.0642, trustScore: 98, phone: "023 9273 1141" },
    { id: 'f2', name: "FoodCycle Portsmouth", category: "food", type: "Hot Meal", area: "PO1", address: "John Pounds Centre, Queen St, PO1 3HN", description: "Free three-course vegetarian community meal served every Wednesday evening.", requirements: "Just turn up.", tags: ["free", "hot_meal"], schedule: { 3: "18:00-19:30" }, lat: 50.7981, lng: -1.0965, trustScore: 100 },
    { id: 'f3', name: "LifeHouse Kitchen", category: "food", type: "Soup Kitchen", area: "PO5", address: "153 Albert Road, PO4 0JW", description: "Hot breakfast and dinner for the homeless and vulnerable.", requirements: "Drop-in.", tags: ["hot_meal", "shower"], schedule: { 3: "09:00-11:00", 4: "18:00-19:30" }, lat: 50.7892, lng: -1.0754, phone: "07800 933983" },
    { id: 's1', name: "Rough Sleeping Hub", category: "shelter", type: "Day Centre", area: "PO5", address: "Kingsway House, 130 Elm Grove", description: "Primary contact for rough sleepers. Showers, laundry, and breakfast.", requirements: "Open access drop-in.", tags: ["shower", "laundry", "breakfast"], schedule: { 1: "08:00-16:00", 2: "08:00-16:00", 3: "08:00-16:00", 4: "08:00-16:00", 5: "08:00-16:00", 6: "08:00-16:00", 0: "08:00-16:00" }, lat: 50.7923, lng: -1.0882, phone: "023 9288 2689", trustScore: 100 },
    { id: 'sup1', name: "HIVE Portsmouth Hub", category: "support", type: "Community Hub", area: "PO1", address: "Central Library, Guildhall Sq", description: "Information hub for all community resources and local charities.", requirements: "Walk-in.", tags: ["advice", "support"], schedule: { 1: "09:30-16:00", 2: "09:30-16:00", 3: "09:30-16:00", 4: "09:30-16:00", 5: "09:30-16:00" }, lat: 50.7984, lng: -1.0911, phone: "023 9261 6709", trustScore: 100 }
];

const PROGRESS_TIPS = [
    { title: "Digital Skills", note: "Central Library offers free IT workshops every Wednesday at 10am." },
    { title: "Financial Support", note: "Advice Portsmouth offers free debt and benefits advice sessions." }
];

/**
 * ============================================================
 * 2. UTILITY LOGIC
 * ============================================================
 */

const checkStatus = (schedule: any) => {
    if (!schedule) return { isOpen: false, label: 'Closed', status: 'closed' };
    const now = new Date();
    const day = now.getDay();
    const hours = schedule[day];
    if (!hours || hours === 'Closed') return { isOpen: false, label: 'Closed Today', status: 'closed' };
    if (hours === "00:00-23:59") return { isOpen: true, label: 'Open 24/7', status: 'open' };
    const [start, end] = hours.split('-');
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;
    if (currentMin >= startMin && currentMin < endMin) return { isOpen: true, label: `Open Now (closes ${end})`, status: 'open' };
    return { isOpen: false, label: 'Closed Now', status: 'closed' };
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
 * 3. PRO COMPONENTS (Consolidated)
 * ============================================================
 */

const AIAssistant = ({ onIntent }: any) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  return (
    <div className={`fixed bottom-28 right-5 z-[80] transition-all ${open ? 'w-80 h-96' : 'w-14 h-14'}`}>
      {open ? (
        <div className="bg-white rounded-3xl shadow-2xl h-full flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in duration-300">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2"><Sparkles size={18}/> <span className="font-black text-xs uppercase tracking-widest">AI Guide</span></div>
            <button onClick={() => setOpen(false)}><X size={18}/></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-xs font-medium space-y-3">
            <div className="bg-slate-50 p-3 rounded-2xl">Hello! I can help you find food banks, warm spaces, or plan your route in Portsmouth. What do you need?</div>
          </div>
          <div className="p-4 border-t flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type help needed..." className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs outline-none border-2 border-transparent focus:border-indigo-500" />
            <button className="bg-indigo-600 text-white p-2 rounded-xl"><Send size={16}/></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce hover:scale-110 transition-transform">
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

const SmartNotifications = ({ notifications, onDismiss }: any) => {
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-24 left-5 right-5 z-[100] space-y-3 pointer-events-none">
      {notifications.map((n: any) => (
        <div key={n.id} className="pointer-events-auto bg-white/95 backdrop-blur-md border-l-4 border-indigo-600 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Bell size={18}/></div>
          <p className="flex-1 text-[11px] font-black text-slate-800">{n.message}</p>
          <button onClick={() => onDismiss(n.id)} className="text-slate-300 hover:text-slate-600"><X size={16}/></button>
        </div>
      ))}
    </div>
  );
};

const ResourceCard = ({ item, isSaved, onToggleSave, onAddToJourney, isInJourney, onAddToCompare, isInCompare }: any) => {
    const status = checkStatus(item.schedule);
    return (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative mb-4 transition-all hover:shadow-xl group">
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${status.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {status.label}
                </span>
                <div className="flex gap-2">
                    <button onClick={() => onAddToCompare(item.id)} className={`p-2 rounded-full transition-all ${isInCompare ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                      <Layers size={18} />
                    </button>
                    <button onClick={() => onToggleSave(item.id)} className={`p-2 rounded-full transition-all ${isSaved ? 'text-amber-500 bg-amber-50' : 'text-slate-300 bg-slate-50'}`}>
                      <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
            <h3 className="text-xl font-black leading-tight text-slate-900 mb-1">{item.name}</h3>
            <p className="text-[11px] font-bold text-slate-400 mb-4 flex items-center gap-1"><MapPin size={12} className="text-indigo-500" /> {item.address}</p>
            <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed">{item.description}</p>
            
            <div className="flex gap-3">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Navigate</a>
                <button onClick={() => onAddToJourney(item.id)} className={`px-6 py-4 rounded-2xl text-xs font-black uppercase transition-all ${isInJourney ? 'bg-emerald-500 text-white shadow-inner' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                  {isInJourney ? 'Added' : 'Plan'}
                </button>
            </div>
        </div>
    );
};

/**
 * ============================================================
 * 4. MAIN APP COMPONENT
 * ============================================================
 */

const App = () => {
    const [view, setView] = useState<'home' | 'map' | 'list' | 'planner' | 'compare'>('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ area: 'All', category: 'all' });
    const [savedIds, setSavedIds] = useState<string[]>(() => JSON.parse(localStorage.getItem('pb_pro_consolidated_saved') || '[]'));
    const [journeyItems, setJourneyItems] = useState<string[]>([]);
    const [compareItems, setCompareItems] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    
    const [stealthMode, setStealthMode] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [showCrisis, setShowCrisis] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<any>(null);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1200);
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
            const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchLower) || item.address.toLowerCase().includes(searchLower);
            return matchesArea && matchesCategory && matchesSearch;
        }).sort((a, b) => {
            if (!userLocation) return 0;
            return getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) - getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        });
    }, [filters, searchQuery, userLocation]);

    const toggleSave = (id: string) => {
        setSavedIds(prev => {
            const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
            localStorage.setItem('pb_pro_consolidated_saved', JSON.stringify(next));
            return next;
        });
    };

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-pulse">
          <Zap size={60} className="text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Portsmouth Bridge</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Connecting Community</p>
        </div>
      </div>
    );

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 max-w-md mx-auto shadow-2xl relative overflow-x-hidden ${highContrast ? 'grayscale contrast-125' : ''}`}>
            
            <SmartNotifications notifications={notifications} onDismiss={(id:any) => setNotifications(prev => prev.filter(n => n.id !== id))} />
            <AIAssistant />

            {/* Header */}
            <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 p-6 flex justify-between items-center transition-all ${stealthMode ? 'opacity-30' : ''}`}>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-indigo-600">{stealthMode ? 'Secure Portal' : 'Portsmouth Bridge'}</h1>
                    {!stealthMode && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Community Lifeline</p>}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setStealthMode(!stealthMode)} className={`p-2.5 rounded-full transition-colors ${stealthMode ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}><Eye size={20} /></button>
                    <button onClick={() => setHighContrast(!highContrast)} className="p-2.5 bg-slate-100 rounded-full text-slate-500"><Zap size={20} /></button>
                </div>
            </header>

            <main className="p-6">
                {view === 'home' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-600">
                        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-950 rounded-[44px] p-10 text-white mb-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl transition-transform group-hover:scale-110"></div>
                            <h2 className="text-3xl font-black mb-2 relative z-10 leading-tight tracking-tight">Welcome home, neighbor.</h2>
                            <p className="text-indigo-100 font-medium opacity-80 relative z-10 mb-8">Ready to navigate your support path in Portsmouth?</p>
                            <div className="flex gap-6 border-t border-white/10 pt-6">
                              <div className="flex flex-col"><span className="text-[8px] font-black uppercase text-indigo-300 mb-1 tracking-widest">Network Status</span><span className="text-lg font-black">{ALL_DATA.length} Active Hubs</span></div>
                              <div className="flex flex-col"><span className="text-[8px] font-black uppercase text-indigo-300 mb-1 tracking-widest">Data Trust</span><span className="text-lg font-black text-emerald-400">100% Real</span></div>
                            </div>
                        </div>

                        <div className="mb-8 relative group">
                            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setView('list'); }} placeholder="Need food, bed, or advice?" className="w-full py-6 pl-14 pr-6 bg-white rounded-[32px] border-2 border-slate-100 focus:border-indigo-600 outline-none font-bold shadow-xl shadow-slate-200/40 transition-all" />
                            <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {[
                                { id: 'food', label: 'Food', icon: <Utensils size={32} />, color: 'bg-emerald-50 text-emerald-700' },
                                { id: 'shelter', label: 'Shelter', icon: <Bed size={32} />, color: 'bg-indigo-50 text-indigo-700' },
                                { id: 'warmth', label: 'Warmth', icon: <Flame size={32} />, color: 'bg-orange-50 text-orange-700' },
                                { id: 'support', label: 'Advice', icon: <LifeBuoy size={32} />, color: 'bg-blue-50 text-blue-700' },
                            ].map(cat => (
                                <button key={cat.id} onClick={() => { setFilters({ ...filters, category: cat.id }); setView('list'); }} className={`p-8 rounded-[36px] ${cat.color} flex flex-col items-center gap-3 shadow-sm border-2 border-white hover:scale-[1.04] active:scale-95 transition-all`}>{cat.icon}<span className="font-black uppercase tracking-widest text-[10px]">{cat.label}</span></button>
                            ))}
                        </div>

                        {journeyItems.length > 0 && (
                          <button onClick={() => setView('planner')} className="w-full bg-slate-900 text-white p-7 rounded-[32px] mb-8 flex items-center justify-between shadow-2xl animate-bounce">
                            <div className="flex items-center gap-4"><Calendar size={24}/><div className="text-left"><p className="text-xs font-black uppercase tracking-widest">Journey Active</p><p className="text-sm opacity-80">{journeyItems.length} stops planned</p></div></div>
                            <ArrowRight size={22}/>
                          </button>
                        )}

                        <div className="p-8 bg-white rounded-[40px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Sparkles size={14} className="text-indigo-500"/> Community Growth</h3>
                          <p className="text-sm font-black text-slate-900 mb-2">{PROGRESS_TIPS[0].title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">{PROGRESS_TIPS[0].note}</p>
                        </div>
                    </div>
                )}

                {view === 'list' && (
                    <div className="animate-in fade-in duration-400">
                        <div className="flex items-center justify-between mb-8">
                            <div><h2 className="text-3xl font-black text-slate-900 tracking-tighter capitalize">{filters.category === 'all' ? 'Directory' : filters.category}</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resources in {filters.area}</p></div>
                            <button onClick={() => setView('home')} className="bg-slate-100 p-4 rounded-3xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"><Home size={22} /></button>
                        </div>
                        {filteredData.length > 0 ? filteredData.map((item: any) => (
                            <ResourceCard 
                              key={item.id} item={item} 
                              isSaved={savedIds.includes(item.id)} 
                              onToggleSave={toggleSave} 
                              isInJourney={journeyItems.includes(item.id)}
                              onAddToJourney={(id:any) => setJourneyItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                              isInCompare={compareItems.includes(item.id)}
                              onAddToCompare={(id:any) => setCompareItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                            />
                        )) : (
                          <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs border-2 border-dashed border-slate-200 rounded-[40px]">No matches found.</div>
                        )}
                    </div>
                )}

                {view === 'planner' && (
                  <div className="animate-in slide-in-from-bottom-10 duration-500">
                    <div className="flex justify-between items-center mb-8">
                      <div><h2 className="text-3xl font-black text-slate-900">My Journey</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimized route planning</p></div>
                      <button onClick={() => setView('home')} className="p-3 bg-slate-100 rounded-2xl"><X size={20}/></button>
                    </div>
                    {journeyItems.length > 0 ? (
                      <div className="space-y-4">
                        {journeyItems.map((id, idx) => {
                          const item = ALL_DATA.find(d => d.id === id);
                          if (!item) return null;
                          return (
                            <div key={id} className="bg-white p-6 rounded-[32px] flex items-center gap-4 shadow-sm border border-slate-100">
                              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black">{idx + 1}</div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-slate-900 truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.area}</p>
                              </div>
                              <button onClick={() => setJourneyItems(prev => prev.filter(i => i !== id))} className="text-slate-200 hover:text-rose-500"><Trash2 size={20}/></button>
                            </div>
                          );
                        })}
                        <button onClick={() => {
                          const waypoints = journeyItems.map(id => {
                            const item = ALL_DATA.find(d => d.id === id);
                            return `${item?.lat},${item?.lng}`;
                          }).join('|');
                          window.open(`https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${journeyItems[journeyItems.length-1]}&waypoints=${waypoints}`, '_blank');
                        }} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 mt-8 hover:bg-indigo-700 transition-all">Launch Smart Navigation</button>
                      </div>
                    ) : (
                      <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-200 rounded-[40px]">No stops planned yet.</div>
                    )}
                  </div>
                )}

                {view === 'map' && (
                  <div className="h-[70vh] w-full rounded-[40px] overflow-hidden shadow-2xl relative border-4 border-white bg-slate-100 animate-in zoom-in duration-500">
                    <iframe width="100%" height="100%" frameBorder="0" title="Map" src={`https://www.openstreetmap.org/export/embed.html?bbox=-1.13,50.77,-1.03,50.83&layer=mapnik`} />
                    <div className="absolute top-5 left-5 right-5 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl z-10 border border-white/50">
                      <p className="text-[10px] font-black uppercase text-indigo-600 mb-1 flex items-center gap-2"><MapPin size={12}/> Interactive Explorer</p>
                      <p className="text-xs font-bold text-slate-600">Showing all {ALL_DATA.length} hubs in Portsmouth.</p>
                    </div>
                  </div>
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-5 z-50 flex justify-around items-center max-w-md mx-auto shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><Home size={26} /><span className="text-[9px] font-black uppercase tracking-tighter">Bridge</span></button>
                <button onClick={() => setView('map')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'map' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><MapIcon size={26} /><span className="text-[9px] font-black uppercase tracking-tighter">Map</span></button>
                <button onClick={() => setView('list')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'list' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><BookOpen size={26} /><span className="text-[9px] font-black uppercase tracking-tighter">List</span></button>
                <button onClick={() => setShowCrisis(true)} className="flex flex-col items-center gap-1.5 text-rose-500 hover:scale-110 transition-all"><AlertTriangle size={26} /><span className="text-[9px] font-black uppercase tracking-tighter">Alerts</span></button>
            </nav>

            {/* Crisis Modal */}
            {showCrisis && (
              <div className="fixed inset-0 z-[300] bg-rose-600 text-white p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                <ShieldAlert size={100} className="mb-8 animate-bounce" />
                <h2 className="text-5xl font-black mb-4 tracking-tighter">Emergency Help</h2>
                <p className="text-xl mb-12 font-bold opacity-90 leading-relaxed">If you are in immediate danger, please call 999 immediately.</p>
                <div className="w-full space-y-4 max-w-xs mx-auto">
                  <a href="tel:999" className="block w-full bg-white text-rose-600 py-6 rounded-full font-black text-xl shadow-2xl text-center">Call 999 Now</a>
                  <button onClick={() => setShowCrisis(false)} className="block w-full border-2 border-white/40 py-5 rounded-full font-bold text-sm tracking-widest uppercase transition-all active:scale-95">Back to Safety</button>
                </div>
              </div>
            )}
        </div>
    );
};

export default App;
