import { useState, useEffect, useMemo } from 'react';
import { ALL_DATA, AREAS, PROGRESS_TIPS, COMMUNITY_DEALS, GIFT_EXCHANGE, TAG_ICONS } from './data';
import { checkStatus, getDistance, playSuccessSound } from './utils';

// Components
import Icon from './components/Icon';
import SimpleMap from './components/SimpleMap';
import ResourceCard from './components/ResourceCard';
import { TipsModal, CrisisModal } from './components/Modals';
import PrintView from './components/PrintView';
import { AreaScheduleView } from './components/Schedule';
import FoodSchedule from './components/FoodSchedule';
import AIAssistant from './components/AIAssistant';
import PrivacyShield from './components/PrivacyShield';
import JourneyPlanner from './components/JourneyPlanner';
import SmartCompare from './components/SmartCompare';
import SmartNotifications from './components/SmartNotifications';
import ProgressTimeline from './components/ProgressTimeline';

import CrisisWizard from './components/CrisisWizard'; // Phase 28: Decision Wizard

const App = () => {
    // Branding & Accessibility State
    const [highContrast, setHighContrast] = useState(false);
    const [stealthMode, setStealthMode] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    const [loading, setLoading] = useState(true);


    // Navigation & Modals
    const [view, setView] = useState<'home' | 'map' | 'list' | 'planner' | 'compare' | 'food-calendar'>('home');
    const [showTips, setShowTips] = useState(false);
    const [showCrisis, setShowCrisis] = useState(false);
    const [showPrint, setShowPrint] = useState(false);
    const [mapFilter, setMapFilter] = useState<'all' | 'open'>('open');
    const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number; label?: string } | null>(null);
    const [showWizard, setShowWizard] = useState(false);

    // List View Pagination
    const [visibleCount, setVisibleCount] = useState(10);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Phase 25: Empowerment & Intelligence
    const [journeyItems, setJourneyItems] = useState<string[]>([]); // Resource IDs for multi-stop journey
    const [compareItems, setCompareItems] = useState<string[]>([]); // Resource IDs for comparison (max 3)
    const [notifications, setNotifications] = useState<Array<{ id: string; type: 'opening_soon' | 'favorite' | 'weather' | 'info'; message: string; timestamp: number; resourceId?: string }>>([]);

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
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Portsmouth Bridge',
                    text: 'Find food, shelter, and community support in Portsmouth. Check out Portsmouth Bridge!',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard! Share it with your friends.');
        }
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



        // Scroll listener for Back to Top
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Clear map focus when leaving map view
    useEffect(() => {
        if (view !== 'map') {
            setMapFocus(null);
        }
    }, [view]);

    // Reset pagination when filters change
    useEffect(() => {
        setVisibleCount(10);
    }, [filters, searchQuery, smartFilters]);


    // Phase 25: Smart Notifications Logic
    useEffect(() => {
        const checkForNotifications = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            const newNotifications: Array<{ id: string; type: 'opening_soon' | 'favorite' | 'weather' | 'info'; message: string; timestamp: number; resourceId?: string }> = [];

            // Check saved resources for opening soon
            savedIds.forEach(id => {
                const resource = ALL_DATA.find(r => r.id === id);
                if (!resource) return;

                const status = checkStatus(resource.schedule);
                const daySchedule = resource.schedule[now.getDay()];

                if (daySchedule && daySchedule !== 'Closed') {
                    const [openTime] = daySchedule.split('-');
                    const [openHour, openMin] = openTime.split(':').map(Number);

                    // Notify 30 minutes before opening
                    const minutesUntilOpen = (openHour * 60 + openMin) - (currentHour * 60 + currentMinutes);

                    if (minutesUntilOpen > 0 && minutesUntilOpen <= 30 && status.status === 'closed') {
                        newNotifications.push({
                            id: `opening_${id}_${now.getTime()}`,
                            type: 'opening_soon',
                            message: `${resource.name} opens in ${minutesUntilOpen} minutes`,
                            timestamp: now.getTime(),
                            resourceId: id
                        });
                    }
                }
            });

            // Weather alerts (example)
            if (currentHour >= 18 && now.getMonth() >= 10 && newNotifications.length === 0) {
                newNotifications.push({
                    id: `weather_${now.getTime()}`,
                    type: 'weather',
                    message: 'Cold evening ahead - Emergency shelter beds available tonight',
                    timestamp: now.getTime()
                });
            }

            if (newNotifications.length > 0) {
                setNotifications(prev => {
                    const existing = prev.map(n => n.id);
                    const unique = newNotifications.filter(n => !existing.includes(n.id));
                    return [...prev, ...unique];
                });
            }
        };

        // Check every 5 minutes
        const interval = setInterval(checkForNotifications, 5 * 60 * 1000);
        checkForNotifications(); // Initial check

        return () => clearInterval(interval);
    }, [savedIds]);

    // Phase 25: Helper Functions


    const toggleJourneyItem = (id: string) => {
        setJourneyItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleCompareItem = (id: string) => {
        setCompareItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 3) {
                alert('Maximum 3 resources for comparison');
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleNavigateJourney = () => {
        if (journeyItems.length === 0) return;

        const journeyResources = ALL_DATA.filter(r => journeyItems.includes(r.id));
        if (journeyResources.length > 0) {
            // Create Google Maps URL with multiple waypoints
            const waypoints = journeyResources.map(r => `${r.lat},${r.lng}`).join('|');
            const url = `https://www.google.com/maps/dir/?api=1&destination=${journeyResources[journeyResources.length - 1].lat},${journeyResources[journeyResources.length - 1].lng}&waypoints=${waypoints}`;
            window.open(url, '_blank');
        }
    };

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
    }, [filters, userLocation, searchQuery, smartFilters]); // Added searchQuery and smartFilters to deps

    const savedResources = useMemo(() => {
        return ALL_DATA.filter(item => savedIds.includes(item.id));
    }, [savedIds]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        const messages = {
            morning: [
                { msg: "Good Morning", sub: "A new day to build bridges." },
                { msg: "Rise with Hope", sub: "Small steps lead to change." },
                { msg: "Hello Neighbor", sub: "You are part of this city." }
            ],
            afternoon: [
                { msg: "Good Afternoon", sub: "Keep moving focused and strong." },
                { msg: "Community First", sub: "Connections make us stronger." },
                { msg: "Pathways Open", sub: "Explore opportunities today." }
            ],
            evening: [
                { msg: "Good Evening", sub: "Rest is part of the journey." },
                { msg: "Safe & Support", sub: "Portsmouth cares for you." },
                { msg: "Peaceful Night", sub: "Tomorrow brings new light." }
            ]
        };

        const timeKey = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        const pool = messages[timeKey];
        // Use a simple hash based on date to keep it consistent for the day but varied
        const dayOfMonth = new Date().getDate();
        return pool[dayOfMonth % pool.length];
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                .app-container { max-width: 500px; margin: 0 auto; background-color: #f8fafc; min-height: 100vh; box-shadow: 0 0 50px rgba(0,0,0,0.08); position: relative; padding-bottom: 140px; }
                .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); scale: 0.98; } to { opacity: 1; transform: translateY(0); scale: 1; } }
                .high-contrast { filter: contrast(1.2) saturate(0) !important; }
                .high-contrast button { border: 1px solid currentcolor !important; box-shadow: none !important; }
            `}</style>

            {/* Scroll To Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-24 right-5 z-[5000] p-4 bg-slate-900 text-white rounded-full shadow-2xl animate-fade-in-up hover:bg-black transition-colors"
                    aria-label="Scroll to top"
                >
                    <Icon name="arrow-right" size={20} className="-rotate-90" />
                </button>
            )}

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

                {/* Clean Spacer */}
                <div className="mb-4"></div>

                {view === 'home' && (
                    <div className="animate-fade-in-up">
                        {/* Progress Timeline Integration */}
                        {savedIds.length > 0 && (
                            <ProgressTimeline savedCount={savedIds.length} />
                        )}
                        {/* Phase 9: Warmer Daily Greeting with City Impact */}
                        <div className="mb-6 p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-[40px] text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                            <div className="relative z-10">
                                <h2 className="text-3xl font-black tracking-tighter mb-2 leading-tight">{greeting.msg}</h2>
                                <p className="text-indigo-100 text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">{greeting.sub}</p>
                            </div>
                        </div>

                        {/* Phase 16: Universal Search Bar (Apple Style: Prime Position) */}
                        <div className="mb-4 relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Icon name="search" size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (view === 'home') setView('list');
                                    }}
                                    placeholder="Search Portsmouth (e.g., 'food', 'shelter')"
                                    className="flex-1 py-4 pl-12 pr-4 bg-white rounded-[20px] border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold text-slate-900 transition-all shadow-lg shadow-slate-100 placeholder:text-slate-400"
                                />
                                <button
                                    onClick={handleShare}
                                    className="p-4 bg-white border border-slate-200 rounded-[20px] text-indigo-600 hover:bg-slate-50 transition-all shadow-lg shadow-slate-100 flex items-center justify-center active:scale-95"
                                    title="Share App"
                                >
                                    <Icon name="share-2" size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Toggle: All vs Open (Apple Segmented Control) */}
                        <div className="bg-slate-100 p-1.5 rounded-[18px] flex mb-6 border border-slate-200">
                            <button
                                onClick={() => setSmartFilters({ ...smartFilters, openNow: false })}
                                className={`flex-1 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${!smartFilters.openNow ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                All Resources
                            </button>
                            <button
                                onClick={() => setSmartFilters({ ...smartFilters, openNow: true })}
                                className={`flex-1 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${smartFilters.openNow ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Open Now
                            </button>
                        </div>

                        {/* Categories - Grid */}
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {['food', 'shelter', 'warmth', 'support', 'family', 'skills', 'charity', 'all'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleSearch({ ...filters, category: cat })}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-xl shadow-sm transition-all group-active:scale-90 ${cat === 'all' ? 'bg-slate-100 text-slate-400' : filters.category === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-100'}`}>
                                        <Icon name={cat === 'all' ? 'grid' : cat === 'support' ? 'lifebuoy' : cat === 'skills' ? 'briefcase' : TAG_ICONS[cat]?.icon || 'circle'} size={20} />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{cat === 'all' ? 'More' : cat === 'support' ? 'Health' : cat}</span>
                                </button>
                            ))}
                        </div>

                        {/* Phase 28: Critical Decision Button (Primary Call to Action) */}
                        <button
                            onClick={() => setShowWizard(true)}
                            className="w-full mb-8 bg-rose-500 text-white p-1 rounded-[32px] shadow-xl shadow-rose-200 group transition-all hover:scale-[1.02] active:scale-95 pr-2"
                        >
                            <div className="flex items-center justify-between bg-white/10 rounded-[28px] p-4 border border-white/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white text-rose-600 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                                        <Icon name="lifebuoy" size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base font-black leading-none mb-1">Find Help Now</h3>
                                        <p className="text-[9px] font-bold text-rose-100 uppercase tracking-widest">Interactive Wizard</p>
                                    </div>
                                </div>
                                <Icon name="chevron-right" size={20} className="mr-2 text-rose-100" />
                            </div>
                        </button>

                        {/* Secondary Tools */}
                        <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            <button onClick={() => setView('planner')} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-indigo-200 transition-all text-left">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Icon name="calendar" size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800">My Journey</h4>
                                    <p className="text-[9px] text-slate-400 font-bold">{savedIds.length} Saved Items</p>
                                </div>
                            </button>
                            <button onClick={() => setView('food-calendar')} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-emerald-200 transition-all text-left">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Icon name="utensils" size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800">Food Cal.</h4>
                                    <p className="text-[9px] text-slate-400 font-bold">Weekly Schedule</p>
                                </div>
                            </button>
                            <button onClick={() => setShowTips(true)} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-amber-200 transition-all text-left">
                                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Icon name="info" size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800">Guide</h4>
                                    <p className="text-[9px] text-slate-400 font-bold">How to use</p>
                                </div>
                            </button>
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

                        {/* Phase 23: Bridge Synergy - Market Deals & Gift Exchange */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                            <div className="p-6 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 transition-colors"></div>
                                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                    <Icon name="tag" size={14} /> Portsmouth Market Deals
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    {COMMUNITY_DEALS.map((deal) => (
                                        <button
                                            key={deal.id}
                                            onClick={() => {
                                                setMapFocus({ lat: deal.lat, lng: deal.lng, label: deal.store });
                                                setView('map');
                                            }}
                                            className="border-l-4 border-emerald-500 pl-4 py-1 hover:bg-emerald-50 w-full text-left rounded-r-lg transition-all active:scale-[0.98]"
                                        >
                                            <p className="text-xs font-black text-slate-900">{deal.store}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">{deal.deal} • {deal.time}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{deal.info}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-12 -mt-12 transition-colors"></div>
                                <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                    <Icon name="heart" size={14} /> City Gift Exchange
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    {GIFT_EXCHANGE.map((gift) => (
                                        <button
                                            key={gift.id}
                                            onClick={() => {
                                                setMapFocus({ lat: gift.lat, lng: gift.lng, label: gift.location });
                                                setView('map');
                                            }}
                                            className="border-l-4 border-rose-500 pl-4 py-1 hover:bg-rose-50 w-full text-left rounded-r-lg transition-all active:scale-[0.98]"
                                        >
                                            <p className="text-xs font-black text-slate-900">{gift.item}</p>
                                            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">{gift.location} • {gift.date}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{gift.info}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'food-calendar' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Food Calendar</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Meal & Pantry Schedule</p>
                            </div>
                            <button onClick={() => setView('home')} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"><Icon name="x" size={20} /></button>
                        </div>
                        <FoodSchedule
                            data={ALL_DATA}
                            onNavigate={(id) => {
                                const item = ALL_DATA.find(i => i.id === id);
                                if (item) {
                                    setMapFocus({ lat: item.lat, lng: item.lng, label: item.name });
                                    setView('map');
                                }
                            }}
                            onSave={toggleSaved}
                            savedIds={savedIds}
                        />
                    </div>
                )}

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
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Explorer</h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visual navigation</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setView('list')}
                                    className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                                    title="Switch to List View"
                                >
                                    <Icon name="list" size={18} />
                                </button>
                                <div className="flex gap-1">
                                    <button onClick={() => setMapFilter('open')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${mapFilter === 'open' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}>Open</button>
                                    <button onClick={() => setMapFilter('all')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${mapFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>All</button>
                                </div>
                            </div>
                        </div>
                        {filters.category !== 'all' && (
                            <div className="mb-4 flex items-center justify-between bg-white px-4 py-3 rounded-2xl border-2 border-slate-100 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Showing only: <span className="text-slate-900 font-black">{filters.category}</span></span>
                                <button
                                    onClick={() => setFilters({ ...filters, category: 'all' })}
                                    className="text-[10px] font-black text-indigo-600 uppercase tracking-wider hover:underline"
                                >
                                    Show All Types
                                </button>
                            </div>
                        )}

                        <SimpleMap
                            data={filteredData}
                            category={filters.category}
                            statusFilter={mapFilter}
                            savedIds={savedIds}
                            onToggleSave={toggleSaved}
                            stealthMode={stealthMode}
                            externalFocus={mapFocus}
                            onCategoryChange={(cat) => {
                                setFilters(prev => ({ ...prev, category: cat, area: 'All' }));
                                setSearchQuery('');
                            }}
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setView('food-calendar')}
                                    className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all flex items-center gap-2"
                                    title="Food Calendar"
                                >
                                    <Icon name="utensils" size={20} />
                                </button>
                                <button
                                    onClick={() => setView('map')}
                                    className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                                    title="Switch to Map View"
                                >
                                    <Icon name="mapPin" size={20} />
                                </button>
                                <button onClick={() => setView('home')} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"><Icon name="home" size={20} /></button>
                            </div>
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
                                <button
                                    onClick={() => setFilters({ ...filters, area: 'All' })}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${filters.area === 'All' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                                >
                                    Whole City
                                </button>
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

                            {/* Phase 30: Eligibility Pre-Filters (User Request) */}
                            <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
                                {[
                                    { label: 'No Referral', tag: 'no_referral', icon: 'check_circle' },
                                    { label: 'Free', tag: 'free', icon: 'tag' },
                                    { label: 'Membership', tag: 'membership', icon: 'id-card' }
                                ].map(f => (
                                    <button
                                        key={f.tag}
                                        onClick={() => setSearchQuery(searchQuery === f.tag ? '' : f.tag)}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border
                                            ${searchQuery === f.tag
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}
                                        `}
                                    >
                                        <Icon name={f.icon} size={12} />
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4 pb-24">
                            {filteredData.slice(0, visibleCount).map(item => (
                                <ResourceCard
                                    key={item.id}
                                    item={item}
                                    isSaved={savedIds.includes(item.id)}
                                    onToggleSave={() => toggleSaved(item.id)}
                                    onAddToCompare={() => toggleCompareItem(item.id)}
                                    onAddToJourney={() => toggleJourneyItem(item.id)}
                                    isInCompare={compareItems.includes(item.id)}
                                    isInJourney={journeyItems.includes(item.id)}
                                    highContrast={highContrast}
                                    onTagClick={(tag) => setSearchQuery(tag)}
                                />
                            ))}
                        </div>

                        {/* Infinite Scroll Sentinel */}
                        {visibleCount < filteredData.length && (
                            <div
                                ref={(node) => {
                                    if (!node) return;
                                    const observer = new IntersectionObserver(
                                        (entries) => {
                                            if (entries[0].isIntersecting) {
                                                setVisibleCount(prev => Math.min(prev + 10, filteredData.length));
                                            }
                                        },
                                        { threshold: 0.1, rootMargin: '100px' }
                                    );
                                    observer.observe(node);
                                    return () => observer.disconnect();
                                }}
                                className="h-20 flex items-center justify-center p-4 text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse"
                            >
                                Loading more resources...
                            </div>
                        )}
                        <div className="pb-32"></div>
                    </div>
                )}

                {view === 'compare' && (
                    <div className="animate-fade-in-up bg-slate-100 min-h-[90vh] rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-1">
                        <div className="flex justify-between items-center px-6 py-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Smart Compare</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decision Support Engine</p>
                            </div>
                            <button onClick={() => setView('home')} className="p-3 bg-white text-slate-400 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"><Icon name="x" size={20} /></button>
                        </div>
                        <SmartCompare
                            items={ALL_DATA.filter(i => compareItems.includes(i.id))}
                            userLocation={userLocation}
                            onRemove={toggleCompareItem}
                            onNavigate={(id) => {
                                const item = ALL_DATA.find(i => i.id === id);
                                if (item) window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`, '_blank');
                            }}
                            onCall={(phone) => window.open(`tel:${phone}`)}
                        />
                    </div>
                )}

                {/* Bottom Nav - simplified for "Always Home" model */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 border border-white/10">
                    <button onClick={() => setView('home')} className={`relative group ${view === 'home' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                        <Icon name="home" size={24} />
                        {view === 'home' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}
                    </button>
                    <button onClick={() => setView('map')} className={`relative group ${view === 'map' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                        <Icon name="mapPin" size={24} />
                        {view === 'map' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}
                    </button>
                    <button onClick={() => setView('list')} className={`relative group ${view === 'list' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                        <Icon name="search" size={24} />
                        {view === 'list' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}
                    </button>
                    <div className="w-px h-6 bg-white/20"></div>
                    <button onClick={() => setShowCrisis(true)} className="text-rose-500 hover:text-rose-400 animate-pulse">
                        <Icon name="lifebuoy" size={24} />
                    </button>
                </div>

                <TipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
                <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />
                {showPrint && <PrintView data={ALL_DATA} onClose={() => setShowPrint(false)} />}
                <PrivacyShield onAccept={() => console.log('Privacy accepted')} />

                {/* Phase 25: Smart Notifications */}
                <SmartNotifications
                    notifications={notifications}
                    onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                    onClearAll={() => setNotifications([])}
                    onAction={(resourceId) => {
                        const resource = ALL_DATA.find(r => r.id === resourceId);
                        if (resource) {
                            setMapFocus({ lat: resource.lat, lng: resource.lng, label: resource.name });
                            setView('map');
                        }
                    }}
                />

                {/* Phase 25: Floating Action Buttons */}
                {(journeyItems.length > 0 || compareItems.length > 0) && (
                    <div className="fixed bottom-24 left-5 z-50 flex flex-col gap-3">
                        {journeyItems.length > 0 && (
                            <button
                                onClick={() => setView('planner')}
                                className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 relative"
                            >
                                <Icon name="mapPin" size={20} />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-xs font-black">{journeyItems.length}</span>
                                </div>
                            </button>
                        )}
                        {compareItems.length > 0 && (
                            <button
                                onClick={() => setView('compare')}
                                className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 transition-all active:scale-95 relative"
                            >
                                <Icon name="shield" size={20} />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-xs font-black">{compareItems.length}</span>
                                </div>
                            </button>
                        )}
                    </div>
                )}

                {/* Phase 25: Journey Planner Modal */}
                {view === 'planner' && journeyItems.length > 0 && (
                    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end" onClick={() => setView('home')}>
                        <div className="w-full max-w-lg mx-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            <JourneyPlanner
                                items={ALL_DATA.filter(r => journeyItems.includes(r.id))}
                                userLocation={userLocation}
                                onRemove={(id) => setJourneyItems(prev => prev.filter(i => i !== id))}
                                onClear={() => {
                                    setJourneyItems([]);
                                    setView('home');
                                }}
                                onNavigate={handleNavigateJourney}
                            />
                        </div>
                    </div>
                )}

                {/* Phase 25: Smart Compare Modal */}
                {view === 'compare' && compareItems.length > 0 && (
                    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setView('home')}>
                        <div className="w-full max-w-4xl mx-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
                            <SmartCompare
                                items={ALL_DATA.filter(r => compareItems.includes(r.id))}
                                userLocation={userLocation}
                                onRemove={(id) => setCompareItems(prev => prev.filter(i => i !== id))}
                                onNavigate={(id) => {
                                    const resource = ALL_DATA.find(r => r.id === id);
                                    if (resource) {
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`, '_blank');
                                    }
                                }}
                                onCall={(phone) => window.location.href = `tel:${phone}`}
                            />
                        </div>
                    </div>
                )}
                {/* FAQ & Support Section (User Request) */}
                <div className="mt-12 mb-12 p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                        <div>
                            <p className="font-bold text-slate-700 text-sm mb-1">Is this service free?</p>
                            <p className="text-xs text-slate-500 leading-relaxed">Yes. Portsmouth Bridge is 100% free to use. Most resources listed are also free or low-cost (like community pantries).</p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700 text-sm mb-1">Do I need internet?</p>
                            <p className="text-xs text-slate-500 leading-relaxed">The app works offline once loaded. You can "Install App" to your home screen to keep it available without data.</p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700 text-sm mb-1">Is my data private?</p>
                            <p className="text-xs text-slate-500 leading-relaxed">Absolutely. We track nothing. Your location stays on your phone. No logins, no cookies.</p>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <p className="font-bold text-indigo-900 text-sm mb-1">Developer Contact</p>
                            <p className="text-xs text-slate-500 mb-2">For feedback, corrections, or technical support:</p>
                            <a href="mailto:ht.tsai@sustainsage-group.com" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
                                <Icon name="mail" size={14} />
                                ht.tsai@sustainsage-group.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* PB: B2B Hint - Internal Marketplace (Point 7) */}
                <div className="mb-8 text-center opacity-30 hover:opacity-100 transition-opacity">
                    <button onClick={() => alert("Partner Portal: Please sign in with your organization ID to access the Resource Exchange Market.")} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-transparent hover:border-slate-400 pb-1">
                        Partner Portal Access
                    </button>
                </div>

                {/* Decision Wizard Modal */}
                {showWizard && (
                    <CrisisWizard
                        userLocation={userLocation}
                        onClose={() => setShowWizard(false)}
                        savedIds={savedIds}
                        onToggleSave={(id) => {
                            if (savedIds.includes(id)) {
                                setSavedIds(prev => prev.filter(i => i !== id));
                            } else {
                                setSavedIds(prev => [...prev, id]);
                                playSuccessSound();
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
