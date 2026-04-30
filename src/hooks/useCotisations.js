import { useState, useEffect } from "react";
import { getCotisations, ajouterCotisation, marquerPaye } from "../data/store";

export function useCotisations() {
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCotisations().then((data) => {
      setCotisations(data);
      setLoading(false);
    });
  }, []);

  async function marquer(id) {
    await marquerPaye(id);
    setCotisations((prev) =>
      prev.map((c) => c.id === id
        ? { ...c, statut: "ok", date_paiement: new Date().toISOString().split("T")[0] }
        : c)
    );
  }

  async function ajouter(form) {
    const nouvelle = await ajouterCotisation(form);
    if (nouvelle) setCotisations((prev) => [nouvelle, ...prev]);
  }

  return { cotisations, loading, marquerPaye: marquer, ajouterCotisation: ajouter };
}