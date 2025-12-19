import { useState, useEffect, useMemo } from 'react';
import { ALL_DATA } from './data';
import { checkStatus, getDistance } from './utils';

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
            return next;
        });
    };

    // Location State
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

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
            return matchesArea && matchesCategory;
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
        if (hour < 12) return { msg: "Good Morning, Portsmouth", sub: "A new day to cross new bridges." };
        if (hour < 18) return { msg: "Good Afternoon", sub: "Keep moving forward, we're here for you." };
        return { msg: "Good Evening", sub: "Rest well, you've done enough for today." };
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
        <div className={`app-container min-h-screen font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 ${highContrast ? 'grayscale contrast-125' : ''}`}>
            <style>{`
                .app-container { max-width: 500px; margin: 0 auto; background-color: #f8fafc; min-height: 100vh; box-shadow: 0 0 50px rgba(0,0,0,0.08); position: relative; padding-bottom: 110px; }
                .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); scale: 0.98; } to { opacity: 1; transform: translateY(0); scale: 1; } }
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
                        {/* Daily Warmth (Phase 8) */}
                        <div className="mb-8 p-6 bg-indigo-600 rounded-[32px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                            <h2 className="text-2xl font-black tracking-tight mb-1">{greeting.msg}</h2>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">{greeting.sub}</p>
                        </div>

                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">Primary Services</p>
                        <div className="grid grid-cols-2 gap-4 pb-8">
                            <CategoryButton label="Food" icon="utensils" color="text-emerald-700 bg-emerald-50" active={filters.category === 'food'} onClick={() => handleSearch({ ...filters, category: 'food' })} />
                            <CategoryButton label="Shelter" icon="bed" color="text-indigo-700 bg-indigo-50" active={filters.category === 'shelter'} onClick={() => handleSearch({ ...filters, category: 'shelter' })} />
                            <CategoryButton label="Warmth" icon="flame" color="text-orange-700 bg-orange-50" active={filters.category === 'warmth'} onClick={() => handleSearch({ ...filters, category: 'warmth' })} />
                            <CategoryButton label="Family" icon="users" color="text-pink-700 bg-pink-50" active={filters.category === 'family'} onClick={() => handleSearch({ ...filters, category: 'family' })} />
                            <CategoryButton label="Health" icon="lifebuoy" color="text-blue-700 bg-blue-50" active={filters.category === 'support'} onClick={() => handleSearch({ ...filters, category: 'support' })} />
                            <CategoryButton label="Charity" icon="shopping-bag" color="text-rose-700 bg-rose-50" active={filters.category === 'charity'} onClick={() => handleSearch({ ...filters, category: 'charity' })} />
                        </div>

                        {savedResources.length > 0 && (
                            <div className="mb-8 p-6 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Icon name="star" size={16} className="text-amber-500" /> My Bridge Pins
                                </h3>
                                <div className="space-y-3">
                                    {savedResources.slice(0, 3).map(res => (
                                        <div key={res.id} className="flex items-center justify-between group">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{res.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{res.area}</p>
                                            </div>
                                            <button onClick={() => setView('planner')} className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"><Icon name="arrow-right" size={14} /></button>
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
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">Journey Planner</h2>
                            <button onClick={() => setView('home')} className="p-2 bg-slate-200 rounded-full"><Icon name="x" size={16} /></button>
                        </div>
                        {savedIds.length > 0 ? (
                            <AreaScheduleView data={savedResources} area="All" category="all" />
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-8">
                                <Icon name="star" size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-lg font-black text-slate-800 mb-2">No Pins Yet</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Add resources to "My Bridge" to build your personalized daily journey.</p>
                                <button onClick={() => setView('list')} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Browse Resources</button>
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
                        <SimpleMap data={filteredData} category={filters.category} statusFilter={mapFilter} />
                    </div>
                )}

                {view === 'list' && (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-800 capitalize">{filters.category === 'all' ? 'Directory' : filters.category}</h2>
                            <button onClick={() => setView('home')} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"><Icon name="x" size={16} /></button>
                        </div>
                        <div className="space-y-4 pb-24">
                            {filteredData.map(item => (
                                <ResourceCard
                                    key={item.id}
                                    item={item}
                                    isSaved={savedIds.includes(item.id)}
                                    onToggleSave={() => toggleSaved(item.id)}
                                />
                            ))}
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
