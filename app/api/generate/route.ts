import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callOpenRouter } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";

const PROMPTS: Record<string, (text: string, tone: string) => string> = {
  texte: (text, tone) =>
    `Écris un texte court (environ 100 mots) sur le sujet suivant : "${text}". Utilise un ton ${tone}.`,
  titre: (text, tone) =>
    `Génère 5 titres accrocheurs pour un contenu sur : "${text}". Ton ${tone}. Liste-les simplement, un par ligne.`,
  description: (text, tone) =>
    `Écris une description courte (2-3 phrases) pour : "${text}". Ton ${tone}.`,
  hashtags: (text) =>
    `Génère 10 hashtags pertinents pour un contenu sur : "${text}". Réponds uniquement avec les hashtags séparés par des espaces.`,
  resume: (text) =>
    `Résume ce texte en 2-3 phrases maximum : "${text}"`,
  reformulation: (text, tone) =>
    `Reformule ce texte avec un ton ${tone}, en gardant le même sens : "${text}"`,
  traduction: (text) =>
    `Traduis ce texte en anglais : "${text}"`,
};

const LENGTH_TOKENS: Record<string, number> = {
  court: 200,
  moyen: 500,
  long: 1000,
};

const LENGTH_LABELS: Record<string, string> = {
  court: "très court (environ 50 mots)",
  moyen: "de longueur moyenne (environ 150 mots)",
  long: "détaillé et développé (environ 400 mots)",
};

const LANGUAGE_LABELS: Record<string, string> = {
  fr: "français",
  en: "anglais",
  es: "espagnol",
  ar: "arabe",
};

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn (ton professionnel, format B2B)",
  instagram: "Instagram (ton visuel, accrocheur, avec émojis pertinents)",
  tiktok: "TikTok (ton dynamique, jeune, direct)",
  facebook: "Facebook (ton convivial, accessible)",
  x: "X/Twitter (concis, percutant, sous 280 caractères)",
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { topic, tone, type, projectId, length, language, creativity, platform, audience } =
    await req.json();

  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "Texte requis" }, { status: 400 });
  }

  const promptBuilder = PROMPTS[type] || PROMPTS.texte;
  let prompt = promptBuilder(topic, tone || "professionnel");

  if (platform && PLATFORM_LABELS[platform]) {
    prompt += ` Ce post est destiné à ${PLATFORM_LABELS[platform]}.`;
  }

  if (audience && typeof audience === "string" && audience.trim()) {
    prompt += ` Le public cible est : ${audience.trim()}.`;
  }

  if (length && LENGTH_LABELS[length]) {
    prompt += ` Le résultat doit être ${LENGTH_LABELS[length]}.`;
  }

  if (language && LANGUAGE_LABELS[language] && language !== "fr") {
    prompt += ` Réponds en ${LANGUAGE_LABELS[language]}.`;
  }

  const temperature =
    creativity === "faible" ? 0.3 : creativity === "élevée" ? 1.0 : 0.7;
  const maxTokens = LENGTH_TOKENS[length] || 500;

  try {
    const result = await callOpenRouter(prompt, undefined, { temperature, maxTokens });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (user) {
      await prisma.generatedContent.create({
        data: {
          type: type || "texte",
          tone: tone || null,
          prompt,
          result,
          userId: user.id,
          projectId: projectId || null,
        },
      });
    }

    return NextResponse.json({ content: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}