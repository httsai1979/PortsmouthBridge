import { useState, useEffect, useMemo, Suspense, lazy, useRef } from 'react';
import Fuse from 'fuse.js';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { db } from './lib/firebase'; 
import { ALL_DATA, AREAS, TAG_ICONS, COMMUNITY_DEALS, GIFT_EXCHANGE, PROGRESS_TIPS } from './data';
import { checkStatus, playSuccessSound, getDistance } from './utils';
import { logSearchEvent } from './services/AnalyticsService';
import { fetchLiveStatus, type LiveStatus } from './services/LiveStatusService';

// Components
import Icon from './components/Icon';
import ResourceCard from './components/ResourceCard';
import { TipsModal, CrisisModal, ReportModal, PartnerRequestModal, TutorialModal } from './components/Modals';
import FAQSection from './components/FAQSection';
import CommunityBulletin from './components/CommunityBulletin';
import AIAssistant from './components/AIAssistant';
import PrivacyShield from './components/PrivacyShield';
import SmartNotifications from './components/SmartNotifications';
import ProgressTimeline from './components/ProgressTimeline';

// Images
import logo from './assets/images/logo.png';

// Authentication
import { useAuth } from './contexts/AuthContext';
import PartnerLogin from './components/PartnerLogin';

// [PERFORMANCE] Lazy Load Heavy Components
const SimpleMap = lazy(() => import('./components/SimpleMap'));
const JourneyPlanner = lazy(() => import('./components/JourneyPlanner'));
const SmartCompare = lazy(() => import('./components/SmartCompare'));
const UnifiedSchedule = lazy(() => import('./components/UnifiedSchedule'));
const AreaScheduleView = lazy(() => import('./components/Schedule').then(module => ({ default: module.AreaScheduleView })));
const CrisisWizard = lazy(() => import('./components/CrisisWizard'));
const PartnerDashboard = lazy(() => import('./components/PartnerDashboard'));
const PulseMap = lazy(() => import('./components/PulseMap'));
const DataMigration = lazy(() => import('./components/DataMigration'));
const PrintView = lazy(() => import('./components/PrintView'));

// Loading Fallback
const PageLoader = () => (
    <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
);

// [FIX] Move static styles outside component to prevent layout thrashing
const APP_STYLES = `
    .app-container { max-width: 500px; margin: 0 auto; background-color: #ffffff; min-height: 100vh; box-shadow: 0 0 50px rgba(0, 0, 0, 0.08); position: relative; padding-bottom: 140px; }
    .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); scale: 0.98; } to { opacity: 1; transform: translateY(0); scale: 1; } }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

const App = () => {
    // Branding & Accessibility State
    const [highContrast, setHighContrast] = useState(false);
    const [stealthMode, setStealthMode] = useState(false);
    const [fontSize, setFontSize] = useState(0); 
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [loading, setLoading] = useState(true);

    // Navigation & Modals
    const [view, setView] = useState<'home' | 'map' | 'list' | 'planner' | 'compare' | 'community-plan' | 'safe-sleep-plan' | 'warm-spaces-plan' | 'faq' | 'partner-dashboard' | 'analytics' | 'data-migration'>('home');
    const [showTips, setShowTips] = useState(false);
    const [showCrisis, setShowCrisis] = useState(false);
    const [showPrint, setShowPrint] = useState(false);
    const [mapFilter, setMapFilter] = useState<'all' | 'open'>('open');
    const [mapFocus, setMapFocus] = useState<{ lat: number, lng: number, label: string, id?: string } | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [showPartnerLogin, setShowPartnerLogin] = useState(false);
    const { currentUser, isPartner, loading: authLoading } = useAuth();
    
    // Tutorial State
    const [showTutorial, setShowTutorial] = useState(false);

    // Modal States
    const [reportTarget, setReportTarget] = useState<{name: string, id: string} | null>(null);
    const [showPartnerRequest, setShowPartnerRequest] = useState(false);

    // List View Pagination
    const [visibleCount, setVisibleCount] = useState(10);
    const [showScrollTop, setShowScrollTop] = useState(false);
    
    // [FIX] Stable ref for intersection observer
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // [Hybrid Data State]
    const [sheetStatus, setSheetStatus] = useState<Record<string, LiveStatus>>({});
    const [firebaseStatus, setFirebaseStatus] = useState<Record<string, LiveStatus>>({});
    
    const liveStatus = useMemo(() => {
        return { ...sheetStatus, ...firebaseStatus };
    }, [sheetStatus, firebaseStatus]);

    // Feature State
    const [journeyItems, setJourneyItems] = useState<string[]>([]);
    const [compareItems, setCompareItems] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<Array<{ id: string; type: 'opening_soon' | 'favorite' | 'weather' | 'info'; message: string; timestamp: number; resourceId?: string }>>([]);

    const [savedIds, setSavedIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('bridge_saved_resources');
        return saved ? JSON.parse(saved) : [];
    });

    const toggleSaved = (id: string) => {
        setSavedIds(prev => {
            const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
            localStorage.setItem('bridge_saved_resources', JSON.stringify(next));
            if (!prev.includes(id)) playSuccessSound();
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
            alert('Link copied to clipboard!');
        }
    };

    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [smartFilters, setSmartFilters] = useState({
        openNow: false,
        nearMe: false,
        verified: false
    });

    const [filters, setFilters] = useState({
        area: 'All',
        category: 'all',
        date: 'today'
    });

    // [FIX] Inject Styles ONCE on mount
    useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.innerHTML = APP_STYLES;
        document.head.appendChild(styleTag);
        return () => { document.head.removeChild(styleTag); };
    }, []);

    // 🛡️ Route Guard
    useEffect(() => {
        if (!authLoading && !currentUser) {
            const restrictedViews = ['partner-dashboard', 'analytics', 'data-migration'];
            if (restrictedViews.includes(view)) {
                setView('home');
            }
        }
    }, [currentUser, authLoading, view]);

    // Font Size Effect
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('fs-0', 'fs-1', 'fs-2');
        root.classList.add(`fs-${fontSize}`);
    }, [fontSize]);

    // Initial Load & Polling
    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
        
        const seenTutorial = localStorage.getItem('seen_tutorial');
        if (!seenTutorial) {
            setShowTutorial(true);
        }

        const loadSheetData = async () => {
            try {
                const data = await fetchLiveStatus();
                if (Object.keys(data).length) {
                    setSheetStatus(data);
                    localStorage.setItem('cached_live_status', JSON.stringify(data));
                }
            } catch (e) {
                const cached = localStorage.getItem('cached_live_status');
                if (cached) setSheetStatus(JSON.parse(cached));
            }
        };

        loadSheetData();
        const intervalId = setInterval(loadSheetData, 5 * 60 * 1000);

        const unsubscribeFirebase = onSnapshot(collection(db, 'services'), (snapshot) => {
            if (!snapshot.empty) {
                const fbData: Record<string, LiveStatus> = {};
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.liveStatus) {
                        fbData[doc.id] = {
                            id: doc.id,
                            status: data.liveStatus.isOpen ? 'Open' : 'Closed',
                            urgency: data.liveStatus.capacity === 'Low' ? 'High' : 'Normal',
                            message: data.liveStatus.message || '',
                            lastUpdated: data.liveStatus.lastUpdated
                        };
                    }
                });
                setFirebaseStatus(fbData);
            }
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log(err)
            );
        }

        const handleStatus = () => setIsOffline(!navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);

        // [FIX] Throttled Scroll Listener
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const shouldShow = window.scrollY > 300;
                    setShowScrollTop(prev => prev !== shouldShow ? shouldShow : prev);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            clearInterval(intervalId);
            unsubscribeFirebase();
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (view !== 'map') {
            setMapFocus(null);
        }
    }, [view]);

    useEffect(() => {
        setVisibleCount(10);
    }, [filters, searchQuery, smartFilters]);

    // [FIX] Infinite Scroll with stable observer
    useEffect(() => {
        if (view !== 'list' || !loadMoreRef.current) return;
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => prev + 10);
            }
        }, { threshold: 0.1, rootMargin: '100px' });
        
        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [view, searchQuery, filters, smartFilters]);

    // [UPDATED] FAQ Navigation Handler
    const handleFAQNavigate = (action: string) => {
        if (action === 'planner') { setView('planner'); return; }
        if (action === 'map') { setView('map'); return; }
        if (action === 'list') { setView('list'); return; }
        if (['food', 'support', 'warmth', 'shelter', 'family'].includes(action)) { setFilters({ ...filters, category: action }); setView('map'); return; }
        if (action === 'no_referral') { setSearchQuery('no_referral'); setView('list'); return; }
        if (action === 'all') { setFilters({ area: 'All', category: 'all', date: 'today' }); setSearchQuery(''); setView('list'); return; }
    };

    // Notifications Logic
    useEffect(() => {
        const checkForNotifications = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            const newNotifications: Array<{ id: string; type: 'opening_soon' | 'favorite' | 'weather' | 'info'; message: string; timestamp: number; resourceId?: string }> = [];

            savedIds.forEach(id => {
                const resource = ALL_DATA.find(r => r.id === id);
                if (!resource) return;

                const status = checkStatus(resource.schedule);
                const daySchedule = resource.schedule[now.getDay()];

                if (daySchedule && daySchedule !== 'Closed') {
                    const match = daySchedule.match(/(\d+):(\d+)/);
                    if (match) {
                        const [_, h, m] = match;
                        const minutesUntilOpen = (parseInt(h) * 60 + parseInt(m)) - (currentHour * 60 + currentMinutes);
                        if (minutesUntilOpen > 0 && minutesUntilOpen <= 30 && status.status === 'closed') {
                            newNotifications.push({ id: `opening_${id}_${now.getTime()}`, type: 'opening_soon', message: `${resource.name} opens in ${minutesUntilOpen} minutes`, timestamp: now.getTime(), resourceId: id });
                        }
                    }
                }
            });

            if (currentHour >= 18 && now.getMonth() >= 10 && newNotifications.length === 0) {
                newNotifications.push({ id: `weather_${now.getTime()}`, type: 'weather', message: 'Cold evening ahead - Emergency shelter beds available tonight', timestamp: now.getTime() });
            }

            if (newNotifications.length > 0) {
                setNotifications(prev => {
                    const existing = prev.map(n => n.id);
                    const unique = newNotifications.filter(n => !existing.includes(n.id));
                    return [...prev, ...unique];
                });
            }
        };

        const interval = setInterval(checkForNotifications, 5 * 60 * 1000);
        checkForNotifications();

        return () => clearInterval(interval);
    }, [savedIds]);

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

    const handleSearch = (newFilters: any) => {
        setFilters(newFilters);
        if (newFilters.category !== 'all' && view === 'home') {
            setView('map');
        }
    };

    // Data Merging & Search Logic
    const filteredData = useMemo(() => {
        let mergedData = ALL_DATA.map(item => {
            const status = liveStatus[item.id];
            if (status) {
                return { 
                    ...item, 
                    description: status.message ? `[${status.status}] ${status.message}` : item.description,
                    capacityLevel: status.urgency === 'High' || status.urgency === 'Critical' ? 'low' : 'high', 
                };
            }
            return item;
        });

        if (searchQuery) {
            const fuse = new Fuse(mergedData, {
                keys: [
                    { name: 'name', weight: 0.4 },
                    { name: 'tags', weight: 0.3 },
                    { name: 'description', weight: 0.2 },
                    { name: 'category', weight: 0.1 }
                ],
                threshold: 0.3,
                ignoreLocation: true
            });
            mergedData = fuse.search(searchQuery).map(result => result.item);
        }

        const data = mergedData.filter(item => {
            const matchesArea = filters.area === 'All' || item.area === filters.area;
            const matchesCategory = filters.category === 'all' || item.category === filters.category;

            const status = checkStatus(item.schedule);
            const matchesOpenNow = !smartFilters.openNow || status.isOpen;
            const matchesVerified = !smartFilters.verified || (item.trustScore && item.trustScore > 90);

            let matchesNearMe = true;
            if (smartFilters.nearMe && userLocation) {
                const dist = getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
                matchesNearMe = dist < 2;
            }

            return matchesArea && matchesCategory && matchesOpenNow && matchesVerified && matchesNearMe;
        });

        return data.sort((a, b) => {
            const urgencyA = liveStatus[a.id]?.urgency === 'High' ? 1 : 0;
            const urgencyB = liveStatus[b.id]?.urgency === 'High' ? 1 : 0;
            if (urgencyA !== urgencyB) return urgencyB - urgencyA;

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
    }, [filters, userLocation, searchQuery, smartFilters, liveStatus]);

    if (loading) return <PageLoader />;
    if (showPrint) return <Suspense fallback={<PageLoader />}><PrintView data={ALL_DATA} onClose={() => setShowPrint(false)} /></Suspense>;

    return (
        <div className={`app-container min-h-screen font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 ${highContrast ? 'high-contrast' : ''}`}>
            
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-24 right-5 z-[5000] p-4 bg-slate-900 text-white rounded-full shadow-2xl animate-fade-in-up hover:bg-black transition-all active:scale-90"
                    aria-label="Scroll to top"
                >
                    <Icon name="arrow-right" size={20} className="-rotate-90" />
                </button>
            )}

            <header className={`sticky top-0 z-50 ${stealthMode ? 'bg-slate-50 border-none' : 'bg-white/95 backdrop-blur-md border-b border-slate-100'} pt-4 pb-3 transition-all`}>
                <div className="px-5 flex justify-between items-center max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className={`w-10 h-10 transition-all ${stealthMode ? 'grayscale opacity-50' : ''}`} />
                        <div>
                            <h1 className={`text-xl font-black ${stealthMode ? 'text-slate-400' : 'text-slate-900'} tracking-tighter leading-none mb-1`}>
                                {stealthMode ? 'Safe Compass' : 'Portsmouth Bridge'}
                            </h1>
                            {!stealthMode && <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Community Support Network</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* Font Size Toggle Button */}
                        <button 
                            onClick={() => setFontSize(prev => (prev + 1) % 3)} 
                            className={`p-2 rounded-xl transition-all border-2 ${fontSize > 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-600 border-slate-100 hover:bg-slate-200'}`} 
                            title="Text Size"
                        >
                            <Icon name="type" size={20} />
                        </button>
                        
                        <button onClick={() => setStealthMode(!stealthMode)} className={`p-2 rounded-xl transition-all ${stealthMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`} title="Stealth Mode"><Icon name="eye" size={20} /></button>
                        <button onClick={() => setHighContrast(!highContrast)} className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors" title="High Contrast"><Icon name="zap" size={20} /></button>

                        {isPartner && (
                            <>
                                <button
                                    onClick={() => setView(view === 'partner-dashboard' ? 'home' : 'partner-dashboard')}
                                    className={`p-2 rounded-xl transition-all ${view === 'partner-dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-emerald-50 text-emerald-600'}`}
                                    title="Agency Dashboard"
                                >
                                    <Icon name="briefcase" size={20} />
                                </button>
                                <button
                                    onClick={() => setView(view === 'analytics' ? 'home' : 'analytics')}
                                    className={`p-2 rounded-xl transition-all ${view === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600'}`}
                                    title="Analytics Pulse"
                                >
                                    <Icon name="activity" size={20} />
                                </button>
                                <button
                                    onClick={() => setView(view === 'data-migration' ? 'home' : 'data-migration')}
                                    className={`p-2 rounded-xl transition-all ${view === 'data-migration' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600'}`}
                                    title="Data Migration"
                                >
                                    <Icon name="database" size={20} />
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setShowPartnerLogin(true)}
                            className={`p-2 rounded-xl transition-all ${currentUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                            title="Partner Access"
                        >
                            <Icon name="users" size={20} />
                        </button>
                    </div>
                </div>
                {isOffline && <div className="bg-amber-50 text-amber-700 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-center border-b border-amber-100 animate-pulse">Offline Support Active</div>}
                {isPartner && <div className="bg-indigo-600 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest text-center border-b border-indigo-700 animate-pulse">Agency Partner Mode Active</div>}
            </header>

            <AIAssistant onIntent={handleSearch} currentArea={filters.area} />

            <div className={`px-5 mt-4 relative z-20 transition-all ${stealthMode ? 'opacity-90 grayscale-[0.3]' : ''}`}>

                {view === 'home' && (
                    <div className="animate-fade-in-up">
                        {/* [UPDATE] New Content Logic for Sliding Cards */}
                        <CommunityBulletin onCTAClick={(id) => {
                            if (id === '1') { setMapFilter('open'); setView('map'); }
                            else if (id === '2') { setFilters({ ...filters, category: 'food' }); setView('map'); }
                            else if (id === '3') { setFilters({ ...filters, category: 'warmth' }); setView('map'); }
                            else if (id === '4') { setView('faq'); } // Go to Guide
                        }} />

                        {savedIds.length > 0 && (
                            <div className="mb-6">
                                <ProgressTimeline savedCount={savedIds.length} />
                            </div>
                        )}

                        <div className="mb-8 relative group">
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
                                    placeholder="Search resources..."
                                    className="flex-1 py-4 pl-12 pr-4 bg-white rounded-[24px] border-2 border-slate-100 focus:border-indigo-600 outline-none text-sm font-bold text-slate-900 transition-all shadow-sm"
                                />
                                <button
                                    onClick={handleShare}
                                    className="p-4 bg-white border-2 border-slate-100 rounded-[24px] text-indigo-600 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center active:scale-95"
                                >
                                    <Icon name="share-2" size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {[
                                { id: 'food', ...TAG_ICONS.food },
                                { id: 'shelter', ...TAG_ICONS.shelter },
                                { id: 'warmth', ...TAG_ICONS.warmth },
                                { id: 'support', ...TAG_ICONS.support },
                                { id: 'family', ...TAG_ICONS.family },
                                { id: 'skills', ...TAG_ICONS.skills },
                                { id: 'charity', ...TAG_ICONS.charity },
                                { id: 'faq', label: 'Guide', icon: 'help-circle' } // Help -> Guide
                            ].map(cat => (
                                <button
                                    key={cat.id || cat.label}
                                    onClick={() => {
                                        if (cat.id === 'faq') setView('faq');
                                        else handleSearch({ ...filters, category: cat.id || 'all' });
                                    }}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all group-active:scale-90 ${filters.category === cat.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border-2 border-slate-50 group-hover:border-indigo-100'}`}>
                                        <Icon name={cat.icon} size={20} />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight truncate w-full px-1">{cat.label.replace(' Support', '').replace(' Hub', '').replace(' Space', '')}</span>
                                </button>
                            ))}
                        </div>

                        {/* Find Help Now -> Find Support */}
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
                                        <h3 className="text-base font-black leading-none mb-1">Find Support</h3>
                                        <p className="text-[9px] font-bold text-rose-100 uppercase tracking-widest">Interactive Wizard</p>
                                    </div>
                                </div>
                                <Icon name="chevron-right" size={20} className="mr-2 text-rose-100" />
                            </div>
                        </button>

                        <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
                            <button onClick={() => setView('planner')} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-indigo-200 transition-all text-left group">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon name="calendar" size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800">My Journey</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{savedIds.length} Trusted Hubs</p>
                                </div>
                            </button>

                            <button onClick={() => setView('community-plan')} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-emerald-200 transition-all text-left group">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon name="utensils" size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800">Food Plan</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Food & Pantries</p>
                                </div>
                            </button>

                            <button onClick={() => setView('safe-sleep-plan')} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-indigo-200 transition-all text-left group">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon name="home" size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800">Sleep Plan</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Housing Support</p>
                                </div>
                            </button>

                            <button onClick={() => setView('warm-spaces-plan')} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-orange-200 transition-all text-left group">
                                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon name="flame" size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800">Warm Hubs</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Safe Warm Spaces</p>
                                </div>
                            </button>
                        </div>

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                            <div className="p-6 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 transition-colors"></div>
                                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                    <Icon name="tag" size={14} /> Portsmouth Market Deals
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    {COMMUNITY_DEALS.map((deal: any) => (
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
                                    {GIFT_EXCHANGE.map((gift: any) => (
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

                {view === 'faq' && (
                    <FAQSection onClose={() => setView('home')} onNavigate={handleFAQNavigate} />
                )}
                
                {view === 'community-plan' && <Suspense fallback={<PageLoader />}><UnifiedSchedule category="food" title="Weekly Food Support" data={ALL_DATA} onNavigate={(id) => { const item = ALL_DATA.find(i => i.id === id); if (item) { setMapFocus({ lat: item.lat, lng: item.lng, label: item.name, id: item.id }); setView('map'); } }} onSave={toggleSaved} savedIds={savedIds} /></Suspense>}
                {view === 'safe-sleep-plan' && <Suspense fallback={<PageLoader />}><UnifiedSchedule category="shelter" title="Safe Sleep" data={ALL_DATA} onNavigate={(id) => { const item = ALL_DATA.find(i => i.id === id); if (item) { setMapFocus({ lat: item.lat, lng: item.lng, label: item.name, id: item.id }); setView('map'); } }} onSave={toggleSaved} savedIds={savedIds} /></Suspense>}
                {view === 'warm-spaces-plan' && <Suspense fallback={<PageLoader />}><UnifiedSchedule category="warmth" title="Warm Spaces" data={ALL_DATA} onNavigate={(id) => { const item = ALL_DATA.find(i => i.id === id); if (item) { setMapFocus({ lat: item.lat, lng: item.lng, label: item.name, id: item.id }); setView('map'); } }} onSave={toggleSaved} savedIds={savedIds} /></Suspense>}
                {view === 'partner-dashboard' && <Suspense fallback={<PageLoader />}><PartnerDashboard /></Suspense>}
                {view === 'analytics' && <Suspense fallback={<PageLoader />}><PulseMap /></Suspense>}
                {view === 'data-migration' && <Suspense fallback={<PageLoader />}><DataMigration /></Suspense>}
                
                {view === 'planner' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-6 flex items-center justify-between">
                            <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Journey Planner</h2></div>
                            <button onClick={() => setView('home')} className="p-3 bg-slate-100 rounded-2xl"><Icon name="x" size={20} /></button>
                        </div>
                        <Suspense fallback={<PageLoader />}>
                            <AreaScheduleView data={ALL_DATA.filter(item => savedIds.includes(item.id))} area={filters.area} category={filters.category} />
                        </Suspense>
                    </div>
                )}
                
                {view === 'compare' && (
                    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setView('home')}>
                        <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                            <Suspense fallback={<PageLoader />}>
                                <SmartCompare items={ALL_DATA.filter(i => compareItems.includes(i.id))} userLocation={userLocation} onRemove={toggleCompareItem} onNavigate={(id) => { const resource = ALL_DATA.find(r => r.id === id); if (resource) { window.open(`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`, '_blank'); } }} onCall={(phone) => window.open(`tel:${phone}`)} />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* List View */}
                {view === 'list' && (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{filters.category === 'all' ? 'Directory' : filters.category}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finding the right support</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setView('community-plan')} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all"><Icon name="calendar" size={20} /></button>
                                <button onClick={() => setView('map')} className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"><Icon name="mapPin" size={20} /></button>
                                <button onClick={() => setView('home')} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"><Icon name="home" size={20} /></button>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="space-y-4 mb-8">
                            <div className="relative">
                                <Icon name="search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search resources..." className="w-full py-4 pl-11 pr-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-600 outline-none text-xs font-bold" />
                                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"><Icon name="x" size={14} /></button>}
                            </div>
                            <div className="flex gap-2 items-center">
                                <button onClick={() => setSmartFilters({ ...smartFilters, openNow: !smartFilters.openNow })} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border ${smartFilters.openNow ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}><div className={`w-1.5 h-1.5 rounded-full ${smartFilters.openNow ? 'bg-white animate-pulse' : 'bg-emerald-500'}`}></div>Open Now</button>
                                <button onClick={() => setSmartFilters({ ...smartFilters, verified: !smartFilters.verified })} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border ${smartFilters.verified ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}><Icon name="check_circle" size={10} /> Verified</button>
                                <button onClick={() => setSmartFilters({ ...smartFilters, nearMe: !smartFilters.nearMe })} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border ${smartFilters.nearMe ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}><Icon name="navigation" size={10} /> Near Me</button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                <button onClick={() => setFilters({ ...filters, area: 'All' })} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${filters.area === 'All' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>Whole City</button>
                                {AREAS.map(area => (<button key={area} onClick={() => setFilters({ ...filters, area })} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${filters.area === area ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>{area}</button>))}
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {['all', 'food', 'shelter', 'warmth', 'support', 'family', 'learning', 'skills', 'charity'].map(cat => (<button key={cat} onClick={() => setFilters({ ...filters, category: cat })} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${filters.category === cat ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>{cat === 'all' ? 'All Needs' : cat}</button>))}
                            </div>
                            <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
                                {[{ label: 'No Referral', tag: 'no_referral', icon: 'check_circle' }, { label: 'Free', tag: 'free', icon: 'tag' }, { label: 'Membership', tag: 'membership', icon: 'id-card' }].map(f => (<button key={f.tag} onClick={() => setSearchQuery(searchQuery === f.tag ? '' : f.tag)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${searchQuery === f.tag ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}><Icon name={f.icon} size={12} />{f.label}</button>))}
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
                                    isPartner={isPartner}
                                    onTagClick={(tag) => setSearchQuery(tag)}
                                    onReport={() => setReportTarget({ name: item.name, id: item.id })}
                                />
                            ))}
                        </div>
                        {/* [CRITICAL FIX] Use stable ref from useRef, not inline function, to prevent infinite re-rendering loop */}
                        {visibleCount < filteredData.length && <div ref={loadMoreRef} className="h-20 flex items-center justify-center p-4 text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading more resources...</div>}
                    </div>
                )}

                {/* View: Map */}
                {view === 'map' && (
                    <div className="animate-fade-in-up pb-20">
                        <div className="mb-4 flex items-center justify-between">
                            <div><h2 className="text-xl font-black text-slate-800">Explorer</h2><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visual navigation</p></div>
                            <div className="flex gap-2">
                                <button onClick={() => setView('list')} className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"><Icon name="list" size={18} /></button>
                                <div className="flex gap-1">
                                    <button onClick={() => setMapFilter('open')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${mapFilter === 'open' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}>Open</button>
                                    <button onClick={() => setMapFilter('all')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${mapFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>All</button>
                                </div>
                            </div>
                        </div>
                        <Suspense fallback={<PageLoader />}>
                            <SimpleMap 
                                data={filteredData} 
                                category={filters.category} 
                                statusFilter={mapFilter} 
                                savedIds={savedIds} 
                                onToggleSave={toggleSaved} 
                                stealthMode={stealthMode} 
                                externalFocus={mapFocus} 
                                liveStatus={liveStatus} 
                                isPartner={isPartner} 
                                onReport={(item: any) => setReportTarget({ name: item.name, id: item.id })}
                                onCategoryChange={(cat: string) => { setFilters(prev => ({ ...prev, category: cat, area: 'All' })); setSearchQuery(''); }} 
                            />
                        </Suspense>
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[50] bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 border border-white/10 w-auto">
                <button onClick={() => setView('home')} className={`relative group ${view === 'home' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}><Icon name="home" size={24} />{view === 'home' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}</button>
                <button onClick={() => setView('map')} className={`relative group ${view === 'map' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}><Icon name="mapPin" size={24} />{view === 'map' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}</button>
                <button onClick={() => setView('list')} className={`relative group ${view === 'list' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}><Icon name="search" size={24} />{view === 'list' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}</button>
                <div className="w-px h-6 bg-white/20"></div>
                <button onClick={() => setShowCrisis(true)} className="text-rose-500 hover:text-rose-400 animate-pulse"><Icon name="lifebuoy" size={24} /></button>
            </div>

            {/* Modals & Overlays */}
            <TipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
            <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />
            <PrivacyShield onAccept={() => console.log('Privacy accepted')} />
            <SmartNotifications notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} onClearAll={() => setNotifications([])} onAction={(resourceId) => { const resource = ALL_DATA.find(r => r.id === resourceId); if (resource) { setMapFocus({ lat: resource.lat, lng: resource.lng, label: resource.name }); setView('map'); } }} />
            
            {showPartnerLogin && <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-slate-900/40 backdrop-blur-sm animate-fade-in"><div className="w-full max-w-md"><PartnerLogin onClose={() => setShowPartnerLogin(false)} onRequestAccess={() => { setShowPartnerLogin(false); setShowPartnerRequest(true); }} /></div></div>}
            
            <ReportModal isOpen={!!reportTarget} onClose={() => setReportTarget(null)} resourceName={reportTarget?.name || ''} resourceId={reportTarget?.id || ''} />
            <PartnerRequestModal isOpen={showPartnerRequest} onClose={() => setShowPartnerRequest(false)} />
            
            <TutorialModal 
                isOpen={showTutorial} 
                onClose={() => {
                    setShowTutorial(false);
                    localStorage.setItem('seen_tutorial', 'true');
                }} 
            />
            
            {showWizard && <Suspense fallback={<PageLoader />}><CrisisWizard userLocation={userLocation} onClose={() => setShowWizard(false)} savedIds={savedIds} onToggleSave={toggleSaved} /></Suspense>}
            
            {(journeyItems.length > 0 || compareItems.length > 0) && (
                <div className="fixed bottom-24 left-5 z-[50] flex flex-col gap-3">
                    {journeyItems.length > 0 && (<button onClick={() => setView('planner')} className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 relative"><Icon name="mapPin" size={20} /><div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"><span className="text-xs font-black">{journeyItems.length}</span></div></button>)}
                    {compareItems.length > 0 && (<button onClick={() => setView('compare')} className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 transition-all active:scale-95 relative"><Icon name="shield" size={20} /><div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center"><span className="text-xs font-black">{compareItems.length}</span></div></button>)}
                </div>
            )}

            {view === 'planner' && journeyItems.length > 0 && (<div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end" onClick={() => setView('home')}><div className="w-full max-w-lg mx-auto animate-slide-up" onClick={(e) => e.stopPropagation()}><Suspense fallback={<PageLoader />}><JourneyPlanner items={ALL_DATA.filter(r => journeyItems.includes(r.id))} userLocation={userLocation} onRemove={(id) => setJourneyItems(prev => prev.filter(i => i !== id))} onClear={() => { setJourneyItems([]); setView('home'); }} onNavigate={() => { if (journeyItems.length > 0) { const points = ALL_DATA.filter(r => journeyItems.includes(r.id)).map(r => `${r.lat},${r.lng}`).join('|'); window.open(`https://www.google.com/maps/dir/?api=1&destination=${points.split('|').pop()}&waypoints=${points}`, '_blank'); } }} /></Suspense></div></div>)}
        </div>
    );
};

export default App;