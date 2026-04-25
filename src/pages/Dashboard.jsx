export default function Dashboard() {
  const stats = [
    { label: "Total membres", value: "247", sub: "+12 ce mois", subColor: "text-[#d4af7a]" },
    { label: "À jour", value: "189", sub: "76% du total", subColor: "text-[#8899aa]", valColor: "text-green-400" },
    { label: "En attente", value: "38", sub: "15% du total", subColor: "text-[#8899aa]", valColor: "text-amber-400" },
    { label: "En retard", value: "20", sub: "9% du total", subColor: "text-[#8899aa]", valColor: "text-red-400" },
  ];

  const mois = [
    { label: "Janvier", pct: 82 },
    { label: "Février", pct: 75 },
    { label: "Mars", pct: 90 },
    { label: "Avril", pct: 76 },
  ];

  const membres = [
    { initiales: "KA", nom: "Koné Aminata", role: "Membre", statut: "ok" },
    { initiales: "BM", nom: "Bamba Moussa", role: "Trésorier", statut: "ok" },
    { initiales: "TF", nom: "Touré Fatou", role: "Membre", statut: "pending" },
    { initiales: "DI", nom: "Diallo Ibrahim", role: "Membre", statut: "late" },
  ];

  const badgeStyle = {
    ok: "bg-green-950 text-green-400",
    pending: "bg-amber-950 text-amber-400",
    late: "bg-red-950 text-red-400",
  };
  const badgeLabel = { ok: "À jour", pending: "En attente", late: "En retard" };

  return (
    <div className="min-h-screen bg-[#0a1628]" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* Topbar */}
      

      <div className="p-6">
        <p className="text-xs tracking-widest text-[#8899aa] mb-1">Bonjour, Admin</p>
        <h1 className="text-3xl font-medium text-[#f0e8d6] mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Vue d'ensemble
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
              <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">{s.label}</p>
              <p className={`text-2xl font-medium mb-1 ${s.valColor || "text-[#f0e8d6]"}`}>{s.value}</p>
              <p className={`text-[11px] ${s.subColor}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Cotisations */}
        <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4 mb-6">
          <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-1">Cotisations perçues</p>
          <p className="text-2xl font-medium text-[#d4af7a]">1 890 000 F</p>
          <p className="text-[11px] text-[#8899aa]">sur 2 470 000 F attendus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Barres participation */}
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#d4af7a] mb-4">Participation mensuelle</p>
            {mois.map((m) => (
              <div key={m.label} className="flex items-center gap-3 mb-3">
                <span className="text-xs text-[#8899aa] min-w-[64px]">{m.label}</span>
                <div className="flex-1 h-1.5 bg-[#d4af7a11] rounded-full overflow-hidden">
                  <div className="h-full bg-[#d4af7a] rounded-full" style={{ width: `${m.pct}%` }} />
                </div>
                <span className="text-xs text-[#d4af7a] min-w-[32px] text-right">{m.pct}%</span>
              </div>
            ))}
          </div>

          {/* Répartition */}
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#d4af7a] mb-4">Répartition</p>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 110 110" className="w-full h-full">
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#d4af7a11" strokeWidth="18"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#4ade80" strokeWidth="18" strokeDasharray="192 251" strokeDashoffset="0" transform="rotate(-90 55 55)"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#fbbf24" strokeWidth="18" strokeDasharray="38 251" strokeDashoffset="-192" transform="rotate(-90 55 55)"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#f87171" strokeWidth="18" strokeDasharray="21 251" strokeDashoffset="-230" transform="rotate(-90 55 55)"/>
                  <text x="55" y="51" textAnchor="middle" fontSize="16" fontWeight="500" fill="#f0e8d6">76%</text>
                  <text x="55" y="65" textAnchor="middle" fontSize="10" fill="#8899aa">à jour</text>
                </svg>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                {[["#4ade80","À jour","189"],["#fbbf24","En attente","38"],["#f87171","En retard","20"]].map(([c,l,n])=>(
                  <div key={l} className="flex items-center gap-2 text-xs text-[#8899aa]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:c}}/>
                    {l} — {n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Derniers membres */}
        <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
          <p className="text-[10px] tracking-[.18em] uppercase text-[#d4af7a] mb-3">Derniers membres ajoutés</p>
          {membres.map((m) => (
            <div key={m.nom} className="flex items-center gap-3 py-2.5 border-b border-[#d4af7a11] last:border-b-0">
              <div className="w-8 h-8 rounded-full bg-[#d4af7a22] flex items-center justify-center text-[11px] text-[#d4af7a] font-medium flex-shrink-0">
                {m.initiales}
              </div>
              <div>
                <p className="text-sm font-medium text-[#f0e8d6]">{m.nom}</p>
                <p className="text-[11px] text-[#8899aa]">{m.role}</p>
              </div>
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeStyle[m.statut]}`}>
                {badgeLabel[m.statut]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}