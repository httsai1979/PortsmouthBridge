import { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import { useAppStore } from './store/useAppStore';

// --- COMPONENTS ---
import Layout from './components/Layout';
import { TipsModal, CrisisModal, ReportModal, PartnerRequestModal, TutorialModal } from './components/Modals';
import PrivacyShield from './components/PrivacyShield';
import SmartNotifications from './components/SmartNotifications';
import PartnerLogin from './components/PartnerLogin';
import AnimatedRoutes from './components/AnimatedRoutes';
import MetaData from './components/MetaData';

// --- LAZY COMPONENTS ---
const CrisisWizard = lazy(() => import('./components/CrisisWizard'));
const ConnectCalculatorView = lazy(() => import('./components/ConnectCalculator'));

const PageLoader = () => (
    <div className="flex items-center justify-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
);

const App = () => {
    // --- GLOBAL STORES ---
    const { isPartner, loading: authLoading } = useAuth();
    const { data: dynamicData, loading: dataLoading } = useData();
    const {
        highContrast, fontSize, savedIds, userLocation,
        notifications, setUserLocation, toggleSavedId,
        clearNotifications
    } = useAppStore();

    // --- LOCAL UI STATE ---
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showTips, setShowTips] = useState(false);
    const [showCrisis, setShowCrisis] = useState(false);
    const [showPartnerLogin, setShowPartnerLogin] = useState(false);
    const [showPartnerRequest, setShowPartnerRequest] = useState(false);
    const [showTutorial, setShowTutorial] = useState(!localStorage.getItem('seen_tutorial'));
    const [showWizard, setShowWizard] = useState(false);
    const [reportTarget, setReportTarget] = useState<{ name: string, id: string } | null>(null);
    const [showConnectCalculator, setShowConnectCalculator] = useState(false);

    // Connect State
    const [connectResult, setConnectResult] = useState<any>(null);
    const [connectInput, setConnectInput] = useState<any>(null);

    // --- EFFECTS ---
    useEffect(() => {
        // Init Location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log('Location access denied', err)
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

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('fs-0', 'fs-1', 'fs-2');
        root.classList.add(`fs-${fontSize}`);
    }, [fontSize]);

    // --- HANDLERS ---
    const liveStatus = useMemo(() => {
        const statuses: Record<string, any> = {};
        dynamicData.forEach(item => {
            statuses[item.id] = {
                id: item.id,
                status: item.liveStatus.isOpen ? 'Open' : 'Closed',
                urgency: item.liveStatus.capacity === 'Full' ? 'High' : 'Normal',
                lastUpdated: item.liveStatus.lastUpdated
            };
        });
        return statuses;
    }, [dynamicData]);

    if (authLoading || dataLoading) return <PageLoader />;

    return (
        <Router>
            <MetaData />
            <div className={`selection:bg-indigo-200 selection:text-indigo-900 ${highContrast ? 'high-contrast' : ''}`}>
                <Layout
                    isOffline={isOffline}
                    onShowCrisis={() => setShowCrisis(true)}
                    onShowPartnerLogin={() => setShowPartnerLogin(true)}
                >
                    <AnimatedRoutes
                        dynamicData={dynamicData as any}
                        isPartner={isPartner}
                        liveStatus={liveStatus}
                        setReportTarget={setReportTarget}
                        setShowWizard={setShowWizard}
                        setShowConnectCalculator={setShowConnectCalculator}
                        connectResult={connectResult}
                    />
                </Layout>

                {/* --- GLOBAL MODALS --- */}
                <TipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
                <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />
                <PrivacyShield onAccept={() => { }} />
                <SmartNotifications
                    notifications={notifications}
                    onDismiss={() => { }}
                    onClearAll={clearNotifications}
                    onAction={() => { }}
                />

                {showPartnerLogin && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                        <div className="w-full max-w-md">
                            <PartnerLogin
                                onClose={() => setShowPartnerLogin(false)}
                                onRequestAccess={() => { setShowPartnerLogin(false); setShowPartnerRequest(true); }}
                            />
                        </div>
                    </div>
                )}

                <ReportModal isOpen={!!reportTarget} onClose={() => setReportTarget(null)} resourceName={reportTarget?.name || ''} resourceId={reportTarget?.id || ''} />
                <PartnerRequestModal isOpen={showPartnerRequest} onClose={() => setShowPartnerRequest(false)} />
                <TutorialModal isOpen={showTutorial} onClose={() => { setShowTutorial(false); localStorage.setItem('seen_tutorial', 'true'); }} />

                {showWizard && (
                    <Suspense fallback={<PageLoader />}>
                        <CrisisWizard data={dynamicData as any} userLocation={userLocation} onClose={() => setShowWizard(false)} savedIds={savedIds} onToggleSave={toggleSavedId} />
                    </Suspense>
                )}

                {showConnectCalculator && (
                    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
                        <div className="w-full max-w-lg">
                            <Suspense fallback={<PageLoader />}>
                                <ConnectCalculatorView
                                    initialData={connectInput}
                                    onComplete={(res, input) => {
                                        setConnectResult(res);
                                        setConnectInput(input);
                                        setShowConnectCalculator(false);
                                    }}
                                    onClose={() => setShowConnectCalculator(false)}
                                />
                            </Suspense>
                        </div>
                    </div>
                )}
            </div>
        </Router>
    );
};

export default App;