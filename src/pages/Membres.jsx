import { useState } from "react";
import { useMembers } from "../hooks/useMembers";
import { modifierMembre } from "../data/store";
import { exportMembresPDF, exportMembresExcel } from "../utils/export";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem, modalAnim } from "../utils/animations";

const badge = {
  ok: { label: "À jour", cls: "bg-green-950 text-green-400" },
  pending: { label: "En attente", cls: "bg-amber-950 text-amber-400" },
  late: { label: "En retard", cls: "bg-red-950 text-red-400" },
};

function initials(nom) {
  // ✅ Sécurisation : vérifier que nom existe
  if (!nom || typeof nom !== 'string') return "?";
  return nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const ModalForm = ({ title, form, setForm, onCancel, onSubmit, submitLabel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <motion.div {...modalAnim}
      className="bg-[#0d1e38] border border-[#d4af7a33] rounded-xl p-6 w-full max-w-sm">
      <h2 className="text-xl text-[#f0e8d6] mb-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}>{title}</h2>

      {[
        { label: "Nom complet", key: "nom", placeholder: "Koné Aminata" },
        { label: "Téléphone", key: "tel", placeholder: "07 00 11 22" },
        { label: "Email", key: "email", placeholder: "email@example.com" },
      ].map((f) => (
        <div key={f.key} className="mb-3">
          <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">{f.label}</label>
          <input
            placeholder={f.placeholder}
            value={form[f.key] || ""}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] placeholder-[#445566] outline-none"
          />
        </div>
      ))}

      <div className="mb-3">
        <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">Rôle</label>
        <select value={form.role || "Membre"} onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] outline-none">
          {["Membre", "Trésorier", "Secrétaire", "Président"].map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">Statut</label>
        <select value={form.statut || "ok"} onChange={(e) => setForm({ ...form, statut: e.target.value })}
          className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] outline-none">
          <option value="ok">À jour</option>
          <option value="pending">En attente</option>
          <option value="late">En retard</option>
        </select>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel}
          className="px-4 py-2 text-xs text-[#8899aa] border border-[#d4af7a22] rounded-lg">Annuler</button>
        <button onClick={onSubmit}
          className="px-4 py-2 text-xs font-medium bg-[#d4af7a] text-[#0a1628] rounded-lg hover:opacity-90">
          {submitLabel}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default function Membres() {
  const { membres, loading, ajouterMembre, supprimerMembre, setMembres } = useMembers();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nom: "", tel: "", email: "", role: "Membre", statut: "ok" });
  const [membreAModifier, setMembreAModifier] = useState(null);
  const [formModif, setFormModif] = useState({ nom: "", tel: "", email: "", role: "Membre", statut: "ok" });

  // ✅ Sécurisation : s'assurer que membres est un tableau
  const membresArray = Array.isArray(membres) ? membres : [];

  const filtered = membresArray.filter((m) => {
    const q = search.toLowerCase();
    const matchQ = (m.nom || "").toLowerCase().includes(q) || 
                   (m.role || "").toLowerCase().includes(q) || 
                   (m.tel || "").includes(q);
    const matchF = filtre === "tous" || m.statut === filtre;
    return matchQ && matchF;
  });

  const handleAjouter = async () => {
    if (!form.nom.trim()) return;
    await ajouterMembre(form);
    if (form.email) {
      alert(`Membre ajouté !\n\nIdentifiants :\nEmail : ${form.email}\nMot de passe : ject2025`);
    }
    setModal(false);
    setForm({ nom: "", tel: "", email: "", role: "Membre", statut: "ok" });
  };

  const handleModifier = (m) => {
    setMembreAModifier(m);
    setFormModif({ 
      nom: m.nom || "", 
      tel: m.tel ?? "", 
      email: m.email ?? "", 
      role: m.role || "Membre", 
      statut: m.statut || "ok" 
    });
  };

  const handleSauvegarder = () => {
    if (!formModif.nom.trim()) return;
    modifierMembre(membreAModifier.id, formModif);
    if (setMembres) {
      setMembres((prev) => prev.map((m) => m.id === membreAModifier.id ? { ...m, ...formModif } : m));
    }
    setMembreAModifier(null);
  };

  const filtres = [
    { key: "tous", label: "Tous" },
    { key: "ok", label: "À jour" },
    { key: "pending", label: "En attente" },
    { key: "late", label: "En retard" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-[#8899aa] text-sm tracking-widest">
        Chargement...
      </motion.p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#0a1628]"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="p-6">

        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-medium text-[#f0e8d6] mb-5"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Membres
        </motion.h1>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 items-center mb-5">
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
            <motion.button key={f.key} onClick={() => setFiltre(f.key)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                filtre === f.key
                  ? "border-[#d4af7a66] text-[#d4af7a] bg-[#0d1e38]"
                  : "border-[#d4af7a22] text-[#8899aa] bg-[#0d1e38]"
              }`}>
              {f.label}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModal(true)}
            className="ml-auto bg-[#d4af7a] text-[#0a1628] text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition">
            + Ajouter
          </motion.button>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => exportMembresPDF(membresArray)}
              className="text-xs px-3 py-2 rounded-lg border border-[#d4af7a22] text-[#d4af7a] hover:bg-[#d4af7a11] transition">
              PDF ↓
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => exportMembresExcel(membresArray)}
              className="text-xs px-3 py-2 rounded-lg border border-[#d4af7a22] text-[#d4af7a] hover:bg-[#d4af7a11] transition">
              Excel ↓
            </motion.button>
          </div>
        </motion.div>

        <p className="text-xs text-[#8899aa] mb-3">
          {filtered.length} membre{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Liste */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-2.5">
          <AnimatePresence>
            {filtered.map((m) => (
              <motion.div
                key={m.id}
                variants={staggerItem}
                exit={{ opacity: 0, x: -20 }}
                layout
                whileHover={{ borderColor: "#d4af7a44" }}
                className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4 flex items-center gap-3 transition">
                <div className="w-10 h-10 rounded-full bg-[#d4af7a22] flex items-center justify-center text-sm text-[#d4af7a] font-medium flex-shrink-0">
                  {initials(m.nom)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#f0e8d6]">{m.nom || "Sans nom"}</p>
                  <p className="text-[11px] text-[#8899aa]">{m.role || "Membre"} · {m.tel || "—"}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${badge[m.statut]?.cls || "bg-gray-950 text-gray-400"}`}>
                  {badge[m.statut]?.label || m.statut || "?"}
                </span>
                <div className="flex gap-1.5 ml-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleModifier(m)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-[#d4af7a11] border border-[#d4af7a22] text-[#d4af7a]">
                    Modifier
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => supprimerMembre(m.id)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-[#f8717111] border border-[#f8717122] text-red-400">
                    Retirer
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal ajout */}
      <AnimatePresence>
        {modal && (
          <ModalForm
            title="Nouveau membre"
            form={form}
            setForm={setForm}
            onCancel={() => setModal(false)}
            onSubmit={handleAjouter}
            submitLabel="Enregistrer"
          />
        )}
      </AnimatePresence>

      {/* Modal modification */}
      <AnimatePresence>
        {membreAModifier && (
          <ModalForm
            title="Modifier le membre"
            form={formModif}
            setForm={setFormModif}
            onCancel={() => setMembreAModifier(null)}
            onSubmit={handleSauvegarder}
            submitLabel="Sauvegarder"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}