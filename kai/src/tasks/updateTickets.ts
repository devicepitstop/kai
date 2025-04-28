import { UpdatePayload } from '../types/tickets';
import { sendCustomerMessage } from './sendCustomerMessage';
import { rs } from '@/lib/repairshopr'; // assuming your RepairShopr client lives here

export async function updateTicket(pay: UpdatePayload) {
  const ticket = await findTicketByCustomer(pay.customerName);
  if (!ticket) throw new Error("TICKET_NOT_FOUND");

  await rs.updateTicket(ticket.id, { status: pay.ticketStatus });

  const note = `${pay.publicNote}${pay.amountOwed ? ` Balance $${pay.amountOwed}.` : ""}`;
  await rs.addPublicNote(ticket.id, note);

  await sendCustomerMessage({
    customerId: ticket.customer_id,
    body: `Hi ${pay.customerName.split(" ")[0]}, ${note} You can pick up your device anytime!`,
  });
}
