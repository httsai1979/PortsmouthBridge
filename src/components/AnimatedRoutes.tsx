import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- COMPONENTS ---
import PageTransition from './PageTransition';

// --- PAGES ---
import Home from '../pages/Home';
import ResourceList from '../pages/ResourceList';
import MapExplorer from '../pages/MapExplorer';
import PompeyLoopPage from '../pages/PompeyLoopPage';
import ConnectPage from '../pages/ConnectPage';
import PartnerPortal from '../pages/PartnerPortal';
import PlanPage from '../pages/PlanPage';
import FAQPage from '../pages/FAQPage';
import MyJourneyPage from '../pages/MyJourneyPage';

interface AnimatedRoutesProps {
    dynamicData: any[];
    isPartner: boolean;
    liveStatus: any;
    setReportTarget: (target: any) => void;
    setShowWizard: (show: boolean) => void;
    setShowConnectCalculator: (show: boolean) => void;
    setMapFocus: (focus: any) => void;
    connectResult: any;
}

const AnimatedRoutes = ({
    dynamicData,
    isPartner,
    liveStatus,
    setReportTarget,
    setShowWizard,
    setShowConnectCalculator,
    setMapFocus,
    connectResult
}: AnimatedRoutesProps) => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                    <PageTransition>
                        <Home
                            onShowWizard={() => setShowWizard(true)}
                            onShowConnectCalculator={() => setShowConnectCalculator(true)}
                            onNavigateToMapFocus={setMapFocus}
                        />
                    </PageTransition>
                } />
                <Route path="/list" element={
                    <PageTransition>
                        <ResourceList data={dynamicData} isPartner={isPartner} onReport={setReportTarget} />
                    </PageTransition>
                } />
                <Route path="/map" element={
                    <PageTransition>
                        <MapExplorer data={dynamicData} liveStatus={liveStatus} isPartner={isPartner} onReport={setReportTarget} />
                    </PageTransition>
                } />
                <Route path="/loop" element={
                    <PageTransition>
                        <PompeyLoopPage />
                    </PageTransition>
                } />
                <Route path="/connect" element={
                    <PageTransition>
                        <ConnectPage connectResult={connectResult} onReset={() => setShowConnectCalculator(true)} onClose={() => { }} />
                    </PageTransition>
                } />
                <Route path="/faq" element={
                    <PageTransition>
                        <FAQPage />
                    </PageTransition>
                } />
                <Route path="/plan/:category" element={
                    <PageTransition>
                        <PlanPage data={dynamicData} />
                    </PageTransition>
                } />
                <Route path="/planner" element={
                    <PageTransition>
                        <MyJourneyPage data={dynamicData} />
                    </PageTransition>
                } />

                {/* Protected Partner Routes */}
                <Route path="/partner/*" element={
                    isPartner ? (
                        <PageTransition>
                            <PartnerPortal />
                        </PageTransition>
                    ) : <Navigate to="/" replace />
                } />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
