export interface Farmer {
  id: string;
  name: string;
  location: string;
  image: string;
  crops: string[];
  farmSize: string;
  languages: string[];
  farmingType: string;
  rating: number;
  about: string;
}

export interface Laborer {
  id: string;
  name: string;
  location: string;
  image: string;
  skills: string[];
  availability: string;
  languages: string[];
  willRelocate: boolean;
  wage: string;
  experience: number;
  rating: number;
  about: string;
}

export const farmers: Farmer[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    location: 'Bangalore Rural, Karnataka',
    image: '/avatars/farmer1.jpg',
    crops: ['rice', 'sugarcane', 'vegetables'],
    farmSize: '5 acres',
    languages: ['Kannada', 'Hindi', 'English'],
    farmingType: 'Traditional',
    rating: 4.7,
    about: 'Experienced farmer with 15 years in rice and sugarcane cultivation. Looking for skilled laborers during harvest seasons.'
  },
  {
    id: '2',
    name: 'Anita Singh',
    location: 'Hosur, Tamil Nadu',
    image: '/avatars/farmer2.jpg',
    crops: ['tomato', 'onion', 'potato'],
    farmSize: '3 acres',
    languages: ['Tamil', 'Telugu'],
    farmingType: 'Organic',
    rating: 4.5,
    about: 'Organic vegetable farmer specializing in tomatoes and onions. Need workers who understand organic farming techniques.'
  },
  {
    id: '3',
    name: 'Mohammed Farooq',
    location: 'Mysore, Karnataka',
    image: '/avatars/farmer3.jpg',
    crops: ['cotton', 'maize'],
    farmSize: '10 acres',
    languages: ['Urdu', 'Kannada'],
    farmingType: 'Mechanized',
    rating: 4.2,
    about: 'Large cotton and maize farm with modern equipment. Looking for laborers with mechanized farming experience.'
  },
  {
    id: '4',
    name: 'Lakshmi Devi',
    location: 'Coimbatore, Tamil Nadu',
    image: '/avatars/farmer4.jpg',
    crops: ['coconut', 'banana'],
    farmSize: '7 acres',
    languages: ['Tamil', 'English'],
    farmingType: 'Traditional',
    rating: 4.8,
    about: 'Family-owned coconut and banana plantation. Need skilled climbers and harvesters year-round.'
  },
  {
    id: '5',
    name: 'Gurpreet Singh',
    location: 'Hassan, Karnataka',
    image: '/avatars/farmer5.jpg',
    crops: ['coffee', 'pepper'],
    farmSize: '12 acres',
    languages: ['Punjabi', 'Hindi', 'Kannada'],
    farmingType: 'Mixed',
    rating: 4.4,
    about: 'Coffee plantation owner looking for seasonal workers during picking season from October to January.'
  }
];

export const laborers: Laborer[] = [
  {
    id: '1',
    name: 'Venkatesh K.',
    location: 'Bangalore Rural, Karnataka',
    image: '/avatars/laborer1.jpg',
    skills: ['rice', 'sugarcane', 'cotton'],
    availability: 'Year-round',
    languages: ['Kannada', 'Telugu'],
    willRelocate: true,
    wage: '₹500/day',
    experience: 7,
    rating: 4.6,
    about: 'Experienced in rice cultivation and harvesting. Skilled in operating small farm equipment.'
  },
  {
    id: '2',
    name: 'Lakshmi N.',
    location: 'Mysore, Karnataka',
    image: '/avatars/laborer2.jpg',
    skills: ['vegetables', 'fruits', 'flowers'],
    availability: 'Seasonal (Oct-Feb)',
    languages: ['Kannada', 'Tamil'],
    willRelocate: false,
    wage: '₹450/day',
    experience: 5,
    rating: 4.3,
    about: 'Specialized in vegetable farming and floriculture. Expert in handling delicate crops and flowers.'
  },
  {
    id: '3',
    name: 'Ramesh B.',
    location: 'Hosur, Tamil Nadu',
    image: '/avatars/laborer3.jpg',
    skills: ['tea', 'coffee', 'spices'],
    availability: 'Year-round',
    languages: ['Tamil', 'Malayalam'],
    willRelocate: true,
    wage: '₹550/day',
    experience: 10,
    rating: 4.8,
    about: 'Decade of experience in coffee and tea estates. Skilled in pruning, picking, and processing.'
  },
  {
    id: '4',
    name: 'Sarita P.',
    location: 'Coimbatore, Tamil Nadu',
    image: '/avatars/laborer4.jpg',
    skills: ['rice', 'wheat', 'pulses'],
    availability: 'Seasonal (Jun-Sep)',
    languages: ['Tamil', 'Hindi'],
    willRelocate: false,
    wage: '₹400/day',
    experience: 3,
    rating: 4.1,
    about: 'Experienced in traditional rice cultivation techniques and wheat harvesting.'
  },
  {
    id: '5',
    name: 'Abdul K.',
    location: 'Hassan, Karnataka',
    image: '/avatars/laborer5.jpg',
    skills: ['cotton', 'sugarcane', 'maize'],
    availability: 'Year-round',
    languages: ['Urdu', 'Kannada', 'Hindi'],
    willRelocate: true,
    wage: '₹600/day',
    experience: 12,
    rating: 4.9,
    about: 'Expert in cotton and sugarcane cultivation. Skilled in irrigation systems and farm machinery operation.'
  }
];
