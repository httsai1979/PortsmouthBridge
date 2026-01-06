import { useState } from 'react';
import Icon from './Icon';
import { checkStatus } from '../utils';
import type { Resource } from '../data';

interface ResourceCardProps {
    item: Resource;
    isSaved: boolean;
    onToggleSave: () => void;
    highContrast?: boolean;
    onAddToJourney?: () => void;
    onAddToCompare?: () => void;
    isInJourney?: boolean;
    isInCompare?: boolean;
}

const ResourceCard = ({ item, isSaved, onToggleSave, highContrast, onAddToJourney, onAddToCompare, isInJourney, isInCompare }: ResourceCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const status = checkStatus(item.schedule);

    // Phase 9 & 10: Tactical Status Logic
    const getStatusColor = () => {
        if (status.status === 'open') return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
        if (status.status === 'closing') return 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]';
        return 'bg-slate-300';
    };

    return (
        <div className={`bg-white rounded-[32px] mb-4 shadow-sm border-2 transition-all duration-300 relative group overflow-hidden flex ${highContrast ? 'border-slate-900 border-[3px]' : isSaved ? 'border-indigo-100 shadow-indigo-100/50' : 'border-slate-50 hover:border-slate-100'}`}>
            {/* Phase 9: Tactical Status Bar */}
            <div className={`w-3 shrink-0 ${getStatusColor()} transition-colors duration-500`} />

            <div className="flex-1 p-5">
                {isSaved && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest z-10">
                        My Bridge Pin
                    </div>
                )}

                {/* PB: Traffic Light System (Capacity) */}
                {item.capacityLevel && (
                    <div className="absolute top-0 right-0 mt-8 mr-4 flex flex-col items-end gap-1 pointer-events-none opacity-80">
                        <div className={`w-3 h-3 rounded-full shadow-sm border border-white ${item.capacityLevel === 'high' ? 'bg-emerald-500' :
                                item.capacityLevel === 'medium' ? 'bg-amber-400' :
                                    item.capacityLevel === 'low' ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'
                            }`} />
                        <span className="text-[6px] font-black uppercase tracking-widest text-slate-400">
                            {item.capacityLevel === 'high' ? 'High Stock' : item.capacityLevel === 'low' ? 'Low Stock' : 'Stock OK'}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${status.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {status.label}
                        </span>
                        {/* PB: Dignity Design - Rename 'Food Bank' to 'Community Share' visually if needed, though mostly data driven. */}
                        <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border-slate-100">
                            {item.type.replace('Food Bank', 'Community Pantry').replace('Soup Kitchen', 'Community Meal')}
                        </span>

                        {/* PB: Transparency / Eligibility */}
                        {(item.eligibility === 'open' || item.tags.includes('no_referral')) && (
                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border-2 border-emerald-200 flex items-center gap-1">
                                <Icon name="check" size={10} /> Open Access
                            </span>
                        )}
                        {item.eligibility === 'referral' && (
                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border-2 border-amber-100 flex items-center gap-1">
                                <Icon name="file-text" size={10} /> Referral
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 tracking-tight pr-12">{item.name}</h3>
                    <button
                        onClick={onToggleSave}
                        className={`p-3 rounded-2xl transition-all ${isSaved ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                    >
                        <Icon name={isSaved ? "star" : "plus"} size={20} />
                    </button>
                </div>

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
                    {/* PB: Psychological Queue Indicator if available, else Transport */}
                    {item.entranceMeta?.queueStatus ? (
                        <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                            <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                                <Icon name="users" size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Queue Status</p>
                                <p className="text-[10px] font-black text-slate-700 capitalize truncate">{item.entranceMeta.queueStatus}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                            <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                                <Icon name="bus" size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transport</p>
                                <p className="text-[10px] font-black text-slate-700 truncate">{item.transport || 'Direct Only'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {expanded && (
                    <div className="bg-slate-50 p-5 rounded-2xl mb-6 animate-fade-in text-[10px] border border-slate-100 space-y-4">
                        {/* PB: Psychological Visibility - Entrance Photo */}
                        {item.entranceMeta?.imageUrl && (
                            <div className="rounded-xl overflow-hidden mb-4 border border-slate-200 relative aspect-video">
                                <img src={item.entranceMeta.imageUrl} alt="Entrance View" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-[8px] font-black uppercase tracking-widest backdrop-blur-sm">
                                    Entrance View • Visual Guide
                                </div>
                            </div>
                        )}

                        {/* PB: Threshold Transparency - ID / Doc Requirements */}
                        <div className="flex gap-2 mb-2">
                            {item.entranceMeta?.idRequired ? (
                                <span className="flex-1 bg-amber-100 text-amber-800 p-2 rounded-lg text-center font-bold">🆔 ID Required</span>
                            ) : (
                                <span className="flex-1 bg-emerald-100 text-emerald-800 p-2 rounded-lg text-center font-bold">✅ No ID Needed</span>
                            )}
                            {item.entranceMeta?.isWheelchairAccessible && (
                                <span className="flex-1 bg-blue-100 text-blue-800 p-2 rounded-lg text-center font-bold">♿ Accessible</span>
                            )}
                        </div>

                        <div>
                            <p className="font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Weekly Schedule</p>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                                <div key={d} className={`flex justify-between py-1 ${i === new Date().getDay() ? 'font-black text-indigo-600' : 'text-slate-500'}`}>
                                    <span className="font-bold">{d}</span><span className="font-black uppercase tracking-tighter">{item.schedule[i] || 'Closed'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="space-y-3">
                    {/* Action Buttons Row */}
                    <div className="flex gap-2">
                        {onAddToJourney && (
                            <button
                                onClick={onAddToJourney}
                                className={`flex-1 py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider shadow-md ${isInJourney
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-200'
                                    : 'bg-white border-2 border-indigo-100 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50'
                                    }`}
                                title={isInJourney ? "Remove from Journey" : "Add to Journey"}
                            >
                                <Icon name="mapPin" size={16} />
                                <span>{isInJourney ? 'IN ROUTE' : 'JOURNEY'}</span>
                            </button>
                        )}
                        {onAddToCompare && (
                            <button
                                onClick={onAddToCompare}
                                className={`flex-1 py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider shadow-md ${isInCompare
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-200'
                                    : 'bg-white border-2 border-emerald-100 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                title={isInCompare ? "Remove from Compare" : "Add to Compare"}
                            >
                                <Icon name="shield" size={16} />
                                <span>{isInCompare ? 'COMPARING' : 'COMPARE'}</span>
                            </button>
                        )}
                        <button
                            onClick={onToggleSave}
                            className={`p-3 rounded-2xl transition-all active:scale-95 shadow-md ${isSaved
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-200'
                                : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                            title={isSaved ? "Unpin" : "Pin"}
                        >
                            <Icon name="star" size={18} />
                        </button>
                    </div>

                    {/* Traditional Action Buttons Row */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${expanded
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 shadow-sm'
                                }`}
                        >
                            {expanded ? 'Close' : 'Full Hours'}
                        </button>

                        {item.phone && (
                            <a
                                href={`tel:${item.phone}`}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                            >
                                <Icon name="phone" size={14} /> Call
                            </a>
                        )}

                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                        >
                            <Icon name="navigation" size={14} /> Navigate
                        </a>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ResourceCard;
