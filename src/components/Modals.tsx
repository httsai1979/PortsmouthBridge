import { useState } from 'react';
import { db } from '../lib/firebase';
// [修正] 補上這些缺少的 import，否則點擊回報按鈕會 Crash
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import Icon from './Icon';

// --- TipsModal (保持原樣) ---
export const TipsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[70] flex items-center justify-center p-4 transition-all" onClick={onClose}>
            <div className="bg-white rounded-[40px] w-full max-w-sm overflow-auto max-h-[90vh] animate-bounce-in shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                        <Icon name="info" size={24} /> The Bridge Guide
                    </h2>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest leading-loose">How we help you cross the bridge to a better tomorrow.</p>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    <section className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Welcome to Portsmouth Bridge</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            A live tool connecting you to verified support in Portsmouth. Everything you see is real, updated, and works offline.
                        </p>
                    </section>
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Master Your Toolkit</h3>
                        <div className="flex gap-4 items-start">
                            <div className="shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Icon name="plus" size={14} /></div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900">Pin & Plan</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Tap the plus icon to save resources. Use "Journey Planner" to see them on a timeline map.</p>
                            </div>
                        </div>
                    </section>
                    <div className="pt-2">
                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all">
                            Start Exploring
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CrisisModal (保持原樣) ---
export const CrisisModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[80] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden animate-bounce-in shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="bg-rose-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <h2 className="text-2xl font-black flex items-center gap-3 relative z-10">
                        <Icon name="alert" size={24} /> Emergency
                    </h2>
                    <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest mt-2 relative z-10">Immediate Support Required</p>
                </div>
                <div className="p-8 space-y-4 bg-slate-50/50">
                    <a href="tel:999" className="flex items-center w-full bg-white p-5 rounded-3xl border-2 border-rose-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl mr-4 group-hover:bg-rose-600 group-hover:text-white transition-colors"><Icon name="phone" size={20} /></div>
                        <div className="flex-1"><div className="font-black text-slate-900 text-xl">999</div><div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Immediate Police/Ambulance</div></div>
                    </a>
                    <a href="tel:111" className="flex items-center w-full bg-white p-4 rounded-3xl border border-dashed border-slate-200 opacity-60 hover:opacity-100 transition-all">
                        <div className="flex-1"><div className="font-black text-slate-700 text-lg">111</div><div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Non-Emergency NHS</div></div>
                    </a>
                    <button onClick={onClose} className="w-full py-4 mt-4 bg-slate-200 hover:bg-slate-300 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-colors">Go Back</button>
                </div>
            </div>
        </div>
    );
};

// --- ReportModal (加入防禦機制) ---
export const ReportModal = ({ isOpen, onClose, resourceName, resourceId }: { isOpen: boolean; onClose: () => void; resourceName: string; resourceId: string }) => {
    const [reason, setReason] = useState('Closed when stated open');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [honeypot, setHoneypot] = useState(''); // [防禦]

    const handleSubmit = async () => {
        // [防禦] 蜜罐檢查
        if (honeypot) {
            console.log("Bot blocked.");
            setSent(true);
            setTimeout(onClose, 1000);
            return;
        }

        setSending(true);
        try {
            await addDoc(collection(db, 'reports'), {
                resourceId,
                resourceName,
                reason,
                timestamp: serverTimestamp(),
                status: 'pending' // 進入審核佇列，不直接影響公開資料
            });
            setSent(true);
            setTimeout(() => { onClose(); setSent(false); setSending(false); }, 2000);
        } catch (e) {
            console.error(e);
            alert('Error sending report. Please check your connection.');
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                {sent ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><Icon name="check" size={32} /></div>
                        <h3 className="text-xl font-black text-slate-900">Thank You</h3>
                        <p className="text-slate-500 text-sm mt-2">We will verify this shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">Report Issue</h3>
                                <p className="text-xs text-slate-500 font-bold">{resourceName}</p>
                            </div>
                            <button onClick={onClose}><Icon name="x" size={20} className="text-slate-400" /></button>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            {/* [防禦] 隱藏的蜜罐欄位 */}
                            <input type="text" style={{display:'none'}} value={honeypot} onChange={e=>setHoneypot(e.target.value)} />
                            
                            {['Closed when stated open', 'Wrong location/address', 'Service no longer exists', 'Other'].map(r => (
                                <button key={r} onClick={() => setReason(r)} className={`w-full p-3 rounded-xl text-xs font-bold text-left border-2 transition-all ${reason === r ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleSubmit} disabled={sending} className="w-full py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-200 hover:scale-[1.02] transition-all disabled:opacity-50">
                            {sending ? 'Sending...' : 'Submit Report'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// --- PartnerRequestModal (保持原樣但修復 import) ---
export const PartnerRequestModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [formData, setFormData] = useState({ orgName: '', email: '', phone: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await addDoc(collection(db, 'partner_requests'), {
                ...formData,
                timestamp: serverTimestamp(),
                status: 'new'
            });
            setStatus('sent');
        } catch (error) {
            console.error(error);
            alert("Error sending request. Please check your connection.");
            setStatus('idle');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                {status === 'sent' ? (
                    <div className="p-10 text-center">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"><Icon name="check" size={40} /></div>
                        <h2 className="text-2xl font-black text-slate-900">Request Sent</h2>
                        <p className="text-slate-500 text-sm mt-2 mb-8">Our team will contact you within 24 hours to verify your organisation.</p>
                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Close</button>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Join the Network</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner Application</p>
                            </div>
                            <button onClick={onClose}><Icon name="x" size={24} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Organisation Name</label>
                                <input required type="text" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold transition-all" 
                                    value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})} placeholder="e.g. Portsmouth Food Hub" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Official Email</label>
                                <input required type="email" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold transition-all" 
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@org.uk" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Contact Phone</label>
                                <input required type="tel" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold transition-all" 
                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="023 92..." />
                            </div>
                            <button type="submit" disabled={status === 'sending'} className="w-full py-4 mt-2 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50">
                                {status === 'sending' ? 'Sending...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};