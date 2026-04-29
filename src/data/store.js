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
  const { data, error } = await supabase
    .from("membres")
    .insert([{ ...form }])
    .select()
    .single();
  if (error) { console.error("ajouterMembre:", error); return null; }

  // Créer compte membre localement
  if (form.email) {
    const comptes = JSON.parse(localStorage.getItem("association_users") || "[]");
    const existe = comptes.find((u) => u.email === form.email);
    if (!existe) {
      comptes.push({
        email: form.email,
        password: "ject2025",
        role: "membre",
        nom: form.nom,
        membre_id: data.id,
      });
      localStorage.setItem("association_users", JSON.stringify(comptes));
    }
  }

  return data;
}

export async function supprimerMembre(id) {
  const { error } = await supabase.from("membres").delete().eq("id", id);
  if (error) console.error("supprimerMembre:", error);
}

export async function modifierMembre(id, updates) {
  const { error } = await supabase.from("membres").update(updates).eq("id", id);
  if (error) console.error("modifierMembre:", error);
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