export interface Event {
  id: string;
  name: string;
  receiptCount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  eventId: string;
  vendorName: string;
  date: string;
  totalAmount: number;
  items: ReceiptItem[];
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  name: string;
  price: number;
  category: ItemCategory;
  quantity: number;
}

export enum ItemCategory {
  FOOD = "FOOD",
  DRINKS = "DRINKS",
  SUPPLIES = "SUPPLIES",
  EQUIPMENT = "EQUIPMENT",
  TRAVEL = "TRAVEL",
  OTHER = "OTHER",
}

export interface EventSummary {
  totalAmount: number;
  receiptCount: number;
  categoryBreakdown: {
    [key in ItemCategory]: number;
  };
  vendorBreakdown: {
    [vendorName: string]: number;
  };
}
