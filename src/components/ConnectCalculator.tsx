import { useState } from 'react';
import Icon from './Icon';
import { calculateConnectBenefits, type ConnectInput, type ConnectResult } from '../services/ConnectLogic';

interface ConnectCalculatorProps {
    onComplete: (result: ConnectResult, input: ConnectInput) => void;
    onClose: () => void;
}

const ConnectCalculator = ({ onComplete, onClose }: ConnectCalculatorProps) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ConnectInput>({
        postcode: '',
        tenure: 'rent_private',
        rentAmount: 0,
        adults: 1,
        children: 0,
        childAges: [],
        isDisabled: false,
        netMonthlyIncome: 1200,
        hasUC: false,
        hasChildBenefit: false,
        isSouthernWater: false,
        isEnergyDebt: false,
        isPregnant: false,
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = () => {
        const result = calculateConnectBenefits(formData);
        onComplete(result, formData);
    };

    return (
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-fade-in-up flex flex-col border border-slate-100 max-h-[90vh]">
            {/* Header */}
            <div className="bg-indigo-600 p-8 text-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-black">Portsmouth Connect</h2>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                        <Icon name="x" size={20} />
                    </button>
                </div>
                <p className="text-indigo-100 text-sm font-bold">Uncovering support for "Hidden Poverty" households.</p>

                {/* Progress Bar */}
                <div className="mt-6 flex gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/30'}`} />
                    ))}
                </div>
            </div>

            <div className="p-8 overflow-y-auto">
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Where do you live & how?</label>
                            <input
                                type="text"
                                placeholder="Postcode (e.g. PO1)"
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold"
                                value={formData.postcode}
                                onChange={e => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                {(['rent_private', 'rent_social', 'owner', 'mortgage'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFormData({ ...formData, tenure: t })}
                                        className={`p-4 border-2 rounded-2xl text-[10px] font-black uppercase transition-all ${formData.tenure === t ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-white text-slate-400'}`}
                                    >
                                        {t.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Rent/Mortgage (£)</label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold"
                                    value={formData.rentAmount || ''}
                                    onChange={e => setFormData({ ...formData, rentAmount: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Who lives with you?</label>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-sm font-bold text-slate-700">Adults</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setFormData({ ...formData, adults: Math.max(1, formData.adults - 1) })} className="p-2 bg-white rounded-xl border border-slate-200"><Icon name="minus" size={16} /></button>
                                    <span className="font-black w-4 text-center">{formData.adults}</span>
                                    <button onClick={() => setFormData({ ...formData, adults: formData.adults + 1 })} className="p-2 bg-white rounded-xl border border-slate-200"><Icon name="plus" size={16} /></button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-sm font-bold text-slate-700">Children</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setFormData({ ...formData, children: Math.max(0, formData.children - 1) })} className="p-2 bg-white rounded-xl border border-slate-200"><Icon name="minus" size={16} /></button>
                                    <span className="font-black w-4 text-center">{formData.children}</span>
                                    <button onClick={() => setFormData({ ...formData, children: formData.children + 1 })} className="p-2 bg-white rounded-xl border border-slate-200"><Icon name="plus" size={16} /></button>
                                </div>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, isDisabled: !formData.isDisabled })}
                                className={`w-full p-4 border-2 rounded-2xl flex items-center justify-between transition-all ${formData.isDisabled ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100'}`}
                            >
                                <span className="text-sm font-black">Disability / Long-term health?</span>
                                <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.isDisabled ? 'bg-orange-500' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isDisabled ? 'left-5' : 'left-1'}`} />
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Snapshot</label>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-700">Net Monthly Earnings</span>
                                    <span className="text-lg font-black text-indigo-600">£{formData.netMonthlyIncome}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5000"
                                    step="50"
                                    className="w-full accent-indigo-600"
                                    value={formData.netMonthlyIncome}
                                    onChange={e => setFormData({ ...formData, netMonthlyIncome: Number(e.target.value) })}
                                />
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Estimated annual: £{formData.netMonthlyIncome * 12}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => setFormData({ ...formData, isSouthernWater: !formData.isSouthernWater })}
                                    className={`p-4 border-2 rounded-2xl text-left transition-all ${formData.isSouthernWater ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] font-black uppercase ${formData.isSouthernWater ? 'text-blue-600' : 'text-slate-400'}`}>Southern Water Customer?</span>
                                        {formData.isSouthernWater && <Icon name="check" size={16} className="text-blue-600" />}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, hasUC: !formData.hasUC })}
                                    className={`p-4 border-2 rounded-2xl text-left transition-all ${formData.hasUC ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] font-black uppercase ${formData.hasUC ? 'text-emerald-600' : 'text-slate-400'}`}>Already on Universal Credit?</span>
                                        {formData.hasUC && <Icon name="check" size={16} className="text-emerald-600" />}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                {step > 1 && (
                    <button onClick={handleBack} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black uppercase text-slate-400">Back</button>
                )}
                {step < 3 ? (
                    <button onClick={handleNext} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase shadow-xl shadow-indigo-100">Next Step</button>
                ) : (
                    <button onClick={handleSubmit} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black uppercase shadow-xl shadow-emerald-100">Calculate Results</button>
                )}
            </div>
        </div>
    );
};

export default ConnectCalculator;
