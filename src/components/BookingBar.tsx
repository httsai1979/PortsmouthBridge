import { useState, useEffect } from 'react';
import Icon from './Icon';
import { getTagConfig } from '../utils';
import { AREAS, TAG_ICONS } from '../data';

interface Filters {
    area: string;
    category: string;
    date: string;
}

interface BookingBarProps {
    onSearch: (filters: Filters) => void;
    currentFilters: Filters;
}

const BookingBar = ({ onSearch, currentFilters }: BookingBarProps) => {
    const [active, setActive] = useState(false);
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters]);

    const handleApply = () => {
        onSearch(localFilters);
        setActive(false);
    };

    return (
        <>
            <div className={`sticky top-0 z-50 px-4 py-3 transition-all duration-300 ${active ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={() => setActive(true)}
                    className="w-full bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-200 p-3 flex items-center gap-3 active:scale-[0.98] transition-all"
                >
                    <div className="bg-slate-100 text-slate-600 p-2 rounded-full">
                        <Icon name="search" size={18} className="" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-slate-900">
                            {localFilters.area === 'All' ? 'Where to?' : localFilters.area}
                        </div>
                        <div className="text-xs text-slate-500">
                            {localFilters.category === 'all' ? 'Any Category' : localFilters.category} • {localFilters.date === 'today' ? 'Today' : localFilters.date === 'any' ? 'Anytime' : localFilters.date}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">
                        <Icon name="filter" size={14} className="text-slate-400" />
                    </div>
                </button>
            </div>

            {active && (
                <div className="fixed inset-0 z-[60] bg-slate-50/95 backdrop-blur-xl overflow-y-auto animate-fade-in-up">
                    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Search</h2>
                            <button
                                onClick={() => setActive(false)}
                                className="bg-slate-200 p-2 rounded-full hover:bg-slate-300 transition"
                            >
                                <Icon name="x" size={20} className="text-slate-600" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-8">
                            <section>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Area</label>
                                <div className="flex flex-wrap gap-2">
                                    {AREAS.map(a => (
                                        <button
                                            key={a}
                                            onClick={() => setLocalFilters({ ...localFilters, area: a })}
                                            className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-4 ${localFilters.area === a
                                                    ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-2xl shadow-slate-900/30'
                                                    : 'bg-white text-slate-500 border-white shadow-lg shadow-slate-200/50 hover:border-slate-200'
                                                }`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Category</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['food', 'shelter', 'warmth', 'support', 'family'].map(c => {
                                        const conf = getTagConfig(c, TAG_ICONS);
                                        const isSelected = localFilters.category === c;
                                        return (
                                            <button
                                                key={c}
                                                onClick={() => setLocalFilters({ ...localFilters, category: isSelected ? 'all' : c })}
                                                className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${isSelected
                                                    ? 'bg-slate-900 border-slate-900 shadow-lg shadow-slate-900/20'
                                                    : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <div className={`p-2 rounded-full ${isSelected ? 'bg-white/20 text-white' : `${conf.bg} ${conf.color}`}`}>
                                                    <Icon name={conf.icon} size={18} />
                                                </div>
                                                <span className={`text-sm font-bold capitalize ${isSelected ? 'text-white' : 'text-slate-700'}`}>{c}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            <section>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Time</label>
                                <div className="bg-white p-1 rounded-2xl border border-slate-200 flex">
                                    {['today', 'tomorrow', 'any'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setLocalFilters({ ...localFilters, date: d })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${localFilters.date === d ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-200 sticky bottom-0 bg-slate-50 pb-6">
                            <button
                                onClick={handleApply}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                            >
                                Show Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingBar;
