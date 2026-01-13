import { useMemo, useEffect } from 'react';
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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// [PERFORMANCE FIX] Move styles completely outside the component
// This prevents the browser from recalculating styles on every scroll frame
const SCHEDULE_STYLES = `
    .schedule-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 20px;
    }
    .day-column {
        min-width: 140px; /* Ensure columns don't get too squashed on mobile */
    }
    @media (max-width: 768px) {
        .schedule-grid {
            display: flex; /* On mobile, fallback to horizontal scroll if needed, but grid is preferred for tablet/desktop */
            flex-direction: column;
            gap: 24px;
        }
        .day-column {
            min-width: 100%;
        }
    }
    @media print {
        body * { visibility: hidden; }
        .schedule-view, .schedule-view * { visibility: visible; }
        .schedule-view { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        .schedule-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .day-column { border: 1px solid #ccc; break-inside: avoid; }
    }
`;

const UnifiedSchedule = ({ data, category, title, onNavigate, savedIds }: UnifiedScheduleProps) => {

    // [FIX] Inject styles once on mount
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = SCHEDULE_STYLES;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    // 整理一週資料：產生每天的開放清單
    const weeklyData = useMemo(() => {
        // Initialize 7 days
        const week = Array(7).fill(null).map(() => [] as Resource[]);

        data.forEach(item => {
            // Filter by category if provided
            if (category && item.category !== category) return;

            // Check schedule for each day
            for (let day = 0; day < 7; day++) {
                const hours = item.schedule[day];
                if (hours && hours !== 'Closed') {
                    week[day].push(item);
                }
            }
        });

        // Sort items by opening time within each day
        return week.map((dayItems, dayIndex) => {
            return dayItems.sort((a, b) => {
                const timeA = a.schedule[dayIndex] || "99:99";
                const timeB = b.schedule[dayIndex] || "99:99";
                return timeA.localeCompare(timeB);
            });
        });
    }, [data, category]);

    const todayIndex = new Date().getDay();

    return (
        <div className="bg-slate-50 min-h-screen pb-32 animate-fade-in-up schedule-view">
            {/* Header */}
            <div className="bg-white p-5 border-b border-slate-100 sticky top-0 z-20 shadow-sm no-print">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{title || "Weekly Overview"}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">7-Day Plan</p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2 active:scale-95"
                    >
                        <Icon name="printer" size={20} />
                        <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Print</span>
                    </button>
                </div>
            </div>

            {/* [NEW] Visual Calendar Grid */}
            <div className="p-4">
                <div className="schedule-grid">
                    {DAYS.map((dayName, index) => {
                        const isToday = index === todayIndex;
                        const items = weeklyData[index];

                        return (
                            <div key={dayName} className={`day-column flex flex-col gap-3 ${isToday ? 'order-first md:order-none' : ''}`}>
                                {/* Day Header */}
                                <div className={`p-3 rounded-xl text-center border-b-4 ${isToday ? 'bg-indigo-600 text-white border-indigo-800' : 'bg-white text-slate-500 border-slate-200'}`}>
                                    <h3 className="text-sm font-black uppercase tracking-wider">{dayName}</h3>
                                    {isToday && <span className="text-[9px] font-bold opacity-80 block mt-1">TODAY</span>}
                                </div>

                                {/* Items List */}
                                <div className="flex flex-col gap-2">
                                    {items.length > 0 ? (
                                        items.map(item => {
                                            const style = TAG_ICONS[item.category] || TAG_ICONS.default;
                                            const time = item.schedule[index];

                                            return (
                                                <div
                                                    key={`${item.id}-${index}`}
                                                    className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
                                                    onClick={() => onNavigate(item.id)}
                                                >
                                                    {/* Color Strip */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg.replace('bg-', 'bg-')}-500`}></div>

                                                    <div className="pl-2">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{time}</span>
                                                            {savedIds.includes(item.id) && <Icon name="heart" size={10} className="text-rose-500" />}
                                                        </div>

                                                        <h4 className="text-xs font-bold text-slate-800 leading-tight my-1 line-clamp-2">{item.name}</h4>

                                                        <div className="flex items-center gap-1 mt-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${style.bg.replace('bg-', 'bg-')}-500`}></div>
                                                            <span className="text-[9px] text-slate-500 truncate max-w-[80px]">{item.area}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase">None</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UnifiedSchedule;