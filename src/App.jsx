import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import Dashboard from "./pages/Dashboard";
import Membres from "./pages/Membres";
import Cotisations from "./pages/Cotisations";
import EspaceMembre from "./pages/EspaceMembre";
import Evenements from "./pages/Evenements";
import PageWrapper from "./components/PageWrapper";
import { motion } from "framer-motion";

// ─── Navbar Admin/Responsable ───────────────────────
function Navbar() {
  const { user, isAdmin, isResponsable, logout } = useAuth();

  const links = [
    { to: "/", label: "Dashboard", show: true },
    { to: "/membres", label: "Membres", show: isAdmin },
    { to: "/cotisations", label: "Cotisations", show: isResponsable },
    { to: "/evenements", label: "Événements", show: isAdmin },
  ];

  return (
    <nav className="bg-[#0d1e38] border-b border-[#d4af7a22] px-6 py-3.5 flex justify-between items-center"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <span className="text-[#f0e8d6] text-xl"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        JECT-TRIANI
      </span>
      <div className="flex items-center gap-1">
        {links.filter((l) => l.show).map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) =>
              `px-3 py-1.5 text-xs rounded-lg transition ${isActive
                ? "bg-[#d4af7a22] text-[#d4af7a] border border-[#d4af7a44]"
                : "text-[#8899aa] hover:text-white"}`
            }>
            {label}
          </NavLink>
        ))}
        <span className="ml-2 text-[9px] tracking-widest uppercase px-2 py-1 rounded-full border border-[#d4af7a33] text-[#d4af7a]">
          {isAdmin ? "Admin" : "Responsable"}
        </span>
        <div className="flex items-center gap-2 ml-3">
          <span className="text-xs text-[#8899aa] hidden md:block">{user?.nom}</span>
          <button onClick={logout}
            className="w-8 h-8 rounded-full bg-[#d4af7a22] border border-[#d4af7a44] flex items-center justify-center text-[11px] text-[#d4af7a] font-medium hover:bg-[#d4af7a33] transition">
            {user?.nom?.[0]?.toUpperCase() ?? "?"}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Navbar Membre ───────────────────────────────────
function MembreNavbar() {
  const { user, logout } = useAuth();

  return (
    // Dans Navbar, wrappez le nav
<motion.nav
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="bg-[#0d1e38] border-b border-[#d4af7a22] px-6 py-3.5 flex justify-between items-center">
      <span className="text-[#f0e8d6] text-xl"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        JECT-TRIANI
      </span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#8899aa]">{user?.nom}</span>
        <span className="text-[9px] tracking-widest uppercase px-2 py-1 rounded-full border border-[#d4af7a33] text-[#d4af7a]">
          Membre
        </span>
        <button onClick={logout}
          className="w-8 h-8 rounded-full bg-[#d4af7a22] border border-[#d4af7a44] flex items-center justify-center text-[11px] text-[#d4af7a] font-medium hover:bg-[#d4af7a33] transition">
          {user?.nom?.[0]?.toUpperCase() ?? "?"}
        </button>
      </div>
    </motion.nav>
  );
}

// ─── Contenu principal ───────────────────────────────
function AppContent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <LoginPage />;

  if (user?.role === "membre") {
    return (
      <>
        <MembreNavbar />
        <Routes>
          <Route path="*" element={<EspaceMembre />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={
  <ProtectedRoute>
    <PageWrapper><Dashboard /></PageWrapper>
  </ProtectedRoute>
} />
<Route path="/membres" element={
  <ProtectedRoute adminOnly>
    <PageWrapper><Membres /></PageWrapper>
  </ProtectedRoute>
} />
<Route path="/cotisations" element={
  <ProtectedRoute>
    <PageWrapper><Cotisations /></PageWrapper>
  </ProtectedRoute>
} />
<Route path="/evenements" element={
  <ProtectedRoute>
    <PageWrapper><Evenements /></PageWrapper>
  </ProtectedRoute>
} />
<Route path="/mon-espace" element={
  <ProtectedRoute>
    <PageWrapper><EspaceMembre /></PageWrapper>
  </ProtectedRoute>
} />
      </Routes>
    </>
  );
}

// ─── App ─────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}