import { useState } from "react";
import { getEvents, ajouterEvent, supprimerEvent } from "../data/store";

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

export default function Evenements() {
  const [events, setEvents] = useState(() => getEvents());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titre: "", date: "", heure: "", lieu: "", type: "ag",
  });

  const handleAjouter = () => {
    if (!form.titre.trim() || !form.date) return;
    const nouveau = ajouterEvent(form);
    setEvents((prev) => [nouveau, ...prev]);
    setForm({ titre: "", date: "", heure: "", lieu: "", type: "ag" });
    setShowForm(false);
  };

  const handleSupprimer = (id) => {
    supprimerEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const aVenir = events.filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const passes = events.filter((e) => new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const fields = [
    { label: "Titre", key: "titre", placeholder: "Ex: Assemblée Générale", type: "text" },
    { label: "Date", key: "date", placeholder: "", type: "date" },
    { label: "Heure", key: "heure", placeholder: "18h00", type: "text" },
    { label: "Lieu", key: "lieu", placeholder: "Salle des fêtes, Cocody", type: "text" },
  ];

  const EventCard = ({ e }) => (
    <div className="bg-[#0d1e38] border border-[#d4af7a22] hover:border-[#d4af7a44] rounded-xl p-4 flex gap-4 transition">
      <div className="flex flex-col items-center justify-center bg-[#d4af7a11] border border-[#d4af7a22] rounded-lg px-3 py-2 min-w-[52px] flex-shrink-0">
        <span className="text-xl text-[#d4af7a] font-medium leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {getDay(e.date)}
        </span>
        <span className="text-[10px] tracking-widest uppercase text-[#8899aa] mt-1">
          {getMonth(e.date)}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-[#f0e8d6] font-medium mb-1">{e.titre}</p>
        <p className="text-[11px] text-[#8899aa] mb-2">{e.heure} · {e.lieu}</p>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${eventBadge[e.type]}`}>
          {eventLabel[e.type]}
        </span>
      </div>
      <button
        onClick={() => handleSupprimer(e.id)}
        className="text-[11px] px-2.5 py-1 rounded-md bg-[#f8717111] border border-[#f8717122] text-red-400 self-start flex-shrink-0"
      >
        Supprimer
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1628]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-3xl mx-auto p-6">

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-medium text-[#f0e8d6]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Événements
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#d4af7a] text-[#0a1628] text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            {showForm ? "✖ Fermer" : "+ Nouvel événement"}
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-6 mb-6">
            <h2 className="text-xl text-[#f0e8d6] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Nouvel événement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {fields.map((f) => (
                <div key={f.key} className={f.key === "titre" ? "md:col-span-2" : ""}>
                  <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] placeholder-[#445566] outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] outline-none"
                >
                  <option value="ag">Assemblée Générale</option>
                  <option value="sport">Sport</option>
                  <option value="social">Social</option>
                  <option value="social">Reunion</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs text-[#8899aa] border border-[#d4af7a22] rounded-lg">
                Annuler
              </button>
              <button onClick={handleAjouter}
                className="px-4 py-2 text-xs font-medium bg-[#d4af7a] text-[#0a1628] rounded-lg hover:opacity-90">
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total", val: events.length, cls: "text-[#f0e8d6]" },
            { label: "À venir", val: aVenir.length, cls: "text-[#d4af7a]" },
            { label: "Passés", val: passes.length, cls: "text-[#8899aa]" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
              <p className="text-[10px] tracking-[.15em] uppercase text-[#8899aa] mb-2">{s.label}</p>
              <p className={`text-2xl font-medium ${s.cls}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* À venir */}
        <p className="text-[10px] tracking-[.2em] uppercase text-[#d4af7a] mb-3">À venir</p>
        <div className="flex flex-col gap-3 mb-8">
          {aVenir.length === 0 && (
            <p className="text-sm text-[#8899aa]">Aucun événement à venir.</p>
          )}
          {aVenir.map((e) => <EventCard key={e.id} e={e} />)}
        </div>

        {/* Passés */}
        {passes.length > 0 && (
          <>
            <div className="h-px bg-[#d4af7a22] mb-6" />
            <p className="text-[10px] tracking-[.2em] uppercase text-[#8899aa] mb-3">Passés</p>
            <div className="flex flex-col gap-3 opacity-50">
              {passes.map((e) => <EventCard key={e.id} e={e} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}