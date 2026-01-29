import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askSchema } from "@/lib/validations";
import OpenAI from "openai";

// POST /api/ask - Ask a question about documents
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();

    // Validate input
    const result = askSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { question, documentIds } = result.data;

    // Fetch relevant documents
    let documents;
    if (documentIds && documentIds.length > 0) {
      documents = await prisma.document.findMany({
        where: {
          id: { in: documentIds },
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          content: true,
        },
      });
    } else {
      // Get all user's documents if no specific IDs provided
      documents = await prisma.document.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          content: true,
        },
        take: 10, // Limit to 10 documents
        orderBy: { updatedAt: "desc" },
      });
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    // Build context from documents
    const context = documents
      .map((doc) => `## ${doc.title}\n${doc.content}`)
      .join("\n\n---\n\n");

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `あなたは知識ベースに基づいて質問に答えるアシスタントです。
以下のドキュメントを参照して、ユーザーの質問に日本語で回答してください。
ドキュメントに関連する情報がない場合は、その旨を伝えてください。

---
${context}
---`,
        },
        {
          role: "user",
          content: question,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const answer = completion.choices[0]?.message?.content;
    if (!answer) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      answer,
      sources: documents.map((doc) => ({
        id: doc.id.toString(),
        title: doc.title,
      })),
    });
  } catch (error) {
    console.error("Error processing question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
