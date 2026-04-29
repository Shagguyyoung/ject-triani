import { useState, useEffect } from "react";
import { getCotisations, marquerPaye, ajouterCotisation } from "../data/store";

export function useCotisations() {
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Charger les cotisations au montage
  useEffect(() => {
    const loadCotisations = () => {
      const result = getCotisations();
      setCotisations(Array.isArray(result) ? result : []);
      setLoading(false);
    };
    loadCotisations();
  }, []);

  function marquer(id) {
    marquerPaye(id);
    setCotisations((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return prevArray.map((c) =>
        c.id === id 
          ? { ...c, statut: "ok", date_paiement: new Date().toISOString().split("T")[0] } 
          : c
      );
    });
  }

  function ajouter(form) {
    const nouvelle = ajouterCotisation(form);
    setCotisations((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      if (!nouvelle) return prevArray;
      return [{ ...nouvelle, membre: {} }, ...prevArray];
    });
  }

  return { 
    cotisations: Array.isArray(cotisations) ? cotisations : [], 
    loading,
    marquerPaye: marquer, 
    ajouterCotisation: ajouter 
  };
}