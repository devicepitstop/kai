import { RepairShoprClient } from '@/packages/repairshopr-sdk/repairshopr';

export const repairShopr = new RepairShoprClient(process.env.RS_API_KEY!);
