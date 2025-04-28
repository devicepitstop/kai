// src/tasks/sendCustomerMessage.ts

import { RepairShoprClient } from '@/packages/repairshopr-sdk';

const repairShopr = new RepairShoprClient(process.env.RS_API_KEY!);

interface SendCustomerMessageOptions {
  customerId: number;
  body: string;
}

export async function sendCustomerMessage({ customerId, body }: SendCustomerMessageOptions) {
  const customer = await repairShopr.customers.get(customerId);
  if (!customer || !customer.email) {
    throw new Error('Customer email not found.');
  }

  // Replace this with whatever your real messaging looks like
  console.log(`Pretend we're sending an email to ${customer.email} saying: ${body}`);

  // If you actually wanted to email through RepairShopr API later, here is where you’d POST.
}
