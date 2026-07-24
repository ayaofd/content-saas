"use client";

import { useState, useEffect } from "react";

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        console.error("Réponse inattendue de /api/projects:", data);
        setProjects([]);
        return;
      }

      setProjects(data);
    } catch (err) {
      console.error("Erreur de chargement des projets:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        await loadProjects();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erreur lors de la création");
      }
    } catch (err) {
      console.error("Erreur lors de la création du projet:", err);
      setError("Erreur réseau, réessaie plus tard");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        console.error("Échec de la suppression du projet:", id);
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du projet:", err);
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
    setEditDescription(project.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleEditSubmit = async (id: string) => {
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? updated : p))
        );
        cancelEdit();
      } else {
        console.error("Échec de la mise à jour du projet:", id);
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du projet:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredProjects = (Array.isArray(projects) ? projects : []).filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Mes projets
      </h1>

      {/* Formulaire de création */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Nouveau projet
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Nom
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium w-fit px-4"
          >
            {creating ? "Création..." : "Créer le projet"}
          </button>
        </form>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <input
          type="text"
          placeholder="Rechercher un projet par nom ou description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      {/* Liste des projets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Liste des projets
        </h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Chargement...</p>
        ) : filteredProjects.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {searchQuery
              ? "Aucun projet ne correspond à ta recherche."
              : "Aucun projet pour l'instant."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredProjects.map((project) => (
              <li
                key={project.id}
                className="border border-gray-100 dark:border-gray-700 rounded-lg p-4"
              >
                {editingId === project.id ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSubmit(project.id)}
                        disabled={savingEdit}
                        className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingEdit ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </p>
                      {project.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 shrink-0 ml-4">
                      <button
                        onClick={() => startEdit(project)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}