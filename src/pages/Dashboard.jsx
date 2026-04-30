import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getStats, getMembres, getCotisations } from "../data/store";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeIn } from "../utils/animations";

function initials(nom) {
  return nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const badgeStyle = {
  ok: "bg-green-950 text-green-400",
  pending: "bg-amber-950 text-amber-400",
  late: "bg-red-950 text-red-400",
};
const badgeLabel = { ok: "À jour", pending: "En attente", late: "En retard" };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0, aJour: 0, enAttente: 0, enRetard: 0, totalPaye: 0, totalAttendu: 0,
  });
  const [membres, setMembres] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getMembres(), getCotisations()]).then(([s, m, c]) => {
      setStats(s);
      setMembres(m);
      setCotisations(c);
      setLoading(false);
    });
  }, []);

  const tauxAJour = stats.total > 0 ? Math.round((stats.aJour / stats.total) * 100) : 0;
  const tauxAttente = stats.total > 0 ? Math.round((stats.enAttente / stats.total) * 100) : 0;
  const tauxRetard = stats.total > 0 ? Math.round((stats.enRetard / stats.total) * 100) : 0;

  const circumference = 2 * Math.PI * 40;
  const arcAJour = (stats.aJour / stats.total) * circumference || 0;
  const arcAttente = (stats.enAttente / stats.total) * circumference || 0;
  const arcRetard = (stats.enRetard / stats.total) * circumference || 0;

  const derniersMembres = [...membres].slice(0, 4);

  const moisNoms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const participationParMois = moisNoms.map((label, i) => {
    const cotDuMois = cotisations.filter((c) => {
      const date = c.date_paiement || c.date_echeance;
      if (!date) return false;
      return new Date(date).getMonth() === i;
    });
    const payees = cotDuMois.filter((c) => c.statut === "ok").length;
    const total = cotDuMois.length;
    return { label, pct: total > 0 ? Math.round((payees / total) * 100) : 0, total };
  }).filter((m) => m.total > 0);

  const statsCards = [
    { label: "Total membres", value: stats.total, sub: `${membres.length} inscrits`, subColor: "text-[#d4af7a]" },
    { label: "À jour", value: stats.aJour, sub: `${tauxAJour}% du total`, subColor: "text-[#8899aa]", valColor: "text-green-400" },
    { label: "En attente", value: stats.enAttente, sub: `${tauxAttente}% du total`, subColor: "text-[#8899aa]", valColor: "text-amber-400" },
    { label: "En retard", value: stats.enRetard, sub: `${tauxRetard}% du total`, subColor: "text-[#8899aa]", valColor: "text-red-400" },
  ];

  const tauxCollecte = stats.totalAttendu > 0
    ? Math.round((stats.totalPaye / stats.totalAttendu) * 100) : 0;

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
    <motion.div {...fadeIn}
      className="min-h-screen bg-[#0a1628]"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="p-6">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}>
          <p className="text-xs tracking-widest text-[#8899aa] mb-1">Bonjour, {user?.nom}</p>
          <h1 className="text-3xl font-medium text-[#f0e8d6] mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Vue d'ensemble
          </h1>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statsCards.map((s) => (
            <motion.div
              key={s.label}
              variants={staggerItem}
              whileHover={{ scale: 1.03, borderColor: "#d4af7a44" }}
              className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4 cursor-default">
              <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">{s.label}</p>
              <p className={`text-2xl font-medium mb-1 ${s.valColor || "text-[#f0e8d6]"}`}>{s.value}</p>
              <p className={`text-[11px] ${s.subColor}`}>{s.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4 mb-6">
          <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-1">Cotisations perçues</p>
          <p className="text-2xl font-medium text-[#d4af7a]">{stats.totalPaye.toLocaleString()} F</p>
          <p className="text-[11px] text-[#8899aa]">sur {stats.totalAttendu.toLocaleString()} F attendus</p>
          <div className="h-1.5 bg-[#d4af7a11] rounded-full mt-3 overflow-hidden">
            <motion.div
              className="h-full bg-[#d4af7a] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${tauxCollecte}%` }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#d4af7a] mb-4">Participation mensuelle</p>
            {participationParMois.length === 0 ? (
              <p className="text-xs text-[#8899aa]">Aucune donnée disponible.</p>
            ) : (
              participationParMois.map((m, i) => (
                <div key={m.label} className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-[#8899aa] min-w-[64px]">{m.label}</span>
                  <div className="flex-1 h-1.5 bg-[#d4af7a11] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#d4af7a] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs text-[#d4af7a] min-w-[32px] text-right">{m.pct}%</span>
                </div>
              ))
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#d4af7a] mb-4">Répartition</p>
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                className="relative w-24 h-24">
                <svg viewBox="0 0 110 110" className="w-full h-full">
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#d4af7a11" strokeWidth="18"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#4ade80" strokeWidth="18"
                    strokeDasharray={`${arcAJour} ${circumference}`}
                    strokeDashoffset="0" transform="rotate(-90 55 55)"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#fbbf24" strokeWidth="18"
                    strokeDasharray={`${arcAttente} ${circumference}`}
                    strokeDashoffset={`-${arcAJour}`} transform="rotate(-90 55 55)"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#f87171" strokeWidth="18"
                    strokeDasharray={`${arcRetard} ${circumference}`}
                    strokeDashoffset={`-${arcAJour + arcAttente}`} transform="rotate(-90 55 55)"/>
                  <text x="55" y="51" textAnchor="middle" fontSize="16" fontWeight="500" fill="#f0e8d6">
                    {tauxAJour}%
                  </text>
                  <text x="55" y="65" textAnchor="middle" fontSize="10" fill="#8899aa">à jour</text>
                </svg>
              </motion.div>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-col gap-1.5 w-full">
                {[
                  ["#4ade80", "À jour", stats.aJour],
                  ["#fbbf24", "En attente", stats.enAttente],
                  ["#f87171", "En retard", stats.enRetard],
                ].map(([c, l, n]) => (
                  <motion.div key={l} variants={staggerItem}
                    className="flex items-center gap-2 text-xs text-[#8899aa]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c }} />
                    {l} — {n}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
          <p className="text-[10px] tracking-[.18em] uppercase text-[#d4af7a] mb-3">Derniers membres ajoutés</p>
          {derniersMembres.length === 0 && (
            <p className="text-xs text-[#8899aa]">Aucun membre enregistré.</p>
          )}
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {derniersMembres.map((m) => (
              <motion.div
                key={m.id}
                variants={staggerItem}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 py-2.5 border-b border-[#d4af7a11] last:border-b-0 cursor-default">
                <div className="w-8 h-8 rounded-full bg-[#d4af7a22] flex items-center justify-center text-[11px] text-[#d4af7a] font-medium flex-shrink-0">
                  {initials(m.nom)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#f0e8d6]">{m.nom}</p>
                  <p className="text-[11px] text-[#8899aa]">{m.role}</p>
                </div>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeStyle[m.statut]}`}>
                  {badgeLabel[m.statut]}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}