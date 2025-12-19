import { useState, useEffect, useMemo } from 'react';
import { ALL_DATA } from './data';
import { checkStatus, getDistance } from './utils';

// Components
import Icon from './components/Icon';
import BookingBar from './components/BookingBar';
import Dashboard from './components/Dashboard';
import SimpleMap from './components/SimpleMap';
import ResourceCard from './components/ResourceCard';
import { TipsModal, CrisisModal } from './components/Modals';
import PrintView from './components/PrintView';
import { AreaScheduleView, CategoryButton } from './components/Schedule';
import AIAssistant from './components/AIAssistant';

const App = () => {
    // Branding & Accessibility State
    const [highContrast, setHighContrast] = useState(false);
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
                    <Icon name="heart" size={48} className="text-rose-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-800">Pompey Haven</h1>
                    <p className="text-slate-400 font-medium">Warmth • Dignity • Community</p>
                </div>
            </div>
        );
    }

    if (showPrint) return <PrintView data={ALL_DATA} onClose={() => setShowPrint(false)} />;

    return (
        <div className={`app-container min-h-screen font-sans text-slate-900 selection:bg-rose-200 selection:text-rose-900 ${highContrast ? 'grayscale contrast-125' : ''}`}>
            <style>{`
                .header-bg { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); }
                .yellow-label { background-color: #facc15; color: #854d0e; font-weight: 800; transform: rotate(-1deg); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 2px solid #fef08a; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .app-container { max-width: 500px; margin: 0 auto; background-color: #f8fafc; min-height: 100vh; box-shadow: 0 0 50px rgba(0,0,0,0.08); position: relative; padding-bottom: 110px; }
                .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); scale: 0.98; } to { opacity: 1; transform: translateY(0); scale: 1; } }
            `}</style>

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
                {isOffline && (
                    <div className="bg-amber-500 text-amber-950 px-5 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse">
                        <Icon name="wifi" size={12} /> Offline Mode: Browsing Saved Data
                    </div>
                )}
            </header>

            <AIAssistant onIntent={handleSearch} currentArea={filters.area} />

            <TipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
            <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />

            <BookingBar onSearch={handleSearch} currentFilters={filters} />

            <div className="px-5 mt-2 relative z-20">
                {view === 'home' && (
                    <Dashboard
                        data={ALL_DATA.filter(i => (filters.area === 'All' || i.area === filters.area))}
                        onNavigate={(cat) => handleSearch({ ...filters, category: cat })}
                    />
                )}

                <div className="flex gap-2 mb-6">
                    <button onClick={() => setView('planner')} className="flex-1 bg-white text-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center gap-2 font-black hover:scale-[1.02] transition-transform">
                        <Icon name="calendar" size={20} className="text-blue-600" /> View Schedule
                    </button>
                    <button onClick={() => setShowTips(true)} className="flex-1 yellow-label p-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                        <Icon name="tag" size={20} /> Tips & Help
                    </button>
                </div>

                {view === 'planner' && (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">Timeline</h2>
                            <button onClick={() => setView('home')} className="p-2 bg-slate-200 rounded-full"><Icon name="x" size={16} /></button>
                        </div>
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