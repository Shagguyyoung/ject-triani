import { useState, useEffect } from "react";
import { getMembres, ajouterMembre, supprimerMembre, modifierMembre } from "../data/store";

export function useMembers() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembres().then((data) => {
      setMembres(data);
      setLoading(false);
    });
  }, []);

  async function ajouter(form) {
    const nouveau = await ajouterMembre(form);
    if (nouveau) setMembres((prev) => [nouveau, ...prev]);
    return nouveau;
  }

  async function supprimer(id) {
    await supprimerMembre(id);
    setMembres((prev) => prev.filter((m) => m.id !== id));
  }

  async function modifier(id, updates) {
    await modifierMembre(id, updates);
    setMembres((prev) => prev.map((m) => m.id === id ? { ...m, ...updates } : m));
  }

  return { membres, loading, setMembres, ajouterMembre: ajouter, supprimerMembre: supprimer, modifierMembre: modifier };
}