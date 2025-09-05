export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number; // CLP
  image: string;
  qty: number;
};

export type OrderStatus = "pending" | "paid" | "failed" | "canceled";

export interface Order {
  id: string;             // = stripeSessionId o uuid
  customerEmail?: string;
  createdAt: string;      // ISO
  status: OrderStatus;
  currency: "clp" | "usd"; // usamos "clp" en este ejemplo
  lines: CartLine[];
  subtotal: number;       // suma qty*unitPrice
  payment?: {
    provider: "stripe" | "webpay";
    sessionId: string;
    paymentIntentId?: string;
    chargeId?: string;
  };
}
