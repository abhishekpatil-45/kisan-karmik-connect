
export interface Crop {
  id: string;
  name: string;
  category: 'cereals' | 'pulses' | 'vegetables' | 'fruits' | 'flowers' | 'cash_crops' | 'spices' | 'oilseeds' | 'fiber_crops' | 'fodder_crops' | 'beverage_crops' | 'plantation_crops';
  season?: 'kharif' | 'rabi' | 'zaid' | 'year_round';
  icon?: string;
}

export const crops: Crop[] = [
  // Cereals
  { id: 'rice', name: 'Rice (Paddy)', category: 'cereals', season: 'kharif' },
  { id: 'wheat', name: 'Wheat', category: 'cereals', season: 'rabi' },
  { id: 'maize', name: 'Maize (Corn)', category: 'cereals', season: 'kharif' },
  { id: 'jowar', name: 'Jowar (Sorghum)', category: 'cereals', season: 'kharif' },
  { id: 'bajra', name: 'Bajra (Pearl Millet)', category: 'cereals', season: 'kharif' },
  { id: 'ragi', name: 'Ragi (Finger Millet)', category: 'cereals', season: 'kharif' },
  { id: 'barley', name: 'Barley', category: 'cereals', season: 'rabi' },
  { id: 'oats', name: 'Oats', category: 'cereals', season: 'rabi' },
  
  // Pulses
  { id: 'chickpea', name: 'Chickpea (Bengal Gram)', category: 'pulses', season: 'rabi' },
  { id: 'pigeon_pea', name: 'Pigeon Pea (Tur/Arhar Dal)', category: 'pulses', season: 'kharif' },
  { id: 'black_gram', name: 'Black Gram (Urad Dal)', category: 'pulses', season: 'kharif' },
  { id: 'green_gram', name: 'Green Gram (Moong Dal)', category: 'pulses', season: 'kharif' },
  { id: 'lentil', name: 'Lentil (Masoor Dal)', category: 'pulses', season: 'rabi' },
  { id: 'kidney_bean', name: 'Kidney Bean (Rajma)', category: 'pulses', season: 'kharif' },
  { id: 'peas', name: 'Peas', category: 'pulses', season: 'rabi' },
  
  // Vegetables
  { id: 'potato', name: 'Potato', category: 'vegetables', season: 'rabi' },
  { id: 'tomato', name: 'Tomato', category: 'vegetables', season: 'year_round' },
  { id: 'onion', name: 'Onion', category: 'vegetables', season: 'rabi' },
  { id: 'okra', name: 'Okra (Lady Finger)', category: 'vegetables', season: 'kharif' },
  { id: 'eggplant', name: 'Eggplant (Brinjal)', category: 'vegetables', season: 'year_round' },
  { id: 'cabbage', name: 'Cabbage', category: 'vegetables', season: 'rabi' },
  { id: 'cauliflower', name: 'Cauliflower', category: 'vegetables', season: 'rabi' },
  { id: 'bitter_gourd', name: 'Bitter Gourd (Karela)', category: 'vegetables', season: 'kharif' },
  { id: 'bottle_gourd', name: 'Bottle Gourd (Lauki)', category: 'vegetables', season: 'year_round' },
  { id: 'cucumber', name: 'Cucumber', category: 'vegetables', season: 'zaid' },
  { id: 'watermelon', name: 'Watermelon', category: 'vegetables', season: 'zaid' },
  { id: 'muskmelon', name: 'Muskmelon', category: 'vegetables', season: 'zaid' },
  { id: 'pumpkin', name: 'Pumpkin', category: 'vegetables', season: 'zaid' },
  { id: 'carrot', name: 'Carrot', category: 'vegetables', season: 'rabi' },
  { id: 'spinach', name: 'Spinach', category: 'vegetables', season: 'rabi' },
  { id: 'beans', name: 'Beans', category: 'vegetables', season: 'kharif' },
  
  // Fruits
  { id: 'mango', name: 'Mango', category: 'fruits', season: 'year_round' },
  { id: 'banana', name: 'Banana', category: 'fruits', season: 'year_round' },
  { id: 'apple', name: 'Apple', category: 'fruits', season: 'year_round' },
  { id: 'grape', name: 'Grape', category: 'fruits', season: 'year_round' },
  { id: 'orange', name: 'Orange', category: 'fruits', season: 'year_round' },
  { id: 'papaya', name: 'Papaya', category: 'fruits', season: 'year_round' },
  { id: 'guava', name: 'Guava', category: 'fruits', season: 'year_round' },
  { id: 'pomegranate', name: 'Pomegranate', category: 'fruits', season: 'year_round' },
  { id: 'pineapple', name: 'Pineapple', category: 'fruits', season: 'year_round' },
  { id: 'litchi', name: 'Litchi', category: 'fruits', season: 'year_round' },
  
  // Cash Crops
  { id: 'cotton', name: 'Cotton', category: 'cash_crops', season: 'kharif' },
  { id: 'sugarcane', name: 'Sugarcane', category: 'cash_crops', season: 'year_round' },
  { id: 'jute', name: 'Jute', category: 'fiber_crops', season: 'kharif' },
  { id: 'tobacco', name: 'Tobacco', category: 'cash_crops', season: 'rabi' },
  
  // Spices
  { id: 'turmeric', name: 'Turmeric', category: 'spices', season: 'kharif' },
  { id: 'ginger', name: 'Ginger', category: 'spices', season: 'kharif' },
  { id: 'garlic', name: 'Garlic', category: 'spices', season: 'rabi' },
  { id: 'chili', name: 'Chili', category: 'spices', season: 'kharif' },
  { id: 'black_pepper', name: 'Black Pepper', category: 'spices', season: 'year_round' },
  { id: 'cardamom', name: 'Cardamom', category: 'spices', season: 'year_round' },
  { id: 'coriander', name: 'Coriander', category: 'spices', season: 'rabi' },
  { id: 'cumin', name: 'Cumin', category: 'spices', season: 'rabi' },
  { id: 'fenugreek', name: 'Fenugreek (Methi)', category: 'spices', season: 'rabi' },
  { id: 'fennel', name: 'Fennel (Saunf)', category: 'spices', season: 'rabi' },
  { id: 'clove', name: 'Clove', category: 'spices', season: 'year_round' },
  
  // Flowers
  { id: 'rose', name: 'Rose', category: 'flowers', season: 'year_round' },
  { id: 'marigold', name: 'Marigold', category: 'flowers', season: 'year_round' },
  { id: 'jasmine', name: 'Jasmine', category: 'flowers', season: 'year_round' },
  { id: 'chrysanthemum', name: 'Chrysanthemum', category: 'flowers', season: 'year_round' },
  
  // Oilseeds
  { id: 'groundnut', name: 'Groundnut', category: 'oilseeds', season: 'kharif' },
  { id: 'mustard', name: 'Mustard', category: 'oilseeds', season: 'rabi' },
  { id: 'soybean', name: 'Soybean', category: 'oilseeds', season: 'kharif' },
  { id: 'sesame', name: 'Sesame (Til)', category: 'oilseeds', season: 'kharif' },
  { id: 'sunflower', name: 'Sunflower', category: 'oilseeds', season: 'rabi' },
  { id: 'linseed', name: 'Linseed', category: 'oilseeds', season: 'rabi' },
  { id: 'castor', name: 'Castor', category: 'oilseeds', season: 'kharif' },
  
  // Beverage Crops
  { id: 'tea', name: 'Tea', category: 'beverage_crops', season: 'year_round' },
  { id: 'coffee', name: 'Coffee', category: 'beverage_crops', season: 'year_round' },
  { id: 'cocoa', name: 'Cocoa', category: 'beverage_crops', season: 'year_round' },
  
  // Plantation Crops
  { id: 'rubber', name: 'Rubber', category: 'plantation_crops', season: 'year_round' },
  { id: 'coconut', name: 'Coconut', category: 'plantation_crops', season: 'year_round' },
  { id: 'areca_nut', name: 'Areca Nut', category: 'plantation_crops', season: 'year_round' },
  
  // Fodder Crops
  { id: 'berseem', name: 'Berseem', category: 'fodder_crops', season: 'rabi' },
  { id: 'lucerne', name: 'Lucerne', category: 'fodder_crops', season: 'rabi' },
  { id: 'napier_grass', name: 'Napier Grass', category: 'fodder_crops', season: 'kharif' }
];

export const cropCategories = [
  { id: 'cereals', name: 'Cereals' },
  { id: 'pulses', name: 'Pulses' },
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'flowers', name: 'Flowers' },
  { id: 'cash_crops', name: 'Cash Crops' },
  { id: 'spices', name: 'Spices' },
  { id: 'oilseeds', name: 'Oilseeds' },
  { id: 'fiber_crops', name: 'Fiber Crops' },
  { id: 'fodder_crops', name: 'Fodder Crops' },
  { id: 'beverage_crops', name: 'Beverage Crops' },
  { id: 'plantation_crops', name: 'Plantation Crops' }
];

export const cropSeasons = [
  { id: 'kharif', name: 'Kharif (Monsoon)', description: 'Sown in June-July, harvested in Sept-Oct' },
  { id: 'rabi', name: 'Rabi (Winter)', description: 'Sown in Oct-Nov, harvested in Mar-Apr' },
  { id: 'zaid', name: 'Zaid (Summer)', description: 'Grown between March to June' },
  { id: 'year_round', name: 'Year Round', description: 'Grown throughout the year' }
];
