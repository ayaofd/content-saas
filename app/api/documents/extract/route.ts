import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    let text = "";

    if (fileName.endsWith(".pdf")) {
const pdfParse = require("pdf-parse/lib/pdf-parse.js");      const data = await pdfParse(buffer);
      text = data.text;
    } else if (fileName.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Format non supporté. Utilise un PDF ou un DOCX." },
        { status: 400 }
      );
    }

    text = text.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Aucun texte n'a pu être extrait de ce document." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("ERREUR /api/documents/extract:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur lors de l'extraction",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}