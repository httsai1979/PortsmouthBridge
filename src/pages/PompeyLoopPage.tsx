import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const PompeyLoopView = lazy(() => import('../components/PompeyLoop'));

const PompeyLoopPage = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-8 min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
                    >
                        <Icon name="chevron-left" size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight text-right uppercase">Community Loop</h2>
                    </div>
                </div>

                <Suspense fallback={
                    <div className="flex items-center justify-center py-20 min-h-[50vh]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                }>
                    <PompeyLoopView />
                </Suspense>
            </div>
        </div>
    );
};

export default PompeyLoopPage;
