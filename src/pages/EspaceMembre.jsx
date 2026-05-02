import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCotisations, getEvents } from "../data/store";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, staggerItem } from "../utils/animations";

const badge = {
  ok: { label: "Payé", cls: "bg-green-950 text-green-400" },
  pending: { label: "En attente", cls: "bg-amber-950 text-amber-400" },
  late: { label: "En retard", cls: "bg-red-950 text-red-400" },
};

const eventBadge = {
  ag: "bg-blue-950 text-blue-400",
  sport: "bg-green-950 text-green-400",
  social: "bg-purple-950 text-purple-400",
};
const eventLabel = { ag: "AG", sport: "Sport", social: "Social" };

function getDay(date) { return new Date(date).getDate(); }
function getMonth(date) {
  return new Date(date).toLocaleString("fr-FR", { month: "short" });
}

export default function EspaceMembre() {
  const { user } = useAuth();
  const [mesCotisations, setMesCotisations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCotisations(), getEvents()]).then(([cots, evts]) => {
      setMesCotisations(cots.filter((c) => c.membre_id === user?.membre_id));
      setEvents(evts);
      setLoading(false);
    });
  }, [user]);

  const totalPaye = mesCotisations.filter((c) => c.statut === "ok").reduce((s, c) => s + (c.montant || 0), 0);
  const totalAttendu = mesCotisations.reduce((s, c) => s + (c.montant || 0), 0);
  const totalEnAttente = mesCotisations.filter((c) => c.statut !== "ok").reduce((s, c) => s + (c.montant || 0), 0);
  const taux = totalAttendu > 0 ? Math.round((totalPaye / totalAttendu) * 100) : 0;

  const eventsAVenir = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (loading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-[#8899aa] text-sm tracking-widest">
        Chargement...
      </motion.p>
    </div>
  );

  return (
    <motion.div {...fadeIn}
      className="min-h-screen bg-[#0a1628]"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6">
          <p className="text-xs text-[#8899aa] mb-1">Bienvenue,</p>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#f0e8d6]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {user?.nom}
          </h1>
        </motion.div>

        {/* Stats */}
        <p className="text-[10px] tracking-[.2em] uppercase text-[#d4af7a] mb-3">Résumé cotisations</p>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {[
            { label: "Total payé", val: `${totalPaye.toLocaleString()} F`, cls: "text-green-400" },
            { label: "En attente", val: `${totalEnAttente.toLocaleString()} F`, cls: "text-amber-400" },
            { label: "Taux", val: `${taux}%`, cls: "text-[#d4af7a]" },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={staggerItem}
              className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-3 sm:p-4">
              <p className="text-[9px] sm:text-[10px] tracking-[.15em] uppercase text-[#8899aa] mb-1.5 sm:mb-2">
                {s.label}
              </p>
              <p className={`text-base sm:text-xl font-medium ${s.cls} truncate`}>{s.val}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Progression */}
        <p className="text-[10px] tracking-[.2em] uppercase text-[#d4af7a] mb-3">Progression annuelle</p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4 mb-6">
          <div className="flex justify-between text-xs text-[#8899aa] mb-2 gap-2">
            <span>Cotisations payées</span>
            <span className="text-[#d4af7a] flex-shrink-0">
              {mesCotisations.filter((c) => c.statut === "ok").length} / {mesCotisations.length} mois
            </span>
          </div>
          <div className="h-1.5 bg-[#d4af7a11] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#d4af7a] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${taux}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Historique */}
        <p className="text-[10px] tracking-[.2em] uppercase text-[#d4af7a] mb-3">Historique des cotisations</p>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-2 mb-8">
          {mesCotisations.length === 0 && (
            <p className="text-sm text-[#8899aa]">Aucune cotisation enregistrée.</p>
          )}
          {mesCotisations.map((c) => (
            <motion.div
              key={c.id}
              variants={staggerItem}
              className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f0e8d6] font-medium truncate">{c.mois}</p>
                <p className="text-[10px] sm:text-[11px] text-[#8899aa] truncate">
                  {c.date_paiement ? `Payé le ${c.date_paiement}` : `Échéance : ${c.date_echeance ?? "—"}`}
                </p>
              </div>
              <span className={`text-xs sm:text-sm font-medium flex-shrink-0 ${c.statut === "ok" ? "text-green-400" : "text-amber-400"}`}>
                {c.montant?.toLocaleString()} F
              </span>
              <span className={`text-[9px] sm:text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0 ${badge[c.statut]?.cls}`}>
                {badge[c.statut]?.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <div className="h-px bg-[#d4af7a22] mb-6" />

        {/* Événements */}
        <p className="text-[10px] tracking-[.2em] uppercase text-[#d4af7a] mb-3">Événements à venir</p>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-3 pb-8">
          {eventsAVenir.length === 0 && (
            <p className="text-sm text-[#8899aa]">Aucun événement à venir.</p>
          )}
          {eventsAVenir.map((e) => (
            <motion.div
              key={e.id}
              variants={staggerItem}
              whileHover={{ borderColor: "#d4af7a44" }}
              className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 transition">
              {/* Date */}
              <div className="flex flex-col items-center justify-center bg-[#d4af7a11] border border-[#d4af7a22] rounded-lg px-2 sm:px-3 py-2 min-w-[44px] sm:min-w-[52px] flex-shrink-0">
                <span className="text-lg sm:text-xl text-[#d4af7a] font-medium leading-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {getDay(e.date)}
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#8899aa] mt-1">
                  {getMonth(e.date)}
                </span>
              </div>
              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f0e8d6] font-medium mb-1 truncate">{e.titre}</p>
                <p className="text-[10px] sm:text-[11px] text-[#8899aa] mb-2 truncate">
                  {e.heure} · {e.lieu}
                </p>
                <span className={`text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-1 rounded-full font-medium ${eventBadge[e.type]}`}>
                  {eventLabel[e.type]}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}