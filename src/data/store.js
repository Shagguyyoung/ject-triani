import db from "./db.json";

const KEY = "association_db";
const USERS_KEY = "association_users";

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

export function getMembres() {
  return getDB().membres;
}

export function ajouterMembre(form) {
  const data = getDB();
  const nouveau = {
    ...form,
    id: generateId(),
    created_at: new Date().toISOString().split("T")[0],
  };
  data.membres = [nouveau, ...data.membres];
  saveDB(data);

  // Créer automatiquement un compte si email fourni
  if (form.email) {
    const comptes = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const existe = comptes.find((u) => u.email === form.email);
    if (!existe) {
      comptes.push({  
        email: form.email,
        password: "ject2025",
        role: "membre",
        nom: form.nom,
        membre_id: nouveau.id,
      });
      localStorage.setItem(USERS_KEY, JSON.stringify(comptes));
    }
  }

  return nouveau;
}

export function supprimerMembre(id) {
  const data = getDB();
  data.membres = data.membres.filter((m) => m.id !== id);
  data.cotisations = data.cotisations.filter((c) => c.membre_id !== id);
  saveDB(data);

  // Supprimer aussi le compte associé
  const membre = getDB().membres.find((m) => m.id === id);
  if (membre?.email) {
    const comptes = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(comptes.filter((u) => u.email !== membre.email))
    );
  }
}

export function modifierMembre(id, updates) {
  const data = getDB();
  data.membres = data.membres.map((m) => (m.id === id ? { ...m, ...updates } : m));
  saveDB(data);
}

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
    c.id === id
      ? { ...c, statut: "ok", date_paiement: new Date().toISOString().split("T")[0] }
      : c
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

export function getStats() {
  const data = getDB();
  return {
    total: data.membres.length,
    aJour: data.membres.filter((m) => m.statut === "ok").length,
    enAttente: data.membres.filter((m) => m.statut === "pending").length,
    enRetard: data.membres.filter((m) => m.statut === "late").length,
    totalPaye: data.cotisations
      .filter((c) => c.statut === "ok")
      .reduce((s, c) => s + c.montant, 0),
    totalAttendu: data.cotisations.reduce((s, c) => s + c.montant, 0),
  };
}