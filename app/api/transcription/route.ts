// app/api/transcription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import handler from '@/src/api/transcription/updateHandler';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await handler(
    {
      method: 'POST',
      body,
    } as any,
    {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code }),
        end: (text: string) => new Response(text, { status: code }),
      }),
      json: (data: any) => NextResponse.json(data),
    } as any,
  );
  return result;
}
