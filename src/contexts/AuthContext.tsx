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
                // WHITELIST CHECK FIRST - Before any Firestore calls
                // This ensures test accounts work even if Firestore has connection issues
                const isWhitelisted =
                    user.email === 'test@test.org' ||
                    user.email?.endsWith('@sustainsage-group.com') ||
                    user.email?.endsWith('@portsmouthbridge.org');

                if (isWhitelisted) {
                    console.log('✅ Partner access granted via whitelist:', user.email);
                    setIsPartner(true);
                } else {
                    // Only check Firestore if not in whitelist
                    try {
                        const partnerDoc = await getDoc(doc(db, 'partners', user.uid));
                        setIsPartner(partnerDoc.exists());
                        if (partnerDoc.exists()) {
                            console.log('✅ Partner access granted via Firestore');
                        }
                    } catch (error) {
                        console.warn('Could not verify partner status from Firestore:', error);
                        setIsPartner(false);
                    }
                }
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
