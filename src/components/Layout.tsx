import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';
import logo from '../assets/images/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useAppStore';

interface LayoutProps {
    children: React.ReactNode;
    isOffline: boolean;
    onShowCrisis: () => void;
    onShowPartnerLogin: () => void;
}

const Layout = ({ children, isOffline, onShowCrisis, onShowPartnerLogin }: LayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isPartner } = useAuth();
    const {
        stealthMode,
        setStealthMode,
        highContrast,
        setHighContrast,
        fontSize,
        setFontSize
    } = useAppStore();

    const isHome = location.pathname === '/';
    const isMap = location.pathname === '/map';
    const isList = location.pathname === '/list';
    const isPartnerPortal = location.pathname.startsWith('/partner');

    if (isPartnerPortal) return <>{children}</>;

    return (
        <div className="app-container overflow-x-hidden min-h-screen pb-32">
            <header className={`sticky top-0 z-50 ${stealthMode ? 'bg-slate-50 border-none' : 'bg-white/95 backdrop-blur-md border-b border-slate-100'} pt-4 pb-3 transition-all`}>
                <div className="px-5 flex justify-between items-center max-w-lg mx-auto">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logo} alt="Logo" className={`w-10 h-10 transition-all ${stealthMode ? 'grayscale opacity-50' : ''}`} />
                        <div>
                            <h1 className={`text-xl font-black ${stealthMode ? 'text-slate-400' : 'text-slate-900'} tracking-tighter leading-none mb-1`}>
                                {stealthMode ? 'Safe Compass' : 'Portsmouth Bridge'}
                            </h1>
                            {!stealthMode && <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Community Support Network</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setFontSize((fontSize + 1) % 3)} className={`p-2 rounded-xl transition-all border-2 ${fontSize > 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-600 border-slate-100 hover:bg-slate-200'}`}><Icon name="type" size={20} /></button>
                        <button onClick={() => setStealthMode(!stealthMode)} className={`p-2 rounded-xl transition-all ${stealthMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon name="eye" size={20} /></button>
                        <button onClick={() => setHighContrast(!highContrast)} className={`p-2 rounded-xl transition-colors ${highContrast ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Icon name="zap" size={20} /></button>
                        {isPartner && (
                            <button onClick={() => navigate('/partner/dashboard')} className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100"><Icon name="briefcase" size={20} /></button>
                        )}
                        <button onClick={onShowPartnerLogin} className={`p-2 rounded-xl transition-all ${currentUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon name="users" size={20} /></button>
                    </div>
                </div>
                {isOffline && <div className="bg-amber-50 text-amber-700 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-center border-b border-amber-100 animate-pulse">Offline Support Active</div>}
            </header>

            <main className={`px-5 mt-4 relative z-20 transition-all ${stealthMode ? 'opacity-90 grayscale-[0.3]' : ''}`}>
                {children}
            </main>

            {/* Bottom Nav */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[50] bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 border border-white/10 w-auto">
                <button onClick={() => navigate('/')} className={`relative group ${isHome ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}><Icon name="home" size={24} />{isHome && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}</button>
                <button onClick={() => navigate('/map')} className={`relative group ${isMap ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}><Icon name="mapPin" size={24} />{isMap && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}</button>
                <button onClick={() => navigate('/list')} className={`relative group ${isList ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}><Icon name="search" size={24} />{isList && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}</button>
                <div className="w-px h-6 bg-white/20"></div>
                <button onClick={onShowCrisis} className="text-rose-500 hover:text-rose-400 animate-pulse"><Icon name="lifebuoy" size={24} /></button>
            </div>
        </div>
    );
};

export default Layout;
