
export interface Crop {
  id: string;
  name: string;
  category: 'cereals' | 'pulses' | 'vegetables' | 'fruits' | 'flowers' | 'cash_crops' | 'spices';
  icon?: string;
}

export const crops: Crop[] = [
  // Cereals
  { id: 'rice', name: 'Rice (Paddy)', category: 'cereals' },
  { id: 'wheat', name: 'Wheat', category: 'cereals' },
  { id: 'maize', name: 'Maize (Corn)', category: 'cereals' },
  { id: 'millets', name: 'Millets', category: 'cereals' },
  { id: 'barley', name: 'Barley', category: 'cereals' },
  { id: 'sorghum', name: 'Sorghum (Jowar)', category: 'cereals' },
  
  // Pulses
  { id: 'chickpea', name: 'Chickpea (Bengal Gram)', category: 'pulses' },
  { id: 'pigeon_pea', name: 'Pigeon Pea (Toor Dal)', category: 'pulses' },
  { id: 'black_gram', name: 'Black Gram (Urad Dal)', category: 'pulses' },
  { id: 'green_gram', name: 'Green Gram (Moong Dal)', category: 'pulses' },
  { id: 'lentil', name: 'Lentil (Masoor Dal)', category: 'pulses' },
  
  // Vegetables
  { id: 'potato', name: 'Potato', category: 'vegetables' },
  { id: 'tomato', name: 'Tomato', category: 'vegetables' },
  { id: 'onion', name: 'Onion', category: 'vegetables' },
  { id: 'okra', name: 'Okra (Lady Finger)', category: 'vegetables' },
  { id: 'eggplant', name: 'Eggplant (Brinjal)', category: 'vegetables' },
  { id: 'cabbage', name: 'Cabbage', category: 'vegetables' },
  { id: 'cauliflower', name: 'Cauliflower', category: 'vegetables' },
  { id: 'bitter_gourd', name: 'Bitter Gourd (Karela)', category: 'vegetables' },
  { id: 'bottle_gourd', name: 'Bottle Gourd (Lauki)', category: 'vegetables' },
  
  // Fruits
  { id: 'mango', name: 'Mango', category: 'fruits' },
  { id: 'banana', name: 'Banana', category: 'fruits' },
  { id: 'apple', name: 'Apple', category: 'fruits' },
  { id: 'grape', name: 'Grape', category: 'fruits' },
  { id: 'orange', name: 'Orange', category: 'fruits' },
  { id: 'papaya', name: 'Papaya', category: 'fruits' },
  
  // Cash Crops
  { id: 'cotton', name: 'Cotton', category: 'cash_crops' },
  { id: 'sugarcane', name: 'Sugarcane', category: 'cash_crops' },
  { id: 'jute', name: 'Jute', category: 'cash_crops' },
  { id: 'tobacco', name: 'Tobacco', category: 'cash_crops' },
  
  // Spices
  { id: 'turmeric', name: 'Turmeric', category: 'spices' },
  { id: 'ginger', name: 'Ginger', category: 'spices' },
  { id: 'chili', name: 'Chili', category: 'spices' },
  { id: 'black_pepper', name: 'Black Pepper', category: 'spices' },
  { id: 'cardamom', name: 'Cardamom', category: 'spices' },
  
  // Flowers
  { id: 'rose', name: 'Rose', category: 'flowers' },
  { id: 'marigold', name: 'Marigold', category: 'flowers' },
  { id: 'jasmine', name: 'Jasmine', category: 'flowers' },
  { id: 'chrysanthemum', name: 'Chrysanthemum', category: 'flowers' }
];

export const cropCategories = [
  { id: 'cereals', name: 'Cereals' },
  { id: 'pulses', name: 'Pulses' },
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'flowers', name: 'Flowers' },
  { id: 'cash_crops', name: 'Cash Crops' },
  { id: 'spices', name: 'Spices' }
];
