export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  description?: string;
}

export const LOW_STOCK_THRESHOLD = 10;
