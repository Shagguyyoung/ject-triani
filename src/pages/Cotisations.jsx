import { useState } from "react";
import { useCotisations } from "../hooks/useCotisations";
import { useMembers } from "../hooks/useMembers";
import { exportCotisationsPDF, exportCotisationsExcel } from "../utils/export";

const badge = {
  ok: { label: "Payé", cls: "bg-green-950 text-green-400" },
  pending: { label: "En attente", cls: "bg-amber-950 text-amber-400" },
  late: { label: "En retard", cls: "bg-red-950 text-red-400" },
};

const actionStyle = {
  ok: "text-green-400 border-green-400/20 bg-green-950 cursor-default opacity-50",
  pending: "text-[#d4af7a] border-[#d4af7a22] bg-[#d4af7a11] hover:bg-[#d4af7a22]",
  late: "text-red-400 border-red-400/20 bg-red-950 hover:bg-red-900",
};

const actionLabel = { ok: "Reçu ✓", pending: "Marquer payé", late: "Relancer" };

function initials(nom) {
  if (!nom || typeof nom !== 'string') return "?";
  return nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Cotisations() {
  const { cotisations, marquerPaye, ajouterCotisation } = useCotisations();
  const { membres } = useMembers();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    membre_id: "",
    montant: "",
    date_echeance: "",
    type: "annuelle",
  });

  // ✅ Sécurisation : s'assurer que cotisations est un tableau
  const cotisationsArray = Array.isArray(cotisations) ? cotisations : [];
  
  // ✅ Sécurisation : s'assurer que membres est un tableau
  const membresArray = Array.isArray(membres) ? membres : [];

  // Stats sécurisées
  const totalAttendu = cotisationsArray.reduce((sum, c) => sum + (c.montant || 0), 0);
  const totalPaye = cotisationsArray
    .filter((c) => c.statut === "ok")
    .reduce((sum, c) => sum + (c.montant || 0), 0);
  const tauxCollecte = totalAttendu > 0 ? Math.round((totalPaye / totalAttendu) * 100) : 0;

  // Filtre sécurisé
  const filtered = cotisationsArray.filter((c) => {
    const nom = c.membre?.nom ?? "";
    const role = c.membre?.role ?? "";
    const q = search.toLowerCase();
    const matchQ = nom.toLowerCase().includes(q) || role.toLowerCase().includes(q);
    const matchF = filtre === "tous" || c.statut === filtre;
    return matchQ && matchF;
  });

  const handleAction = (statut, id, nom) => {
    if (statut === "pending") marquerPaye(id);
    else if (statut === "late") alert(`Relance envoyée à ${nom}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ajouterCotisation({
      membre_id: formData.membre_id,
      montant: parseFloat(formData.montant),
      date_echeance: formData.date_echeance,
      type: formData.type,
      statut: "pending",
      date_paiement: null,
      mois: new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" }),
    });
    setShowForm(false);
    setFormData({ membre_id: "", montant: "", date_echeance: "", type: "annuelle" });
  };

  const filtres = [
    { key: "tous", label: "Tous" },
    { key: "ok", label: "Payé" },
    { key: "pending", label: "En attente" },
    { key: "late", label: "En retard" },
  ];

  return (
    <div className="min-h-screen bg-[#0a1628]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-medium text-[#f0e8d6]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Cotisations
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#d4af7a] text-[#0a1628] px-4 py-2 rounded-lg hover:opacity-90 transition text-sm font-medium"
          >
            {showForm ? "✖ Fermer" : "+ Nouvelle cotisation"}
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-6 mb-6">
            <h2 className="text-xl text-[#f0e8d6] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Ajouter une cotisation
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Select membre */}
              <select
                value={formData.membre_id}
                onChange={(e) => setFormData({ ...formData, membre_id: e.target.value })}
                required
                className="bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-4 py-2 text-[#f0e8d6] outline-none focus:border-[#d4af7a]"
              >
                <option value="">Sélectionner un membre</option>
                {membresArray.map((m) => (
                  <option key={m.id} value={m.id}>{m.nom} — {m.role}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Montant (F CFA)"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                required
                className="bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-4 py-2 text-[#f0e8d6] placeholder-[#445566] outline-none focus:border-[#d4af7a]"
              />

              <input
                type="date"
                value={formData.date_echeance}
                onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                required
                className="bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-4 py-2 text-[#f0e8d6] outline-none focus:border-[#d4af7a]"
              />

              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-4 py-2 text-[#f0e8d6] outline-none focus:border-[#d4af7a]"
              >
                <option value="mensuelle">Mensuelle</option>
                <option value="trimestrielle">Trimestrielle</option>
                <option value="annuelle">Annuelle</option>
              </select>

              <button
                type="submit"
                className="md:col-span-2 bg-[#d4af7a] text-[#0a1628] px-6 py-2 rounded-lg hover:opacity-90 transition text-sm font-medium"
              >
                Ajouter
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Montant mensuel", val: "10 000 F", sub: "par membre", cls: "text-[#d4af7a]" },
            { label: "Perçu", val: `${totalPaye.toLocaleString()} F`, sub: `${cotisationsArray.filter(c => c.statut === "ok").length} paiements`, cls: "text-green-400" },
            { label: "Attendu total", val: `${totalAttendu.toLocaleString()} F`, sub: `${cotisationsArray.length} cotisations`, cls: "text-[#f0e8d6]" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
              <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">{s.label}</p>
              <p className={`text-xl font-medium mb-1 ${s.cls}`}>{s.val}</p>
              <p className="text-[11px] text-[#8899aa]">{s.sub}</p>
            </div>
          ))}
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">Taux de collecte</p>
            <p className="text-xl font-medium text-[#d4af7a]">{tauxCollecte}%</p>
            <div className="h-1.5 bg-[#d4af7a11] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[#d4af7a] rounded-full" style={{ width: `${tauxCollecte}%` }} />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1e38] border border-[#d4af7a22] rounded-lg pl-4 pr-3 py-2 text-sm text-[#f0e8d6] placeholder-[#445566] outline-none"
            />
          </div>
          {filtres.map((f) => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                filtre === f.key
                  ? "border-[#d4af7a66] text-[#d4af7a] bg-[#0d1e38]"
                  : "border-[#d4af7a22] text-[#8899aa] bg-[#0d1e38]"
              }`}>
              {f.label}
            </button>
          ))}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => exportCotisationsPDF(cotisationsArray)}
              className="text-xs px-3 py-2 rounded-lg border border-[#d4af7a22] text-[#d4af7a] hover:bg-[#d4af7a11] transition"
            >
              PDF ↓
            </button>
            <button
              onClick={() => exportCotisationsExcel(cotisationsArray)}
              className="text-xs px-3 py-2 rounded-lg border border-[#d4af7a22] text-[#d4af7a] hover:bg-[#d4af7a11] transition"
            >
              Excel ↓
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl overflow-hidden">
          <p className="text-[10px] tracking-[.18em] uppercase text-[#d4af7a] px-4 pt-4 pb-3">
            {new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" })}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d4af7a11]">
                  {["Membre", "Montant", "Échéance", "Statut", "Action"].map((h) => (
                    <th key={h} className="text-left text-[10px] tracking-[.12em] uppercase text-[#8899aa] font-normal px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id || i} className="border-b border-[#d4af7a0a] last:border-b-0 hover:bg-[#d4af7a05] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#d4af7a22] flex items-center justify-center text-[11px] text-[#d4af7a] font-medium flex-shrink-0">
                          {initials(c.membre?.nom)}
                        </div>
                        <div>
                          <p className="text-[#f0e8d6] font-medium text-xs">{c.membre?.nom ?? "—"}</p>
                          <p className="text-[11px] text-[#8899aa]">{c.membre?.role ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-medium text-xs ${c.statut === "ok" ? "text-green-400" : c.statut === "late" ? "text-red-400" : "text-[#8899aa]"}`}>
                      {c.montant ? `${c.montant.toLocaleString()} F` : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#8899aa] text-xs">{c.date_echeance ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${badge[c.statut]?.cls || "bg-gray-950 text-gray-400"}`}>
                        {badge[c.statut]?.label || c.statut || "?"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAction(c.statut, c.id, c.membre?.nom)}
                        className={`text-[10px] px-2.5 py-1 rounded-md border font-medium ${actionStyle[c.statut] || "text-gray-400 border-gray-400/20 bg-gray-950"}`}
                      >
                        {actionLabel[c.statut] || "Action"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}