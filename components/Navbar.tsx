"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { href: "/dashboard", label: "Tableau de bord" },
    { href: "/profile", label: "Profil" },
    { href: "/projects", label: "Projets" },
    { href: "/generate", label: "Générer" },
    { href: "/chat", label: "Chat" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Liens - visibles sur desktop, cachés sur mobile */}
        <div className="hidden md:flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium ${
                pathname === link.href
                  ? "text-[#5C0A1E] dark:text-[#E4C578] border-b-2 border-[#5C0A1E] dark:border-[#E4C578]"
                  : "text-gray-600 dark:text-gray-300 hover:text-[#5C0A1E] dark:hover:text-[#E4C578]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Email + toggle + déconnexion - visibles sur desktop */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {session?.user?.email}
          </span>
          {mounted && (
            <button
              onClick={toggleTheme}
              className="text-xl"
              aria-label="Changer de thème"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
          >
            Déconnexion
          </button>
        </div>

        {/* Bouton burger - visible seulement sur mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
          <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
          <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-3 mt-4 pb-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`font-medium ${
                pathname === link.href
                  ? "text-[#5C0A1E] dark:text-[#E4C578]"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t dark:border-gray-700 pt-3 flex flex-col gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {session?.user?.email}
            </span>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="text-xl w-fit"
                aria-label="Changer de thème"
              >
                {theme === "dark" ? "☀️ Mode clair" : "🌙 Mode sombre"}
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm w-fit"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}