import { useState, useEffect } from 'react';
import Icon from './Icon';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface LoopItem {
    id: string;
    type: 'skill' | 'item';
    title: string;
    description: string;
    category: string;
    contact: string;
    userId: string;
    userName: string;
    timestamp: Timestamp | null;
}


const PompeyLoop = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'all' | 'skills' | 'items'>('all');
    const [posts, setPosts] = useState<LoopItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        type: 'skill' as 'skill' | 'item',
        title: '',
        description: '',
        category: '',
        contact: ''
    });

    // Real-time listener
    useEffect(() => {
        const q = query(collection(db, 'community_posts'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = Date.now();
            const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

            const items = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as LoopItem[];

            // Auto-Expiry Logic: Only show posts from the last 14 days
            const validItems = items.filter(item => {
                if (!item.timestamp) return true; // Assume true for fresh server-side timestamps
                return (now - item.timestamp.toMillis()) < fourteenDaysMs;
            });

            setPosts(validItems);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please sign in to post to the Loop.');
            return;
        }


        try {
            setIsSubmitting(true);
            await addDoc(collection(db, 'community_posts'), {
                ...formData,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
                timestamp: serverTimestamp()
            });
            setIsModalOpen(false);
            setFormData({ type: 'skill', title: '', description: '', category: '', contact: '' });
        } catch (error) {
            console.error('Error posting to Loop:', error);
            alert('Could not post your item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (ts: Timestamp | null) => {
        if (!ts) return 'Just now';
        const date = ts.toDate();
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    const [revealedContacts, setRevealedContacts] = useState<string[]>([]);

    const toggleContact = (id: string) => {
        if (revealedContacts.includes(id)) {
            setRevealedContacts(prev => prev.filter(i => i !== id));
        } else {
            setRevealedContacts(prev => [...prev, id]);
        }
    };

    const handleReport = (_id: string) => {
        alert('Thank you for your report. Our community moderators will review this post within 24 hours to ensure the Loop remains safe and dignified.');
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Section */}
            <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tighter mb-2">The Pompey Loop</h2>
                    <p className="text-xs font-bold text-white/50 leading-relaxed uppercase tracking-widest">Community-led exchange for skills and items. <br />Dignity preserved. No money needed.</p>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-8 flex items-center gap-3 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                        <Icon name="plus" size={18} /> Post to the Loop
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 px-1">
                {(['all', 'skills', 'items'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-400'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Post List */}
            <div className="space-y-4">
                {posts.filter(i => activeTab === 'all' || (activeTab === 'skills' ? i.type === 'skill' : i.type === 'item')).map(item => (
                    <div key={item.id} className="p-6 bg-white rounded-[32px] border-2 border-slate-50 hover:border-indigo-100 transition-all shadow-xl shadow-slate-100/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.type === 'skill' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {item.type === 'skill' ? 'Skill Swap' : 'Item Flow'}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100">
                                    {item.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-300 font-bold uppercase">{formatTime(item.timestamp)}</span>
                                <button onClick={() => handleReport(item.id)} className="text-slate-300 hover:text-rose-400 transition-colors">
                                    <Icon name="flag" size={14} />
                                </button>
                            </div>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-1 leading-tight tracking-tight uppercase">{item.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{item.description}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px]">
                                    {item.userName?.[0]?.toUpperCase() || 'P'}
                                </div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{item.userName}</span>
                            </div>
                            <div className="flex gap-2">
                                {revealedContacts.includes(item.id) ? (
                                    <div className="flex flex-col items-end gap-2 animate-fade-in">
                                        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black border border-indigo-100">
                                            {item.contact}
                                        </div>
                                        <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic flex items-center gap-1">
                                            <Icon name="lifebuoy" size={10} /> Never send money online. Meet in public places.
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => toggleContact(item.id)}
                                        className="flex items-center gap-2 py-2 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all text-center"
                                    >
                                        Click to Reveal Contact
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {posts.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <p className="text-xs font-bold uppercase tracking-widest">No loop posts yet. <br />Be the first to help your neighbours.</p>
                    </div>
                )}
            </div>

            {/* Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative animate-scale-in">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <Icon name="x" size={24} />
                        </button>

                        <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Post to the Loop</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                                {(['skill', 'item'] as const).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                    >
                                        {type === 'skill' ? 'Offer a Skill' : 'Give an Item'}
                                    </button>
                                ))}
                            </div>

                            <input
                                required
                                placeholder="Short Title (e.g. Garden Help)"
                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                value={formData.title}
                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />

                            <textarea
                                required
                                rows={3}
                                placeholder="Describe what you're offering or what you need..."
                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    required
                                    placeholder="Category"
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                    value={formData.category}
                                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                />
                                <input
                                    required
                                    placeholder="Contact info"
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                    value={formData.contact}
                                    onChange={e => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Posting...' : 'Send to Loop'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PompeyLoop;
