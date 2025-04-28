import { RepairShoprClient } from '@/packages/repairshopr-sdk';

export const repairShopr = new RepairShoprClient({
  apiKey: process.env.RS_API_KEY!,
  userToken: process.env.RS_USER_TOKEN!,
});
