
import { useMemo } from 'react';
import Icon from './Icon';
import type { Resource } from '../data';

interface FoodScheduleProps {
    data: Resource[];
    onNavigate: (id: string) => void;
    onSave: (id: string) => void;
    savedIds: string[];
}

const FoodSchedule = ({ data, onNavigate, onSave, savedIds }: FoodScheduleProps) => {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const DAY_INDICES = [1, 2, 3, 4, 5, 6, 0]; // Mapping visual days to JS Date.getDay() (0=Sun)

    const processedSchedule = useMemo(() => {
        const scheduleByDay: Record<number, Array<{ resource: Resource, time: string, start: number }>> = {};

        // Filter only FOOD items
        const foodItems = data.filter(d => d.category === 'food');

        DAY_INDICES.forEach(dayIndex => {
            scheduleByDay[dayIndex] = [];
            foodItems.forEach(item => {
                const hours = item.schedule[dayIndex];
                if (hours && hours !== 'Closed') {
                    // Normalize time for sorting
                    const startH = parseInt(hours.split(':')[0]);
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
    }, [data]);

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border-2 border-slate-100 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <Icon name="calendar" size={20} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">Weekly Food Calendar</h3>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Plan your meals & pantry visits</p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-6 justify-center">
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">Free / Hot Meal</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-[9px] font-black uppercase text-orange-800 tracking-wider">Pantry (Membership)</span>
                </div>
            </div>

            <div className="space-y-6 relative">
                {/* Main Vertical Timeline Line */}
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100 z-0"></div>

                {DAYS.map((dayName, index) => {
                    const dayIndex = DAY_INDICES[index];
                    const items = processedSchedule[dayIndex] || [];
                    const today = new Date().getDay();
                    const isToday = dayIndex === today;

                    return (
                        <div key={dayIndex} className={`mb-8 relative ${isToday ? 'opacity-100' : 'opacity-80'}`}>
                            {/* Day Node */}
                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-4 transition-all ${isToday ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-200 scale-110' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    {dayName.substring(0, 3)}
                                </div>
                                <h4 className={`text-lg font-black tracking-tight ${isToday ? 'text-indigo-900' : 'text-slate-400'}`}>
                                    {dayName} {isToday && <span className="ml-2 text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full align-middle tracking-wider shadow-sm">TODAY</span>}
                                </h4>
                            </div>

                            <div className="pl-14 space-y-4">
                                {items.length > 0 ? (
                                    items.map(({ resource, time }) => {
                                        const isPantry = resource.type.toLowerCase().includes('pantry') || resource.tags.includes('membership');
                                        const isSaved = savedIds.includes(resource.id);

                                        return (
                                            <button
                                                key={resource.id}
                                                onClick={() => onNavigate(resource.id)}
                                                className={`w-full relative p-5 rounded-[24px] border-l-[6px] shadow-sm transition-all hover:scale-[1.02] hover:shadow-md bg-white text-left group ${isPantry
                                                    ? 'border-orange-400 shadow-orange-50'
                                                    : 'border-emerald-400 shadow-emerald-50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h5 className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{resource.name}</h5>
                                                            <Icon name="arrow-right" size={12} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" />
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${isPantry ? 'bg-orange-50 text-orange-800' : 'bg-emerald-50 text-emerald-800'
                                                                }`}>
                                                                {isPantry ? 'Membership' : 'Free / Meal'}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest self-center">
                                                                {resource.area}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); onSave(resource.id); }} className={`p-2 rounded-full hover:bg-slate-50 transition-colors ${isSaved ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}>
                                                            <Icon name="star" size={16} className={isSaved ? "fill-current" : ""} />
                                                        </button>
                                                        <div className="text-right">
                                                            <span className="block text-xs font-black text-slate-900">{time}</span>
                                                            {isPantry && <span className="text-[9px] font-bold text-orange-500 uppercase">£ Fees</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-slate-400 italic font-medium py-2 ml-1">No services scheduled.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FoodSchedule;
