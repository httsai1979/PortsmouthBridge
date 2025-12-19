import { useState } from 'react';
import Icon from './Icon';

interface PrivacyShieldProps {
    onAccept: () => void;
}

const PrivacyShield = ({ onAccept }: PrivacyShieldProps) => {
    const [isVisible, setIsVisible] = useState(() => {
        return !localStorage.getItem('haven_privacy_accepted');
    });

    const handleAccept = () => {
        localStorage.setItem('haven_privacy_accepted', 'true');
        setIsVisible(false);
        onAccept();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-8 bg-indigo-600 text-white text-center relative">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="check_circle" size={40} />
                    </div>
                    <h2 className="text-2xl font-black mb-2">Privacy First</h2>
                    <p className="text-indigo-100 text-sm">Your dignity and privacy are our top priority.</p>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 flex-1">
                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Icon name="eye" size={18} />
                            </div>
                            <h3 className="font-bold text-slate-800">Zero Personal Data</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            We don't know who you are. We don't use cookies, tracker, or require user accounts. Your search history never leaves this device.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Icon name="mapPin" size={18} />
                            </div>
                            <h3 className="font-bold text-slate-800">Local Location Only</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Your GPS location is only used locally to find resources near you. It is never transmitted to our servers or third parties.
                        </p>
                    </section>

                    <section className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                        <p className="text-xs text-slate-500">
                            By using Pompey Haven, you agree to our 100% anonymous, local-first privacy policy. You can clear all cached data anytime in the settings.
                        </p>
                    </section>
                </div>

                <div className="p-8 border-t border-slate-100 bg-white">
                    <button
                        onClick={handleAccept}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        I Trust Haven, Let's Go
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                        GDPR Compliant Architecture
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyShield;
