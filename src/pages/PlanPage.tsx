import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAppStore } from '../store/useAppStore';
import { ServiceDocument } from '../types/schema';

const UnifiedSchedule = lazy(() => import('../components/UnifiedSchedule'));

interface PlanPageProps {
    data: ServiceDocument[];
}

const PlanPage = ({ data }: PlanPageProps) => {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const { savedIds, toggleSavedId } = useAppStore();

    const config: Record<string, { title: string, color: string, icon: string }> = {
        food: { title: 'Weekly Food Support', color: 'emerald', icon: 'utensils' },
        shelter: { title: 'Safe Sleep', color: 'indigo', icon: 'home' },
        warmth: { title: 'Warm Spaces', color: 'orange', icon: 'flame' },
    };

    const currentConfig = config[category || 'food'] || config.food;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600">
                        <Icon name="chevron-left" size={24} />
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">{currentConfig.title}</h1>
                    </div>
                    <div className="w-10"></div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-4">
                <Suspense fallback={
                    <div className="flex items-center justify-center py-20 min-h-[50vh]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                }>
                    <UnifiedSchedule
                        category={category as any}
                        title={currentConfig.title}
                        data={data as any}
                        onNavigate={(id) => {
                            const item = data.find(i => i.id === id);
                            if (item) {
                                navigate(`/map?lat=${item.location.lat}&lng=${item.location.lng}&label=${encodeURIComponent(item.name)}&id=${item.id}`);
                            }
                        }}
                        onSave={toggleSavedId}
                        savedIds={savedIds}
                    />
                </Suspense>
            </main>
        </div>
    );
};

export default PlanPage;
