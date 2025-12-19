import { useState, useEffect, useMemo } from 'react';
import { ALL_DATA, AREAS, PROGRESS_TIPS } from './data';
import { checkStatus, getDistance, playSuccessSound } from './utils';

// Components
import Icon from './components/Icon';
import SimpleMap from './components/SimpleMap';
import ResourceCard from './components/ResourceCard';
import { TipsModal, CrisisModal } from './components/Modals';
import PrintView from './components/PrintView';
import { AreaScheduleView, CategoryButton } from './components/Schedule';
import AIAssistant from './components/AIAssistant';
import PrivacyShield from './components/PrivacyShield';

const App = () => {
    // Branding & Accessibility State
    const [highContrast, setHighContrast] = useState(false);
    const [stealthMode, setStealthMode] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [loading, setLoading] = useState(true);

    // Navigation & Modals
    const [view, setView] = useState<'home' | 'map' | 'list' | 'planner'>('home');
    const [showTips, setShowTips] = useState(false);
    const [showCrisis, setShowCrisis] = useState(false);
    const [showPrint, setShowPrint] = useState(false);
    const [mapFilter, setMapFilter] = useState<'all' | 'open'>('open');

    // Personalization (Phase 8: My Bridge Cart)
    const [savedIds, setSavedIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('bridge_saved_resources');
        return saved ? JSON.parse(saved) : [];
    });

    const toggleSaved = (id: string) => {
        setSavedIds(prev => {
            const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
            localStorage.setItem('bridge_saved_resources', JSON.stringify(next));
            if (!prev.includes(id)) playSuccessSound(); // Play sound on Pin
            return next;
        });
    };

    // Location State
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Discovery State (Phase 16: Extreme Intuition)
    const [searchQuery, setSearchQuery] = useState('');
    const [smartFilters, setSmartFilters] = useState({
        openNow: false,
        nearMe: false,
        verified: false
    });

    // Filter State
    const [filters, setFilters] = useState({
        area: 'All',
        category: 'all',
        date: 'today'
    });

    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log("Location access denied", err)
            );
        }
        const handleStatus = () => setIsOffline(!navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, []);

    const handleSearch = (newFilters: any) => {
        setFilters(newFilters);
        if (newFilters.category !== 'all' && view === 'home') setView('list');
    };

    const filteredData = useMemo(() => {
        const data = ALL_DATA.filter(item => {
            const matchesArea = filters.area === 'All' || item.area === filters.area;
            const matchesCategory = filters.category === 'all' || item.category === filters.category;

            // Universal Search (Name, Address, Tags)
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                item.name.toLowerCase().includes(searchLower) ||
                item.address.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower) ||
                item.tags.some(t => t.toLowerCase().includes(searchLower));

            // Smart Tokens
            const status = checkStatus(item.schedule);
            const matchesOpenNow = !smartFilters.openNow || status.isOpen;
            const matchesVerified = !smartFilters.verified || (item.trustScore && item.trustScore > 90);

            let matchesNearMe = true;
            if (smartFilters.nearMe && userLocation) {
                const dist = getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
                matchesNearMe = dist < 2; // Within 2km for walking hub
            }

            return matchesArea && matchesCategory && matchesSearch && matchesOpenNow && matchesVerified && matchesNearMe;
        });
        return data.sort((a, b) => {
            const statusA = checkStatus(a.schedule);
            const statusB = checkStatus(b.schedule);
            if (statusA.isOpen && !statusB.isOpen) return -1;
            if (!statusA.isOpen && statusB.isOpen) return 1;
            if (userLocation) {
                const distA = getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
                const distB = getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
                return distA - distB;
            }
            return 0;
        });
    }, [filters, userLocation]);

    const savedResources = useMemo(() => {
        return ALL_DATA.filter(item => savedIds.includes(item.id));
    }, [savedIds]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        const messages = {
            morning: [
                { msg: "Good Morning, Portsmouth", sub: "A new day to cross new bridges." },
                { msg: "Rise with Hope", sub: "Small steps today lead to big changes." },
                { msg: "Hello Neighbor", sub: "You are not alone in this journey." }
            ],
            afternoon: [
                { msg: "Good Afternoon", sub: "Keep moving forward, we're here for you." },
                { msg: "Steady Progress", sub: "Every connection you make is a win." },
                { msg: "Find Your Path", sub: "The city is full of open doors today." }
            ],
            evening: [
                { msg: "Good Evening", sub: "Rest well, you've done enough for today." },
                { msg: "Peace & Rest", sub: "Tomorrow is another chance to build." },
                { msg: "Home & Safety", sub: "The bridge stays open for you." }
            ]
        };

        const timeKey = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        const pool = messages[timeKey];
        // Use a simple hash based on date to keep it consistent for the day but varied
        const dayOfMonth = new Date().getDate();
        return pool[dayOfMonth % pool.length];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center animate-pulse">
                    <Icon name="zap" size={48} className="text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-800">Portsmouth Bridge</h1>
                    <p className="text-slate-400 font-medium">Connecting Community • Restoring Hope</p>
                </div>
            </div>
        );
    }

    if (showPrint) return <PrintView data={ALL_DATA} onClose={() => setShowPrint(false)} />;

    const greeting = getGreeting();

    return (
        <div className={`app-container min-h-screen font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 ${highContrast ? 'high-contrast' : ''}`}>
            <style>{`
                .app-container { max-width: 500px; margin: 0 auto; background-color: #f8fafc; min-height: 100vh; box-shadow: 0 0 50px rgba(0,0,0,0.08); position: relative; padding-bottom: 110px; }
                .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); scale: 0.98; } to { opacity: 1; transform: translateY(0); scale: 1; } }
                .high-contrast { filter: contrast(1.2) saturate(0) !important; }
                .high-contrast button { border: 1px solid currentcolor !important; box-shadow: none !important; }
            `}</style>

            <header className={`sticky top-0 z-50 ${stealthMode ? 'bg-slate-100 border-none' : 'bg-white/95 backdrop-blur-md border-b border-slate-200/50'} pt-4 pb-3 transition-all`}>
                <div className="px-5 flex justify-between items-center max-w-lg mx-auto">
                    <div>
                        <h1 className={`text-2xl font-black ${stealthMode ? 'text-slate-400' : 'text-slate-900'} tracking-tighter`}>
                            {stealthMode ? 'Shielded Compass' : 'Portsmouth Bridge'}
                        </h1>
                        {!stealthMode && <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Connecting your community</p>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { if (confirm("GDPR: Delete settings?")) { localStorage.clear(); window.location.reload(); } }} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><Icon name="trash" size={18} /></button>
                        <button onClick={() => setStealthMode(!stealthMode)} className={`p-2 rounded-full transition-all ${stealthMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon name="eye" size={20} /></button>
                        <button onClick={() => setHighContrast(!highContrast)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"><Icon name="zap" size={20} /></button>
                    </div>
                </div>
                {isOffline && <div className="bg-amber-500 text-amber-950 px-5 py-1 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">Offline Mode: Offline Data Available</div>}
            </header>

            <AIAssistant onIntent={handleSearch} currentArea={filters.area} />

            <div className={`px-5 mt-4 relative z-20 transition-all ${stealthMode ? 'opacity-90 grayscale-[0.5]' : ''}`}>
                {view === 'home' && (
                    <div className="animate-fade-in-up">
                        {/* Phase 9: Warmer Daily Greeting with City Impact */}
                        <div className="mb-8 p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-[40px] text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                            <div className="relative z-10">
                                <h2 className="text-3xl font-black tracking-tighter mb-2 leading-tight">{greeting.msg}</h2>
                                <p className="text-indigo-100 text-xs font-black uppercase tracking-[0.2em] mb-8 opacity-80">{greeting.sub}</p>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                                    <div className="flex flex-col">
                                        <div className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                            City Pulse
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-white">
                                                {(() => {
                                                    const verified = ALL_DATA.filter(p => (p.trustScore || 0) > 90).length;
                                                    return Math.round((verified / ALL_DATA.length) * 100);
                                                })()}%
                                            </span>
                                            <span className="text-[10px] font-bold text-indigo-200 leading-none">High-Confidence<br />Verified Network</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Active Lifelines</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-white">
                                                {ALL_DATA.filter(p => (filters.area === 'All' || p.area === filters.area) && checkStatus(p.schedule).status === 'open').length}
                                            </span>
                                            <span className="text-[10px] font-bold text-indigo-200 leading-none">Hubs Open In<br />{filters.area === 'All' ? 'Portsmouth' : filters.area}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phase 16: Universal Search Bar */}
                        <div className="mb-6 relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Icon name="search" size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (view === 'home') setView('list');
                                }}
                                placeholder="Search by name, street, or service..."
                                className="w-full py-5 pl-12 pr-4 bg-white rounded-[24px] border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold text-slate-900 transition-all shadow-xl shadow-slate-200/50"
                            />
                        </div>

                        <div className="flex justify-between items-center mb-4 pl-1">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">City Services</p>
                            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">Portsmouth Total</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pb-8">
                            <CategoryButton label="Food" icon="utensils" color="text-emerald-700 bg-emerald-50" active={filters.category === 'food'} onClick={() => handleSearch({ ...filters, category: 'food' })} />
                            <CategoryButton label="Shelter" icon="bed" color="text-indigo-700 bg-indigo-50" active={filters.category === 'shelter'} onClick={() => handleSearch({ ...filters, category: 'shelter' })} />
                            <CategoryButton label="Warmth" icon="flame" color="text-orange-700 bg-orange-50" active={filters.category === 'warmth'} onClick={() => handleSearch({ ...filters, category: 'warmth' })} />
                            <CategoryButton label="Family" icon="family" color="text-pink-700 bg-pink-50" active={filters.category === 'family'} onClick={() => handleSearch({ ...filters, category: 'family' })} />
                            <CategoryButton label="Health" icon="lifebuoy" color="text-blue-700 bg-blue-50" active={filters.category === 'support'} onClick={() => handleSearch({ ...filters, category: 'support' })} />
                            <CategoryButton label="Charity" icon="shopping-bag" color="text-rose-700 bg-rose-50" active={filters.category === 'charity'} onClick={() => handleSearch({ ...filters, category: 'charity' })} />
                            <CategoryButton label="Learning" icon="book-open" color="text-amber-700 bg-amber-50" active={filters.category === 'learning'} onClick={() => handleSearch({ ...filters, category: 'learning' })} />
                            <CategoryButton label="Work Skills" icon="briefcase" color="text-slate-700 bg-slate-100" active={filters.category === 'skills'} onClick={() => handleSearch({ ...filters, category: 'skills' })} />
                        </div>

                        {/* Phase 21: Growth Pathway Tips */}
                        <div className="mb-10 p-6 bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-[32px] border-2 border-amber-100/50 shadow-md shadow-amber-200/20 relative overflow-hidden group transition-all hover:shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <Icon name="sparkles" size={14} className="animate-pulse" /> Community Growth Tip
                            </h3>
                            <div className="relative z-10">
                                {(() => {
                                    const tip = PROGRESS_TIPS[Math.floor(new Date().getDate()) % PROGRESS_TIPS.length];
                                    return (
                                        <>
                                            <p className="text-sm font-black text-slate-900 mb-1">{tip.title}</p>
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed opacity-90">{tip.note}</p>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {savedResources.length > 0 && (
                            <div className="mb-8 p-6 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-50 transition-colors"></div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                    <Icon name="star" size={16} className="text-amber-500" /> My Bridge Pins
                                </h3>
                                <div className="space-y-3 relative z-10">
                                    {savedResources.slice(0, 3).map(res => (
                                        <div key={res.id} className="flex items-center justify-between">
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-900 truncate">{res.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{res.area} • {res.transport || 'Near You'}</p>
                                            </div>
                                            <button onClick={() => setView('planner')} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Icon name="arrow-right" size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-2 mb-8">
                    <button onClick={() => setView('planner')} className="flex-1 bg-slate-900 text-white p-5 rounded-[28px] shadow-xl shadow-slate-200 flex flex-col items-center justify-center gap-1 font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform">
                        <Icon name="calendar" size={24} className="mb-1" /> {savedIds.length > 0 ? 'My Journey' : 'Plan Journey'}
                    </button>
                    <button onClick={() => setShowTips(true)} className="flex-1 bg-white border-2 border-slate-100 p-5 rounded-[28px] flex flex-col items-center justify-center gap-1 font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform">
                        <Icon name="info" size={24} className="mb-1 text-indigo-600" /> Help Guide
                    </button>
                </div>

                {view === 'planner' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Journey Planner</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organizing your success</p>
                            </div>
                            <button onClick={() => setView('home')} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"><Icon name="x" size={20} /></button>
                        </div>

                        {savedIds.length > 0 && (
                            <div className="space-y-4 mb-8">
                                {/* Tactical Area Filter */}
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {AREAS.map(area => (
                                        <button
                                            key={area}
                                            onClick={() => setFilters({ ...filters, area })}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${filters.area === area ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            {area}
                                        </button>
                                    ))}
                                </div>
                                {/* Tactical Category Filter */}
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {['all', 'food', 'shelter', 'warmth', 'support', 'family', 'charity'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilters({ ...filters, category: cat })}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${filters.category === cat ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            {cat === 'all' ? 'All Needs' : cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {savedIds.length > 0 ? (
                            <AreaScheduleView
                                data={savedResources}
                                area={filters.area}
                                category={filters.category}
                            />
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-8 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Icon name="star" size={40} className="text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2">No Pins Yet</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8">Add resources to "My Bridge" to build your personalized daily journey.</p>
                                <button onClick={() => setView('list')} className="w-full py-5 bg-indigo-600 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all">Browse Resources</button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'map' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">Explorer</h2>
                            <div className="flex gap-1">
                                <button onClick={() => setMapFilter('open')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${mapFilter === 'open' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}>Open</button>
                                <button onClick={() => setMapFilter('all')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${mapFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>All</button>
                            </div>
                        </div>
                        <SimpleMap
                            data={filteredData}
                            category={filters.category}
                            statusFilter={mapFilter}
                            savedIds={savedIds}
                            onToggleSave={toggleSaved}
                            stealthMode={stealthMode}
                        />
                    </div>
                )}

                {view === 'list' && (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{filters.category === 'all' ? 'Directory' : filters.category}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finding the right support</p>
                            </div>
                            <button onClick={() => setView('home')} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"><Icon name="home" size={20} /></button>
                        </div>

                        {/* Directory Tactical Filters (Enhanced) */}
                        <div className="space-y-4 mb-8">
                            {/* Search Field */}
                            <div className="relative">
                                <Icon name="search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search resources..."
                                    className="w-full py-4 pl-11 pr-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-600 outline-none text-xs font-bold"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600">
                                        <Icon name="x" size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Smart Action Tokens */}
                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={() => setSmartFilters({ ...smartFilters, openNow: !smartFilters.openNow })}
                                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border ${smartFilters.openNow ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${smartFilters.openNow ? 'bg-white animate-pulse' : 'bg-emerald-500'}`}></div>
                                    Open Now
                                </button>
                                <button
                                    onClick={() => setSmartFilters({ ...smartFilters, verified: !smartFilters.verified })}
                                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border ${smartFilters.verified ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                                >
                                    <Icon name="check_circle" size={10} /> Verified
                                </button>
                                <button
                                    onClick={() => setSmartFilters({ ...smartFilters, nearMe: !smartFilters.nearMe })}
                                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border ${smartFilters.nearMe ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                                >
                                    <Icon name="navigation" size={10} /> Near Me
                                </button>
                            </div>

                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {AREAS.map(area => (
                                    <button
                                        key={area}
                                        onClick={() => setFilters({ ...filters, area })}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${filters.area === area ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >
                                        {area}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {['all', 'food', 'shelter', 'warmth', 'support', 'family', 'learning', 'skills', 'charity'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilters({ ...filters, category: cat })}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${filters.category === cat ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >
                                        {cat === 'all' ? 'All Needs' : cat === 'support' ? 'Health' : cat === 'skills' ? 'Work Skills' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4 pb-24">
                            {filteredData.length > 0 ? (
                                filteredData.map(item => (
                                    <ResourceCard
                                        key={item.id}
                                        item={item}
                                        isSaved={savedIds.includes(item.id)}
                                        onToggleSave={() => toggleSaved(item.id)}
                                        highContrast={highContrast}
                                    />
                                ))
                            ) : (
                                <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-8 shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon name="search" size={24} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 mb-1">No Matches Found</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Try adjusting your filters or search terms.</p>
                                    <button onClick={() => { setSearchQuery(''); setFilters({ ...filters, area: 'All', category: 'all' }); setSmartFilters({ openNow: false, nearMe: false, verified: false }); }} className="mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b-2 border-indigo-100 pb-1">Reset All Filters</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-6 z-50 max-w-lg mx-auto flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
                    <Icon name="home" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Bridge</span>
                </button>
                <button onClick={() => setView('map')} className={`flex flex-col items-center gap-1 transition-all ${view === 'map' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
                    <Icon name="navigation" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Explorer</span>
                </button>
                <button onClick={() => setView('list')} className={`flex flex-col items-center gap-1 transition-all ${view === 'list' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
                    <Icon name="tag" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Directory</span>
                </button>
                <button onClick={() => setShowCrisis(true)} className="flex flex-col items-center gap-1 text-rose-500 hover:scale-110 transition-all">
                    <Icon name="alert" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Alerts</span>
                </button>
            </nav>

            <TipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
            <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />
            <PrivacyShield onAccept={() => console.log('Privacy accepted')} />
        </div>
    );
};

export default App;
