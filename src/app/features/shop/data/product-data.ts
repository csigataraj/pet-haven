export interface Product {
  sku: string;
  name: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  highlights: string[];
  isNew?: boolean;
  discountedPrice?: number;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'stock-desc';

export const SORT_OPTIONS: { labelKey: string; value: SortOption }[] = [
  { labelKey: 'shop.sortOptions.featured', value: 'featured' },
  { labelKey: 'shop.sortOptions.priceAsc', value: 'price-asc' },
  { labelKey: 'shop.sortOptions.priceDesc', value: 'price-desc' },
  { labelKey: 'shop.sortOptions.nameAsc', value: 'name-asc' },
  { labelKey: 'shop.sortOptions.nameDesc', value: 'name-desc' },
  { labelKey: 'shop.sortOptions.stockDesc', value: 'stock-desc' }
];

export const PRODUCTS: Product[] = [
  {
    name: 'Nordic Pet Bed',
    sku: 'PET-001',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    price: 89,
    discountedPrice: 69,
    stock: 23,
    category: 'Sleep',
    description: 'Orthopedic pet bed with washable cover and memory-foam core.',
    highlights: ['Machine washable', 'Anti-slip base', 'Available in 3 sizes']
  },
  {
    name: 'Travel Water Bottle',
    sku: 'PET-014',
    imageUrl: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80',
    price: 24,
    stock: 54,
    category: 'Travel',
    description: 'Leak-proof bottle with fold-out cup for quick walks and hikes.',
    highlights: ['BPA-free', 'One-hand operation', 'Fits backpack pockets']
  },
  {
    name: 'Reflective Leash',
    sku: 'PET-028',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 19,
    stock: 118,
    category: 'Walking',
    description: 'Durable leash with reflective threading for night visibility.',
    highlights: ['360 deg swivel clip', 'Padded handle', 'Weather resistant']
  },
  {
    name: 'Calming Toy Bundle',
    sku: 'PET-033',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    price: 34,
    stock: 39,
    category: 'Toys',
    description: 'Curated toy set designed to reduce stress and encourage play.',
    highlights: ['3 textured toys', 'Vet-reviewed materials', 'Great for indoor days']
  },
  {
    name: 'Grooming Starter Kit',
    sku: 'PET-041',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 49,
    discountedPrice: 39,
    stock: 0,
    category: 'Grooming',
    description: 'Essential grooming set including brush, comb, and nail trimmer.',
    highlights: ['Ergonomic grip', 'Beginner friendly', 'Storage pouch included']
  },
  {
    name: 'Organic Treat Pack',
    sku: 'PET-052',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    price: 16,
    stock: 82,
    category: 'Food',
    description: 'Single-protein organic treats crafted for sensitive stomachs.',
    highlights: ['No artificial fillers', 'Small-batch baked', 'Resealable bag']
  },
  {
    name: 'Cooling Gel Mat',
    sku: 'PET-101',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    price: 42,
    discountedPrice: 32,
    stock: 67,
    category: 'Sleep',
    description: 'Pressure-activated cooling mat for warmer days and recovery naps.',
    highlights: ['No refrigeration needed', 'Foldable', 'Water-resistant shell']
  },
  {
    name: 'Foldable Crate Pad',
    sku: 'PET-102',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    price: 29,
    stock: 51,
    category: 'Sleep',
    description: 'Compact crate cushion built for travel and quick setup.',
    highlights: ['Machine washable', 'Lightweight', 'Reinforced stitching']
  },
  {
    name: 'Memory Foam Donut Bed',
    sku: 'PET-103',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 96,
    stock: 18,
    category: 'Sleep',
    description: 'Round nest-style bed that supports neck and hips.',
    highlights: ['Orthopedic fill', 'Zip-off cover', 'Non-slip base']
  },
  {
    name: 'Auto-Seal Food Container',
    sku: 'PET-104',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    price: 33,
    stock: 120,
    category: 'Food',
    description: 'Airtight storage bin to keep kibble dry and fresh.',
    highlights: ['Moisture lock', 'Scoop included', 'Stackable design']
  },
  {
    name: 'Salmon Bites Jar',
    sku: 'PET-105',
    imageUrl: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80',
    price: 14,
    stock: 140,
    category: 'Food',
    description: 'Freeze-dried salmon reward bites with simple ingredients.',
    highlights: ['High protein', 'Grain free', 'Training size pieces']
  },
  {
    name: 'Pumpkin Digestive Topper',
    sku: 'PET-106',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    price: 21,
    stock: 75,
    category: 'Food',
    description: 'Fiber-rich topper to support digestion and appetite.',
    highlights: ['Easy sprinkle pouch', 'Vet formulated', 'No corn or soy']
  },
  {
    name: 'Two-Bowl Elevated Stand',
    sku: 'PET-107',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 48,
    stock: 34,
    category: 'Feeding',
    description: 'Raised feeder for improved posture during meals.',
    highlights: ['Stainless bowls', 'Anti-slip feet', 'Tool-free setup']
  },
  {
    name: 'Slow Feeder Puzzle Bowl',
    sku: 'PET-108',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    price: 19,
    stock: 89,
    category: 'Feeding',
    description: 'Maze-style bowl that encourages slower, healthier eating.',
    highlights: ['Dishwasher safe', 'BPA free', 'Wide base']
  },
  {
    name: 'Automatic Water Fountain',
    sku: 'PET-109',
    imageUrl: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80',
    price: 59,
    discountedPrice: 45,
    stock: 26,
    category: 'Feeding',
    description: 'Quiet recirculating fountain with multi-stage filtration.',
    highlights: ['Low-noise pump', 'LED level window', '3 filter pack']
  },
  {
    name: 'Daily Vitamin Chews',
    sku: 'PET-110',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 27,
    stock: 91,
    category: 'Health',
    description: 'Soft supplement chews for coat, joints, and immunity.',
    highlights: ['Tasty duck flavor', '90-count tub', 'Made in EU']
  },
  {
    name: 'Joint Support Powder',
    sku: 'PET-111',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    price: 38,
    stock: 44,
    category: 'Health',
    description: 'Glucosamine blend designed for active or senior pets.',
    highlights: ['Measured scoop', '30-day supply', 'No added sugar']
  },
  {
    name: 'Ear & Paw Care Set',
    sku: 'PET-112',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 24,
    stock: 57,
    category: 'Health',
    description: 'Daily hygiene kit for routine ear and paw cleaning.',
    highlights: ['Alcohol free', 'Travel size', 'Cotton pads included']
  },
  {
    name: 'Clicker Training Duo',
    sku: 'PET-113',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 12,
    stock: 136,
    category: 'Training',
    description: 'Two-clicker set for at-home behavior training sessions.',
    highlights: ['Loud clear click', 'Wrist strap', 'Pocket friendly']
  },
  {
    name: 'Treat Training Pouch',
    sku: 'PET-114',
    imageUrl: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80',
    price: 18,
    stock: 102,
    category: 'Training',
    description: 'Quick-access pouch for rewards during walks and drills.',
    highlights: ['Magnetic closure', 'Belt clip', 'Machine washable liner']
  },
  {
    name: 'Agility Cone Pack',
    sku: 'PET-115',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    price: 26,
    stock: 49,
    category: 'Training',
    description: 'Set of six cones for agility and recall games.',
    highlights: ['Bright colors', 'Carry strap', 'Indoor/outdoor use']
  },
  {
    name: 'Rope Tug XL',
    sku: 'PET-116',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    price: 15,
    stock: 98,
    category: 'Toys',
    description: 'Durable braided rope toy for supervised tug play.',
    highlights: ['Cotton blend', 'Helps clean teeth', 'Heavy-duty knots']
  },
  {
    name: 'Squeaky Hedgehog Toy',
    sku: 'PET-117',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    price: 13,
    stock: 114,
    category: 'Toys',
    description: 'Soft plush toy with protected squeaker core.',
    highlights: ['Reinforced seams', 'Machine washable', 'Lightweight']
  },
  {
    name: 'Bounce Ball 4-Pack',
    sku: 'PET-118',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 17,
    stock: 130,
    category: 'Toys',
    description: 'High-rebound fetch balls for backyard activity.',
    highlights: ['Non-toxic rubber', 'Visible colors', 'Fits launchers']
  },
  {
    name: 'Cat Teaser Wand',
    sku: 'PET-119',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    price: 11,
    stock: 88,
    category: 'Toys',
    description: 'Interactive wand with feather lure for active cats.',
    highlights: ['Swappable tips', 'Flexible rod', 'Indoor exercise']
  },
  {
    name: 'Silicone Grooming Glove',
    sku: 'PET-120',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 16,
    stock: 77,
    category: 'Grooming',
    description: 'Loose-hair remover glove for daily coat maintenance.',
    highlights: ['Adjustable wrist strap', 'Gentle tips', 'Easy rinse clean']
  },
  {
    name: 'De-Shedding Comb Pro',
    sku: 'PET-121',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 31,
    stock: 42,
    category: 'Grooming',
    description: 'Undercoat comb for reducing shedding on double coats.',
    highlights: ['Stainless teeth', 'Soft grip handle', 'One-click release']
  },
  {
    name: 'Dry Shampoo Foam',
    sku: 'PET-122',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 19,
    stock: 63,
    category: 'Grooming',
    description: 'No-rinse foam cleanser for quick freshening between baths.',
    highlights: ['Coconut scent', 'Paraben free', 'Suitable for puppies']
  },
  {
    name: 'Adventure Harness',
    sku: 'PET-123',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 37,
    stock: 54,
    category: 'Walking',
    description: 'No-pull harness with front and back leash attachment points.',
    highlights: ['Reflective trim', 'Breathable mesh', 'Four-point adjustment']
  },
  {
    name: 'Hands-Free Running Leash',
    sku: 'PET-124',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 28,
    stock: 47,
    category: 'Walking',
    description: 'Shock-absorbing leash with adjustable waist belt.',
    highlights: ['Bungee section', 'Dual handles', 'Night-safe stitching']
  },
  {
    name: 'LED Safety Collar',
    sku: 'PET-125',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 22,
    stock: 86,
    category: 'Walking',
    description: 'Rechargeable illuminated collar for low-light visibility.',
    highlights: ['USB-C charging', '3 light modes', 'Splash resistant']
  },
  {
    name: 'Weekend Carrier Backpack',
    sku: 'PET-126',
    imageUrl: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80',
    price: 74,
    discountedPrice: 55,
    stock: 20,
    category: 'Travel',
    description: 'Ventilated backpack carrier for city outings and transit.',
    highlights: ['Padded shoulder straps', 'Top window', 'Safety clip']
  },
  {
    name: 'Collapsible Travel Crate',
    sku: 'PET-127',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    price: 112,
    stock: 9,
    category: 'Travel',
    description: 'Portable soft crate with steel frame for secure rest stops.',
    highlights: ['Tool-free fold', 'Mesh airflow', 'Carry bag included']
  },
  {
    name: 'Seat Belt Tether',
    sku: 'PET-128',
    imageUrl: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80',
    price: 14,
    stock: 125,
    category: 'Travel',
    description: 'Adjustable in-car tether for safer road trips.',
    highlights: ['Metal swivel clip', 'Universal buckle fit', 'Short/long range']
  },
  {
    name: 'Portable Litter Box',
    sku: 'PET-129',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    price: 32,
    stock: 29,
    category: 'Travel',
    description: 'Leak-resistant foldable litter box for cat travel.',
    highlights: ['Waterproof liner', 'Compact fold', 'Odor-control flap']
  },
  {
    name: 'Ceramic Treat Jar',
    sku: 'PET-130',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    price: 25,
    stock: 58,
    category: 'Accessories',
    description: 'Counter-top jar with airtight bamboo lid.',
    highlights: ['Dishwasher-safe jar', 'Silicone seal', 'Modern matte finish']
  },
  {
    name: 'Name Tag Set',
    sku: 'PET-131',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 9,
    stock: 210,
    category: 'Accessories',
    description: 'Three anodized ID tags with engraving area.',
    highlights: ['Rust resistant', 'Split rings included', 'Lightweight']
  },
  {
    name: 'Paw Print Frame Kit',
    sku: 'PET-132',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    price: 23,
    stock: 46,
    category: 'Accessories',
    description: 'Keepsake frame with non-toxic impression clay.',
    highlights: ['No-bake clay', 'Photo slot', 'Gift-ready box']
  },
  {
    name: 'Rainproof Dog Coat',
    sku: 'PET-133',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 39,
    stock: 37,
    category: 'Accessories',
    description: 'Lightweight weatherproof coat for wet and windy walks.',
    highlights: ['Reflective strip', 'Belly strap', 'Machine washable']
  },
  {
    name: 'Biodegradable Waste Bags',
    sku: 'PET-134',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 12,
    stock: 300,
    category: 'Walking',
    description: 'Leak-resistant compostable waste bag rolls.',
    highlights: ['120 bags total', 'Tear easy', 'Fits standard dispensers']
  },
  {
    name: 'Dental Rope Ring',
    sku: 'PET-135',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    price: 14,
    stock: 109,
    category: 'Toys',
    description: 'Ring-shaped rope toy built for chewing and fetch.',
    highlights: ['Natural cotton', 'Flexible core', 'Indoor/outdoor']
  },
  {
    name: 'Snuffle Mat Deluxe',
    sku: 'PET-136',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    price: 36,
    stock: 33,
    category: 'Training',
    description: 'Foraging mat that slows mealtime and enriches play.',
    highlights: ['Non-slip backing', 'Machine washable', 'Foldable storage']
  },
  {
    name: 'Recall Long Line',
    sku: 'PET-137',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 27,
    stock: 62,
    category: 'Training',
    description: '15-meter line for distance recall practice.',
    highlights: ['Tangle-resistant weave', 'Padded handle', 'Rustproof clip']
  },
  {
    name: 'Puppy Potty Bells',
    sku: 'PET-138',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 10,
    stock: 154,
    category: 'Training',
    description: 'Door-hanging bell strap for potty communication.',
    highlights: ['Adjustable strap', 'Clear ring tone', 'Beginner friendly']
  },
  {
    name: 'Hypoallergenic Shampoo',
    sku: 'PET-139',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 18,
    stock: 95,
    category: 'Grooming',
    description: 'Gentle shampoo formulated for sensitive skin.',
    highlights: ['Soap free', 'pH balanced', 'Aloe enriched']
  },
  {
    name: 'Flea Comb Precision',
    sku: 'PET-140',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 13,
    stock: 83,
    category: 'Grooming',
    description: 'Fine-tooth comb for close grooming checks.',
    highlights: ['Rounded teeth tips', 'Comfort handle', 'Travel cap']
  },
  {
    name: 'Freeze-Dried Liver Cubes',
    sku: 'PET-141',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    price: 20,
    stock: 101,
    category: 'Food',
    description: 'Single-ingredient liver rewards for high-value training.',
    highlights: ['Protein rich', 'No additives', 'Crunchy texture']
  },
  {
    name: 'Turkey & Rice Kibble',
    sku: 'PET-142',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    price: 44,
    stock: 52,
    category: 'Food',
    description: 'Balanced dry formula for adult maintenance diets.',
    highlights: ['Added prebiotics', 'Omega blend', 'Resealable sack']
  },
  {
    name: 'Probiotic Soft Chews',
    sku: 'PET-143',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 29,
    discountedPrice: 22,
    stock: 66,
    category: 'Health',
    description: 'Digestive support chews with live cultures.',
    highlights: ['Chicken flavor', '60 chews', 'Daily support'],
    isNew: true
  },
  {
    name: 'Calming Aid Drops',
    sku: 'PET-144',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
    price: 22,
    stock: 39,
    category: 'Health',
    description: 'Herbal blend to help with travel and storm anxiety.',
    highlights: ['Measured dropper', 'Alcohol free', 'Fast-acting formula'],
    isNew: true
  },
  {
    name: 'Reflective Rain Leash',
    sku: 'PET-145',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    price: 24,
    stock: 58,
    category: 'Walking',
    description: 'Water-resistant leash for wet weather walks.',
    highlights: ['Quick-dry webbing', 'Traffic handle', 'Rustproof hardware'],
    isNew: true
  },
  {
    name: 'Pet Stroller Lite',
    sku: 'PET-146',
    imageUrl: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80',
    price: 139,
    discountedPrice: 109,
    stock: 7,
    category: 'Travel',
    description: 'Foldable stroller for small pets and senior companions.',
    highlights: ['One-hand fold', 'Storage basket', 'Locking front wheels'],
    isNew: true
  },
  {
    name: 'Weekend Road Trip Kit',
    sku: 'PET-147',
    imageUrl: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80',
    price: 63,
    stock: 22,
    category: 'Travel',
    description: 'Grab-and-go travel set with bowls, mat, and organizer.',
    highlights: ['Insulated pouch', 'Roll-up mat', 'Portable bowls'],
    isNew: true
  },
  {
    name: 'Window Perch Hammock',
    sku: 'PET-148',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    price: 34,
    stock: 41,
    category: 'Sleep',
    description: 'Sun-bathing perch with reinforced suction support.',
    highlights: ['Breathable mesh', 'Tool-free install', 'Easy clean cover'],
    isNew: true
  },
  {
    name: 'Orthopedic Sofa Bed',
    sku: 'PET-149',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    price: 118,
    discountedPrice: 89,
    stock: 12,
    category: 'Sleep',
    description: 'Bolstered orthopedic bed for larger breeds and seniors.',
    highlights: ['High-density foam', 'Waterproof liner', 'Removable cover'],
    isNew: true
  },
  {
    name: 'Interactive Laser Spinner',
    sku: 'PET-150',
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    price: 31,
    stock: 35,
    category: 'Toys',
    description: 'Automatic laser toy with randomized movement patterns.',
    highlights: ['Auto shutoff', 'USB rechargeable', 'Silent motor'],
    isNew: true
  }
];
