import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import Dashboard from "./pages/Dashboard";
import Membres from "./pages/Membres";
import Cotisations from "./pages/Cotisations";

function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-[#0d1e38] border-b border-[#d4af7a22] px-6 py-3.5 flex justify-between items-center"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <span className="text-[#f0e8d6] text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        MonAssociation
      </span>
      <div className="flex items-center gap-1">
        {[
          { to: "/", label: "Dashboard" },
          { to: "/membres", label: "Membres" },
          { to: "/cotisations", label: "Cotisations" },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) =>
              `px-3 py-1.5 text-xs rounded-lg transition ${isActive
                ? "bg-[#d4af7a22] text-[#d4af7a] border border-[#d4af7a44]"
                : "text-[#8899aa] hover:text-[#f0e8d6]"}`
            }>
            {label}
          </NavLink>
        ))}

        {/* Badge rôle */}
        <span className="ml-2 text-[9px] tracking-widest uppercase px-2 py-1 rounded-full border border-[#d4af7a33] text-[#d4af7a]">
          {isAdmin ? "Admin" : "Responsable"}
        </span>

        {/* Avatar + logout */}
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          title="Se déconnecter"
          className="ml-2 w-8 h-8 rounded-full bg-[#d4af7a22] border border-[#d4af7a44] flex items-center justify-center text-[11px] text-[#d4af7a] font-medium hover:bg-[#d4af7a33] transition"
        >
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </button>
      </div>
    </nav>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d4af7a]" />
    </div>
  );

  if (!isAuthenticated) return <LoginPage />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/membres" element={
          <ProtectedRoute adminOnly><Membres /></ProtectedRoute>
        } />
        <Route path="/cotisations" element={
          <ProtectedRoute><Cotisations /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}