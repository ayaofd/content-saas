import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callOpenRouter } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { conversationId, message } = await req.json();

    if (!conversationId || !message) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }

    await prisma.message.create({
      data: { conversationId, role: "user", content: message },
    });

    const history = conversation.messages
      .map((m) => `${m.role === "user" ? "Utilisateur" : "Assistant"}: ${m.content}`)
      .join("\n");
    const prompt = `${history}\nUtilisateur: ${message}\nAssistant:`;

    const reply = await callOpenRouter(prompt);

    await prisma.message.create({
      data: { conversationId, role: "assistant", content: reply },
    });

    if (conversation.messages.length === 0) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { title: message.slice(0, 50) },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("ERREUR /api/chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors du chat" },
      { status: 500 }
    );
  }
}