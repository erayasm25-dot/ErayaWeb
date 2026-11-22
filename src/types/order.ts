export type PaymentMethod = "UPI" | "PAY_AT_PICKUP";

export type PaymentStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "UNPAID";

export type OrderStatus =
  | "RECEIVED"
  | "CRAFTING"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED";

export type PickupStatus = "PENDING" | "READY" | "PICKED_UP";

export type SheetsSyncStatus =
  | "PENDING"
  | "SYNCED"
  | "FAILED"
  | "PENDING_RETRY"
  | "NOT_CONFIGURED";

export interface OrderItemRecord {
  id?: number;
  orderId: string;
  productId: string;
  productSku: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  customisationDetails: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  phone: string;
  email: string;
  pickupPreference: string;
  customerNotes: string;
  paymentMethod: PaymentMethod;
  upiReference: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  pickupStatus: PickupStatus;
  subtotal: number;
  total: number;
  sheetsSyncStatus: SheetsSyncStatus;
  sheetsSyncAttempts: number;
  sheetsLastError: string | null;
  sheetsLastSyncedAt: string | null;
  items: OrderItemRecord[];
}

export interface CustomOrderRecord {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  category: string;
  request: string;
  budget: string;
  referenceImageName: string | null;
  referenceImageData: string | null;
  status: "NEW" | "REVIEWING" | "QUOTED" | "CLOSED";
}

export interface PublicOwnerSettings {
  upiId: string;
  upiName: string;
  upiQrImage: string;
  pickupAddress: string;
  pickupSlots: string[];
}

export interface AdminOwnerSettings extends PublicOwnerSettings {
  googleSheetsWebhookUrl: string;
  googleSheetsSecret: string;
}
