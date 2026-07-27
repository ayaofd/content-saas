"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la réinitialisation");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 border-2 border-blue-500">
        <h1 className="text-2xl font-bold text-blue-600">Mot de passe oublié</h1>

        {success ? (
          <p className="text-green-600 text-sm text-center mt-4">
            Mot de passe mis à jour ! Redirection vers la connexion...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-blue-500 bg-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-700"
              required
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-2 border-blue-500 bg-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-700"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
            </button>
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline text-center"
            >
              Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}