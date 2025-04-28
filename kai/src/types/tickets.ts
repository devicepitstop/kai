export interface UpdatePayload {
    customerName: string;
    ticketStatus: "Completed" | "In Progress" | "Need Approval" | string;
    publicNote: string;
    amountOwed?: number;
  }
  