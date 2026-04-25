import { useState } from "react";
import { getMembres, ajouterMembre, supprimerMembre, modifierMembre } from "../data/store";

export function useMembers() {
  const [membres, setMembres] = useState(() => getMembres());

  function ajouter(form) {
    const nouveau = ajouterMembre(form);
    setMembres((prev) => [nouveau, ...prev]);
  }

  function supprimer(id) {
    supprimerMembre(id);
    setMembres((prev) => prev.filter((m) => m.id !== id));
  }

  function modifierStatut(id, statut) {
    modifierMembre(id, { statut });
    setMembres((prev) => prev.map((m) => (m.id === id ? { ...m, statut } : m)));
  }

  return { membres, ajouterMembre: ajouter, supprimerMembre: supprimer, modifierStatut };
}