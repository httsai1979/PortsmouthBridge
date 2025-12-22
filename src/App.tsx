import React, { useState, useEffect, useMemo } from 'react';

// --- Mock Data & Utility Functions ---
const AREAS = ['All', 'Southsea', 'City Centre', 'Fratton', 'North End', 'Cosham'];

const ALL_DATA = [
  { id: '1', name: 'Portsmouth Food Bank', area: 'City Centre', category: 'food', address: '72 King St', description: 'Providing emergency food assistance to help families in need through difficult times.', tags: ['food', 'emergency'], lat: 50.7989, lng: -1.0912, trustScore: 95, schedule: { 1: '09:00-17:00', 3: '09:00-17:00', 5: '09:00-17:00' } },
  { id: '2', name: 'Safe Haven Shelter', area: 'Southsea', category: 'shelter', address: '15 Hope Road', description: 'Providing a safe, warm night shelter and professional advisory services.', tags: ['shelter', 'night'], lat: 50.7850, lng: -1.0750, trustScore: 92, schedule: { 0: '20:00-08:00', 1: '20:00-08:00', 2: '20:00-08:00', 3: '20:00-08:00', 4: '20:00-08:00', 5: '20:00-08:00', 6: '20:00-08:00' } },
  { id: '3', name: 'Warmth Hub', area: 'Fratton', category: 'warmth', address: 'Community Hall', description: 'A welcoming space to rest for free, have a hot drink, and receive community support.', tags: ['warmth', 'coffee'], lat: 50.8010, lng: -1.0700, trustScore: 88, schedule: { 1: '10:00-16:00', 2: '10:00-16:00' } }
];

const checkStatus = (schedule) => {
  const now = new Date();
  const day = now.getDay();
  const time = now.getHours() * 60 + now.getMinutes();
  const todaySchedule = schedule[day];
  
  if (!todaySchedule || todaySchedule === 'Closed') return { isOpen: false, status: 'closed', message: 'Closed today' };
  
  const [open, close] = todaySchedule.split('-').map(t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  });

  if (time >= open && time < close) return { isOpen: true, status: 'open', message: 'Open now' };
  return { isOpen: false, status: 'closed', message: 'Currently closed' };
};

// --- Sub-components ---
const Icon = ({ name, size = 20, className = "" }) => {
  const icons = {
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    eye: (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </>
    ),
    share2: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
      </>
    ),
    utensils: (
      <>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z" />
      </>
    ),
    bed: (
      <>
        <path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 17h20M6 8v9" />
      </>
    ),
    flame: <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 4 6.5 2 2 3 5.5 3 8.5a7 7 0 11-14 0c0-1.15.3-2.35 1-3.5 0 1.15.5 2 1 2.5z" />,
    family: (
      <>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M19 8a4 4 0 010 7.75" />
      </>
    ),
    lifebuoy: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" />
      </>
    ),
    "shopping-bag": (
      <>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
      </>
    ),
    "book-open": (
      <>
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </>
    ),
    briefcase: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </>
    ),
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    home: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    navigation: <polygon points="3 11 22 2 13 21 11 13 3 11" />,
    tag: (
      <>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
    mapPin: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    arrowRight: (
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>
    ),
    check_circle: (
      <>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    sparkles: (
      <>
        <path d="M9.67 4L12 2l2.33 2M20 10l2 2.33-2 2.33M4 10l-2 2.33 2 2.33M9.67 20L12 22l2.33-2" />
      </>
    )
  };
  
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {icons[name] || null}
    </svg>
  );
};

const ResourceCard = ({ item, isSaved, onToggleSave, onAddToJourney, isInJourney }) => {
  const status = checkStatus(item.schedule);
  return (
    <div className="bg-white rounded-[32px] p-6 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all animate-fade-in-up">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${status.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
            {status.message}
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-2 leading-tight">{item.name}</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">{item.area} • {item.address}</p>
        </div>
        <button 
            onClick={onToggleSave} 
            className={`p-3 rounded-2xl transition-all ${isSaved ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-300 hover:text-indigo-400'}`}
        >
          <Icon name="star" size={20} />
        </button>
      </div>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed line-clamp-2">{item.description}</p>
      <div className="flex gap-2">
        <button 
            onClick={onAddToJourney} 
            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isInJourney ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          {isInJourney ? 'In Itinerary' : 'Add to Daily Itinerary'}
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
    const [highContrast, setHighContrast] = useState(false);
    const [stealthMode, setStealthMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [savedIds, setSavedIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('bridge_saved') || '[]');
        } catch {
            return [];
        }
    });
    const [journeyItems, setJourneyItems] = useState([]);
    const [filters, setFilters] = useState({ area: 'All', category: 'all' });

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('bridge_saved', JSON.stringify(savedIds));
    }, [savedIds]);

    const toggleSaved = (id) => {
        setSavedIds(prev => {
            const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
            return next;
        });
    };

    const toggleJourney = (id) => {
        setJourneyItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredData = useMemo(() => {
        return ALL_DATA.filter(item => {
            const matchesArea = filters.area === 'All' || item.area === filters.area;
            const matchesCategory = filters.category === 'all' || item.category === filters.category;
            const matchesSearch = !searchQuery || 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesArea && matchesCategory && matchesSearch;
        });
    }, [filters, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center animate-pulse">
                    <Icon name="zap" size={48} className="text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Portsmouth Bridge</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Connecting Community • Restoring Hope</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`app-container min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-100 ${highContrast ? 'grayscale contrast-125' : ''}`}>
            <style>{`
                .app-container { max-width: 500px; margin: 0 auto; box-shadow: 0 0 80px rgba(0,0,0,0.06); min-height: 100vh; position: relative; padding-bottom: 110px; }
                .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            <header className={`sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex justify-between items-center transition-all`}>
                <div>
                    <h1 className={`text-xl font-black tracking-tighter ${stealthMode ? 'text-slate-200' : 'text-slate-900'}`}>
                        {stealthMode ? 'Shielded Compass' : 'Portsmouth Bridge'}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setStealthMode(!stealthMode)} 
                        className={`p-2.5 rounded-2xl transition-all ${stealthMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        title="Stealth Mode"
                    >
                        <Icon name="eye" size={20} />
                    </button>
                    <button 
                        onClick={() => setHighContrast(!highContrast)} 
                        className={`p-2.5 rounded-2xl transition-all ${highContrast ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        title="High Contrast"
                    >
                        <Icon name="zap" size={20} />
                    </button>
                </div>
            </header>

            <main className="px-6 pt-6 pb-20">
                {view === 'home' && (
                    <div className="animate-fade-in-up">
                        {/* Welcome Banner */}
                        <div className="mb-8 p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-[40px] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black leading-tight mb-2">Good morning, Portsmouth</h2>
                                <p className="text-indigo-100 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Your comprehensive community support network</p>
                                
                                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-indigo-300 mb-1 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                                            Active Hubs
                                        </div>
                                        <p className="text-2xl font-black">{ALL_DATA.length} <span className="text-xs font-medium opacity-60">sites</span></p>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-indigo-300 mb-1">Open Today</div>
                                        <p className="text-2xl font-black">{ALL_DATA.filter(d => checkStatus(d.schedule).isOpen).length} <span className="text-xs font-medium opacity-60">open</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-10 group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <Icon name="search" size={22} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search services (e.g. food, shelter)..."
                                className="w-full py-6 pl-14 pr-6 bg-white rounded-[28px] border-2 border-slate-100 focus:border-indigo-600 outline-none font-bold text-slate-800 shadow-sm transition-all focus:shadow-xl focus:shadow-indigo-50"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); if(e.target.value) setView('list'); }}
                            />
                        </div>

                        <div className="flex justify-between items-center mb-5 px-1">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Popular Needs</h3>
                            <button onClick={() => setView('list')} className="text-[10px] font-black text-indigo-600 uppercase">View All</button>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mb-12">
                            {[
                                { id: 'food', label: 'Food Assistance', icon: 'utensils', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                                { id: 'shelter', label: 'Accommodation & Shelter', icon: 'bed', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
                                { id: 'warmth', label: 'Warm Spaces', icon: 'flame', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
                                { id: 'family', label: 'Family Support', icon: 'family', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' }
                            ].map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => { setFilters({ ...filters, category: cat.id }); setView('list'); }}
                                    className={`p-7 rounded-[36px] text-left transition-all active:scale-95 shadow-sm hover:shadow-md ${cat.color}`}
                                >
                                    <div className="mb-5 bg-white/50 w-12 h-12 rounded-2xl flex items-center justify-center">
                                        <Icon name={cat.icon} size={24} />
                                    </div>
                                    <p className="font-black text-sm tracking-tight">{cat.label}</p>
                                    <p className="text-[9px] font-bold opacity-50 mt-1 uppercase tracking-wider">{ALL_DATA.filter(d => d.category === cat.id).length} resources</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'list' && (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 capitalize">
                                    {filters.category === 'all' ? 'Resource Directory' : filters.category}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Finding the right support for you</p>
                            </div>
                            <button onClick={() => setView('home')} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all">
                                <Icon name="x" size={20} />
                            </button>
                        </div>
                        
                        {/* Area Filter */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
                            {AREAS.map(a => (
                                <button 
                                    key={a}
                                    onClick={() => setFilters({...filters, area: a})}
                                    className={`px-5 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-2 transition-all ${filters.area === a ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-100'}`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-5">
                            {filteredData.length > 0 ? filteredData.map(item => (
                                <ResourceCard 
                                    key={item.id} 
                                    item={item} 
                                    isSaved={savedIds.includes(item.id)}
                                    onToggleSave={() => toggleSaved(item.id)}
                                    onAddToJourney={() => toggleJourney(item.id)}
                                    isInJourney={journeyItems.includes(item.id)}
                                />
                            )) : (
                                <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                                    <Icon name="search" size={40} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold">No results found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 py-5 px-10 flex justify-between items-center z-50 max-w-[500px] mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
                <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
                    <Icon name="home" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
                </button>
                <button onClick={() => setView('list')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'list' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
                    <Icon name="tag" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Directory</span>
                </button>
                <button className={`flex flex-col items-center gap-1.5 transition-all text-slate-300`}>
                    <Icon name="navigation" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Map</span>
                </button>
                <button className={`flex flex-col items-center gap-1.5 transition-all text-rose-400 hover:text-rose-600`}>
                    <Icon name="alert" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Emergency</span>
                </button>
            </nav>
        </div>
    );
};

// --- Mounting Logic ---
const rootElement = document.getElementById('app');
if (rootElement) {
    import('react-dom/client').then(ReactDOM => {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<App />);
    }).catch(err => {
        console.error("React Mounting Error:", err);
    });
}

export default App;
