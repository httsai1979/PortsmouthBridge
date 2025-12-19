import Icon from './Icon';
import type { Resource } from '../data';
import { checkStatus } from '../utils';

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
    const nowHour = new Date().getHours();

    const filteredData = data.filter(item => {
        const matchesArea = area === 'All' || item.area === area;
        const matchesCategory = category === 'all' || item.category === category;
        const isOpenToday = item.schedule[currentDayIdx] !== 'Closed';
        return matchesArea && matchesCategory && isOpenToday;
    });

    // Sorting: Open now first, then by priority
    const sortedData = [...filteredData].sort((a, b) => {
        const aStatus = checkStatus(a.schedule).status;
        const bStatus = checkStatus(b.schedule).status;
        if (aStatus === 'open' && bStatus !== 'open') return -1;
        if (aStatus !== 'open' && bStatus === 'open') return 1;
        return 0;
    });

    if (sortedData.length === 0) {
        return (
            <div className="py-16 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100 px-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="search" size={32} className="text-slate-200" />
                </div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px] leading-relaxed">
                    No results for {category !== 'all' ? category : ''} in {area}<br />
                    Try changing your filters or pinning more items.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-24">
            <div className="flex items-center justify-between px-1 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">The Story of Today</h2>
                </div>
                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">
                    {nowHour}:00 Right Now
                </span>
            </div>

            <div className="relative pl-8 border-l-2 border-slate-100 space-y-8 ml-2">
                {sortedData.map(item => {
                    const status = checkStatus(item.schedule);
                    const isOpen = status.status === 'open';
                    return (
                        <div key={item.id} className="relative">
                            {/* The Timeline Dot */}
                            <div className={`absolute -left-[37px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-md transition-all ${isOpen ? 'bg-emerald-500 scale-125' : 'bg-slate-300'}`}></div>

                            <div className={`bg-white rounded-[28px] p-5 shadow-xl transition-all border-2 ${isOpen ? 'border-emerald-100 shadow-emerald-200/20' : 'border-white opacity-90 grayscale-[0.3]'}`}>
                                <div className="flex justify-between items-start mb-3 gap-2">
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 truncate">{item.type}</div>
                                        <h3 className="text-lg font-black text-slate-900 leading-tight truncate">{item.name}</h3>
                                    </div>
                                    <div className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${isOpen ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                        {item.schedule[currentDayIdx]}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                    <Icon name="mapPin" size={12} className="shrink-0" /> {item.address}
                                </div>

                                {isOpen && (
                                    <div className="mt-4 pt-4 border-t border-emerald-50 flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase">
                                        <Icon name="check_circle" size={12} /> You can visit right now
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest pt-8 pb-4 italic">
                Sorted by availability • Seeing is believing
            </p>
        </div>
    );
};
