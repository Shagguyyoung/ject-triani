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
  // 1. Créer l'utilisateur dans Supabase Auth
  let authUser = null;
  
  if (form.email) {
    const tempPassword = "ject2025";
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: tempPassword,
      options: {
        data: {
          nom: form.nom,
          prenom: form.prenom || "",
          role: form.role || "Membre"
        }
      }
    });
    
    if (authError) {
      console.error("Erreur création auth:", authError);
      // Si l'utilisateur existe déjà, on continue quand même
      if (!authError.message.includes("already registered")) {
        // On ne retourne pas null, on continue pour créer le membre
        console.warn("L'utilisateur existe peut-être déjà");
      }
    } else {
      authUser = authData.user;
    }
  }
  
  // 2. Ajouter le membre dans la table "membres"
  const membreData = {
    nom: form.nom,
    prenom: form.prenom || "",
    email: form.email,
    telephone: form.tel || "",
    role: form.role || "Membre",
    statut: form.statut || "ok",
    user_id: authUser?.id || null
  };
  
  const { data, error } = await supabase
    .from("membres")
    .insert([membreData])
    .select()
    .single();
    
  if (error) { 
    console.error("ajouterMembre:", error); 
    return null; 
  }
  
  // 3. Sauvegarder aussi dans localStorage pour la connexion (fallback)
  if (form.email) {
    const comptes = JSON.parse(localStorage.getItem("association_users") || "[]");
    const existe = comptes.find((u) => u.email === form.email);
    if (!existe) {
      comptes.push({
        email: form.email,
        password: "ject2025",
        role: form.role || "membre",
        nom: form.nom,
        prenom: form.prenom || "",
        membre_id: data.id,
      });
      localStorage.setItem("association_users", JSON.stringify(comptes));
    }
  }
  
  // 4. Afficher les identifiants dans la console pour debug
  console.log("✅ Membre ajouté avec succès !");
  console.log("   Email:", form.email);
  console.log("   Mot de passe: ject2025");
  
  return data;
}

export async function supprimerMembre(id) {
  // Récupérer le membre pour avoir son user_id et email
  const { data: membre } = await supabase
    .from("membres")
    .select("user_id, email")
    .eq("id", id)
    .single();
  
  // Supprimer le membre de la table
  const { error } = await supabase.from("membres").delete().eq("id", id);
  if (error) console.error("supprimerMembre:", error);
  
  // Supprimer du localStorage
  if (membre?.email) {
    const comptes = JSON.parse(localStorage.getItem("association_users") || "[]");
    const nouveauxComptes = comptes.filter((u) => u.email !== membre.email);
    localStorage.setItem("association_users", JSON.stringify(nouveauxComptes));
  }
  
  // Note: La suppression de l'utilisateur Auth nécessite des droits admin
  // Si tu as besoin de cette fonctionnalité, contacte-moi
}

export async function modifierMembre(id, updates) {
  const { error } = await supabase.from("membres").update(updates).eq("id", id);
  if (error) console.error("modifierMembre:", error);
  
  // Mettre à jour le localStorage si l'email ou le nom change
  if (updates.email || updates.nom) {
    const comptes = JSON.parse(localStorage.getItem("association_users") || "[]");
    const compteIndex = comptes.findIndex((u) => u.membre_id === id);
    if (compteIndex !== -1) {
      if (updates.email) comptes[compteIndex].email = updates.email;
      if (updates.nom) comptes[compteIndex].nom = updates.nom;
      localStorage.setItem("association_users", JSON.stringify(comptes));
    }
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

// ─── AUTH UTILS ─────────────────────────────────────

// Fonction pour connecter un utilisateur (à utiliser dans LoginPage)
export async function loginUser(email, password) {
  // 1. Essayer la connexion avec Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (!error && data.user) {
    // Récupérer le profil membre
    const { data: membre } = await supabase
      .from("membres")
      .select("*")
      .eq("email", email)
      .single();
    
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: membre?.role || "membre",
        nom: membre?.nom || data.user.user_metadata?.nom,
        prenom: membre?.prenom || "",
        membre_id: membre?.id
      }
    };
  }
  
  // 2. Fallback: connexion avec localStorage
  const comptes = JSON.parse(localStorage.getItem("association_users") || "[]");
  const userLocal = comptes.find(u => u.email === email && u.password === password);
  
  if (userLocal) {
    return {
      success: true,
      user: {
        email: userLocal.email,
        role: userLocal.role,
        nom: userLocal.nom,
        prenom: userLocal.prenom || "",
        membre_id: userLocal.membre_id
      }
    };
  }
  
  return { success: false, error: "Email ou mot de passe incorrect" };
}

// Fonction pour déconnecter l'utilisateur
export async function logoutUser() {
  await supabase.auth.signOut();
  // Le localStorage sera géré par l'app
}