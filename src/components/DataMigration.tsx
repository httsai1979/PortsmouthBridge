import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, setDoc, doc, getDocs } from 'firebase/firestore';
import { ALL_DATA } from '../data';
import type { ServiceDocument } from '../types/schema';
import { useAuth } from '../contexts/AuthContextBase';

// Hardcoded verified Admin UIDs for sensitive data operations
const VERIFIED_ADMIN_UIDS = ['3mC8w2S9pZ0', 'ADMIN_V1_MASTER'];

const DataMigration = () => {
    const { isPartner, currentUser } = useAuth();
    const [migrating, setMigrating] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [firestoreCount, setFirestoreCount] = useState<number | null>(null);

    const addLog = (message: string) => {
        setLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
    };

    const checkFirestoreStatus = async () => {
        try {
            addLog('📡 Connecting to the database...');
            const snapshot = await getDocs(collection(db, 'services'));
            setFirestoreCount(snapshot.size);
            addLog(`✅ Connection successful! Found ${snapshot.size} active records.`);
        } catch (error: any) {
            console.error(error);
            addLog(`❌ Connection Error: ${error.message}`);
            setFirestoreCount(0);
        }
    };

    const migrateData = async () => {
        if (migrating) return;

        // Security Check: Only specific verified UIDs can execute migration
        if (!currentUser || !VERIFIED_ADMIN_UIDS.includes(currentUser.uid)) {
            alert('CRITICAL ACCESS DENIED: Your account is verified as a partner, but does not have Master Migration privileges. Please contact the Portsmouth Bridge Admin.');
            addLog('⚠️ Security Alert: Unauthorised migration attempt blocked.');
            return;
        }

        const confirmed = window.confirm(
            `Are you ready to sanitise and upload ${ALL_DATA.length} records? This will overwrite existing cloud data.`
        );

        if (!confirmed) return;

        setMigrating(true);
        setLog([]);
        addLog('🚀 Starting Data Sanitisation & Upload...');

        const servicesCollection = collection(db, 'services');
        let success = 0;
        let failed = 0;

        for (let i = 0; i < ALL_DATA.length; i++) {
            const resource = ALL_DATA[i];

            // Mapping raw data to the structured ServiceDocument schema
            // Ensuring all optional or missing fields have safe default values for Firestore
            try {
                const docData: ServiceDocument = {
                    id: resource.id,
                    name: resource.name || 'Unnamed Resource',
                    category: (['food', 'shelter', 'warmth', 'support', 'family', 'mental_health'].includes(resource.category)
                        ? resource.category
                        : 'support') as ServiceDocument['category'],
                    type: resource.type || '',
                    area: resource.area || '',
                    address: resource.address || '',
                    requirements: resource.requirements || '',
                    description: resource.description || 'No description provided.',
                    tags: resource.tags || [],
                    lat: resource.lat ?? 50.8000,
                    lng: resource.lng ?? -1.0800,
                    location: {
                        lat: resource.lat ?? 50.8000,
                        lng: resource.lng ?? -1.0800,
                        address: resource.address || 'Address not listed',
                        area: resource.area || 'Portsmouth',
                    },
                    thresholdInfo: {
                        idRequired: resource.entranceMeta?.idRequired ?? false,
                        queueStatus: resource.entranceMeta?.queueStatus
                            ? (resource.entranceMeta.queueStatus.charAt(0).toUpperCase() + resource.entranceMeta.queueStatus.slice(1)) as ServiceDocument['thresholdInfo']['queueStatus']
                            : 'unknown',
                        entrancePhotoUrl: resource.entranceMeta?.imageUrl ?? null
                    },
                    liveStatus: {
                        isOpen: true,
                        capacity: (resource.capacityLevel && (resource.capacityLevel === 'low' || resource.capacityLevel === 'medium' || resource.capacityLevel === 'high' || resource.capacityLevel === 'full'))
                            ? (resource.capacityLevel.charAt(0).toUpperCase() + resource.capacityLevel.slice(1)) as ServiceDocument['liveStatus']['capacity']
                            : 'unknown',
                        lastUpdated: new Date().toISOString(),
                        message: (resource as typeof resource & { status?: { message: string } }).status?.message ?? ""
                    },
                    b2bData: {
                        internalPhone: resource.phone || 'N/A',
                        partnerNotes: "System migrated from central static dataset."
                    },
                    phone: resource.phone ?? null,
                    website: (resource as typeof resource & { website?: string }).website ?? "",
                    schedule: resource.schedule || {},
                    trustScore: resource.trustScore ?? 0
                };

                await setDoc(doc(servicesCollection, resource.id), docData);
                success++;
                addLog(`✓ Sanitised & Uploaded: ${resource.name}`);
            } catch (error: unknown) {
                failed++;
                const errMsg = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Record failure - ${resource.id}:`, error);
                addLog(`❌ Failed record: ${resource.name} - ${errMsg}`);
            }
        }

        addLog(`🏁 Migration complete! Success: ${success}, Failed: ${failed}`);
        setMigrating(false);
        await checkFirestoreStatus();
    };

    if (!isPartner) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-black text-slate-900 uppercase">Access Restricted</h2>
                <p className="text-xs text-slate-400 font-bold mt-2">Only verified partners can manage data migration.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Data Migration Centre</h2>
            </div>

            <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-slate-200 border border-slate-100">
                <div className="flex gap-4 mb-8">
                    <div className="flex-1 p-6 bg-slate-50 rounded-3xl text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Files</p>
                        <p className="text-4xl font-black text-slate-900 mt-1">{ALL_DATA.length}</p>
                    </div>
                    <div className="flex-1 p-6 bg-slate-50 rounded-3xl text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud Database</p>
                        <p className={`text-4xl font-black mt-1 ${firestoreCount === 0 ? 'text-rose-500' : 'text-indigo-600'}`}>
                            {firestoreCount === null ? '?' : firestoreCount}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={checkFirestoreStatus}
                        className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Check Connection
                    </button>

                    <button
                        onClick={migrateData}
                        disabled={migrating}
                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-200 active:scale-[0.98]"
                    >
                        {migrating ? 'Processing Records...' : 'Initialise Migration'}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-bold italic px-4">
                        Warning: This will synchronise local data with the cloud. Existing entries with matching IDs will be overwritten.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Operation Logs</h3>
                    <button onClick={() => setLog([])} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-tighter">Clear Console</button>
                </div>
                <div className="bg-slate-800/40 rounded-2xl p-6 h-72 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-2 border border-slate-800/50">
                    {log.length === 0 && <span className="text-slate-600 italic">No operations recorded...</span>}
                    {log.map((line, i) => (
                        <div key={i} className={line.includes('❌') ? 'text-rose-400' : line.includes('✓') ? 'text-emerald-400 font-bold' : ''}>
                            {line}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DataMigration;