
export interface ReceiptItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

export interface ReceiptData {
  date: string;
  billNo: string;
  customerName: string;
  items: ReceiptItem[];
  taxRate: number;
}
