import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "alumni" | "admin";
  avatar?: string;
  batch?: number;
  major?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string; role?: string; batch?: number; major?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAlumni: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("au_alumni_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("au_alumni_token") || null;
  });

  useEffect(() => {
    if (token) {
      // Validate session with backend
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && data.user) {
            setUser(data.user);
            localStorage.setItem("au_alumni_user", JSON.stringify(data.user));
          } else {
            // Invalid token
            logout();
          }
        })
        .catch(() => {
          // If server temporarily unreachable, keep stored user
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("au_alumni_token", data.token);
        localStorage.setItem("au_alumni_user", JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch (err: any) {
      return { success: false, message: err.message || "Network error" };
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role?: string; batch?: number; major?: string }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("au_alumni_token", data.token);
        localStorage.setItem("au_alumni_user", JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || "Registration failed" };
    } catch (err: any) {
      return { success: false, message: err.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("au_alumni_user");
    localStorage.removeItem("au_alumni_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isAlumni: user?.role === "alumni",
        isStudent: user?.role === "student",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
