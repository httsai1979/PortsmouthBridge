import React, { Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';

const PartnerDashboard = lazy(() => import('../components/PartnerDashboard'));
const PulseMap = lazy(() => import('../components/PulseMap'));
const DataMigration = lazy(() => import('../components/DataMigration'));

const PartnerPortal = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const activeTab = location.pathname.split('/').pop() || 'dashboard';

    const tabs = [
        { id: 'dashboard', label: 'Agency Feed', icon: 'briefcase', component: PartnerDashboard },
        { id: 'analytics', label: 'Pulse Map', icon: 'activity', component: PulseMap },
        { id: 'migration', label: 'Data Lab', icon: 'database', component: DataMigration },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || PartnerDashboard;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <Icon name="home" size={20} />
                            </button>
                            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Partner Portal</h1>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-px">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => navigate(`/partner/${tab.id}`)}
                                className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon name={tab.icon as any} size={14} />
                                    {tab.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Suspense fallback={
                    <div className="flex items-center justify-center py-20 min-h-[50vh]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                }>
                    <ActiveComponent />
                </Suspense>
            </main>
        </div>
    );
};

export default PartnerPortal;
