import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isLoading, isAdmin, isResponsable, loginWithRedirect } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d4af7a]" />
    </div>
  );

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  if (adminOnly && !isAdmin) return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center gap-3">
      <p className="text-2xl text-[#f0e8d6]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Accès refusé
      </p>
      <p className="text-sm text-[#8899aa]">Vous n'avez pas les droits nécessaires.</p>
    </div>
  );

  if (!isResponsable) return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center gap-3">
      <p className="text-2xl text-[#f0e8d6]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Accès refusé
      </p>
      <p className="text-sm text-[#8899aa]">Contactez un administrateur.</p>
    </div>
  );

  return children;
}