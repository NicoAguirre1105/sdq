export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  size: string | null;
  unitPrice: number;
  image: string | null;
  quantity: number;
};
