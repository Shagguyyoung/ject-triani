import { createContext, useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthContext = createContext();

const NAMESPACE = "https://monassociation.com";

export function AuthProvider({ children }) {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  const roles = user?.[`${NAMESPACE}/roles`] || [];
  const isAdmin = roles.includes("admin");
  const isResponsable = roles.includes("responsable") || isAdmin;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isAdmin, isResponsable, loginWithRedirect, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}