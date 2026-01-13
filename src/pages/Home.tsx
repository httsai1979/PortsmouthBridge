import { useAppStore } from '../store/useAppStore';
import Icon from '../components/Icon';
import CommunityBulletin from '../components/CommunityBulletin';
import ProgressTimeline from '../components/ProgressTimeline';
import { TAG_ICONS, COMMUNITY_DEALS, GIFT_EXCHANGE, PROGRESS_TIPS } from '../data';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HomeProps {
    onShowWizard: () => void;
    onShowConnectCalculator: () => void;
}

const Home = ({
    onShowWizard,
    onShowConnectCalculator
}: HomeProps) => {
    const navigate = useNavigate();
    const { savedIds } = useAppStore();

    const handleBulletinClick = (id: string) => {
        if (id === '1') navigate('/map?status=open');
        else if (id === '2') navigate('/map?category=food');
        else if (id === '3') navigate('/map?category=warmth');
        else if (id === '4') navigate('/faq');
    };

    const handleCategorySearch = (catId: string) => {
        if (catId === 'faq') navigate('/faq');
        else navigate(`/list?category=${catId}`);
    };

    return (
        <div className="animate-fade-in-up">
            <CommunityBulletin onCTAClick={handleBulletinClick} />

            {savedIds.length > 0 && (
                <div className="mb-6">
                    <ProgressTimeline savedCount={savedIds.length} />
                </div>
            )}

            <div className="mb-8 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="search" size={18} className="text-slate-400" />
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="flex-1 py-4 pl-12 pr-4 bg-white rounded-[24px] border-2 border-slate-100 focus:border-indigo-600 outline-none text-sm font-bold shadow-sm"
                        onClick={() => navigate('/list')}
                    />
                    <button className="p-4 bg-white border-2 border-slate-100 rounded-[24px] text-indigo-600 hover:bg-slate-50 shadow-sm flex items-center justify-center active:scale-95">
                        <Icon name="share-2" size={20} />
                    </button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-4 gap-3 mb-8"
            >
                {[
                    { id: 'food', ...TAG_ICONS.food }, { id: 'shelter', ...TAG_ICONS.shelter }, { id: 'warmth', ...TAG_ICONS.warmth }, { id: 'support', ...TAG_ICONS.support },
                    { id: 'family', ...TAG_ICONS.family }, { id: 'skills', ...TAG_ICONS.skills }, { id: 'charity', ...TAG_ICONS.charity }, { id: 'faq', label: 'Guide', icon: 'help-circle' }
                ].map((cat, idx) => (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + (idx * 0.05) }}
                        key={cat.id || cat.label}
                        onClick={() => handleCategorySearch(cat.id || 'all')}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all group-active:scale-90 bg-white text-slate-500 border-2 border-slate-50`}>
                            <Icon name={cat.icon} size={20} />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight truncate w-full px-1">
                            {cat.label.replace(' Support', '').replace(' Hub', '')}
                        </span>
                    </motion.button>
                ))}
            </motion.div>

            <button onClick={onShowWizard} className="w-full mb-8 bg-rose-500 text-white p-1 rounded-[32px] shadow-xl shadow-rose-200 group transition-all hover:scale-[1.02] active:scale-95 pr-2">
                <div className="flex items-center justify-between bg-white/10 rounded-[28px] p-4 border border-white/20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white text-rose-600 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                            <Icon name="lifebuoy" size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-base font-black leading-none mb-1">Find Support</h3>
                            <p className="text-[9px] font-bold text-rose-100 uppercase tracking-widest">Interactive Wizard</p>
                        </div>
                    </div>
                    <Icon name="chevron-right" size={20} className="mr-2 text-rose-100" />
                </div>
            </button>

            <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
                <button onClick={() => navigate('/planner')} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-indigo-200">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon name="calendar" size={18} /></div>
                    <div><h4 className="text-xs font-black text-slate-800">My Journey</h4><p className="text-[9px] text-slate-400 font-bold uppercase">{savedIds.length} Trusted Hubs</p></div>
                </button>

                <button onClick={onShowConnectCalculator} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-indigo-200">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon name="cpu" size={18} /></div>
                    <div><h4 className="text-xs font-black text-slate-800">Connect Tool</h4><p className="text-[9px] text-slate-400 font-bold uppercase">Eligibility Check</p></div>
                </button>

                <button onClick={() => navigate('/loop')} className="snap-start min-w-[140px] bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex flex-col gap-2 hover:border-indigo-200">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"><Icon name="repeat" size={18} /></div>
                    <div><h4 className="text-xs font-black text-slate-800">Pompey Loop</h4><p className="text-[9px] text-slate-400 font-bold uppercase">Community Offers</p></div>
                </button>
            </div>

            {/* Daily Inspiration / Quick Tip */}
            <div className="mb-8 p-6 bg-indigo-900 rounded-[32px] text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-300">Community Wisdom</h3>
                    <p className="text-sm font-bold italic mb-4 leading-relaxed line-clamp-2">"Small acts of kindness multiply until they overflow and bless the whole city."</p>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center">
                            <Icon name="info" size={12} className="text-indigo-200" />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-200">Tip: {PROGRESS_TIPS[0].title} - {PROGRESS_TIPS[0].note}</span>
                    </div>
                </div>
            </div>

            {/* Local Spotlights */}
            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Local Spotlight</h3>
                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">See All</button>
                </div>

                <div className="space-y-3">
                    {COMMUNITY_DEALS.slice(0, 1).map(deal => (
                        <div key={deal.id} className="p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm flex gap-4 items-start group">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                <Icon name="tag" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={() => deal.lat && navigate(`/map?lat=${deal.lat}&lng=${deal.lng}&label=${encodeURIComponent(deal.store)}`)}
                                    className="text-sm font-black text-slate-900 mb-1 leading-tight text-left w-full hover:text-indigo-600"
                                >
                                    {deal.store}
                                </button>
                                <p className="text-[11px] text-slate-500 font-medium mb-1 font-bold">{deal.deal}</p>
                                <p className="text-[11px] text-slate-500 font-medium mb-3">{deal.info}</p>
                                <button
                                    onClick={() => deal.lat && navigate(`/map?lat=${deal.lat}&lng=${deal.lng}&label=${encodeURIComponent(deal.store)}`)}
                                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all"
                                >
                                    View on map <Icon name="arrow-right" size={10} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {GIFT_EXCHANGE.slice(0, 1).map(gift => (
                        <div key={gift.id} className="p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm flex gap-4 items-start group">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                <Icon name="gift" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={() => gift.lat && navigate(`/map?lat=${gift.lat}&lng=${gift.lng}&label=${encodeURIComponent(gift.item)}`)}
                                    className="text-sm font-black text-slate-900 mb-1 leading-tight text-left w-full hover:text-emerald-600"
                                >
                                    {gift.item}
                                </button>
                                <p className="text-[11px] text-slate-500 font-medium mb-3">{gift.info}</p>
                                <button
                                    onClick={() => gift.lat && navigate(`/map?lat=${gift.lat}&lng=${gift.lng}&label=${encodeURIComponent(gift.item)}`)}
                                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all"
                                >
                                    View on map <Icon name="arrow-right" size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-20" /> {/* Bottom Spacing */}
        </div>
    );
};

export default Home;
