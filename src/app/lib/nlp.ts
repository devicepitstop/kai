// src/lib/nlp.ts

import { UpdatePayload } from '../../../kai/src/types/tickets';
import Fuse from 'fuse.js';

/** --- Phase 4 Update Logic --- */
const UPDATE_SYNONYMS = /(update|set|mark|close|finish)/i;
const STATUS_MAP = {
  completed: "Completed",
  done: "Completed",
  finished: "Completed",
  progress: "In Progress",
} as const;

export interface IntentResult =
  | { type: "create"; data: CreatePayload }
  | { type: "update"; data: Partial<UpdatePayload> };

export function detectIntent(text: string): IntentResult {
  const isUpdate = UPDATE_SYNONYMS.test(text);
  if (!isUpdate) return { type: "create", data: parseTranscript(text) };

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
  const base = text.replace(/\$?\d+\s?(bucks|dollars)?/i, '').trim();
  return `${base}${amount ? ` Balance $${amount}.` : ""}`;
}

/** --- Phase 2 Creation Logic --- */
export type Priority = 'Low' | 'Normal' | 'High';

export interface PartNeeded {
  name: string;
  cost_estimate?: number;
}

export interface CreatePayload {
  subject: string;
  problem_type: string;
  priority: Priority;
  parts_needed: PartNeeded[];
}

const PROBLEM_MAP: Record<string, { type: string; priority: Priority }> = {
  battery: { type: 'Battery', priority: 'High' },
  screen: { type: 'Display', priority: 'Normal' },
  charger: { type: 'Charging Port', priority: 'Normal' },
  keyboard: { type: 'Keyboard', priority: 'Normal' },
};

export function parseTranscript(txt: string): CreatePayload {
  const lower = txt.toLowerCase();
  if (!/(screen|battery|charge|keyboard)/.test(lower)) {
    return { subject: 'Unknown', problem_type: 'General', priority: 'Normal', parts_needed: [] };
  }
  const urgent = /(swollen|smoking|sparking|fire|burn)/.test(lower);
  const key = Object.keys(PROBLEM_MAP).find(k => lower.includes(k));
  const meta = PROBLEM_MAP[key!];

  return {
    subject: `${key!.charAt(0).toUpperCase() + key!.slice(1)} issue`,
    problem_type: meta.type,
    priority: urgent ? 'High' : meta.priority,
    parts_needed: inferParts(lower, key!),
  };
}

function inferParts(text: string, key: string): PartNeeded[] {
  if (key === 'battery') {
    const modelMatch = text.match(/iphone\s?\d{1,2}|pixel\s?\d/i);
    return [{ name: `${modelMatch ? modelMatch[0] + ' ' : ''}Battery` }];
  }
  if (key === 'screen') return [{ name: 'Replacement Screen' }];
  if (key === 'charger') return [{ name: 'Charging Port' }];
  if (key === 'keyboard') return [{ name: 'Keyboard' }];
  return [];
}
