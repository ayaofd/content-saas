import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ERREUR /api/projects/[id] DELETE:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression du projet" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Nom de projet requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name, description: description || null },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("ERREUR /api/projects/[id] PATCH:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour du projet" },
      { status: 500 }
    );
  }
}