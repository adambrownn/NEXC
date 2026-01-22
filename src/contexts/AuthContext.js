import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

// Export the context directly so it can be imported elsewhere
export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const currentUser = authService.getCurrentUser();

                if (currentUser) {
                    setUser(currentUser);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            let result;

            if (credentials.email) {
                result = await authService.loginWithEmail(credentials.email, credentials.password);
            } else if (credentials.phone) {
                result = await authService.loginWithPhone(credentials.phone, credentials.password);
            }

            if (!result.err) {
                setUser(result.user);
                setIsAuthenticated(true);
                return { success: true };
            }

            return { success: false, error: result.err };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);