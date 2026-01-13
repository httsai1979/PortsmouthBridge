import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { ServiceDocument } from '../types/schema';
import Icon from './Icon';

const PartnerDashboard = () => {
    const { currentUser } = useAuth();
    const [managedServices, setManagedServices] = useState<ServiceDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingService, setEditingService] = useState<ServiceDocument | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        address: '',
        phone: '',
        description: '',
        website: ''
    });

    useEffect(() => {
        if (!currentUser) return;

        // Listen for changes in the cloud database
        const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
            const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceDocument));
            setManagedServices(services);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const filteredServices = managedServices.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Function to update status
    const updateStatus = async (serviceId: string, updates: any) => {
        setUpdating(serviceId);
        try {
            const serviceRef = doc(db, 'services', serviceId);
            await updateDoc(serviceRef, {
                ...updates,
                'liveStatus.lastUpdated': new Date().toISOString()
            });
        } catch (error) {
            console.error("Error:", error);
            alert("Update failed. Please check your connection or permissions.");
        } finally {
            setUpdating(null);
        }
    };

    const handleEditClick = (service: ServiceDocument) => {
        setEditingService(service);
        setEditForm({
            name: service.name,
            address: service.location.address,
            phone: service.phone || '',
            description: service.description,
            website: service.website || ''
        });
    };

    const handleSaveDetails = async () => {
        if (!editingService || !currentUser) return;
        setUpdating(editingService.id);

        try {
            const serviceRef = doc(db, 'services', editingService.id);
            const updates = {
                name: editForm.name,
                'location.address': editForm.address,
                phone: editForm.phone,
                description: editForm.description,
                website: editForm.website,
                lastEditedBy: currentUser.email,
                lastEditedAt: serverTimestamp()
            };

            await updateDoc(serviceRef, updates);
            setEditingService(null);
        } catch (error) {
            console.error("Error saving details:", error);
            alert("Failed to save details. Ensure you have partner permissions.");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Partner Dashboard</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Management Centre</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Icon name="search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter services..."
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-indigo-600 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="hidden md:block px-4 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                        Live System
                    </div>
                </div>
            </div>

            {/* Show guide if database is empty */}
            {managedServices.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="info" size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">Database is Empty</h3>
                    <p className="text-xs text-slate-500 font-medium mb-6 max-w-xs mx-auto">
                        This appears to be a fresh setup. Please go to the "Data Migration" tab to upload the initial data.
                    </p>
                    <div className="p-4 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl inline-block">
                        Please click the "Data Migration" button above to start.
                    </div>
                </div>
            ) : (
                // Show control cards if data exists
                <div className="grid gap-6">
                    {filteredServices.map(service => (
                        <div key={service.id} className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden relative">

                            {/* Loading Overlay */}
                            {updating === service.id && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        Updating...
                                    </div>
                                </div>
                            )}

                            {/* Card Header & Status */}
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">{service.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${service.liveStatus.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {service.liveStatus.isOpen ? 'Open' : 'Closed'}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase">Updated: {new Date(service.liveStatus.lastUpdated).toLocaleTimeString()}</span>
                                        <button
                                            onClick={() => handleEditClick(service)}
                                            className="px-3 py-1 bg-slate-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-wider hover:bg-slate-100 transition-colors"
                                        >
                                            Edit Details
                                        </button>
                                    </div>
                                </div>

                                {/* Status Buttons */}
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
                                        Close
                                    </button>
                                </div>
                            </div>

                            {/* Capacity Controls */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Capacity / Stock Level</label>
                                <div className="flex gap-2">
                                    {(['High', 'Medium', 'Low', 'Full'] as const).map(lev => (
                                        <button
                                            key={lev}
                                            onClick={() => updateStatus(service.id, { 'liveStatus.capacity': lev })}
                                            className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-tighter transition-all border-2 ${service.liveStatus.capacity === lev ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-50 text-slate-400'}`}
                                        >
                                            {lev === 'High' ? 'Good' : lev === 'Medium' ? 'Medium' : lev === 'Low' ? 'Low' : 'Full'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Broadcast Section */}
                            <div className="mt-8 space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Broadcast</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        defaultValue={service.liveStatus.message || ''}
                                        placeholder="e.g. Urgent: Blankets needed..."
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

            {/* Edit Modal */}
            {editingService && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative animate-scale-in max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setEditingService(null)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <Icon name="x" size={24} />
                        </button>

                        <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Edit Service Details</h3>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Name</label>
                                <input
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Address</label>
                                <input
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                    value={editForm.address}
                                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website</label>
                                    <input
                                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                        value={editForm.website}
                                        onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Description</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all"
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setEditingService(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveDetails}
                                    disabled={updating === editingService.id}
                                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {updating === editingService.id ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerDashboard;