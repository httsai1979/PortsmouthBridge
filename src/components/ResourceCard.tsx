import { useState } from 'react';
import Icon from './Icon';
import { checkStatus } from '../utils';
import type { Resource } from '../data';

interface ResourceCardProps {
    item: Resource;
    isSaved: boolean;
    onToggleSave: () => void;
}

const ResourceCard = ({ item, isSaved, onToggleSave }: ResourceCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const status = checkStatus(item.schedule);

    // Phase 9 & 10: Tactical Status Logic
    const getStatusColor = () => {
        if (status.status === 'open') return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
        if (status.status === 'closing') return 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]';
        return 'bg-slate-300';
    };

    return (
        <div className={`bg-white rounded-[32px] mb-4 shadow-sm border-2 transition-all duration-300 relative group overflow-hidden flex ${isSaved ? 'border-indigo-100 shadow-indigo-100/50' : 'border-slate-50 hover:border-slate-100'}`}>
            {/* Phase 9: Tactical Status Bar */}
            <div className={`w-3 shrink-0 ${getStatusColor()} transition-colors duration-500`} />

            <div className="flex-1 p-5">
                {isSaved && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest z-10">
                        My Bridge Pin
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${status.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {status.label}
                        </span>
                        {item.trustScore && item.trustScore > 90 && (
                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border-2 border-indigo-100 flex items-center gap-1">
                                <Icon name="check_circle" size={10} /> Verified
                            </span>
                        )}
                        <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border-slate-100">
                            {item.type}
                        </span>
                    </div>
                    <button
                        onClick={onToggleSave}
                        className={`p-3 rounded-2xl transition-all ${isSaved ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                    >
                        <Icon name={isSaved ? "star" : "plus"} size={20} />
                    </button>
                </div>

                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 tracking-tight pr-12">{item.name}</h3>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4">
                    <Icon name="mapPin" size={14} className="text-slate-400" /> {item.address}
                </div>

                <p className="text-sm text-slate-600 mb-5 leading-relaxed font-medium line-clamp-2">{item.description}</p>

                {/* Iconic Details (Phase 9: Tactical Clarity) */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                        <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                            <Icon name="clock" size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Today</p>
                            <p className={`text-[10px] font-black truncate ${status.status === 'open' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {item.schedule[new Date().getDay()] || 'Closed'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                        <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                            <Icon name="bus" size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transport</p>
                            <p className="text-[10px] font-black text-slate-700 truncate">{item.transport || 'Direct Only'}</p>
                        </div>
                    </div>
                </div>

                {expanded && (
                    <div className="bg-slate-50 p-5 rounded-2xl mb-6 animate-fade-in text-[10px] border border-slate-100 space-y-2">
                        <p className="font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Weekly Schedule</p>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                            <div key={d} className={`flex justify-between py-1 ${i === new Date().getDay() ? 'font-black text-indigo-600' : 'text-slate-500'}`}>
                                <span className="font-bold">{d}</span><span className="font-black uppercase tracking-tighter">{item.schedule[i] || 'Closed'}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${expanded ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 shadow-sm'}`}
                    >
                        {expanded ? 'Close' : 'Full Hours'}
                    </button>

                    {item.phone && (
                        <a
                            href={`tel:${item.phone}`}
                            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                        >
                            <Icon name="phone" size={14} /> Call
                        </a>
                    )}

                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200"
                    >
                        <Icon name="navigation" size={14} /> Go
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
