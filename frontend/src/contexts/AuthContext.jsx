import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/apiClient";

const AuthContext = createContext(undefined);

function dbProfileToUserProfile(p) {
  return {
    id: p.id,
    username: p.username,
    email: p.email,
    points: p.points ?? 0,
    streak: p.streak ?? 0,
    avatarUrl: p.avatarUrl ?? null,
    createdAt: new Date(p.createdAt),
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const p = await api.get('/api/auth/me');
      setUser({ id: p.id, email: p.email });
      setProfile(dbProfileToUserProfile(p));
    } catch {
      // Token expired or invalid
      api.clearToken();
      setUser(null);
      setProfile(null);
    }
  }, []);

  // On mount – restore session from stored JWT
  useEffect(() => {
    if (api.hasToken()) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      api.setToken(res.token);
      setUser({ id: res.user.id, email: res.user.email });
      setProfile(dbProfileToUserProfile(res.user));
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email) => {
    await api.post('/api/auth/send-otp', { email });
  };

  const register = async (username, email, password, otp) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { username, email, password, otp });
      api.setToken(res.token);
      setUser({ id: res.user.id, email: res.user.email });
      setProfile(dbProfileToUserProfile(res.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    api.clearToken();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (api.hasToken()) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        login,
        register,
        sendOTP,
        logout,
        refreshProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
