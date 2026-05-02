import { supabase } from "../supabase/client";

// ─── MEMBRES ────────────────────────────────────────

export async function getMembres() {
  const { data, error } = await supabase
    .from("membres")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("getMembres:", error); return []; }
  return data;
}

export async function ajouterMembre(form) {
  // 1. Ajouter dans la table membres
  const { data, error } = await supabase
    .from("membres")
    .insert([{
      nom: form.nom,
      email: form.email ?? null,
      tel: form.tel ?? null,
      role: form.role ?? "Membre",
      statut: form.statut ?? "ok",
    }])
    .select()
    .single();

  if (error) { console.error("ajouterMembre:", error); return null; }

  // 2. Créer le compte dans la table users si email fourni
  if (form.email) {
    await creerCompte(form.email, form.nom, data.id);
  }

  return data;
}

export async function supprimerMembre(id) {
  // Supprimer le compte utilisateur lié
  await supabase.from("users").delete().eq("membre_id", id);
  // Supprimer le membre
  const { error } = await supabase.from("membres").delete().eq("id", id);
  if (error) console.error("supprimerMembre:", error);
}

export async function modifierMembre(id, updates) {
  const { error } = await supabase.from("membres").update(updates).eq("id", id);
  if (error) console.error("modifierMembre:", error);

  // Mettre à jour le compte users si email ou nom change
  if (updates.email || updates.nom) {
    const patch = {};
    if (updates.email) patch.email = updates.email;
    if (updates.nom) patch.nom = updates.nom;
    await supabase.from("users").update(patch).eq("membre_id", id);
  }
}

// ─── COTISATIONS ────────────────────────────────────

export async function getCotisations() {
  const { data, error } = await supabase
    .from("cotisations")
    .select("*, membre:membres(id, nom, role, tel, email, statut)")
    .order("created_at", { ascending: false });
  if (error) { console.error("getCotisations:", error); return []; }
  return data;
}

export async function ajouterCotisation(form) {
  const { data, error } = await supabase
    .from("cotisations")
    .insert([{ ...form }])
    .select("*, membre:membres(id, nom, role)")
    .single();
  if (error) { console.error("ajouterCotisation:", error); return null; }
  return data;
}

export async function marquerPaye(id) {
  const { error } = await supabase
    .from("cotisations")
    .update({
      statut: "ok",
      date_paiement: new Date().toISOString().split("T")[0],
    })
    .eq("id", id);
  if (error) console.error("marquerPaye:", error);
}

// ─── STATS ──────────────────────────────────────────

export async function getStats() {
  const [{ data: membres }, { data: cotisations }] = await Promise.all([
    supabase.from("membres").select("statut"),
    supabase.from("cotisations").select("statut, montant"),
  ]);

  const m = membres || [];
  const c = cotisations || [];

  return {
    total: m.length,
    aJour: m.filter((x) => x.statut === "ok").length,
    enAttente: m.filter((x) => x.statut === "pending").length,
    enRetard: m.filter((x) => x.statut === "late").length,
    totalPaye: c.filter((x) => x.statut === "ok").reduce((s, x) => s + (x.montant || 0), 0),
    totalAttendu: c.reduce((s, x) => s + (x.montant || 0), 0),
  };
}

// ─── EVENTS ─────────────────────────────────────────

export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) { console.error("getEvents:", error); return []; }
  return data;
}

export async function ajouterEvent(form) {
  const { data, error } = await supabase
    .from("events")
    .insert([{ ...form }])
    .select()
    .single();
  if (error) { console.error("ajouterEvent:", error); return null; }
  return data;
}

export async function supprimerEvent(id) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) console.error("supprimerEvent:", error);
}

// ─── AUTH ────────────────────────────────────────────

export async function getUser(email, password) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();
  if (error) return null;
  return data;
}

export async function creerCompte(email, nom, membreId) {
  // Vérifier si le compte existe déjà
  const { data: existe } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existe) return existe;

  const { data, error } = await supabase
    .from("users")
    .insert([{
      email,
      password: "ject2025",
      role: "membre",
      nom,
      membre_id: membreId,
    }])
    .select()
    .single();
  if (error) { console.error("creerCompte:", error); return null; }
  return data;
}