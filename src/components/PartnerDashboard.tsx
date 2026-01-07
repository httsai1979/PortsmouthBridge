import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { ServiceDocument } from '../types/schema';
import Icon from './Icon';

const PartnerDashboard = () => {
    const { currentUser } = useAuth();
    const [managedServices, setManagedServices] = useState<ServiceDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        // In a real app, we'd filter by ownerId or partnerId
        // For this prototype, we'll fetch all services but in a real scenario we'd do:
        // const q = query(collection(db, 'services'), where('ownerId', '==', currentUser.uid));

        const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
            const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceDocument));
            setManagedServices(services);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const updateStatus = async (serviceId: string, updates: any) => {
        setUpdating(serviceId);
        try {
            const serviceRef = doc(db, 'services', serviceId);
            await updateDoc(serviceRef, {
                ...updates,
                'liveStatus.lastUpdated': new Date().toISOString()
            });
        } catch (error) {
            console.error("Error updating service:", error);
            alert("Failed to update status.");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading Agency Command Centre...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Agency Command Centre</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Community Coordination</p>
                </div>
                <div className="px-4 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                    Live Partner Link
                </div>
            </div>

            {managedServices.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No assigned services found.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {managedServices.map(service => (
                        <div key={service.id} className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden relative">
                            {updating === service.id && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        Syncing...
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">{service.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${service.liveStatus.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {service.liveStatus.isOpen ? 'Currently Open' : 'Closed'}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase">Last Updated: {new Date(service.liveStatus.lastUpdated).toLocaleTimeString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateStatus(service.id, { 'liveStatus.isOpen': true })}
                                        className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${service.liveStatus.isOpen ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        Open
                                    </button>
                                    <button
                                        onClick={() => updateStatus(service.id, { 'liveStatus.isOpen': false })}
                                        className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!service.liveStatus.isOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        Closed
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Capacity Slider */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Capacity / Stock Level</label>
                                    <div className="flex gap-2">
                                        {(['High', 'Medium', 'Low', 'Full'] as const).map(lev => (
                                            <button
                                                key={lev}
                                                onClick={() => updateStatus(service.id, { 'liveStatus.capacity': lev })}
                                                className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-tighter transition-all border-2 ${service.liveStatus.capacity === lev ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-50 text-slate-400'}`}
                                            >
                                                {lev === 'High' ? 'Good Stock' : lev === 'Medium' ? 'Medium' : lev === 'Low' ? 'Low Stock' : 'Full / No Stock'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Queue Controller */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Queue status (Threshold)</label>
                                    <div className="flex gap-2">
                                        {(['Empty', 'Light', 'Busy', 'Long'] as const).map(q => (
                                            <button
                                                key={q}
                                                onClick={() => updateStatus(service.id, { 'thresholdInfo.queueStatus': q })}
                                                className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-tighter transition-all border-2 ${service.thresholdInfo.queueStatus === q ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-50 text-slate-400'}`}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Broadcast Box */}
                            <div className="mt-8 space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crisis Broadcast / Announcement</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        defaultValue={service.liveStatus.message || ''}
                                        placeholder="e.g. Urgent: We need blankets or volunteers..."
                                        onBlur={(e) => updateStatus(service.id, { 'liveStatus.message': e.target.value })}
                                        className="flex-1 p-5 bg-slate-50 border-2 border-slate-50 rounded-[24px] outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm font-bold"
                                    />
                                    <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center">
                                        <Icon name="zap" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PartnerDashboard;
