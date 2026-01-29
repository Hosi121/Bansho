import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { relationsSchema } from '@/lib/validations';

const PROMPT_TEMPLATE = `次の2つのドキュメントの関連性を0から1のスケールで評価してください。
1: 非常に関連している
0: 全く関連していない
結果を次のJSON形式で返してください: {"relation": <スコア>}

ドキュメント1: %s
ドキュメント2: %s`;

// POST /api/relations - Calculate relation between documents
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);
    const body = await request.json();

    // Validate input
    const result = relationsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { documentIds } = result.data;

    // Fetch documents
    const documents = await prisma.document.findMany({
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

    if (documents.length !== documentIds.length) {
      return NextResponse.json(
        { error: 'One or more documents not found or not owned by user' },
        { status: 404 }
      );
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return a default relation score if no API key
      console.warn('OpenAI API key not configured, returning default relation');
      return NextResponse.json({ relation: 0.5 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Create prompt
    const doc1 = documents[0];
    const doc2 = documents[1];
    const prompt = PROMPT_TEMPLATE.replace('%s', `${doc1.title}\n${doc1.content}`).replace(
      '%s',
      `${doc2.title}\n${doc2.content}`
    );

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse response
    let relation = 0.5;
    try {
      const parsed = JSON.parse(responseContent);
      relation = Math.min(1, Math.max(0, parsed.relation));
    } catch {
      // Try to extract number from response
      const match = responseContent.match(/(\d+\.?\d*)/);
      if (match) {
        relation = Math.min(1, Math.max(0, parseFloat(match[1])));
      }
    }

    // Save the edge to database using upsert
    await prisma.edge.upsert({
      where: {
        fromDocumentId_toDocumentId: {
          fromDocumentId: doc1.id,
          toDocumentId: doc2.id,
        },
      },
      update: { weight: relation, deletedAt: null },
      create: {
        fromDocumentId: doc1.id,
        toDocumentId: doc2.id,
        weight: relation,
      },
    });

    return NextResponse.json({ relation });
  } catch (error) {
    console.error('Error calculating relation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/relations - Get all relations for user's documents
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);

    // Get all user's documents
    const documents = await prisma.document.findMany({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    const documentIds = documents.map((d) => d.id);

    // Get all edges between user's documents
    const edges = await prisma.edge.findMany({
      where: {
        fromDocumentId: { in: documentIds },
        toDocumentId: { in: documentIds },
        deletedAt: null,
      },
      include: {
        fromDocument: { select: { id: true, title: true } },
        toDocument: { select: { id: true, title: true } },
      },
    });

    const relations = edges.map((edge) => ({
      id: edge.id,
      from: {
        id: edge.fromDocument.id.toString(),
        title: edge.fromDocument.title,
      },
      to: {
        id: edge.toDocument.id.toString(),
        title: edge.toDocument.title,
      },
      weight: edge.weight,
    }));

    return NextResponse.json(relations);
  } catch (error) {
    console.error('Error fetching relations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
