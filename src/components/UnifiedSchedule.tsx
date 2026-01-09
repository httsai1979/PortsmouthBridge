import { useState, useMemo } from 'react';
import { Resource, TAG_ICONS } from '../data';
import Icon from './Icon';

interface UnifiedScheduleProps {
    data: Resource[];
    category?: string;
    title?: string;
    onNavigate: (id: string) => void;
    onSave: (id: string) => void;
    savedIds: string[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const UnifiedSchedule = ({ data, category, title, onNavigate, onSave, savedIds }: UnifiedScheduleProps) => {
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const [showPrintMode, setShowPrintMode] = useState(false);

    // 過濾並排序當天開放的機構
    const dailyResources = useMemo(() => {
        const filtered = data.filter(item => {
            const isOpenToday = item.schedule[selectedDay] && item.schedule[selectedDay] !== 'Closed';
            const matchesCategory = category ? item.category === category : true;
            return isOpenToday && matchesCategory;
        });

        // 依據開放時間排序 (簡單字串排序即可，例如 "09:00" < "10:00")
        return filtered.sort((a, b) => {
            const timeA = a.schedule[selectedDay] || "99:99";
            const timeB = b.schedule[selectedDay] || "99:99";
            return timeA.localeCompare(timeB);
        });
    }, [data, selectedDay, category]);

    return (
        <div className="bg-slate-50 min-h-screen pb-32 animate-fade-in-up">
            {/* Header */}
            <div className="bg-white p-5 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{title || "Weekly Schedule"}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan your visit</p>
                    </div>
                    {/* 列印/截圖按鈕 */}
                    <button 
                        onClick={() => window.print()}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2"
                        title="Print or Screenshot this view"
                    >
                        <Icon name="printer" size={20} />
                        <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Print / Save</span>
                    </button>
                </div>

                {/* Day Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {DAYS.map((day, index) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(index)}
                            className={`flex-shrink-0 px-5 py-3 rounded-2xl flex flex-col items-center min-w-[80px] transition-all border-2 ${
                                selectedDay === index 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-105' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                            }`}
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest">{day.substring(0, 3)}</span>
                            {/* 顯示當日開放數量小點 */}
                            <span className={`text-sm font-bold mt-1 ${selectedDay === index ? 'text-white' : 'text-slate-600'}`}>
                                {index === new Date().getDay() ? 'Today' : new Date().getDate() + (index - new Date().getDay())}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* List Content */}
            <div className="p-5 space-y-3">
                {dailyResources.length > 0 ? (
                    dailyResources.map(item => {
                        const style = TAG_ICONS[item.category] || TAG_ICONS.default;
                        const time = item.schedule[selectedDay];
                        const isSaved = savedIds.includes(item.id);

                        return (
                            <div key={item.id} className="bg-white rounded-[24px] p-5 border-2 border-slate-100 shadow-sm flex gap-4 items-start group hover:border-indigo-100 transition-all">
                                {/* Time Column */}
                                <div className="flex flex-col items-center min-w-[60px] pt-1">
                                    <span className="text-lg font-black text-slate-900 leading-none">{time?.split('-')[0]}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Opens</span>
                                    <div className="w-px h-full bg-slate-100 my-2"></div>
                                    <span className="text-xs font-bold text-slate-500">{time?.split('-')[1]}</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider mb-2 ${style.bg} ${style.color}`}>
                                            <Icon name={style.icon} size={10} /> {style.label}
                                        </div>
                                        {/* Save Button */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onSave(item.id); }}
                                            className={`transition-colors ${isSaved ? 'text-rose-500' : 'text-slate-300 hover:text-slate-400'}`}
                                        >
                                            <Icon name="heart" size={20} fill={isSaved} />
                                        </button>
                                    </div>
                                    
                                    <h3 className="text-base font-black text-slate-900 leading-tight mb-1">{item.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
                                        <Icon name="mapPin" size={12} />
                                        <span>{item.address}</span>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => onNavigate(item.id)}
                                            className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            View on Map
                                        </button>
                                        {item.no_referral && (
                                            <div className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center" title="No Referral Needed">
                                                <Icon name="check_circle" size={12} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="calendar-off" size={24} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">No services listed for this day.</p>
                        <p className="text-xs text-slate-400 mt-1">Try checking another day.</p>
                    </div>
                )}
            </div>

            {/* Print Styles Injection */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .animate-fade-in-up, .animate-fade-in-up * { visibility: visible; }
                    .animate-fade-in-up { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; }
                    button, .sticky, header, .fixed { display: none !important; }
                    .border-2 { border-width: 1px !important; border-color: #000 !important; }
                    .text-slate-400 { color: #666 !important; }
                    .bg-slate-50 { background: white !important; }
                }
            `}</style>
        </div>
    );
};

export default UnifiedSchedule;