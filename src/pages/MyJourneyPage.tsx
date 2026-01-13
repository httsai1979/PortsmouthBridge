import { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAppStore } from '../store/useAppStore';
import { ServiceDocument } from '../types/schema';

const AreaScheduleView = lazy(() => import('../components/Schedule').then(module => ({ default: module.AreaScheduleView })));

interface MyJourneyPageProps {
    data: ServiceDocument[];
}

const MyJourneyPage = ({ data }: MyJourneyPageProps) => {
    const navigate = useNavigate();
    const { savedIds } = useAppStore();

    const savedResources = data.filter(item => savedIds.includes(item.id));

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600">
                        <Icon name="chevron-left" size={24} />
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">My Journey</h1>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{savedIds.length} Saved Hubs</p>
                    </div>
                    <div className="w-10"></div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-4 pt-8">
                {savedIds.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <Icon name="calendar" size={40} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Your Journey is Empty</h2>
                        <p className="text-slate-500 font-medium mb-8">Save resources to your journey to see your personalized schedule and map.</p>
                        <button
                            onClick={() => navigate('/list')}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
                        >
                            Browse Directory
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in-up">
                        <Suspense fallback={
                            <div className="flex items-center justify-center py-20 min-h-[50vh]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        }>
                            <AreaScheduleView data={savedResources} area="All" category="all" />
                        </Suspense>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyJourneyPage;
