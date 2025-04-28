// src/tasks/updateTicket.ts

import { UpdatePayload } from '@/types/tickets';
import { RepairShopr } from '@/packages/repairshopr-sdk';
import { sendCustomerMessage } from './sendCustomerMessage';

const rs = new RepairShopr({
  subdomain: process.env.RS_SUBDOMAIN!,
  apiKey: process.env.RS_API_KEY!,
  userToken: process.env.RS_USER_TOKEN!,
});

export async function updateTicket(payload: UpdatePayload) {
  const ticket = await rs.tickets.findByCustomerName(payload.customerName);
  if (!ticket) throw new Error("Ticket not found");

  await rs.tickets.update(ticket.id, {
    status: payload.ticketStatus,
  });

  await rs.tickets.addPublicNote(ticket.id, payload.publicNote);

  await sendCustomerMessage({
    customerId: ticket.customer_id,
    body: `Hi ${payload.customerName.split(' ')[0]}, ${payload.publicNote}`,
  });
}
