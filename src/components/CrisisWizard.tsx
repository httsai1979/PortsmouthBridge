import { useState } from 'react';
import { ALL_DATA } from '../data';
import { checkStatus, getDistance } from '../utils';
import Icon from './Icon';
import ResourceCard from './ResourceCard';

interface CrisisWizardProps {
    userLocation: { lat: number; lng: number } | null;
    onClose: () => void;
    onToggleSave: (id: string) => void;
    savedIds: string[];
}

const CrisisWizard = ({ userLocation, onClose, onToggleSave, savedIds }: CrisisWizardProps) => {
    const [step, setStep] = useState<'need' | 'urgency' | 'result'>('need');
    const [selectedNeed, setSelectedNeed] = useState<string>('');
    const [results, setResults] = useState<any[]>([]);

    const needs = [
        { id: 'food', label: 'I need food', icon: 'utensils', color: 'bg-emerald-500' },
        { id: 'shelter', label: 'I need a bed', icon: 'bed', color: 'bg-indigo-500' },
        { id: 'warmth', label: 'I am cold', icon: 'flame', color: 'bg-orange-500' },
        { id: 'support', label: 'I need advice', icon: 'lifebuoy', color: 'bg-blue-500' },
        { id: 'family', label: 'Family help', icon: 'family', color: 'bg-pink-500' },
        { id: 'mental_health', label: 'Need to talk', icon: 'brain', color: 'bg-purple-500' }
    ];

    const handleNeedSelect = (needId: string) => {
        setSelectedNeed(needId);
        // Instant calculation for "Best Option"
        let matches = ALL_DATA.filter(item => {
            if (needId === 'mental_health') return item.tags.includes('mental_health');
            if (needId === 'food') return item.category === 'food' && item.tags.includes('free');
            return item.category === needId;
        });

        // 1. Filter by Open Now (Crucial for crisis)
        const openNow = matches.filter(item => checkStatus(item.schedule).isOpen);

        let finalResults = openNow.length > 0 ? openNow : matches;

        // 2. Sort by Distance if available
        if (userLocation) {
            finalResults.sort((a, b) => {
                const dietA = getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
                const dietB = getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
                return dietA - dietB;
            });
        }

        setResults(finalResults.slice(0, 3));
        setStep('result');
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-slate-900/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-white rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200"
                >
                    <Icon name="x" size={20} />
                </button>

                {step === 'need' && (
                    <div className="animate-fade-in-up">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Icon name="lifebuoy" size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Immediate Help</h2>
                            <p className="text-slate-500 font-medium">What is your most urgent need right now?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {needs.map(need => (
                                <button
                                    key={need.id}
                                    onClick={() => handleNeedSelect(need.id)}
                                    className="p-4 rounded-2xl border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98] text-left group"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${need.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                                        <Icon name={need.icon} size={20} />
                                    </div>
                                    <span className="font-black text-slate-800 block">{need.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'result' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Icon name="check_circle" size={24} className="text-emerald-500" />
                                {needs.find(n => n.id === selectedNeed)?.label || 'Best Options'}
                            </h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Instant Matches • {results.length} found
                            </p>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {results.length > 0 ? (
                                results.map(item => (
                                    <ResourceCard
                                        key={item.id}
                                        item={item}
                                        isSaved={savedIds.includes(item.id)}
                                        onToggleSave={() => onToggleSave(item.id)}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl">
                                    <p className="font-black text-slate-400 mb-2">No immediate matches found.</p>
                                    <button
                                        onClick={() => setStep('need')}
                                        className="text-indigo-600 font-bold underline"
                                    >
                                        Try another category
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <button
                                onClick={() => setStep('need')}
                                className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600"
                            >
                                ← Start Over
                            </button>
                            <span className="text-[10px] text-slate-300 font-black uppercase">Offline Ready</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrisisWizard;
