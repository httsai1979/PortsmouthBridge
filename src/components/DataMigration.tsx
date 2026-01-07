import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, setDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { ALL_DATA } from '../data';
import type { ServiceDocument } from '../types/schema';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';

const DataMigration = () => {
    const { isPartner } = useAuth();
    const [migrating, setMigrating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState<string[]>([]);
    const [firestoreCount, setFirestoreCount] = useState<number | null>(null);

    const addLog = (message: string) => {
        setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const checkFirestoreStatus = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'services'));
            setFirestoreCount(snapshot.size);
            addLog(`✓ Firestore connected. Found ${snapshot.size} services.`);
        } catch (error: any) {
            addLog(`✗ Error checking Firestore: ${error.message}`);
            setFirestoreCount(0);
        }
    };

    const migrateData = async () => {
        if (migrating) return;

        const confirmed = window.confirm(
            'This will upload all static data to Firestore. ' +
            'Existing documents with the same ID will be overwritten. Continue?'
        );

        if (!confirmed) return;

        setMigrating(true);
        setProgress(0);
        addLog('🚀 Starting migration...');

        const servicesCollection = collection(db, 'services');
        const total = ALL_DATA.length;
        let success = 0;
        let failed = 0;

        for (let i = 0; i < ALL_DATA.length; i++) {
            const resource = ALL_DATA[i];

            const docData: ServiceDocument = {
                id: resource.id,
                name: resource.name,
                category: (['food', 'shelter', 'warmth', 'support', 'family'].includes(resource.category)
                    ? resource.category
                    : 'support') as ServiceDocument['category'],
                location: {
                    lat: resource.lat,
                    lng: resource.lng,
                    address: resource.address,
                    area: resource.area,
                },
                thresholdInfo: {
                    idRequired: resource.entranceMeta?.idRequired ?? false,
                    queueStatus: resource.entranceMeta?.queueStatus
                        ? (resource.entranceMeta.queueStatus.charAt(0).toUpperCase() +
                            resource.entranceMeta.queueStatus.slice(1)) as ServiceDocument['thresholdInfo']['queueStatus']
                        : 'Empty',
                    entrancePhotoUrl: resource.entranceMeta?.imageUrl
                },
                liveStatus: {
                    isOpen: true,
                    capacity: 'High',
                    lastUpdated: new Date().toISOString(),
                    message: "Welcome to Portsmouth Bridge live updates."
                },
                b2bData: {
                    internalPhone: resource.phone || '023 9282 2251 (Council Hub)',
                    partnerNotes: "Migrated from Portsmouth Bridge V1 Static Dataset."
                },
                description: resource.description,
                tags: resource.tags,
                phone: resource.phone,
                schedule: resource.schedule,
                trustScore: resource.trustScore
            };

            try {
                await setDoc(doc(servicesCollection, resource.id), docData);
                success++;
                addLog(`✓ Migrated: ${resource.name}`);
            } catch (error: any) {
                failed++;
                addLog(`✗ Failed: ${resource.name} - ${error.message}`);
            }

            setProgress(Math.round(((i + 1) / total) * 100));
        }

        addLog(`\n🏁 Migration complete!`);
        addLog(`   Success: ${success} | Failed: ${failed}`);
        setMigrating(false);

        // Refresh count
        await checkFirestoreStatus();
    };

    const clearFirestore = async () => {
        if (migrating) return;

        const confirmed = window.confirm(
            '⚠️ WARNING: This will DELETE all services from Firestore. ' +
            'This action cannot be undone. Are you absolutely sure?'
        );

        if (!confirmed) return;

        setMigrating(true);
        addLog('🗑️ Clearing Firestore services...');

        try {
            const snapshot = await getDocs(collection(db, 'services'));
            let deleted = 0;

            for (const docSnapshot of snapshot.docs) {
                await deleteDoc(doc(db, 'services', docSnapshot.id));
                deleted++;
            }

            addLog(`✓ Deleted ${deleted} documents.`);
            setFirestoreCount(0);
        } catch (error: any) {
            addLog(`✗ Error clearing: ${error.message}`);
        }

        setMigrating(false);
    };

    if (!isPartner) {
        return (
            <div className="p-8 bg-white rounded-[32px] shadow-xl text-center">
                <Icon name="lock" size={40} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-800 mb-2">Access Restricted</h3>
                <p className="text-xs text-slate-400">Only verified partners can access data migration tools.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Data Migration</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Firebase Synchronization Tool</p>
                </div>
                <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                    Admin Only
                </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-[32px] p-6 shadow-lg border border-slate-100">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">System Status</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Static Data</p>
                        <p className="text-2xl font-black text-slate-900">{ALL_DATA.length}</p>
                        <p className="text-[9px] text-slate-400">Resources in code</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Firestore</p>
                        <p className="text-2xl font-black text-indigo-600">
                            {firestoreCount === null ? '—' : firestoreCount}
                        </p>
                        <p className="text-[9px] text-slate-400">Documents synced</p>
                    </div>
                </div>

                <button
                    onClick={checkFirestoreStatus}
                    disabled={migrating}
                    className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                    Check Connection
                </button>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-[32px] p-6 shadow-lg border border-slate-100">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Migration Actions</h3>

                {migrating && (
                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={migrateData}
                        disabled={migrating}
                        className="py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Icon name="upload" size={16} />
                        {migrating ? 'Migrating...' : 'Migrate to Firestore'}
                    </button>
                    <button
                        onClick={clearFirestore}
                        disabled={migrating}
                        className="py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Icon name="trash" size={16} />
                        Clear Firestore
                    </button>
                </div>
            </div>

            {/* Log Console */}
            {log.length > 0 && (
                <div className="bg-slate-900 rounded-[32px] p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Console Output</h3>
                        <button
                            onClick={() => setLog([])}
                            className="text-[9px] text-slate-500 hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1">
                        {log.map((line, i) => (
                            <div key={i} className={line.includes('✓') ? 'text-emerald-400' : line.includes('✗') ? 'text-rose-400' : ''}>
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataMigration;
