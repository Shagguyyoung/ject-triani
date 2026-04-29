import { useState, useEffect } from "react";
import { getMembres, ajouterMembre, supprimerMembre, modifierMembre } from "../data/store";

export function useMembers() {
  const [membres, setMembres] = useState([]);

  // ✅ Charger les membres au montage
  useEffect(() => {
    const loadMembres = () => {
      const result = getMembres();
      setMembres(Array.isArray(result) ? result : []);
    };
    loadMembres();
  }, []);

  function ajouter(form) {
    const nouveau = ajouterMembre(form);
    // ✅ Sécurisation : s'assurer que prev est un tableau
    setMembres((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return nouveau ? [nouveau, ...prevArray] : prevArray;
    });
  }

  function supprimer(id) {
    supprimerMembre(id);
    setMembres((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return prevArray.filter((m) => m.id !== id);
    });
  }

  function modifierStatut(id, statut) {
    modifierMembre(id, { statut });
    setMembres((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return prevArray.map((m) => (m.id === id ? { ...m, statut } : m));
    });
  }

  return { 
    membres: Array.isArray(membres) ? membres : [], 
    setMembres, 
    ajouterMembre: ajouter, 
    supprimerMembre: supprimer, 
    modifierStatut 
  };
}