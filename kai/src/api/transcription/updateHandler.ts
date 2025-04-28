import type { VercelRequest, VercelResponse } from '@vercel/node';
import { detectIntent } from '../../lib/nlp';
import { updateTicket } from '../../tasks/updateTicket';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('POST only');

  const { text } = req.body as { text: string };
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const intent = detectIntent(text);
    if (intent.type !== "update") return res.status(422).json({ error: "NOT_UPDATE_INTENT" });

    await updateTicket(intent.data);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
