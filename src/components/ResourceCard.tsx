import { useState, memo } from 'react';
import Icon from './Icon';
import { checkStatus } from '../utils';
import type { Resource } from '../data';
import { TAG_ICONS } from '../data';

interface ResourceCardProps {
    item: Resource;
    isSaved: boolean;
    onToggleSave: () => void;
    highContrast?: boolean;
    onAddToJourney?: () => void;
    onAddToCompare?: () => void;
    onTagClick?: (tag: string) => void;
    isInJourney?: boolean;
    isInCompare?: boolean;
    onReport?: () => void;
    isPartner?: boolean;
}

const ResourceCard = memo(({
    item,
    isSaved,
    onToggleSave,
    highContrast,
    onAddToJourney,
    onAddToCompare,
    onTagClick,
    isInJourney,
    isInCompare,
    onReport,
    isPartner
}: ResourceCardProps) => {
    const [expanded, setExpanded] = useState(false);

    // 使用統一的狀態檢查工具
    const status = checkStatus(item.schedule);

    return (
        <div className={`bg-white rounded-[32px] mb-6 shadow-xl shadow-slate-200/50 border overflow-hidden transition-all duration-300 relative group flex flex-col ${highContrast ? 'border-slate-900 border-[3px]' : isSaved ? 'ring-4 ring-indigo-50 border-indigo-200' : 'border-slate-100 hover:scale-[1.01] hover:shadow-2xl'}`}>
            {/* ... rest of the component remains same ... */}
            <div className="h-32 relative bg-slate-100 overflow-hidden">
                {item.entranceMeta?.imageUrl ? (
                    <img src={item.entranceMeta.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${item.category === 'food' ? 'from-emerald-400 to-teal-600' :
                        item.category === 'shelter' ? 'from-indigo-400 to-purple-600' :
                            item.category === 'warmth' ? 'from-orange-400 to-red-500' :
                                item.category === 'family' ? 'from-pink-400 to-rose-500' :
                                    'from-slate-400 to-slate-600'
                        } opacity-90`}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <Icon name={item.category === 'food' ? 'utensils' : 'mapPin'} size={64} />
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {item.capacityLevel && (
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-lg ${item.capacityLevel === 'high' ? 'bg-emerald-500/90 text-white' :
                            item.capacityLevel === 'medium' ? 'bg-amber-400/90 text-slate-900' :
                                'bg-rose-500/90 text-white animate-pulse'
                            }`}>
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                {item.capacityLevel === 'high' ? 'Good Stock' : item.capacityLevel === 'low' ? 'Urgent Need' : 'Stock OK'}
                            </span>
                        </div>
                    </div>
                )}

                {isSaved && (
                    <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <Icon name="star" size={12} /> Pinned
                    </div>
                )}

                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 items-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 ${status.status === 'open' ? 'bg-emerald-500 text-white' : 'bg-slate-800/80 text-white'}`}>
                        {status.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-lg">
                        {item.type.replace('Food Bank', 'Pantry').replace('Soup Kitchen', 'Meal')}
                    </span>
                </div>
            </div>

            <div className="flex-1 p-6 relative">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{item.name}</h3>
                    <button
                        onClick={onToggleSave}
                        className={`p-2 rounded-full transition-all ${isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-50'}`}
                    >
                        <Icon name={isSaved ? "star" : "plus"} size={24} />
                    </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4">
                    <Icon name="mapPin" size={14} className="text-slate-400" /> {item.address}
                </div>

                <p className={`text-sm mb-6 leading-relaxed font-medium line-clamp-2 ${item.description.startsWith('[') ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                    {item.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {(item.eligibility === 'open' || item.tags.includes('no_referral')) && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 cursor-default">
                            <Icon name="check" size={10} /> Open Access
                        </span>
                    )}
                    {item.tags.slice(0, 3).map(tag => (
                        <button
                            key={tag}
                            onClick={(e) => {
                                e.stopPropagation();
                                onTagClick?.(tag);
                            }}
                            className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors"
                        >
                            #{TAG_ICONS[tag]?.label || tag.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${expanded
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        {expanded ? 'Close Info' : 'View Details'} <Icon name={expanded ? "chevron-up" : "chevron-down"} size={12} />
                    </button>

                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200/50 active:scale-95"
                    >
                        <Icon name="navigation" size={14} /> Navigate
                    </a>
                </div>

                <div className="flex gap-2">
                    {item.phone && (
                        <a href={`tel:${item.phone}`} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center flex-1">
                            <Icon name="phone" size={18} />
                        </a>
                    )}
                    <button
                        onClick={async () => {
                            if (navigator.share) {
                                try {
                                    await navigator.share({
                                        title: item.name,
                                        text: item.description,
                                        url: window.location.href,
                                    });
                                } catch (err) { console.log('Error sharing:', err); }
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied to clipboard!');
                            }
                        }}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center flex-1"
                    >
                        <Icon name="share-2" size={18} />
                    </button>
                    {onAddToJourney && (
                        <button onClick={onAddToJourney} className={`p-3 rounded-xl transition-colors flex items-center justify-center flex-1 ${isInJourney ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                            <Icon name="mapPin" size={18} />
                        </button>
                    )}
                    {onAddToCompare && (
                        <button onClick={onAddToCompare} className={`p-3 rounded-xl transition-colors flex items-center justify-center flex-1 ${isInCompare ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                            <Icon name="shield" size={18} />
                        </button>
                    )}
                </div>

                {expanded && (
                    <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in space-y-6">
                        {/* Access Guide */}
                        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-xl"></div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/50 flex items-center gap-2">
                                <Icon name="shield" size={12} className="text-indigo-400" /> Access Guide
                            </h4>

                            <div className="space-y-4 relative z-10">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Icon name={item.eligibility === 'referral' ? "file-text" : "check-circle"} size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-wide">Requirement: {(item.eligibility || 'open').toUpperCase()}</p>
                                        <p className="text-[11px] text-white/60 font-medium leading-relaxed">
                                            {item.eligibility === 'referral'
                                                ? "You need a voucher or a referral from HIVE Portsmouth, Citizens Advice, or a school worker."
                                                : "Direct access available. No referral needed, just show up during opening hours."}
                                        </p>
                                    </div>
                                </div>

                                {item.entranceMeta?.idRequired && (
                                    <div className="flex gap-4 p-3 bg-white/5 rounded-2xl border border-white/10">
                                        <Icon name="user-check" size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">ID Required</p>
                                            <p className="text-[10px] text-white/50 font-medium leading-tight">Please bring a proof of address or a photo ID if possible.</p>
                                        </div>
                                    </div>
                                )}

                                {item.eligibility === 'referral' && (
                                    <button
                                        onClick={() => window.open('https://www.hiveportsmouth.org.uk/contact-us', '_blank')}
                                        className="w-full py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
                                    >
                                        Get Referral Help (HIVE)
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <p className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Opening Schedule</p>
                            {onReport && (
                                <button
                                    onClick={onReport}
                                    className="text-[10px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                                >
                                    <Icon name="alert-triangle" size={12} />
                                    {isPartner ? 'Update Status' : 'Report Issue'}
                                </button>
                            )}
                        </div>

                        <div className="space-y-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                                <div key={d} className={`flex justify-between py-1.5 border-b border-slate-50 last:border-0 text-[10px] px-1 ${i === new Date().getDay() ? 'font-black text-indigo-600 bg-indigo-50/50 rounded-lg' : 'text-slate-500 font-medium'}`}>
                                    <span>{d}</span><span>{item.schedule[i] || 'Closed'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default ResourceCard;