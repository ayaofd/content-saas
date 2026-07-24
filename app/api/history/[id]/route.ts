import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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

    const item = await prisma.generatedContent.findUnique({ where: { id } });

    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: "Introuvable ou non autorisé" }, { status: 404 });
    }

    await prisma.generatedContent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ERREUR /api/history/[id] DELETE:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
}