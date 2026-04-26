import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ─── HELPERS ────────────────────────────────────────

function pdfBase(titre) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(titre, 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);
  doc.setDrawColor(212, 175, 122);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);
  return doc;
}

// ─── MEMBRES PDF ────────────────────────────────────

export function exportMembresPDF(membres) {
  const doc = pdfBase("Liste des membres");

  const rows = membres.map((m, i) => [
    String(i + 1).padStart(3, "0"),
    m.nom,
    m.role,
    m.tel ?? "—",
    m.email ?? "—",
    m.statut === "ok" ? "À jour" : m.statut === "pending" ? "En attente" : "En retard",
    m.created_at ?? "—",
  ]);

  autoTable(doc, {
    startY: 38,
    head: [["#", "Nom", "Rôle", "Téléphone", "Email", "Statut", "Inscrit le"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [13, 30, 56], textColor: [212, 175, 122], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      5: {
        fontStyle: "bold",
        textColor: (cell) =>
          cell.raw === "À jour" ? [34, 197, 94]
          : cell.raw === "En attente" ? [251, 191, 36]
          : [248, 113, 113],
      },
    },
  });

  doc.save(`membres_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ─── MEMBRES EXCEL ──────────────────────────────────

export function exportMembresExcel(membres) {
  const rows = membres.map((m, i) => ({
    "#": String(i + 1).padStart(3, "0"),
    Nom: m.nom,
    Rôle: m.role,
    Téléphone: m.tel ?? "",
    Email: m.email ?? "",
    Statut: m.statut === "ok" ? "À jour" : m.statut === "pending" ? "En attente" : "En retard",
    "Inscrit le": m.created_at ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Membres");
  XLSX.writeFile(wb, `membres_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ─── COTISATIONS PDF ────────────────────────────────

export function exportCotisationsPDF(cotisations) {
  const doc = pdfBase("Suivi des cotisations");

  const totalPaye = cotisations
    .filter((c) => c.statut === "ok")
    .reduce((s, c) => s + (c.montant || 0), 0);
  const totalAttendu = cotisations.reduce((s, c) => s + (c.montant || 0), 0);
  const taux = totalAttendu > 0 ? Math.round((totalPaye / totalAttendu) * 100) : 0;

  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total perçu : ${totalPaye.toLocaleString()} F   |   Attendu : ${totalAttendu.toLocaleString()} F   |   Taux : ${taux}%`, 14, 40);

  const rows = cotisations.map((c, i) => [
    String(i + 1).padStart(3, "0"),
    c.membre?.nom ?? "—",
    c.membre?.role ?? "—",
    c.montant ? `${c.montant.toLocaleString()} F` : "—",
    c.mois ?? "—",
    c.date_paiement ?? "—",
    c.statut === "ok" ? "Payé" : c.statut === "pending" ? "En attente" : "En retard",
  ]);

  autoTable(doc, {
    startY: 46,
    head: [["#", "Membre", "Rôle", "Montant", "Mois", "Date paiement", "Statut"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [13, 30, 56], textColor: [212, 175, 122], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`cotisations_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ─── COTISATIONS EXCEL ──────────────────────────────

export function exportCotisationsExcel(cotisations) {
  const rows = cotisations.map((c, i) => ({
    "#": String(i + 1).padStart(3, "0"),
    Membre: c.membre?.nom ?? "—",
    Rôle: c.membre?.role ?? "—",
    "Montant (F)": c.montant ?? 0,
    Mois: c.mois ?? "—",
    "Date paiement": c.date_paiement ?? "—",
    Statut: c.statut === "ok" ? "Payé" : c.statut === "pending" ? "En attente" : "En retard",
  }));

  // Ligne totaux
  const totalPaye = cotisations
    .filter((c) => c.statut === "ok")
    .reduce((s, c) => s + (c.montant || 0), 0);
  rows.push({
    "#": "",
    Membre: "TOTAL PERÇU",
    Rôle: "",
    "Montant (F)": totalPaye,
    Mois: "",
    "Date paiement": "",
    Statut: "",
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cotisations");
  XLSX.writeFile(wb, `cotisations_${new Date().toISOString().split("T")[0]}.xlsx`);
}