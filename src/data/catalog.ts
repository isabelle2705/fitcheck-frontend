export interface CatalogItem {
  id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear';
  imageUrl: string;
  brandPaid?: boolean;
}

export const CATALOG: CatalogItem[] = [
  // Tops
  {
    id: 'cat-001',
    name: 'White Classic Tee',
    category: 'tops',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
  },
  {
    id: 'cat-002',
    name: 'Black Fitted Top',
    category: 'tops',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80',
  },
  {
    id: 'cat-003',
    name: 'Striped Button Shirt',
    category: 'tops',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
  },
  {
    id: 'cat-004',
    name: 'Cream Knit Sweater',
    category: 'tops',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80',
  },
  // Bottoms
  {
    id: 'cat-005',
    name: 'Blue Denim Jeans',
    category: 'bottoms',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
  },
  {
    id: 'cat-006',
    name: 'Black Slim Trousers',
    category: 'bottoms',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
  },
  {
    id: 'cat-007',
    name: 'White Midi Skirt',
    category: 'bottoms',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80',
  },
  // Dresses
  {
    id: 'cat-008',
    name: 'Little Black Dress',
    category: 'dresses',
    imageUrl: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&q=80',
  },
  {
    id: 'cat-009',
    name: 'Floral Wrap Dress',
    category: 'dresses',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80',
  },
  {
    id: 'cat-010',
    name: 'Rust Slip Dress',
    category: 'dresses',
    imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80',
  },
  // Outerwear
  {
    id: 'cat-011',
    name: 'Denim Jacket',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80',
  },
  {
    id: 'cat-012',
    name: 'Camel Trench Coat',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1548624149-f9b789ece38c?w=400&q=80',
  },
];

export const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'dresses', label: 'Dresses' },
  { key: 'outerwear', label: 'Outerwear' },
] as const;
