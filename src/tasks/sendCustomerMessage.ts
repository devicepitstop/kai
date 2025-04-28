import { repairShopr } from '@/lib/repairshopr';

export async function sendCustomerMessage({ customerId, body }: { customerId: number; body: string }) {
  await repairShopr.communications.create({
    customer_id: customerId,
    subject: 'Repair Update',
    body,
    to_cc: [],
  });
}
