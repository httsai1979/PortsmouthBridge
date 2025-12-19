import { useState, useEffect, useMemo } from 'react';
import { ALL_DATA } from './data';
import { checkStatus, getDistance } from './utils';

// Components
import Icon from './components/Icon';
import BookingBar from './components/BookingBar';
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

    // Initial Loading State
    const [loading, setLoading] = useState(true);
    // ... rest of state
    const [view, setView] = useState<'home' | 'map' | 'list' | 'planner'>('home');
    const [showTips, setShowTips] = useState(false);
    const [showCrisis, setShowCrisis] = useState(false);
    const [showPrint, setShowPrint] = useState(false);
    const [mapFilter, setMapFilter] = useState<'all' | 'open'>('open');

    // User Location State
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Filter State
    const [filters, setFilters] = useState({
        area: 'All',
        category: 'all',
        date: 'today'
    });

    // Load Data
    useEffect(() => {
        setTimeout(() => setLoading(false), 800);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log("Location access denied/error", err)
            );
        }

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSearch = (newFilters: { area: string; category: string; date: string }) => {
        setFilters(newFilters);
        // Automatically switch view based on search selection
        if (newFilters.category !== 'all') {
            if (view === 'home') setView('list');
        }
    };

    // Filter Data Logic
    const filteredData = useMemo(() => {
        const data = ALL_DATA.filter(item => {
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
                    <Icon name="zap" size={48} className="text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-800">Portsmouth Bridge</h1>
                    <p className="text-slate-400 font-medium">Connecting Community • Restoring Hope</p>
                </div>
            </div>
        );
    }

    if (showPrint) return <PrintView data={ALL_DATA} onClose={() => setShowPrint(false)} />;

    return (
        <div className={`app-container min-h-screen font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 ${highContrast ? 'grayscale contrast-125' : ''}`}>
            <style>{`
                .yellow-label { background-color: #facc15; color: #854d0e; font-weight: 800; transform: rotate(-1deg); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 2px solid #fef08a; }
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
                        <button
                            onClick={() => {
                                if (confirm("GDPR Request: This will delete all local preferences. Proceed?")) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                            title="Clear Data"
                        >
                            <Icon name="trash" size={18} />
                        </button>
                        <button
                            onClick={() => setStealthMode(!stealthMode)}
                            className={`p-2 rounded-full transition-all ${stealthMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                            title="Stealth Mode"
                        >
                            <Icon name="eye" size={20} />
                        </button>
                        <button onClick={() => setHighContrast(!highContrast)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors" aria-label="Toggle High Contrast">
                            <Icon name="zap" size={20} />
                        </button>
                    </div>
                </div>
                {isOffline && (
                    <div className="bg-amber-500 text-amber-950 px-5 py-1 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Icon name="wifi" size={12} /> Offline Mode: Browsing Saved Data
                    </div>
                )}
            </header>

            <AIAssistant onIntent={handleSearch} currentArea={filters.area} />

            <div className={`px-5 mt-4 relative z-20 transition-all ${stealthMode ? 'opacity-90 grayscale-[0.5]' : ''}`}>
                {view === 'home' && (
                    <div className="animate-fade-in-up">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">I Need Assistance With...</p>
                        <div className="grid grid-cols-2 gap-4 pb-8">
                            <CategoryButton label="Food" icon="utensils" color="text-emerald-700 bg-emerald-50" active={filters.category === 'food'} onClick={() => handleSearch({ ...filters, category: 'food' })} />
                            <CategoryButton label="Shelter" icon="bed" color="text-indigo-700 bg-indigo-50" active={filters.category === 'shelter'} onClick={() => handleSearch({ ...filters, category: 'shelter' })} />
                            <CategoryButton label="Warmth" icon="flame" color="text-orange-700 bg-orange-50" active={filters.category === 'warmth'} onClick={() => handleSearch({ ...filters, category: 'warmth' })} />
                            <CategoryButton label="Family" icon="users" color="text-pink-700 bg-pink-50" active={filters.category === 'family'} onClick={() => handleSearch({ ...filters, category: 'family' })} />
                            <CategoryButton label="Health" icon="lifebuoy" color="text-blue-700 bg-blue-50" active={filters.category === 'support'} onClick={() => handleSearch({ ...filters, category: 'support' })} />
                            <CategoryButton label="Charity" icon="shopping-bag" color="text-rose-700 bg-rose-50" active={filters.category === 'charity'} onClick={() => handleSearch({ ...filters, category: 'charity' })} />
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mb-8">
                    <button onClick={() => setView('planner')} className="flex-1 bg-slate-900 text-white p-5 rounded-3xl shadow-xl shadow-slate-200 flex flex-col items-center justify-center gap-1 font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform">
                        <Icon name="calendar" size={24} className="mb-1" /> Plan Journey
                    </button>
                    <button onClick={() => setShowTips(true)} className="flex-1 bg-white border border-slate-200 p-5 rounded-3xl flex flex-col items-center justify-center gap-1 font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform">
                        <Icon name="info" size={24} className="mb-1 text-blue-600" /> Help Guide
                    </button>
                </div>

                {view === 'planner' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">Journey Planner</h2>
                            <button onClick={() => setView('home')} className="p-2 bg-slate-200 rounded-full"><Icon name="x" size={16} /></button>
                        </div>
                        <AreaScheduleView data={ALL_DATA} area={filters.area} category="all" />
                    </div>
                )}

                {view === 'map' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">Live Map</h2>
                            <div className="flex gap-1">
                                <button onClick={() => setMapFilter('open')} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${mapFilter === 'open' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500'}`}>Open Now</button>
                                <button onClick={() => setMapFilter('all')} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${mapFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500'}`}>All</button>
                            </div>
                        </div>
                        <SimpleMap data={filteredData} category={filters.category} statusFilter={mapFilter} />
                    </div>
                )}

                {view === 'list' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-black text-slate-800 capitalize">{filters.category === 'all' ? 'All Resources' : filters.category}</h2>
                                <button onClick={() => setView('home')} className="p-2 bg-slate-200 rounded-full"><Icon name="x" size={16} /></button>
                            </div>
                        </div>
                        <div className="space-y-4 pb-24">
                            {filteredData.length > 0 ? (
                                filteredData.map(item => <ResourceCard key={item.id} item={item} />)
                            ) : (
                                <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="font-bold">No results found in {filters.area}.</p>
                                    <button onClick={() => setFilters({ ...filters, area: 'All' })} className="text-emerald-600 text-xs font-bold mt-2 underline">View All Areas</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="h-28"></div>

            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-6 z-50 max-w-lg mx-auto flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <Icon name="home" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
                </button>
                <button onClick={() => setView('map')} className={`flex flex-col items-center gap-1 ${view === 'map' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <Icon name="navigation" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Explorer</span>
                </button>
                <button onClick={() => setView('list')} className={`flex flex-col items-center gap-1 ${view === 'list' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <Icon name="tag" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Directory</span>
                </button>
                <button onClick={() => { setShowCrisis(true); }} className="flex flex-col items-center gap-1 text-rose-500">
                    <Icon name="alert" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Alert</span>
                </button>
            </nav>

            <TipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
            <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />
            <PrivacyShield onAccept={() => console.log('Privacy accepted')} />
        </div>
    );
};

export default App;
