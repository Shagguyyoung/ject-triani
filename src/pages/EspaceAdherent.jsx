import { useState, useEffect } from "react";
import { supabase } from "../../supabase/client";

const badge = {
  payé: { label: "Payé", cls: "bg-green-950 text-green-400" },
  en_attente: { label: "En attente", cls: "bg-amber-950 text-amber-400" },
  expiré: { label: "Expiré", cls: "bg-red-950 text-red-400" },
};

export default function EspaceAdherent({ user }) {
  const [profil, setProfil] = useState(null);
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    telephone: "",
    adresse: "",
    profession: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfil();
      fetchCotisations();
    }
  }, [user]);

  async function fetchProfil() {
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .eq("email", user.email)
      .single();

    if (!error && data) {
      setProfil(data);
      setFormData({
        telephone: data.telephone || "",
        adresse: data.adresse || "",
        profession: data.profession || ""
      });
    }
  }

  async function fetchCotisations() {
    setLoading(true);
    const { data, error } = await supabase
      .from("cotisations")
      .select("*")
      .eq("membre_id", profil?.id)
      .order("date_echeance", { ascending: false });

    if (!error) setCotisations(data || []);
    setLoading(false);
  }

  async function updateProfil(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("membres")
      .update({
        telephone: formData.telephone,
        adresse: formData.adresse,
        profession: formData.profession
      })
      .eq("id", profil.id);

    if (!error) {
      setProfil({ ...profil, ...formData });
      setEditing(false);
      alert("Profil mis à jour !");
    }
  }

  const totalPaye = cotisations
    .filter(c => c.statut === "payé")
    .reduce((sum, c) => sum + (c.montant || 0), 0);

  const totalAttendu = cotisations.reduce((sum, c) => sum + (c.montant || 0), 0);

  if (!profil) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af7a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="p-6">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-[#f0e8d6]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Mon espace adhérent
          </h1>
          <p className="text-[#8899aa] text-sm mt-1">Bienvenue {profil.prenom} {profil.nom}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte de profil - Colonne gauche */}
          <div className="lg:col-span-1">
            <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-6 sticky top-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-[#d4af7a22] flex items-center justify-center text-4xl text-[#d4af7a] font-medium mb-4">
                  {profil.prenom?.[0]}{profil.nom?.[0]}
                </div>
                <h2 className="text-xl font-semibold text-[#f0e8d6]">{profil.prenom} {profil.nom}</h2>
                <p className="text-[#8899aa] text-sm mb-4">{profil.email}</p>
                
                <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
                  profil.statut === "actif" 
                    ? "bg-green-950 text-green-400" 
                    : "bg-red-950 text-red-400"
                }`}>
                  {profil.statut === "actif" ? "✓ Membre actif" : "✗ Compte inactif"}
                </div>

                <div className="w-full border-t border-[#d4af7a11] my-4"></div>

                {!editing ? (
                  <>
                    <div className="w-full space-y-3 text-sm mb-6">
                      <div className="flex justify-between">
                        <span className="text-[#8899aa]">📞 Téléphone</span>
                        <span className="text-[#f0e8d6]">{profil.telephone || "Non renseigné"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8899aa]">📍 Adresse</span>
                        <span className="text-[#f0e8d6] text-right">{profil.adresse || "Non renseignée"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8899aa]">💼 Profession</span>
                        <span className="text-[#f0e8d6]">{profil.profession || "Non renseignée"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8899aa]">📅 Membre depuis</span>
                        <span className="text-[#f0e8d6]">
                          {new Date(profil.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="w-full bg-[#d4af7a] text-[#0a1628] px-4 py-2 rounded-lg hover:bg-[#c49b5c] transition font-semibold"
                    >
                      ✏️ Modifier mon profil
                    </button>
                  </>
                ) : (
                  <form onSubmit={updateProfil} className="w-full space-y-3">
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] placeholder-[#445566] focus:outline-none focus:border-[#d4af7a]"
                    />
                    <input
                      type="text"
                      placeholder="Adresse"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] placeholder-[#445566] focus:outline-none focus:border-[#d4af7a]"
                    />
                    <input
                      type="text"
                      placeholder="Profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2 text-sm text-[#f0e8d6] placeholder-[#445566] focus:outline-none focus:border-[#d4af7a]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-[#d4af7a] text-[#0a1628] px-3 py-2 rounded-lg hover:bg-[#c49b5c] transition font-semibold text-sm"
                      >
                        💾 Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="flex-1 bg-[#0a1628] border border-[#d4af7a22] text-[#8899aa] px-3 py-2 rounded-lg hover:bg-[#d4af7a11] transition text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Cotisations - Colonne droite */}
          <div className="lg:col-span-2">
            {/* Stats rapides */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
                <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">Total payé</p>
                <p className="text-2xl font-bold text-green-400">{totalPaye.toLocaleString()} F</p>
              </div>
              <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl p-4">
                <p className="text-[10px] tracking-[.18em] uppercase text-[#8899aa] mb-2">Reste à payer</p>
                <p className="text-2xl font-bold text-amber-400">{(totalAttendu - totalPaye).toLocaleString()} F</p>
              </div>
            </div>

            {/* Historique cotisations */}
            <div className="bg-[#0d1e38] border border-[#d4af7a22] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#d4af7a11]">
                <h3 className="text-lg font-semibold text-[#f0e8d6]">📋 Historique des cotisations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#d4af7a11]">
                      <th className="text-left text-[10px] tracking-[.12em] uppercase text-[#8899aa] font-normal px-4 py-3">Montant</th>
                      <th className="text-left text-[10px] tracking-[.12em] uppercase text-[#8899aa] font-normal px-4 py-3">Type</th>
                      <th className="text-left text-[10px] tracking-[.12em] uppercase text-[#8899aa] font-normal px-4 py-3">Échéance</th>
                      <th className="text-left text-[10px] tracking-[.12em] uppercase text-[#8899aa] font-normal px-4 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-[#8899aa]">
                          <div className="animate-spin inline-block w-5 h-5 border-b-2 border-[#d4af7a] rounded-full"></div>
                        </td>
                      </tr>
                    ) : cotisations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-[#8899aa]">
                          Aucune cotisation trouvée
                        </td>
                      </tr>
                    ) : (
                      cotisations.map((cotisation) => (
                        <tr key={cotisation.id} className="border-b border-[#d4af7a0a] last:border-b-0 hover:bg-[#d4af7a05] transition">
                          <td className="px-4 py-3 font-medium text-[#f0e8d6]">{cotisation.montant.toLocaleString()} F</td>
                          <td className="px-4 py-3 text-[#8899aa] capitalize">{cotisation.type}</td>
                          <td className="px-4 py-3 text-[#8899aa]">
                            {new Date(cotisation.date_echeance).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${badge[cotisation.statut]?.cls || "bg-gray-950 text-gray-400"}`}>
                              {badge[cotisation.statut]?.label || cotisation.statut}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bouton télécharger reçu */}
            <div className="mt-6 text-center">
              <button className="bg-[#d4af7a11] border border-[#d4af7a33] text-[#d4af7a] px-6 py-3 rounded-lg hover:bg-[#d4af7a22] transition text-sm font-semibold">
                📄 Télécharger tous mes reçus (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}