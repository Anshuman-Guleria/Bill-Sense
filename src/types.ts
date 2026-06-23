export interface ChargeItem {
  id: string;
  name: string;
  amount: number;
  category: "subscription" | "fee" | "tax" | "usage" | "unclear" | "other";
  isFlagged: boolean;
  simplification: string;
  actionTip: string;
}

export interface BillAnalysis {
  merchant: string;
  billingDate: string;
  accountNumber: string;
  totalAmount: number;
  charges: ChargeItem[];
  summary: string;
  recommendation: string;
}

export interface SavedBill extends BillAnalysis {
  id: string;
  timestamp: string;
  rawText: string;
}
