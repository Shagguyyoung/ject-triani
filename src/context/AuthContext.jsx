import { createContext, useContext, useState } from "react";
import users from "../data/users";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(email, password) {
    // Comptes dynamiques (membres ajoutés via l'interface)
    const dynamicUsers = JSON.parse(
      localStorage.getItem("association_users") || "[]"
    );

    // Fusionner avec les comptes fixes (admin)
    const allUsers = [...users, ...dynamicUsers];

    const found = allUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem("auth_user", JSON.stringify(safeUser));
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("auth_user");
  }

  const isAdmin = user?.role === "admin";
  const isResponsable = user?.role === "responsable" || isAdmin;

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAdmin, isResponsable, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}