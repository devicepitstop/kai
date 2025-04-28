// src/tasks/updateTicket.ts

import { UpdatePayload } from '@/types/tickets';
import { RepairShoprClient } from '@/packages/repairshopr-sdk';
import { sendCustomerMessage } from './sendCustomerMessage';

const repairShopr = new RepairShoprClient(process.env.RS_API_KEY!);

export async function updateTicket(payload: UpdatePayload) {
  // Find the ticket by customer name
  const tickets = await repairShopr.tickets.list();
  const ticket = tickets.find(t => 
    t.customer_business_then_name?.toLowerCase().includes(payload.customerName!.toLowerCase())
  );
  
  if (!ticket) throw new Error("Ticket not found");

  // Update the ticket status
  await repairShopr.tickets.update(ticket.id, {
    status: payload.ticketStatus,
  });

  // Add a public note
  await repairShopr.tickets.addPublicNote(ticket.id, payload.publicNote);

  // Send a customer message
  await sendCustomerMessage({
    customerId: ticket.customer_id,
    body: `Hi ${payload.customerName?.split(' ')[0]}, ${payload.publicNote}`,
  });
}
