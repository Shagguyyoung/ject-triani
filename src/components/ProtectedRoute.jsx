import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false, responsableOnly = false }) {
  const { isAuthenticated, isAdmin, isResponsable } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (adminOnly && !isAdmin) return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center gap-3"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <p className="text-2xl text-[#f0e8d6]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Accès refusé
      </p>
      <p className="text-sm text-[#8899aa]">Cette section est réservée aux administrateurs.</p>
    </div>
  );

  if (responsableOnly && !isResponsable) return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center gap-3"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <p className="text-2xl text-[#f0e8d6]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Accès refusé
      </p>
      <p className="text-sm text-[#8899aa]">Contactez un administrateur.</p>
    </div>
  );

  return children;
}