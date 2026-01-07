
import { useMemo } from 'react';
import Icon from './Icon';
import type { Resource } from '../data';

interface UnifiedScheduleProps {
    data: Resource[];
    onNavigate: (id: string) => void;
    onSave: (id: string) => void;
    savedIds: string[];
    category?: string;
    title?: string;
    subtitle?: string;
}

const UnifiedSchedule = ({
    data,
    onNavigate,
    onSave,
    savedIds,
    category = 'food',
    title = 'Community Support Calendar',
    subtitle = 'Plan your visits and find support'
}: UnifiedScheduleProps) => {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const DAY_INDICES = [1, 2, 3, 4, 5, 6, 0]; // Mapping visual days to JS Date.getDay() (0=Sun)

    const processedSchedule = useMemo(() => {
        const scheduleByDay: Record<number, Array<{ resource: Resource, time: string, start: number }>> = {};

        // Filter items by category
        const items = data.filter(d => d.category === category);

        DAY_INDICES.forEach(dayIndex => {
            scheduleByDay[dayIndex] = [];
            items.forEach(item => {
                const hours = item.schedule[dayIndex];
                if (hours && hours !== 'Closed') {
                    // Try to normalize time for sorting
                    const match = hours.match(/(\d+):(\d+)/);
                    const startH = match ? parseInt(match[1]) : 99; // Fallback for "Variable" or other strings

                    scheduleByDay[dayIndex].push({
                        resource: item,
                        time: hours,
                        start: startH
                    });
                }
            });
            // Sort by start time
            scheduleByDay[dayIndex].sort((a, b) => a.start - b.start);
        });

        return scheduleByDay;
    }, [data, category]);

    const getCategoryConfig = (cat: string) => {
        switch (cat) {
            case 'food': return { icon: 'calendar', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-400' };
            case 'shelter': return { icon: 'home', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-400' };
            case 'warmth': return { icon: 'flame', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-400' };
            default: return { icon: 'info', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-400' };
        }
    };

    const config = getCategoryConfig(category);

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border-2 border-slate-100 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center`}>
                        <Icon name={config.icon} size={20} className={config.color} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{title}</h3>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 relative">
                {/* Main Vertical Timeline Line */}
                <div className="absolute left-[19px] top-6 bottom-6 w-px bg-slate-100 z-0"></div>

                {DAYS.map((dayName, index) => {
                    const dayIndex = DAY_INDICES[index];
                    const items = processedSchedule[dayIndex] || [];
                    const today = new Date().getDay();
                    const isToday = dayIndex === today;

                    return (
                        <div key={dayIndex} className={`mb-8 relative ${isToday ? 'opacity-100' : 'opacity-80'}`}>
                            {/* Day Node */}
                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 transition-all ${isToday ? 'bg-white border-slate-900 text-slate-900 shadow-lg scale-110' : 'bg-white border-slate-100 text-slate-300'}`}>
                                    {dayName.substring(0, 3)}
                                </div>
                                <h4 className={`text-lg font-black tracking-tight ${isToday ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {dayName} {isToday && <span className="ml-2 text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full align-middle tracking-wider shadow-sm">ACTIVE</span>}
                                </h4>
                            </div>

                            <div className="pl-14 space-y-4">
                                {items.length > 0 ? (
                                    items.map(({ resource, time }) => {
                                        const isRestricted = resource.requirements && resource.requirements !== 'None.';
                                        const isSaved = savedIds.includes(resource.id);

                                        return (
                                            <button
                                                key={resource.id}
                                                onClick={() => onNavigate(resource.id)}
                                                className={`w-full relative p-5 rounded-[24px] border border-slate-100 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md bg-white text-left group overflow-hidden`}
                                            >
                                                {/* Category Accent */}
                                                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${config.color.replace('text', 'bg')}`}></div>

                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h5 className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{resource.name}</h5>
                                                            <Icon name="arrow-right" size={12} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" />
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {isRestricted ? (
                                                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-100">
                                                                    Requirement
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                                                                    Open Access
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest self-center">
                                                                {resource.area}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div onClick={(e) => { e.stopPropagation(); onSave(resource.id); }} className={`p-2 rounded-full hover:bg-slate-50 transition-colors ${isSaved ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}>
                                                            <Icon name="star" size={16} className={isSaved ? "fill-current" : ""} />
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block text-xs font-black text-slate-900 tabular-nums">{time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-slate-300 italic font-medium py-2 ml-1">No community partners active today.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UnifiedSchedule;

