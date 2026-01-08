import { useState } from 'react';
import Icon from './Icon';

export const ProgressTimeline = ({ savedCount }: { savedCount: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (savedCount === 0) return null;

    return (
        <div className="mb-6 mx-1">
            {/* 1. 收合狀態：只顯示最關鍵的資訊 (省空間) */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between active:scale-[0.98] transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
                        <Icon name="mapPin" size={20} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-black text-slate-900">
                            My Plan ({savedCount})
                        </p>
                        <p className="text-xs text-slate-500 font-bold">
                            {isExpanded ? 'Tap to close' : 'Tap to view your list'}
                        </p>
                    </div>
                </div>
                <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={20} className="text-slate-400" />
            </button>

            {/* 2. 展開狀態：才顯示詳細步驟 */}
            {isExpanded && (
                <div className="mt-2 p-5 bg-white rounded-2xl border border-slate-100 animate-fade-in-up">
                    <div className="space-y-4">
                        <div className={`flex gap-4 ${savedCount > 0 ? 'opacity-100' : 'opacity-50'}`}>
                            <Icon name="check_circle" className="text-emerald-500" />
                            <p className="text-xs font-bold text-slate-700">Find a resource</p>
                        </div>
                        <div className={`flex gap-4 ${savedCount >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                            <Icon name="check_circle" className={savedCount >= 3 ? "text-emerald-500" : "text-slate-300"} />
                            <p className="text-xs font-bold text-slate-700">Build a support network (3+)</p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 mt-2">
                             <p className="text-[10px] text-slate-400 leading-relaxed">
                                Tip: Use the "Journey Planner" button above to see the best route to visit these places.
                             </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressTimeline;