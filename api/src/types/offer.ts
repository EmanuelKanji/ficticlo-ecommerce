export interface Offer {
  id: string;
  title: string;
  description?: string;
  discount: number; // porcentaje
  productIds: string[];
  active: boolean;
}
