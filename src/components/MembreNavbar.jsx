function MembreNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-[#0d1e38] border-b border-[#d4af7a22] px-6 py-3.5 flex justify-between items-center"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <span className="text-[#f0e8d6] text-xl"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        JECT-TRIANI
      </span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#8899aa]">{user?.nom}</span>
        <span className="text-[9px] tracking-widest uppercase px-2 py-1 rounded-full border border-[#d4af7a33] text-[#d4af7a]">
          Membre
        </span>
        <button
          onClick={logout}
          className="w-8 h-8 rounded-full bg-[#d4af7a22] border border-[#d4af7a44] flex items-center justify-center text-[11px] text-[#d4af7a] font-medium hover:bg-[#d4af7a33] transition"
        >
          {user?.nom?.[0]?.toUpperCase() ?? "?"}
        </button>
      </div>
    </nav>
  );
}