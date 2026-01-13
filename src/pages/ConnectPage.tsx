import { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const ConnectDashboardView = lazy(() => import('../components/ConnectDashboard'));

interface ConnectPageProps {
    connectResult: any;
    onReset: () => void;
    onClose: () => void;
}

const ConnectPage = ({ connectResult, onReset, onClose }: ConnectPageProps) => {
    const navigate = useNavigate();

    if (!connectResult) {
        // Redirect or show message if no result
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[50vh] text-center px-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                    <Icon name="zap" size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">No Calculation Results</h2>
                <p className="text-slate-500 font-medium mb-8">Please complete a Connect Check to see your personalized dashboard.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-indigo-600/5 py-8 px-4">
            <div className="max-w-lg mx-auto">
                <Suspense fallback={
                    <div className="flex items-center justify-center py-20 min-h-[50vh]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                }>
                    <ConnectDashboardView
                        result={connectResult}
                        onReset={onReset}
                        onClose={onClose}
                    />
                </Suspense>
            </div>
        </div>
    );
};

export default ConnectPage;
