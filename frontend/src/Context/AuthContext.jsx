import { createContext, useState, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  async function login(email, password) {
    const res = await api.post('/api/login', { email, password });
    const newUser = { name: res.data.name, role: res.data.role };

    setToken(res.data.token);
    setUser(newUser);

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext, AuthProvider, useAuth };

