import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate auth state from localStorage on first mount
  useEffect(() => {
    const storedToken = localStorage.getItem('alvora_token');
    const storedUser = localStorage.getItem('alvora_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('alvora_token');
        localStorage.removeItem('alvora_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = ({ user: userData, token: tokenData }) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('alvora_token', tokenData);
    localStorage.setItem('alvora_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('alvora_token');
    localStorage.removeItem('alvora_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
