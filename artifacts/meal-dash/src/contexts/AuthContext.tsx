// artifacts/meal-dash/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  isAdmin: boolean;
};

type LoginResult = { ok: true; isAdmin: boolean } | { ok: false; error: string };
type SignupResult = { ok: true } | { ok: false; error: string };

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => LoginResult;
  signup: (data: { name: string; email: string; password: string; phone: string; address: string }) => SignupResult;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
};

// ── Change these to your real admin credentials ──────────────
const ADMIN_EMAIL = "oluwashijibomiolaseni@gmail.com";
const ADMIN_PASSWORD = "mealdash2024";

const AuthContext = createContext<AuthContextType | null>(null);

function getUsers(): Record<string, { password: string; user: User }> {
  try { return JSON.parse(localStorage.getItem("md_users") || "{}"); } catch { return {}; }
}
function saveUsers(u: Record<string, { password: string; user: User }>) {
  localStorage.setItem("md_users", JSON.stringify(u));
}
function getSavedUser(): User | null {
  try { const r = localStorage.getItem("md_current_user"); return r ? JSON.parse(r) : null; } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getSavedUser);

  const login = useCallback((email: string, password: string): LoginResult => {
    // Admin shortcut
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: "admin", name: "Admin", email: ADMIN_EMAIL,
        address: "", phone: "", isAdmin: true,
      };
      setUser(adminUser);
      localStorage.setItem("md_current_user", JSON.stringify(adminUser));
      return { ok: true, isAdmin: true };
    }

    const users = getUsers();
    const record = users[email.toLowerCase()];
    if (!record) return { ok: false, error: "No account found with this email" };
    if (record.password !== password) return { ok: false, error: "Incorrect password" };

    setUser(record.user);
    localStorage.setItem("md_current_user", JSON.stringify(record.user));
    return { ok: true, isAdmin: false };
  }, []);

  const signup = useCallback((data: {
    name: string; email: string; password: string; phone: string; address: string;
  }): SignupResult => {
    const users = getUsers();
    const key = data.email.toLowerCase();
    if (key === ADMIN_EMAIL.toLowerCase()) return { ok: false, error: "This email is not available" };
    if (users[key]) return { ok: false, error: "An account with this email already exists" };

    const newUser: User = {
      id: Date.now().toString(),
      name: data.name, email: data.email,
      address: data.address, phone: data.phone,
      isAdmin: false,
    };
    users[key] = { password: data.password, user: newUser };
    saveUsers(users);
    setUser(newUser);
    localStorage.setItem("md_current_user", JSON.stringify(newUser));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("md_current_user");
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("md_current_user", JSON.stringify(updated));
      const users = getUsers();
      if (users[prev.email.toLowerCase()]) {
        users[prev.email.toLowerCase()].user = updated;
        saveUsers(users);
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}