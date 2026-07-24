"use client";

import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Données mockées en attendant la vraie base de données
const stats = [
  { label: "Projets actifs", value: 4 },
  { label: "Contenus générés", value: 128 },
  { label: "Ce mois-ci", value: 32 },
  { label: "Crédits restants", value: 850 },
];

const chartData = [
  { day: "Lun", contenus: 8 },
  { day: "Mar", contenus: 12 },
  { day: "Mer", contenus: 5 },
  { day: "Jeu", contenus: 18 },
  { day: "Ven", contenus: 10 },
  { day: "Sam", contenus: 3 },
  { day: "Dim", contenus: 6 },
];

const recentActivity = [
  { id: 1, text: "Article de blog généré", project: "Projet Marketing", time: "Il y a 2h" },
  { id: 2, text: "Post Instagram créé", project: "Projet Social Media", time: "Il y a 5h" },
  { id: 3, text: "Nouveau projet créé", project: "Projet SEO", time: "Hier" },
  { id: 4, text: "Description produit générée", project: "Projet E-commerce", time: "Hier" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.email?.split("@")[0] ?? "";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Bonjour {firstName} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Voici un aperçu de ton activité
        </p>
      </div>

      {/* Cartes de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Contenus générés cette semaine
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="day" stroke="currentColor" className="text-xs text-gray-500 dark:text-gray-400" />
              <YAxis stroke="currentColor" className="text-xs text-gray-500 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--tooltip-bg, white)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="contenus" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activité récente */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Activité récente
          </h2>
          <ul className="space-y-4">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="text-sm">
                <p className="text-gray-900 dark:text-white font-medium">
                  {activity.text}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {activity.project} · {activity.time}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}