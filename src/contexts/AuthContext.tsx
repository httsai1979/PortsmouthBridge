import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
    currentUser: User | null;
    isPartner: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isPartner, setIsPartner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Check if user has a partner profile in Firestore
                // We'll store partner-specific metadata in a 'partners' collection
                const partnerDoc = await getDoc(doc(db, 'partners', user.uid));

                // PB: Developer Whitelist (Allow test account to access dashboard)
                const isWhitelisted = user.email === 'test@test.org' || !!user.email?.endsWith('@sustainsage-group.com');

                setIsPartner(partnerDoc.exists() || isWhitelisted);
            } else {
                setIsPartner(false);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, isPartner, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
