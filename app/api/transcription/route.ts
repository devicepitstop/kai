// app/api/transcription/route.ts

import { UpdatePayload } from '@/types/tickets';
import { NextRequest, NextResponse } from 'next/server';
import { detectIntent } from '@/lib/nlp';
import { updateTicket } from '@/tasks/updateTicket';

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

  const intent = detectIntent(text);

  if (intent.type === 'update') {
    await updateTicket(intent.data as UpdatePayload);
    return NextResponse.json({ status: 'Ticket updated' });
  }

  return NextResponse.json({ status: 'No actionable intent' });
}
