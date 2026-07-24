"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";

type HistoryItem = {
  id: string;
  type: string;
  tone: string | null;
  prompt: string;
  result: string;
  createdAt: string;
};

export default function HistoryList({ projectId }: { projectId?: string }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = projectId ? `/api/projects/${projectId}/history` : "/api/history";

    fetch(url)
      .then((res) => res.json())
      .then((data) => setItems(data.history || []))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/history/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDownloadTxt = (item: HistoryItem) => {
    const blob = new Blob([item.result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.type}-${item.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = (item: HistoryItem) => {
    const doc = new jsPDF();
    const marginLeft = 15;
    const marginTop = 20;
    const maxWidth = 180;

    doc.setFontSize(14);
    doc.text(`${item.type.toUpperCase()}${item.tone ? " · " + item.tone : ""}`, marginLeft, marginTop);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(new Date(item.createdAt).toLocaleString("fr-FR"), marginLeft, marginTop + 7);

    doc.setFontSize(12);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(item.result, maxWidth);
    doc.text(lines, marginLeft, marginTop + 18);

    doc.save(`${item.type}-${item.id}.pdf`);
  };

  if (loading) return <p className="text-sm text-gray-500">Chargement de l'historique...</p>;
  if (items.length === 0) return <p className="text-sm text-gray-500">Aucune génération pour le moment.</p>;

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-gray-200 p-3 bg-white">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase">
              {item.type} {item.tone ? `· ${item.tone}` : ""}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(item.createdAt).toLocaleString("fr-FR")}
            </span>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.result}</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <button
              onClick={() => handleCopy(item.result)}
              className="text-xs text-blue-600 hover:underline"
            >
              Copier
            </button>
            <button
              onClick={() => handleDownloadTxt(item)}
              className="text-xs text-blue-600 hover:underline"
            >
              Exporter TXT
            </button>
            <button
              onClick={() => handleDownloadPdf(item)}
              className="text-xs text-blue-600 hover:underline"
            >
              Télécharger PDF
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}