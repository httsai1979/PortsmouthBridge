import { useNavigate } from 'react-router-dom';
import FAQSection from '../components/FAQSection';
import Icon from '../components/Icon';

const FAQPage = () => {
    const navigate = useNavigate();

    const handleFAQNavigate = (target: string) => {
        if (target === 'community-loop') {
            navigate('/loop');
        } else if (target === 'connect-benefits') {
            navigate('/connect');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600">
                        <Icon name="chevron-left" size={24} />
                    </button>
                    <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Support Guide</h1>
                    <div className="w-10"></div>
                </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <FAQSection onClose={() => navigate(-1)} onNavigate={handleFAQNavigate} />
            </div>
        </div>
    );
};

export default FAQPage;
