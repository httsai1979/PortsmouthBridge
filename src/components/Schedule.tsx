import Icon from './Icon';
import type { Resource } from '../data';

export const CategoryButton = ({ label, icon, active, onClick, color }: { label: string; icon: string; active: boolean; onClick: () => void; color: string }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-6 rounded-[32px] transition-all duration-300 border-4 ${active
            ? 'bg-slate-900 border-slate-900 text-white scale-[0.98] shadow-inner shadow-black/20'
            : `${color.split(' ')[1]} border-white shadow-xl shadow-slate-200/50 hover:scale-[1.05] active:scale-95`
            }`}
    >
        <div className={`mb-3 p-3 rounded-2xl ${active ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
            <Icon name={icon} size={32} />
        </div>
        <span className={`text-[12px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-700'}`}>{label}</span>
    </button>
);

export const AreaScheduleView = ({ data, area, category }: { data: Resource[]; area: string; category: string }) => {
    const currentDayIdx = new Date().getDay();
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    const filteredData = data.filter(item => {
        const matchesArea = area === 'All' || item.area === area;
        const matchesCategory = category === 'all' || item.category === category;
        const hasSomeSchedule = Object.values(item.schedule).some((s: string) => s !== 'Closed');
        return matchesArea && matchesCategory && hasSomeSchedule;
    });

    if (filteredData.length === 0) {
        return (
            <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                <Icon name="search" size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="font-black text-slate-400 uppercase tracking-widest">No plans found in {area}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-24">
            <div className="flex items-center gap-3 px-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Today's Visual Timeline</h2>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-x-auto no-scrollbar">
                <div className="min-w-[600px]">
                    {/* Timeline Header */}
                    <div className="flex mb-4 pl-32 border-b border-slate-50 pb-2">
                        {hours.map(h => (
                            <div key={h} className="flex-1 text-center text-[10px] font-black text-slate-400">
                                {h > 12 ? `${h - 12}P` : `${h}A`}
                            </div>
                        ))}
                    </div>

                    {/* Timeline Rows */}
                    <div className="space-y-4">
                        {filteredPoints(filteredData, currentDayIdx).map(item => (
                            <div key={item.id} className="flex items-center group">
                                <div className="w-32 pr-4 shrink-0">
                                    <div className="text-[11px] font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{item.name}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{item.type}</div>
                                </div>
                                <div className="flex-1 h-3 bg-slate-50 rounded-full relative overflow-hidden flex">
                                    {renderTimeBlock(item.schedule[currentDayIdx], hours)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest italic">
                Swimlane view: Colored bars represent open hours
            </p>
        </div>
    );
};

// Helper to filter points for the current day view
const filteredPoints = (data: Resource[], dayIdx: number) => {
    return data.filter(i => i.schedule[dayIdx] !== 'Closed');
};

// Helper to parse time string and render visual block
const renderTimeBlock = (timeStr: string, timelineHours: number[]) => {
    if (timeStr === 'Closed') return null;

    // Rough parsing e.g. "9:00 - 17:00"
    const parts = timeStr.split(' - ');
    if (parts.length !== 2) return <div className="flex-1 bg-slate-200"></div>;

    const start = parseInt(parts[0].split(':')[0]);
    const end = parseInt(parts[1].split(':')[0]);

    return timelineHours.map(h => {
        const isOpen = h >= start && h < end;
        return (
            <div
                key={h}
                className={`flex-1 ${isOpen ? 'bg-emerald-500 border-x border-white/20' : ''}`}
            ></div>
        );
    });
};
