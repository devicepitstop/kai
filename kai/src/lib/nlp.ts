import { UpdatePayload } from '../types/tickets';
import Fuse from 'fuse.js';

const UPDATE_SYNONYMS = /(update|set|mark|close|finish)/i;
const STATUS_MAP = {
  completed: "Completed",
  done: "Completed",
  finished: "Completed",
  progress: "In Progress",
} as const;

export type IntentResult =
  | { type: "create"; data: any } // Placeholder for Phase 2 create
  | { type: "update"; data: Partial<UpdatePayload> };

export function detectIntent(text: string): IntentResult {
  const isUpdate = UPDATE_SYNONYMS.test(text);
  if (!isUpdate) return { type: "create", data: {/* TODO */} };

  const nameMatch = text.match(/(?:for|of)\s([\w\s'.-]+)'s?\s+ticket/i);
  const statusMatch = text.match(/(?:to|as)\s(Completed|finished|done|in progress)/i);
  const amount = text.match(/\$?(\d+)\s?(?:bucks|dollars)?/i);

  return {
    type: "update",
    data: {
      customerName: nameMatch?.[1]?.trim(),
      ticketStatus: STATUS_MAP[statusMatch?.[1]?.toLowerCase() as keyof typeof STATUS_MAP] ?? "Completed",
      amountOwed: amount ? Number(amount[1]) : undefined,
      publicNote: buildNote(text, amount?.[1]),
    },
  };
}

function buildNote(text: string, amount?: string) {
  const base = text.replace(/\s?\$?\d+\s?(bucks|dollars)?/i, '').trim();
  return `${base}${amount ? ` Balance $${amount}.` : ""}`;
}
