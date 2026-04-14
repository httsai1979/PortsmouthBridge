import { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { GoogleGenerativeAI } from "@google/generative-ai";
import DEFAULT_POLICY_CONFIG from '../config/policy_2026';

const ConnectDashboardView = lazy(() => import('../components/ConnectDashboard'));

interface ConnectPageProps {
    connectResult: any;
    onReset: () => void;
    onClose: () => void;
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const ConnectPage = ({ connectResult, onReset, onClose }: ConnectPageProps) => {
    const navigate = useNavigate();
    const [toolMode, setToolMode] = useState<'dashboard' | 'shield' | 'nursery'>(connectResult ? 'dashboard' : 'dashboard');
    
    // Emergency Shield State
    const [shieldLoading, setShieldLoading] = useState(false);
    const [smsText, setSmsText] = useState('');

    // Nursery Unblocker State
    const [nurseryLoading, setNurseryLoading] = useState(false);
    const [nurseryStep, setNurseryStep] = useState(0);
    const [nurseryData, setNurseryData] = useState({ age: '', income: '', hasUC: '' });
    const [nurseryChecklist, setNurseryChecklist] = useState<string[]>([]);

    const generateLeaveSMS = async () => {
        setShieldLoading(true);
        try {
            const prompt = `Generate a short, firm, and legally robust SMS for a parent in the UK to send to their boss. 
            The parent needs to stay home because their child is suddenly sick. 
            The SMS MUST explicitly invoke 'Section 57A of the Employment Rights Act 1996' (Statutory Time Off for Dependants). 
            Keep it professional but urgent. Include placeholders for [Child Name] and [Boss Name].
            Respond ONLY with the SMS text.`;
            
            const result = await model.generateContent(prompt);
            setSmsText(result.response.text());
        } catch (e) {
            setSmsText("Hi [Boss], I need to take emergency leave today to care for my sick child. I am invoking my statutory right to 'Time Off for Dependants' under UK law. Will keep you updated. [Your Name]");
        } finally {
            setShieldLoading(false);
        }
    };

    const generateNurseryChecklist = async () => {
        setNurseryLoading(true);
        try {
            const prompt = `Based on UK 2026 policy:
            - Child Age: ${nurseryData.age}
            - Family Income: ${nurseryData.income}
            - UC Status: ${nurseryData.hasUC}
            
            Using these policy thresholds: UC Standard Allowance £${DEFAULT_POLICY_CONFIG.ucStandardAllowanceSingle25Plus}, Income threshold £${DEFAULT_POLICY_CONFIG.southernWaterIncomeThreshold}.
            
            Generate a simple 3-step checklist to claim 15 or 30 free nursery hours. 
            Respond ONLY with a JSON array of 3 strings.`;
            
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, '');
            setNurseryChecklist(JSON.parse(text));
            setNurseryStep(2);
        } catch (e) {
            setNurseryChecklist([
                "Check eligibility on the Portsmouth City Council website",
                "Get your code from the Childcare Service",
                "Take the code to your chosen nursery"
            ]);
            setNurseryStep(2);
        } finally {
            setNurseryLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    if (!connectResult && toolMode === 'dashboard') {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[50vh] text-center px-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                    <Icon name="zap" size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Connect Tools</h2>
                <p className="text-slate-500 font-medium mb-8">Need immediate help with childcare or work protection?</p>
                <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
                    <button onClick={() => setToolMode('shield')} className="p-6 bg-rose-600 text-white rounded-3xl font-black flex items-center gap-4 shadow-xl shadow-rose-100">
                        <Icon name="shield" size={24} /> Emergency Leave
                    </button>
                    <button onClick={() => setToolMode('nursery')} className="p-6 bg-emerald-600 text-white rounded-3xl font-black flex items-center gap-4 shadow-xl shadow-emerald-100">
                        <Icon name="baby" size={24} /> Nursery Unblocker
                    </button>
                    <button onClick={() => navigate('/')} className="p-4 text-slate-400 font-black uppercase text-[10px] tracking-widest mt-4">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-lg mx-auto">
                {/* Mode Selector */}
                {connectResult && (
                    <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
                        <button onClick={() => setToolMode('dashboard')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${toolMode === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Strategy</button>
                        <button onClick={() => setToolMode('shield')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${toolMode === 'shield' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-400'}`}>Leave Shield</button>
                        <button onClick={() => setToolMode('nursery')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${toolMode === 'nursery' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400'}`}>Nursery</button>
                    </div>
                )}

                {toolMode === 'dashboard' && (
                    <Suspense fallback={<div className="flex items-center justify-center py-20 min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
                        <ConnectDashboardView result={connectResult} onReset={onReset} onClose={onClose} />
                    </Suspense>
                )}

                {toolMode === 'shield' && (
                    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8 space-y-8 animate-fade-in-up">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900 italic">Emergency Shield</h2>
                            <button onClick={() => connectResult ? setToolMode('dashboard') : navigate('/')} className="p-2 bg-slate-100 rounded-full"><Icon name="x" size={20} /></button>
                        </div>
                        <div className="p-6 bg-rose-50 rounded-3xl border-2 border-rose-100 flex gap-4 items-start">
                            <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shrink-0"><Icon name="alert-triangle" size={24} /></div>
                            <div>
                                <h4 className="text-sm font-black text-rose-900">Sick Child Protection</h4>
                                <p className="text-xs font-medium text-rose-700/70 mt-1">Legally, your boss CANNOT fire you for taking emergency time off for a sick dependant.</p>
                            </div>
                        </div>

                        {!smsText ? (
                            <button 
                                onClick={generateLeaveSMS} 
                                disabled={shieldLoading}
                                className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {shieldLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icon name="message-square" size={20} />}
                                Generate Legal Leave SMS
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Copy & Send to Boss</p>
                                <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl text-sm font-bold text-slate-900 leading-relaxed italic">
                                    {smsText}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => copyToClipboard(smsText)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                                        <Icon name="copy" size={16} /> Copy Text
                                    </button>
                                    <button onClick={() => setSmsText('')} className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Reset</button>
                                </div>
                            </div>
                        )}
                        <p className="text-[8px] text-slate-300 font-bold uppercase text-center leading-loose">Based on Section 57A Employment Rights Act 1996. Not legal advice. Speak to ACAS for more.</p>
                    </div>
                )}

                {toolMode === 'nursery' && (
                    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8 space-y-8 animate-fade-in-up">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900 italic">Nursery Unblocker</h2>
                            <button onClick={() => connectResult ? setToolMode('dashboard') : navigate('/')} className="p-2 bg-slate-100 rounded-full"><Icon name="x" size={20} /></button>
                        </div>

                        {nurseryStep === 0 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">How old is your child?</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Under 2', '2 Years Old', '3-4 Years Old', '5+'].map(age => (
                                            <button key={age} onClick={() => { setNurseryData({ ...nurseryData, age }); setNurseryStep(1); }} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 text-left hover:border-emerald-500 transition-all">{age}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {nurseryStep === 1 && (
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Family Income (Annual)</label>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {['Under £20k', 'Over £20k'].map(inc => (
                                                <button key={inc} onClick={() => setNurseryData({ ...nurseryData, income: inc })} className={`p-4 border-2 rounded-2xl text-xs font-bold text-slate-900 text-left transition-all ${nurseryData.income === inc ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}>{inc}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">On Universal Credit?</label>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {['Yes', 'No'].map(uc => (
                                                <button key={uc} onClick={() => setNurseryData({ ...nurseryData, hasUC: uc })} className={`p-4 border-2 rounded-2xl text-xs font-bold text-slate-900 text-left transition-all ${nurseryData.hasUC === uc ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}>{uc}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={generateNurseryChecklist}
                                    disabled={!nurseryData.income || !nurseryData.hasUC || nurseryLoading}
                                    className="w-full py-6 bg-emerald-600 text-white rounded-[32px] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {nurseryLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icon name="check" size={20} />}
                                    Get My Checklist
                                </button>
                                <button onClick={() => setNurseryStep(0)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Go Back</button>
                            </div>
                        )}

                        {nurseryStep === 2 && (
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Accessing Free Hours</h4>
                                <div className="space-y-4">
                                    {nurseryChecklist.map((step, idx) => (
                                        <div key={idx} className="flex gap-4 p-5 bg-emerald-50 border-2 border-emerald-100 rounded-3xl items-start">
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</div>
                                            <p className="text-sm font-bold text-emerald-900 leading-tight">{step}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => { setNurseryStep(0); setNurseryData({ age: '', income: '', hasUC: '' }); }} className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Calculate Again</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectPage;
