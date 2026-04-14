import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useDataSync } from './hooks/useDataSync';
import { useAppStore } from './store/useAppStore';
import { fetchLiveStatus } from './services/LiveStatusService';

// --- COMPONENTS ---
import Layout from './components/Layout';
import { TipsModal, CrisisModal, ReportModal, PartnerRequestModal, TutorialModal } from './components/Modals';
import PrivacyShield from './components/PrivacyShield';
import SmartNotifications from './components/SmartNotifications';
import PartnerLogin from './components/PartnerLogin';
import AnimatedRoutes from './components/AnimatedRoutes';
import MetaData from './components/MetaData';
import AIAssistant, { AIIntent } from './components/AIAssistant';
import Icon from './components/Icon';

// --- LAZY COMPONENTS ---
const CrisisWizard = lazy(() => import('./components/CrisisWizard'));
const ConnectCalculatorView = lazy(() => import('./components/ConnectCalculator'));

const PageLoader = () => (
    <div className="flex items-center justify-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
);

const AppContent = () => {
    const navigate = useNavigate();
    const { loading: authLoading } = useAuth();
    const {
        data: dynamicData,
        loading: dataLoading,
        setData,
        highContrast, fontSize, savedIds, userLocation,
        notifications, setUserLocation, toggleSavedId,
        clearNotifications,
        modals, setModal, reportTarget, setReportTarget,
        connectInput, setConnectInput, setConnectResult,
        stealthMode
    } = useAppStore();

    // Activate Data Sync (Firestore Layer)
    useDataSync();

    // --- EFFECTS ---
    useEffect(() => {
        // Init Location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => console.log('Location access denied')
            );
        }
    }, [setUserLocation]);

    // Live Status Polling (Sheets Layer)
    useEffect(() => {
        const pollLiveStatus = async () => {
            if (navigator.onLine) {
                const statuses = await fetchLiveStatus();
                if (Object.keys(statuses).length > 0) {
                    const patches: Partial<ServiceDocument>[] = Object.values(statuses).map(s => ({
                        id: s.id,
                        liveStatus: {
                            isOpen: s.status === 'Open' || s.status === 'Low Stock' || s.status === 'Busy',
                            capacity: s.status as any, // Cast temporarily to match broader ServiceDocument capacity
                            lastUpdated: s.lastUpdated || new Date().toISOString(),
                            message: s.message
                        }
                    }));
                    setData(patches);
                }
            }
        };

        pollLiveStatus();
        const interval = setInterval(pollLiveStatus, 15 * 60 * 1000); // 15 mins
        return () => clearInterval(interval);
    }, [setData]);

    const handleAIIntent = (intent: AIIntent) => {
        const params = new URLSearchParams();
        if (intent.category !== 'all') params.set('category', intent.category);
        if (intent.timeContext === 'now') params.set('openNow', 'true');

        navigate({
            pathname: '/list',
            search: params.toString()
        });
    };

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('fs-0', 'fs-1', 'fs-2');
        root.classList.add(`fs-${fontSize}`);
    }, [fontSize]);

    if (authLoading) return <PageLoader />;
    if (dataLoading && dynamicData.length === 0) return <PageLoader />;

    return (
        <div className={`selection:bg-indigo-200 selection:text-indigo-900 ${highContrast ? 'high-contrast' : ''}`}>
            <MetaData />


            <Layout
                onShowCrisis={() => setModal('crisis', true)}
                onShowPartnerLogin={() => setModal('partnerLogin', true)}
            >
                <AnimatedRoutes />
            </Layout>

            {/* AI Assistant - Floating Global Access */}
            <AIAssistant onIntent={handleAIIntent} />

            {/* Panic Button - Only in Stealth Mode */}
            {stealthMode && (
                <button
                    onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.replace('https://weather.com');
                    }}
                    className="fixed bottom-28 right-5 w-14 h-14 bg-rose-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white z-50 animate-bounce"
                    aria-label="Quick Exit"
                >
                    <Icon name="zap" size={24} />
                </button>
            )}

            {/* --- GLOBAL MODALS --- */}
            <TipsModal isOpen={modals.tips} onClose={() => setModal('tips', false)} />
            <CrisisModal isOpen={modals.crisis} onClose={() => setModal('crisis', false)} />
            <PrivacyShield onAccept={() => { }} />
            <SmartNotifications
                notifications={notifications}
                onDismiss={() => { }}
                onClearAll={clearNotifications}
                onAction={() => { }}
            />

            {modals.partnerLogin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-md">
                        <PartnerLogin
                            onClose={() => setModal('partnerLogin', false)}
                            onRequestAccess={() => { setModal('partnerLogin', false); setModal('partnerRequest', true); }}
                        />
                    </div>
                </div>
            )}

            <ReportModal
                isOpen={!!reportTarget}
                onClose={() => setReportTarget(null)}
                resourceName={reportTarget?.name || ''}
                resourceId={reportTarget?.id || ''}
            />

            <PartnerRequestModal isOpen={modals.partnerRequest} onClose={() => setModal('partnerRequest', false)} />

            <TutorialModal
                isOpen={modals.tutorial}
                onClose={() => { setModal('tutorial', false); localStorage.setItem('seen_tutorial', 'true'); }}
            />

            {modals.wizard && (
                <Suspense fallback={<PageLoader />}>
                    <CrisisWizard
                        data={dynamicData}
                        userLocation={userLocation}
                        onClose={() => setModal('wizard', false)}
                        savedIds={savedIds}
                        onToggleSave={toggleSavedId}
                    />
                </Suspense>
            )}

            {modals.connectCalculator && (
                <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
                    <div className="w-full max-w-lg">
                        <Suspense fallback={<PageLoader />}>
                            <ConnectCalculatorView
                                initialData={connectInput}
                                onComplete={(res, input) => {
                                    setConnectResult(res);
                                    setConnectInput(input);
                                    setModal('connectCalculator', false);
                                }}
                                onClose={() => setModal('connectCalculator', false)}
                            />
                        </Suspense>
                    </div>
                </div>
            )}
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;