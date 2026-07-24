"use client";

import { useState, useRef } from "react";
import HistoryList from "@/components/HistoryList";

const TYPES = [
  { value: "texte", label: "Texte" },
  { value: "titre", label: "Titres" },
  { value: "description", label: "Description" },
  { value: "hashtags", label: "Hashtags" },
  { value: "resume", label: "Résumé" },
  { value: "reformulation", label: "Reformulation" },
  { value: "traduction", label: "Traduction (EN)" },
];

export default function GeneratePage() {
  const [type, setType] = useState("texte");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [length, setLength] = useState("moyen");
  const [language, setLanguage] = useState("fr");
  const [creativity, setCreativity] = useState("moyenne");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyKey, setHistoryKey] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const needsTone = ["texte", "titre", "description", "reformulation"].includes(type);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Erreur lors de l'extraction du document");
        setFileName("");
        return;
      }

      setTopic(data.text);
    } catch {
      setUploadError("Impossible de contacter le serveur");
      setFileName("");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, type, length, language, creativity }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la génération");
        return;
      }

      setResult(data.content);
      setHistoryKey((k) => k + 1);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  const topicLabel =
    type === "resume" || type === "reformulation" || type === "traduction"
      ? "Texte à traiter"
      : "Sujet";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Génération IA
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Type de génération
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                {topicLabel}
              </label>
              <label className="text-xs text-blue-600 hover:underline cursor-pointer">
                {uploading ? "Extraction..." : "Uploader un document (PDF/DOCX)"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              required
              rows={5}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ex: les bienfaits du café"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            {fileName && !uploadError && (
              <p className="text-xs text-gray-500 mt-1">
                Texte extrait de « {fileName} » — tu peux le modifier avant de générer.
              </p>
            )}
            {uploadError && (
              <p className="text-xs text-red-500 mt-1">{uploadError}</p>
            )}
          </div>

          {needsTone && (
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                Ton
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="professionnel">Professionnel</option>
                <option value="marketing">Marketing</option>
                <option value="humoristique">Humoristique</option>
                <option value="décontracté">Décontracté</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                Longueur
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="court">Court</option>
                <option value="moyen">Moyen</option>
                <option value="long">Long</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                Langue
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="es">Espagnol</option>
                <option value="ar">Arabe</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                Créativité
              </label>
              <select
                value={creativity}
                onChange={(e) => setCreativity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="faible">Faible</option>
                <option value="moyenne">Moyenne</option>
                <option value="élevée">Élevée</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium w-fit px-4"
          >
            {loading ? "Génération..." : "Générer"}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Résultat
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
            {result}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Historique
        </h2>
        <HistoryList key={historyKey} />
      </div>
    </div>
  );
}