import { useEffect } from 'react'; // [FIX] Added useEffect
import { Resource } from '../data';
import Icon from './Icon';

// [FIX] Move styles out
const PRINT_PAGE_STYLES = `
    @media print {
        @page { margin: 0.5cm; }
        body { -webkit-print-color-adjust: exact; }
        .print-container { position: static; overflow: visible; }
        .print\\:hidden { display: none !important; }
    }
`;

const PrintView = ({ data, onClose }: { data: Resource[], onClose: () => void }) => {
    // Group data by category for clearer reading
    const categories = ['food', 'shelter', 'warmth', 'support'];

    // [FIX] Inject styles ONCE
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = PRINT_PAGE_STYLES;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);
    
    return (
        <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto print-container animate-fade-in">
            {/* Control Bar (Hidden when printing) */}
            <div className="sticky top-0 bg-indigo-600 text-white p-4 flex justify-between items-center print:hidden shadow-lg z-50">
                <div>
                    <h2 className="font-bold text-lg">Print / Screenshot Mode</h2>
                    <p className="text-xs opacity-80">Press 'Print' or take a screenshot now.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => window.print()} className="px-6 py-2 bg-white text-indigo-600 rounded-full font-bold text-sm shadow-sm hover:bg-indigo-50 transition-colors">
                        Print
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <Icon name="x" size={24} />
                    </button>
                </div>
            </div>

            {/* Printable Content */}
            <div className="p-8 max-w-3xl mx-auto text-black">
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Portsmouth Bridge</h1>
                    <p className="text-sm font-bold uppercase tracking-widest">Community Support Guide • Offline Edition</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="border border-black p-4 rounded-lg">
                        <h3 className="font-black text-sm uppercase mb-2 flex items-center gap-2">
                            <Icon name="alert" size={16} /> Emergency Numbers
                        </h3>
                        <div className="space-y-1 text-sm">
                            <p><strong>Emergency:</strong> 999</p>
                            <p><strong>NHS Medical:</strong> 111</p>
                            <p><strong>Housing Options:</strong> 023 9283 4000</p>
                            <p><strong>Samaritans:</strong> 116 123 (Free)</p>
                        </div>
                    </div>
                    <div className="border border-black p-4 rounded-lg">
                        <h3 className="font-black text-sm uppercase mb-2">Key Tips</h3>
                        <ul className="list-disc pl-4 text-xs space-y-1">
                            <li>Green 'Open' tag means no referral needed.</li>
                            <li>Libraries offer free warmth & charging.</li>
                            <li>Community Meals are free and welcoming.</li>
                        </ul>
                    </div>
                </div>

                {categories.map(cat => {
                    const items = data.filter(i => i.category === cat);
                    if (items.length === 0) return null;

                    return (
                        <div key={cat} className="mb-8 break-inside-avoid">
                            <h2 className="text-xl font-black uppercase border-b-2 border-black mb-4 pb-1">
                                {cat === 'food' ? 'Food & Pantries' : 
                                 cat === 'shelter' ? 'Housing Support' : 
                                 cat === 'warmth' ? 'Warm Spaces' : 'Community Support'}
                            </h2>
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-200 break-inside-avoid">
                                        <div className="pr-4 max-w-[70%]">
                                            <h4 className="font-bold text-base">{item.name}</h4>
                                            <p className="text-xs mt-1">{item.address}</p>
                                            <p className="text-xs italic mt-1 text-gray-600">{item.requirements}</p>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-xs font-bold font-mono">
                                                {item.phone || 'No Phone'}
                                            </p>
                                            <div className="mt-2 text-[10px] uppercase font-bold border border-black inline-block px-1">
                                                {item.area}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="mt-8 pt-4 border-t-2 border-black text-center text-xs font-bold uppercase tracking-widest">
                    Generated by Portsmouth Bridge • Keep this guide safe
                </div>
            </div>
            
            {/* NO STYLE TAG HERE */}
        </div>
    );
};

export default PrintView;