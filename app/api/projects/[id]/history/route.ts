import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const history = await prisma.generatedContent.findMany({
      where: { projectId: id, userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("ERREUR /api/projects/[id]/history GET:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'historique du projet" },
      { status: 500 }
    );
  }
}