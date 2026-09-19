const FOOD_IMAGES = {
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&h=200&fit=crop',
  fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop',
  sandwich: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=200&h=200&fit=crop',
  chicken: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop',
  rice: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=200&fit=crop',
  tea: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
  samosa: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop',
  kebab: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&h=200&fit=crop',
  noodles: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop';

export function getFoodImage(itemName) {
  const lower = itemName.toLowerCase();
  const match = Object.keys(FOOD_IMAGES).find((keyword) => lower.includes(keyword));
  return match ? FOOD_IMAGES[match] : DEFAULT_IMAGE;
}