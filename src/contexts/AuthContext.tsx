import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  user: { username: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('sonder_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated && authData.user) {
          setIsAuthenticated(true);
          setUser(authData.user);
        }
      } catch (error) {
        localStorage.removeItem('sonder_auth');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Hardcoded credentials
    if (username === 'admin' && password === 'sonder2025') {
      const userData = { username: 'admin' };
      setIsAuthenticated(true);
      setUser(userData);
      
      // Persist to localStorage
      localStorage.setItem('sonder_auth', JSON.stringify({
        isAuthenticated: true,
        user: userData
      }));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('sonder_auth');
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};