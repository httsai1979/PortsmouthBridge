import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
    children: JSX.Element;
    requirePartner?: boolean;
}

const ProtectedRoute = ({ children, requirePartner = false }: ProtectedRouteProps) => {
    const { currentUser, isPartner, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!currentUser) {
        // Redirect to home if not logged in
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (requirePartner && !isPartner) {
        // Redirect to home if partner access is required but not granted
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
