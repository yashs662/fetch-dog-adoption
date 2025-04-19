import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, logoutUser } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  login: (name: string, email: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from sessionStorage on component mount
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });
  
  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem('userName') || '';
  });
  
  const [userEmail, setUserEmail] = useState(() => {
    return sessionStorage.getItem('userEmail') || '';
  });

  // Update sessionStorage whenever auth state changes
  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated.toString());
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('userEmail', userEmail);
  }, [isAuthenticated, userName, userEmail]);

  const login = async (name: string, email: string) => {
    try {
      await loginUser(name, email);
      setIsAuthenticated(true);
      setUserName(name);
      setUserEmail(email);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setUserName('');
      setUserEmail('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, userEmail, login, logout }}>
      {children}
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