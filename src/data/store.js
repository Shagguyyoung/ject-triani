import db from "./db.json";

// Clé localStorage pour persister les données
const KEY = "association_db";

function getDB() {
  const saved = localStorage.getItem(KEY);
  return saved ? JSON.parse(saved) : db;
}

function saveDB(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString();
}

// ─── MEMBRES ───────────────────────────────────────

export function getMembres() {
  return getDB().membres;
}

export function ajouterMembre(form) {
  const data = getDB();
  const nouveau = { ...form, id: generateId(), created_at: new Date().toISOString().split("T")[0] };
  data.membres = [nouveau, ...data.membres];
  saveDB(data);
  return nouveau;
}

export function supprimerMembre(id) {
  const data = getDB();
  data.membres = data.membres.filter((m) => m.id !== id);
  data.cotisations = data.cotisations.filter((c) => c.membre_id !== id);
  saveDB(data);
}

export function modifierMembre(id, updates) {
  const data = getDB();
  data.membres = data.membres.map((m) => (m.id === id ? { ...m, ...updates } : m));
  saveDB(data);
}

// ─── COTISATIONS ───────────────────────────────────

export function getCotisations() {
  const data = getDB();
  return data.cotisations.map((c) => ({
    ...c,
    membre: data.membres.find((m) => m.id === c.membre_id) || {},
  }));
}

export function marquerPaye(id) {
  const data = getDB();
  data.cotisations = data.cotisations.map((c) =>
    c.id === id ? { ...c, statut: "ok", date_paiement: new Date().toISOString().split("T")[0] } : c
  );
  saveDB(data);
}

export function ajouterCotisation(form) {
  const data = getDB();
  const nouvelle = { ...form, id: generateId() };
  data.cotisations = [nouvelle, ...data.cotisations];
  saveDB(data);
  return nouvelle;
}

// ─── STATS ─────────────────────────────────────────

export function getStats() {
  const data = getDB();
  const membres = data.membres;
  const cotisations = data.cotisations;
  return {
    total: membres.length,
    aJour: membres.filter((m) => m.statut === "ok").length,
    enAttente: membres.filter((m) => m.statut === "pending").length,
    enRetard: membres.filter((m) => m.statut === "late").length,
    totalPaye: cotisations.filter((c) => c.statut === "ok").reduce((s, c) => s + c.montant, 0),
    totalAttendu: cotisations.reduce((s, c) => s + c.montant, 0),
  };
}