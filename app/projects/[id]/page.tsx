import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HistoryList from "@/components/HistoryList";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-gray-500">Projet introuvable.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {project.name}
        </h1>
        {project.description && (
          <p className="text-gray-500 text-sm mt-1">{project.description}</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Historique du projet
        </h2>
        <HistoryList projectId={id} />
      </div>
    </div>
  );
}