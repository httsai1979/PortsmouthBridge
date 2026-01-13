import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { checkStatus } from '../utils';
import type { Resource } from '../data';
import { TAG_ICONS } from '../data';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

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
    const { currentUser } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        description: item.description,
        phone: item.phone || '',
        tags: item.tags || [],
        schedule: item.schedule || {}
    });

    useEffect(() => {
        setEditForm({
            description: item.description,
            phone: item.phone || '',
            tags: item.tags || [],
            schedule: item.schedule || {}
        });
    }, [item]);

    // 使用統一的狀態檢查工具
    const status = checkStatus(item.schedule);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`bg-white rounded-[32px] mb-6 shadow-xl shadow-slate-200/50 border overflow-hidden transition-all duration-300 relative group flex flex-col ${highContrast ? 'border-slate-900 border-[3px]' : isSaved ? 'ring-4 ring-indigo-50 border-indigo-200' : 'border-slate-100 hover:shadow-2xl'}`}
        >
            <div className="h-40 relative bg-slate-100 overflow-hidden">
                {item.entranceMeta?.imageUrl ? (
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        src={item.entranceMeta.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br transition-all duration-500 ${item.category === 'food' ? 'from-emerald-400 via-emerald-500 to-teal-600' :
                            item.category === 'shelter' ? 'from-indigo-400 via-indigo-500 to-purple-600' :
                                item.category === 'warmth' ? 'from-orange-400 via-orange-500 to-red-500' :
                                    item.category === 'family' ? 'from-pink-400 via-pink-500 to-rose-500' :
                                        'from-slate-400 via-slate-500 to-slate-600'
                        }`}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <Icon name={item.category === 'food' ? 'utensils' : 'mapPin'} size={80} />
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {item.capacityLevel && (
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/30 shadow-2xl ${item.capacityLevel === 'high' ? 'bg-emerald-500/80 text-white' :
                                    item.capacityLevel === 'medium' ? 'bg-amber-400/80 text-slate-900' :
                                        'bg-rose-500/80 text-white'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full bg-current ${item.capacityLevel === 'low' ? 'animate-pulse' : ''}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                {item.capacityLevel === 'high' ? 'Good Stock' : item.capacityLevel === 'low' ? 'Urgent Need' : 'Stock OK'}
                            </span>
                        </motion.div>
                    </div>
                )}

                {isPartner && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="absolute top-4 left-4 z-40 bg-white/90 backdrop-blur-md text-indigo-600 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 hover:bg-white transition-all ring-1 ring-black/5 active:scale-95"
                    >
                        <Icon name="edit" size={12} /> Partner Edit
                    </button>
                )}

                {!isPartner && isSaved && (
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5"
                    >
                        <Icon name="star" size={12} /> Pinned
                    </motion.div>
                )}

                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 items-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-xl border border-white/20 ${status.status === 'open' ? 'bg-emerald-500/90 text-white' : 'bg-slate-900/90 text-white'}`}>
                        {status.label}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/10 text-white backdrop-blur-xl border border-white/20 shadow-xl">
                        {item.type.replace('Food Bank', 'Pantry').replace(' soup Kitchen', 'Meal')}
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

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
                                {/* Access Guide */}
                                <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/50 flex items-center gap-2">
                                        <Icon name="shield" size={12} className="text-indigo-400" /> Access Guide
                                    </h4>

                                    <div className="space-y-4 relative z-10">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                                                <Icon name={item.eligibility === 'referral' ? "file-text" : "check-circle"} size={18} />
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
                                            <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                                <Icon name="user-check" size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">ID Required</p>
                                                    <p className="text-[10px] text-white/50 font-medium leading-tight">Please bring a proof of address or a photo ID if possible.</p>
                                                </div>
                                            </div>
                                        )}

                                        {item.eligibility === 'referral' && (
                                            <button
                                                onClick={() => window.open('https://www.hiveportsmouth.org.uk/contact-us', '_blank')}
                                                className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
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
                                            className="text-[10px] font-black text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                                        >
                                            <Icon name="alert-triangle" size={12} />
                                            {isPartner ? 'Update Status' : 'Report Issue'}
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-1 bg-slate-50/50 p-2 rounded-3xl border border-slate-100/50">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                                        <div key={d} className={`flex justify-between py-2 border-b border-slate-200/50 last:border-0 text-[10px] px-3 ${i === new Date().getDay() ? 'font-black text-indigo-800 bg-white rounded-2xl shadow-sm border-indigo-100 border' : 'text-slate-500 font-bold uppercase tracking-wide'}`}>
                                            <span>{d}</span><span>{item.schedule[i] || 'Closed'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Partner Direct-Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditing(false)}>
                    <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative animate-scale-in" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <Icon name="x" size={24} />
                        </button>

                        <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Direct CMS Edit</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Editing: {item.name}</p>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Description</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                    <input
                                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                        value={editForm.phone}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tags (CSV)</label>
                                    <input
                                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                        value={editForm.tags.join(', ')}
                                        onChange={e => setEditForm({ ...editForm, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '') })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weekly Schedule</label>
                                <div className="grid grid-cols-1 gap-1">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                        <div key={day} className="flex items-center gap-2">
                                            <span className="w-8 text-[9px] font-bold text-slate-400 uppercase">{day}</span>
                                            <input
                                                className="flex-1 px-3 py-1.5 bg-slate-50 rounded-xl border border-transparent focus:border-indigo-500 outline-none text-[11px] font-bold transition-all"
                                                value={editForm.schedule[i] || ''}
                                                onChange={e => setEditForm({ ...editForm, schedule: { ...editForm.schedule, [i]: e.target.value } })}
                                                placeholder="e.g. 10:00-14:00"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!currentUser) return;
                                        setIsSaving(true);
                                        try {
                                            const serviceRef = doc(db, 'services', item.id);
                                            await updateDoc(serviceRef, {
                                                description: editForm.description,
                                                phone: editForm.phone,
                                                tags: editForm.tags,
                                                schedule: editForm.schedule,
                                                lastEditedBy: currentUser.uid,
                                                lastEditedAt: serverTimestamp(),
                                                'liveStatus.lastUpdated': new Date().toISOString()
                                            });
                                            setIsEditing(false);
                                        } catch (err) {
                                            console.error(err);
                                            alert('Failed to save changes.');
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }}
                                    disabled={isSaving}
                                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
});

export default ResourceCard;