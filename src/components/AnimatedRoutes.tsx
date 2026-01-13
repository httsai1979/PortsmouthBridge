import { useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- STORES & CONTEXTS ---
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useAppStore } from '../store/useAppStore';

// --- COMPONENTS ---
import PageTransition from './PageTransition';
import ProtectedRoute from './ProtectedRoute';

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

const AnimatedRoutes = () => {
    const location = useLocation();
    const { isPartner } = useAuth();
    const { data: dynamicData } = useData();
    const {
        setModal, setReportTarget, connectResult
    } = useAppStore();

    // Derived Status Mapping
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

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                    <PageTransition>
                        <Home />
                    </PageTransition>
                } />
                <Route path="/list" element={
                    <PageTransition>
                        <ResourceList
                            data={dynamicData}
                            isPartner={isPartner}
                            onReport={setReportTarget}
                        />
                    </PageTransition>
                } />
                <Route path="/map" element={
                    <PageTransition>
                        <MapExplorer />
                    </PageTransition>
                } />
                <Route path="/loop" element={
                    <PageTransition>
                        <PompeyLoopPage />
                    </PageTransition>
                } />
                <Route path="/connect" element={
                    <PageTransition>
                        <ConnectPage
                            connectResult={connectResult}
                            onReset={() => setModal('connectCalculator', true)}
                            onClose={() => { }}
                        />
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

                {/* Secure Partner Routes */}
                <Route path="/partner/*" element={
                    <ProtectedRoute requirePartner>
                        <PageTransition>
                            <PartnerPortal />
                        </PageTransition>
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
