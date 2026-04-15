import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { checkStatus, getDistance } from '../utils';
import type { Resource } from '../data';
import { TAG_ICONS } from '../data';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContextBase';
import { useAppStore } from '../store/useAppStore';

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
    const { stealthMode, userLocation } = useAppStore();
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

    const status = checkStatus(item.schedule);
    
    // Calculate distance
    const distanceString = userLocation && item.lat && item.lng 
        ? getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng).toFixed(1) + ' miles away'
        : '';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`bg-white rounded-[32px] mb-6 shadow-xl shadow-slate-200/50 border overflow-hidden transition-all duration-300 relative group flex flex-col ${highContrast ? 'border-slate-900 border-[3px]' : isSaved ? 'ring-4 ring-indigo-50 border-indigo-200' : 'border-slate-100 hover:shadow-2xl'}`}
        >
            {/* Image Section - Blocked in Stealth Mode */}
            {!stealthMode && (
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
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
            )}

            <div className={`flex-1 p-6 relative ${stealthMode ? 'pt-8' : ''}`}>
                {/* Header: Name, Status, Distance (Always Visible) */}
                <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${status.status === 'open' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                                {status.label}
                            </span>
                            {distanceString && <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tight">{distanceString}</span>}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight">{item.name}</h3>
                    </div>
                    <button
                        onClick={onToggleSave}
                        className={`p-2 rounded-full transition-all ${isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-50'}`}
                    >
                        <Icon name={isSaved ? "star" : "plus"} size={20} />
                    </button>
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    {item.type.replace('Food Bank', 'Pantry').replace(' soup Kitchen', 'Meal')}
                </p>

                {/* Progressive Disclosure: View Details Toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${expanded
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50'
                    }`}
                >
                    {expanded ? 'Hide Details' : 'View Details & Access'} <Icon name={expanded ? "chevron-up" : "chevron-down"} size={12} />
                </button>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="mt-6 space-y-6 pt-6 border-t border-slate-100">
                                {/* Details Hidden from Main View */}
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                            <Icon name="mapPin" size={14} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Location</p>
                                            <p className="text-xs font-bold text-slate-700">{item.address}</p>
                                        </div>
                                    </div>

                                    {item.phone && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Icon name="phone" size={14} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Contact</p>
                                                <p className="text-xs font-bold text-slate-700">{item.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className={`text-sm leading-relaxed font-medium ${item.description.startsWith('[') ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                                    {item.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {item.tags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => onTagClick?.(tag)}
                                            className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100"
                                        >
                                            #{TAG_ICONS[tag]?.label || tag.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>

                                {/* Access Guide / Requirements */}
                                <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 text-indigo-400">Requirement Guide</h4>
                                    <p className="text-xs font-bold leading-relaxed mb-4">
                                        {item.eligibility === 'referral'
                                            ? " referral needed from HIVE, Citizens Advice, or a school worker."
                                            : "Direct access. No referral needed, just show up during opening hours."}
                                    </p>
                                    {item.entranceMeta?.idRequired && (
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                            <Icon name="info" size={16} className="text-amber-400" />
                                            <span className="text-[10px] font-black uppercase text-amber-400">Bring ID if possible</span>
                                        </div>
                                    )}
                                </div>

                                {/* Opening Hours */}
                                <div className="space-y-1 bg-slate-50/50 p-2 rounded-3xl border border-slate-100/50">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                                        <div key={d} className={`flex justify-between py-2 border-b border-slate-200/50 last:border-0 text-[10px] px-3 ${i === new Date().getDay() ? 'font-black text-indigo-800 bg-white rounded-2xl shadow-sm border-indigo-100 border' : 'text-slate-500 font-bold uppercase tracking-wide'}`}>
                                            <span>{d}</span><span>{item.schedule[i] || 'Closed'}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 shadow-lg shadow-indigo-100"
                                    >
                                        <Icon name="navigation" size={14} /> GPS Navigation
                                    </a>
                                    {onAddToJourney && (
                                        <button 
                                            onClick={onAddToJourney}
                                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 ${isInJourney ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}
                                        >
                                            <Icon name="mapPin" size={14} /> My Journey
                                        </button>
                                    )}
                                    {onAddToCompare && (
                                        <button 
                                            onClick={onAddToCompare}
                                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 ${isInCompare ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}
                                        >
                                            <Icon name="shield" size={14} /> Compare
                                        </button>
                                    )}
                                    {onReport && (
                                        <button 
                                            onClick={onReport}
                                            className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 bg-slate-100 text-slate-500"
                                        >
                                            <Icon name="alert-triangle" size={14} /> Report
                                        </button>
                                    )}
                                </div>

                                {isPartner && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full py-4 bg-white border-2 border-dashed border-indigo-200 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
                                    >
                                        <Icon name="edit" size={12} /> Edit Details (CMS)
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Partner Edit Modal logic... (Kept same as before but simplified for brevity) */}
            {isEditing && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditing(false)}>
                    <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative animate-scale-in" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsEditing(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"><Icon name="x" size={24} /></button>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Direct CMS Edit</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Editing: {item.name}</p>
                        <div className="space-y-4">
                            <textarea rows={3} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none text-sm font-bold" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold" value={editForm.tags.join(', ')} onChange={e => setEditForm({ ...editForm, tags: e.target.value.split(',').map(t => t.trim()) })} />
                            </div>
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
                                            lastEditedBy: currentUser.uid,
                                            lastEditedAt: serverTimestamp(),
                                            'liveStatus.lastUpdated': new Date().toISOString()
                                        });
                                        setIsEditing(false);
                                    } catch (err) { alert('Failed to save changes.'); } finally { setIsSaving(false); }
                                }}
                                disabled={isSaving}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
});

export default ResourceCard;