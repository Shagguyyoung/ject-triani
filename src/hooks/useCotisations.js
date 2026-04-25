import { useState } from "react";
import { getCotisations, marquerPaye, ajouterCotisation } from "../data/store";

export function useCotisations() {
  const [cotisations, setCotisations] = useState(() => getCotisations());

  function marquer(id) {
    marquerPaye(id);
    setCotisations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, statut: "ok", date_paiement: new Date().toISOString().split("T")[0] } : c
      )
    );
  }

  function ajouter(form) {
    const nouvelle = ajouterCotisation(form);
    setCotisations((prev) => [{ ...nouvelle, membre: {} }, ...prev]);
  }

  return { cotisations, marquerPaye: marquer, ajouterCotisation: ajouter };
}