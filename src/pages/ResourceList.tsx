import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import ResourceCard from '../components/ResourceCard';
import { AREAS } from '../data';
import { useAppStore } from '../store/useAppStore';
import { ServiceDocument } from '../types/schema';
import { useFilteredData } from '../hooks/useFilteredData';

interface ResourceListProps {
    data: ServiceDocument[];
    isPartner: boolean;
    onReport: (item: any) => void;
}

const ResourceList = ({ data, isPartner, onReport }: ResourceListProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { savedIds, toggleSavedId, highContrast, userLocation } = useAppStore();

    const [visibleCount, setVisibleCount] = useState(10);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const category = searchParams.get('category') || 'all';
    const area = searchParams.get('area') || 'All';
    const q = searchParams.get('q') || '';
    const openNow = searchParams.get('openNow') === 'true';
    const verified = searchParams.get('verified') === 'true';
    const nearMe = searchParams.get('nearMe') === 'true';

    const filteredData = useFilteredData(data, {
        category,
        area,
        q,
        openNow,
        verified,
        nearMe
    }, userLocation);

    useEffect(() => {
        setVisibleCount(10);
    }, [category, area, q, openNow, verified, nearMe]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + 10);
                }
            },
            { threshold: 1.0 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [data]);

    const updateFilters = (updates: Record<string, string | boolean | null>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === false || value === 'all' || value === 'All') {
                newParams.delete(key);
            } else {
                newParams.set(key, String(value));
            }
        });
        setSearchParams(newParams);
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
                        {category === 'all' ? 'Directory' : category}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finding the right support</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/map')} className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
                        <Icon name="mapPin" size={20} />
                    </button>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="relative">
                    <Icon name="search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => updateFilters({ q: e.target.value })}
                        placeholder="Search resources..."
                        className="w-full py-4 pl-11 pr-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-600 outline-none text-sm font-bold shadow-sm"
                    />
                    {q && (
                        <button onClick={() => updateFilters({ q: null })} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600">
                            <Icon name="x" size={14} />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 items-center overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => updateFilters({ openNow: !openNow })}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border whitespace-nowrap ${openNow ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${openNow ? 'bg-white animate-pulse' : 'bg-emerald-500'}`}></div>
                        Open Now
                    </button>
                    <button
                        onClick={() => updateFilters({ verified: !verified })}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border whitespace-nowrap ${verified ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                        <Icon name="check_circle" size={10} /> Verified
                    </button>
                    <button
                        onClick={() => updateFilters({ nearMe: !nearMe })}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border whitespace-nowrap ${nearMe ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                        <Icon name="navigation" size={10} /> Near Me
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <button
                        onClick={() => updateFilters({ area: 'All' })}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${area === 'All' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                        Whole City
                    </button>
                    {AREAS.map(a => (
                        <button
                            key={a}
                            onClick={() => updateFilters({ area: a })}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${area === a ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                        >
                            {a}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {['all', 'food', 'shelter', 'warmth', 'support', 'family', 'learning', 'skills', 'charity'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => updateFilters({ category: cat })}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${category === cat ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                        >
                            {cat === 'all' ? 'All Needs' : cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pb-24">
                {filteredData.slice(0, visibleCount).map(item => (
                    <ResourceCard
                        key={item.id}
                        item={item as any}
                        isSaved={savedIds.includes(item.id)}
                        onToggleSave={() => toggleSavedId(item.id)}
                        highContrast={highContrast}
                        isPartner={isPartner}
                        onTagClick={(tag) => updateFilters({ q: tag })}
                        onReport={() => onReport(item)}
                    />
                ))}
            </div>

            {visibleCount < filteredData.length && (
                <div ref={loadMoreRef} className="h-20 flex items-center justify-center p-4 text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">
                    Loading more resources...
                </div>
            )}
        </div>
    );
};

export default ResourceList;
