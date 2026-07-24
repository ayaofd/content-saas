import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error("ERREUR /api/user GET:", err);
    return NextResponse.json(
      { error: "Erreur serveur", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    console.error("ERREUR /api/user PATCH:", err);
    return NextResponse.json(
      { error: "Erreur serveur", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}