import { useState } from "react";
import { useCotisations } from "../hooks/useCotisations";

const badge = {
  ok: { label: "Payé", cls: "bg-green-950 text-green-400" },
  pending: { label: "En attente", cls: "bg-amber-950 text-amber-400" },
  late: { label: "En retard", cls: "bg-red-950 text-red-400" },
};

const actionStyle = {
  ok: "text-green-400 border-green-400/20 bg-green-950 cursor-default opacity-50",
  pending: "text-[#d4af7a] border-[#d4af7a22] bg-[#d4af7a11] hover:bg-[#d4af7a22]",
  late: "text-red-400 border-red-400/20 bg-red-950 hover:bg-red-900"
};

const actionLabel = { ok: "Reçu ✓", pending: "Marquer payé", late: "Relancer" };

function initials(nom) {
  return nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Cotisations() {
  const { cotisations, loading, marquerPayé, ajouterCotisation } = useCotisations();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    membre_id: "",
    montant: "",
    date_echeance: "",
    type: "annuelle"
  });

  // Filtrer les cotisations
  const filtered = cotisations.filter((m) => {
    const q = search.toLowerCase();
    const matchQ = m.nom.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
    const matchF = filtre === "tous" || m.statut === filtre;
    return matchQ && matchF;
  });

  // Calculer les stats
  const totalAttendu = cotisations.reduce((sum, c) => sum + (c.montant_raw || 0), 0);
  const totalPaye = cotisations
    .filter(c => c.statut === "ok")
    .reduce((sum, c) => sum + (c.montant_raw || 0), 0);
  const tauxCollecte = totalAttendu > 0 ? Math.round((totalPaye / totalAttendu) * 100) : 0;

  const handleMarquerPaye = async (id) => {
    await marquerPayé(id);
  };

  const handleRelancer = (nom) => {
    alert(`Relance envoyée à ${nom}`);
  };

  const handleAction = (statut, id, nom) => {
    if (statut === "pending") {
      handleMarquerPaye(id);
    } else if (statut === "late") {
      handleRelancer(nom);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await ajouterCotisation(
      formData.membre_id,
      parseFloat(formData.montant),
      formData.date_echeance,
      formData.type
    );
    if (success) {
      setShowForm(false);
      setFormData({ membre_id: "", montant: "", date_echeance: "", type: "annuelle" });
    }
  };

  const filtres = [
    { key: "tous", label: "Tous" },
    { key: "ok", label: "Payé" },
    { key: "pending", label: "En attente" },
    { key: "late", label: "En retard" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af7a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-medium text-[#f0e8d6]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Cotisations
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#d4af7a] text-[#0a1628] px-4 py-2 rounded-lg hover:bg-[#c49b5c] transition font-semibold"
          >
            {showForm ? "✖ Fermer" : "+ Nouvelle cotisation"}
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showForm && (
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#f0e8d6] mb-4">Ajouter une cotisation</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="membre_id"
                placeholder="ID du membre (uuid)"
                value={formData.membre_id}
                onChange={(e) => setFormData({ ...formData, membre_id: e.target.value })}
                required
                className="bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-4 py-2 text-[#f0e8d6] placeholder-[#445566] focus:outline-none focus:border-[#d4af7a]"
              />
              <input
                type="number"
                name="montant"
                placeholder="Montant (F CFA)"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                required
                className="bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-4 py-2 text-[#f0e8d6] placeholder-[#445566] focus:outline-none focus:border-[#d4af7a]"
              />
              <input
                type="date"
                name="date_echeance"
                value={formData.date_echeance}
                onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                required
                className="bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-4 py-2 text-[#f0e8d6] focus:outline-none focus:border-[#d4af7a]"
              />
              <select
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-4 py-2 text-[#f0e8d6] focus:outline-none focus:border-[#d4af7a]"
              >
                <option value="annuelle">Annuelle</option>
                <option value="trimestrielle">Trimestrielle</option>
                <option value="mensuelle">Mensuelle</option>
              </select>
              <button
                type="submit"
                className="md:col-span-2 bg-[#d4af7a] text-[#0a1628] px-6 py-2 rounded-lg hover:bg-[#c49b5c] transition font-semibold"
              >
                Ajouter
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">Montant mensuel</p>
            <p className="text-xl font-medium mb-1 text-[#d4af7a]">10 000 F</p>
            <p className="text-[11px] text-[#8899aa]">par membre</p>
          </div>
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">Perçu ce mois</p>
            <p className="text-xl font-medium mb-1 text-green-400">{totalPaye.toLocaleString()} F</p>
            <p className="text-[11px] text-[#8899aa]">{cotisations.filter(c => c.statut === "ok").length} paiements</p>
          </div>
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">Attendu total</p>
            <p className="text-xl font-medium mb-1 text-[#f0e8d6]">{totalAttendu.toLocaleString()} F</p>
            <p className="text-[11px] text-[#8899aa]">{cotisations.length} cotisations</p>
          </div>
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">Taux de collecte</p>
            <p className="text-xl font-medium mb-1 text-[#d4af7a]">{tauxCollecte}%</p>
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
              className="w-full bg-[#0d1e38] border border-[#d4af7a22] rounded-lg pl-9 pr-3 py-2 text-sm text-[#f0e8d6] placeholder-[#445566] outline-none focus:border-[#d4af7a] transition"
            />
          </div>
          {filtres.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                filtre === f.key
                  ? "border-[#d4af7a66] text-[#d4af7a] bg-[#0d1e38]"
                  : "border-[#d4af7a22] text-[#8899aa] bg-[#0d1e38] hover:border-[#d4af7a44]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tableau */}
        <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl overflow-hidden">
          <p className="text-[10px] tracking-[.18em] uppercase text-[#d4af7a] px-4 pt-4 pb-3">
            {new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d4af7a11]">
                  {["Membre", "Montant", "Date", "Statut", "Action"].map((h) => (
                    <th key={h} className="text-left text-[10px] tracking-[.12em] uppercase text-[#8899aa] font-normal px-4 py-2.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.id || i} className="border-b border-[#d4af7a0a] last:border-b-0 hover:bg-[#d4af7a05] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#d4af7a22] flex items-center justify-center text-[11px] text-[#d4af7a] font-medium flex-shrink-0">
                          {initials(m.nom)}
                        </div>
                        <div>
                          <p className="text-[#f0e8d6] font-medium text-xs">{m.nom}</p>
                          <p className="text-[11px] text-[#8899aa]">{m.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-medium ${m.statut === "ok" ? "text-green-400" : m.statut === "late" ? "text-red-400" : "text-[#8899aa]"}`}>
                      {m.montant}
                    </td>
                    <td className="px-4 py-3 text-[#8899aa] text-xs">{m.date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${badge[m.statut].cls}`}>
                        {badge[m.statut].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAction(m.statut, m.id, m.nom)}
                        className={`text-[10px] px-2.5 py-1 rounded-md border font-medium ${actionStyle[m.statut]}`}
                      >
                        {actionLabel[m.statut]}
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