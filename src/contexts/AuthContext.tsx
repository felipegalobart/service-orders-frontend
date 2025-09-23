import React, { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, AuthContextType, LoginRequest, User } from '../types/auth';

// Initial state
const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
};

// Action types
type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'LOGIN_FAILURE' }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'RESTORE_AUTH'; payload: { user: User; token: string } };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                isLoading: true,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        case 'RESTORE_AUTH':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check for stored auth data on mount
    useEffect(() => {
        const checkStoredAuth = () => {
            try {
                const storedToken = localStorage.getItem('auth_token');
                const storedUser = localStorage.getItem('auth_user');

                if (storedToken && storedUser) {
                    const user = JSON.parse(storedUser);
                    dispatch({
                        type: 'RESTORE_AUTH',
                        payload: { user, token: storedToken },
                    });
                } else {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } catch (error) {
                console.error('Error restoring auth:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        checkStoredAuth();
    }, []);

    // Login function
    const login = async (credentials: LoginRequest): Promise<void> => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            // Store in localStorage
            localStorage.setItem('auth_token', data.access_token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: data.user, token: data.access_token },
            });
        } catch (error) {
            console.error('Login error:', error);
            dispatch({ type: 'LOGIN_FAILURE' });
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        dispatch({ type: 'LOGOUT' });
    };

    // Refresh token function
    const refreshToken = async (): Promise<void> => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${state.token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();

            // Update stored token
            localStorage.setItem('auth_token', data.access_token);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: state.user!, token: data.access_token },
            });
        } catch (error) {
            console.error('Token refresh error:', error);
            logout();
            throw error;
        }
    };

    const contextValue: AuthContextType = {
        ...state,
        login,
        logout,
        refreshToken,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Export context for use in custom hook
export { AuthContext };
