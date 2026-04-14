import { createContext, useContext } from 'react';
import { type User } from 'firebase/auth';

export interface AuthContextType {
    currentUser: User | null;
    isPartner: boolean;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
