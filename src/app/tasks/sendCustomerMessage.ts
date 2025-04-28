import { rs } from '@/lib/repairshopr';

export async function sendCustomerMessage({ customerId, body }: { customerId: number; body: string }) {
  return await rs.sendCommunication(customerId, { subject: "Repair Update", body });
}
