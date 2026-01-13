import { useEffect, Suspense, lazy } from 'react';
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
    const { loading: authLoading } = useAuth();
    const { data: dynamicData, loading: dataLoading } = useData();
    const {
        highContrast, fontSize, savedIds, userLocation,
        notifications, setUserLocation, toggleSavedId,
        clearNotifications, isOffline, setIsOffline,
        modals, setModal, reportTarget, setReportTarget,
        connectInput, setConnectInput, setConnectResult
    } = useAppStore();

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

    if (authLoading || dataLoading) return <PageLoader />;

    return (
        <Router>
            <MetaData />
            <div className={`selection:bg-indigo-200 selection:text-indigo-900 ${highContrast ? 'high-contrast' : ''}`}>
                <Layout
                    isOffline={isOffline}
                    onShowCrisis={() => setModal('crisis', true)}
                    onShowPartnerLogin={() => setModal('partnerLogin', true)}
                >
                    <AnimatedRoutes />
                </Layout>

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
                            data={dynamicData as any}
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
        </Router>
    );
};

export default App;