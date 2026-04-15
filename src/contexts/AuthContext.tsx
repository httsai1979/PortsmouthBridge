import { useEffect, useState, type ReactNode } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { AuthContext } from './AuthContextBase';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isPartner, setIsPartner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    // [PHASE 1] Custom Claims RBAC Implementation
                    // We check the ID token for the 'role' field set by Cloud Functions
                    const tokenResult = await user.getIdTokenResult(true); // Force refresh to pick up new claims
                    const role = tokenResult.claims.role;

                    if (role === 'partner') {
                        console.log('✅ Partner access verified via Custom Claims');
                        setIsPartner(true);
                    } else {
                        setIsPartner(false);
                    }
                } catch (error) {
                    console.warn('Failed to fetch custom claims:', error);
                    setIsPartner(false);
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
