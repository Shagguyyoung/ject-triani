import { useState } from "react";
import { useMembers } from "../hooks/useMembers";

const badge = {
  ok: { label: "À jour", cls: "bg-green-950 text-green-400" },
  pending: { label: "En attente", cls: "bg-amber-950 text-amber-400" },
  late: { label: "En retard", cls: "bg-red-950 text-red-400" },
};

function initials(nom) {
  return nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Membres() {
  const { membres, loading, ajouterMembre, supprimerMembre } = useMembers();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nom: "", tel: "", email: "", role: "Membre", statut: "ok" });

  const filtered = membres.filter((m) => {
    const q = search.toLowerCase();
    const matchQ = m.nom.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.tel?.includes(q);
    const matchF = filtre === "tous" || m.statut === filtre;
    return matchQ && matchF;
  });

  const handleAjouter = async () => {
    if (!form.nom.trim()) return;
    await ajouterMembre(form);
    setModal(false);
    setForm({ nom: "", tel: "", email: "", role: "Membre", statut: "ok" });
  };

  const filtres = [
    { key: "tous", label: "Tous" },
    { key: "ok", label: "À jour" },
    { key: "pending", label: "En attente" },
    { key: "late", label: "En retard" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <p className="text-[#8899aa] text-sm tracking-widest">Chargement...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1628]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="p-6">
        <h1 className="text-3xl font-medium text-[#f0e8d6] mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Membres</h1>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center mb-5">
          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1e38] border border-[#d4af7a22] rounded-lg pl-9 pr-3 py-2 text-sm text-[#f0e8d6] placeholder-[#445566] outline-none"
            />
          </div>

          {filtres.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                filtre === f.key
                  ? "border-[#d4af7a66] text-[#d4af7a] bg-[#0d1e38]"
                  : "border-[#d4af7a22] text-[#8899aa] bg-[#0d1e38]"
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={() => setModal(true)}
            className="ml-auto bg-[#d4af7a] text-[#0a1628] text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            + Ajouter
          </button>
        </div>

        <p className="text-xs text-[#8899aa] mb-3">{filtered.length} membre{filtered.length > 1 ? "s" : ""}</p>

        {/* Liste */}
        <div className="flex flex-col gap-2.5">
          {filtered.map((m) => (
            <div key={m.id} className="bg-[#0d1e38] border border-[#d4af7a22] hover:border-[#d4af7a44] rounded-xl p-4 flex items-center gap-3 transition cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#d4af7a22] flex items-center justify-center text-sm text-[#d4af7a] font-medium flex-shrink-0">
                {initials(m.nom)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#f0e8d6]">{m.nom}</p>
                <p className="text-[11px] text-[#8899aa]">{m.role} · {m.tel}</p>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${badge[m.statut].cls}`}>
                {badge[m.statut].label}
              </span>
              <div className="flex gap-1.5 ml-2">
                <button className="text-[11px] px-2.5 py-1 rounded-md bg-[#d4af7a11] border border-[#d4af7a22] text-[#d4af7a]">
                  Modifier
                </button>
                <button
                  onClick={() => supprimerMembre(m.id)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-[#f8717111] border border-[#f8717122] text-red-400"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1e38] border border-[#d4af7a33] rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl text-[#f0e8d6] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Nouveau membre</h2>

            {[
              { label: "Nom complet", key: "nom", placeholder: "Koné Aminata" },
              { label: "Téléphone", key: "tel", placeholder: "07 00 11 22" },
              { label: "Email", key: "email", placeholder: "email@example.com" },
            ].map((f) => (
              <div key={f.key} className="mb-3">
                <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">{f.label}</label>
                <input
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] placeholder-[#445566] outline-none"
                />
              </div>
            ))}

            <div className="mb-3">
              <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">Rôle</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] outline-none"
              >
                {["Membre", "Trésorier", "Secrétaire", "Président"].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">Statut</label>
              <select
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value })}
                className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] outline-none"
              >
                <option value="ok">À jour</option>
                <option value="pending">En attente</option>
                <option value="late">En retard</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-xs text-[#8899aa] border border-[#d4af7a22] rounded-lg">Annuler</button>
              <button onClick={handleAjouter} className="px-4 py-2 text-xs font-medium bg-[#d4af7a] text-[#0a1628] rounded-lg hover:opacity-90">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}