"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { update } = useSession();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

 useEffect(() => {
  fetch("/api/user")
    .then((res) => {
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      return res.json();
    })
    .then((data) => {
      setEmail(data.email ?? "");
      setName(data.name ?? "");
      setLoadingProfile(false);
    })
    .catch((err) => {
      console.error("Erreur chargement profil:", err);
      setLoadingProfile(false);
    });
}, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      setProfileMessage("Profil mis à jour !");
      update();
    } else {
      setProfileMessage("Erreur lors de la mise à jour");
    }

    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      setPasswordMessage("Mot de passe changé avec succès !");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setPasswordError(data.error || "Erreur lors du changement de mot de passe");
    }

    setSavingPassword(false);
  };

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Mon profil
      </h1>

      {/* Infos utilisateur */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Informations
        </h2>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#5C0A1E]"
            />
          </div>

          {profileMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="bg-[#C9A227] text-[#3D0714] py-2 rounded-lg hover:bg-[#E4C578] disabled:opacity-50 text-sm font-medium w-fit px-4"
          >
            {savingProfile ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>

      {/* Changement de mot de passe */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Changer le mot de passe
        </h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#5C0A1E]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#5C0A1E]"
            />
          </div>

          {passwordMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {passwordMessage}
            </p>
          )}
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="bg-[#C9A227] text-[#3D0714] py-2 rounded-lg hover:bg-[#E4C578] disabled:opacity-50 text-sm font-medium w-fit px-4"
          >
            {savingPassword ? "Changement..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}