import { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';

interface PartnerLoginProps {
    onClose: () => void;
    onRequestAccess?: () => void; // [NEW] Added prop
}

const PartnerLogin = ({ onClose, onRequestAccess }: PartnerLoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser, isPartner } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        onClose();
    };

    if (currentUser) {
        return (
            <div className="p-8 text-center bg-white rounded-[40px] shadow-2xl animate-fade-in-up">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="check_circle" size={40} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Connected as Partner</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                    Logged in as: {currentUser.email}
                </p>

                {isPartner ? (
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-8">
                        <p className="text-xs font-bold text-indigo-600">You have Partner Dashboard access.</p>
                    </div>
                ) : (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-8">
                        <p className="text-xs font-bold text-amber-600">Pending partner verification.</p>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-[40px] shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Partner Login</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inter-Agency Connection</p>
                </div>
                <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200">
                    <Icon name="x" size={20} />
                </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Agency Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[24px] outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm font-bold"
                        placeholder="staff@charity.org"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Access Key</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[24px] outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm font-bold"
                        placeholder="••••••••"
                    />
                </div>

                {error && <p className="text-xs font-bold text-rose-600 text-center px-4">{error}</p>}

                <button
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] disabled:opacity-50 transition-all mt-4"
                >
                    {loading ? 'Connecting...' : 'Secure Login'}
                </button>
            </form>

            {/* [NEW] Request Access Button */}
            <div className="mt-8 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Registered Partners Only</p>
                {onRequestAccess && (
                    <button 
                        onClick={onRequestAccess}
                        className="text-[10px] font-bold text-indigo-500 mt-2 hover:text-indigo-700 underline transition-colors"
                    >
                        Request access for your charity
                    </button>
                )}
            </div>
        </div>
    );
};

export default PartnerLogin;