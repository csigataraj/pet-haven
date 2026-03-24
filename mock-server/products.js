// Product catalog — keep in sync with src/app/features/shop/data/product-data.ts
const PRODUCTS = [
  { sku: 'PET-001', name: 'Nordic Pet Bed', price: 89, stock: 23, category: 'Sleep', description: 'Orthopedic pet bed with washable cover and memory-foam core.' },
  { sku: 'PET-014', name: 'Travel Water Bottle', price: 24, stock: 54, category: 'Travel', description: 'Leak-proof bottle with fold-out cup for quick walks and hikes.' },
  { sku: 'PET-028', name: 'Reflective Leash', price: 19, stock: 118, category: 'Walking', description: 'Durable leash with reflective threading for night visibility.' },
  { sku: 'PET-033', name: 'Calming Toy Bundle', price: 34, stock: 39, category: 'Toys', description: 'Curated toy set designed to reduce stress and encourage play.' },
  { sku: 'PET-041', name: 'Grooming Starter Kit', price: 49, stock: 0, category: 'Grooming', description: 'Essential grooming set including brush, comb, and nail trimmer.' },
  { sku: 'PET-052', name: 'Organic Treat Pack', price: 16, stock: 82, category: 'Food', description: 'Single-protein organic treats crafted for sensitive stomachs.' },
  { sku: 'PET-101', name: 'Cooling Gel Mat', price: 42, stock: 67, category: 'Sleep', description: 'Pressure-activated cooling mat for warmer days and recovery naps.' },
  { sku: 'PET-102', name: 'Foldable Crate Pad', price: 29, stock: 51, category: 'Sleep', description: 'Compact crate cushion built for travel and quick setup.' },
  { sku: 'PET-103', name: 'Memory Foam Donut Bed', price: 96, stock: 18, category: 'Sleep', description: 'Round nest-style bed that supports neck and hips.' },
  { sku: 'PET-104', name: 'Auto-Seal Food Container', price: 33, stock: 120, category: 'Food', description: 'Airtight storage bin to keep kibble dry and fresh.' },
  { sku: 'PET-105', name: 'Salmon Bites Jar', price: 14, stock: 140, category: 'Food', description: 'Freeze-dried salmon reward bites with simple ingredients.' },
  { sku: 'PET-106', name: 'Pumpkin Digestive Topper', price: 21, stock: 75, category: 'Food', description: 'Fiber-rich topper to support digestion and appetite.' },
  { sku: 'PET-107', name: 'Two-Bowl Elevated Stand', price: 48, stock: 34, category: 'Feeding', description: 'Raised feeder for improved posture during meals.' },
  { sku: 'PET-108', name: 'Slow Feeder Puzzle Bowl', price: 19, stock: 89, category: 'Feeding', description: 'Maze-style bowl that encourages slower, healthier eating.' },
  { sku: 'PET-109', name: 'Automatic Water Fountain', price: 59, stock: 26, category: 'Feeding', description: 'Quiet recirculating fountain with multi-stage filtration.' },
  { sku: 'PET-110', name: 'Daily Vitamin Chews', price: 27, stock: 91, category: 'Health', description: 'Soft supplement chews for coat, joints, and immunity.' },
  { sku: 'PET-111', name: 'Joint Support Powder', price: 38, stock: 44, category: 'Health', description: 'Glucosamine blend designed for active or senior pets.' },
  { sku: 'PET-112', name: 'Ear & Paw Care Set', price: 24, stock: 57, category: 'Health', description: 'Daily hygiene kit for routine ear and paw cleaning.' },
  { sku: 'PET-113', name: 'Clicker Training Duo', price: 12, stock: 136, category: 'Training', description: 'Two-clicker set for at-home behavior training sessions.' },
  { sku: 'PET-114', name: 'Treat Training Pouch', price: 18, stock: 102, category: 'Training', description: 'Quick-access pouch for rewards during walks and drills.' },
  { sku: 'PET-115', name: 'Agility Cone Pack', price: 26, stock: 49, category: 'Training', description: 'Set of six cones for agility and recall games.' },
  { sku: 'PET-116', name: 'Rope Tug XL', price: 15, stock: 98, category: 'Toys', description: 'Durable braided rope toy for supervised tug play.' },
  { sku: 'PET-117', name: 'Squeaky Hedgehog Toy', price: 13, stock: 114, category: 'Toys', description: 'Soft plush toy with protected squeaker core.' },
  { sku: 'PET-118', name: 'Bounce Ball 4-Pack', price: 17, stock: 130, category: 'Toys', description: 'High-rebound fetch balls for backyard activity.' },
  { sku: 'PET-119', name: 'Cat Teaser Wand', price: 11, stock: 88, category: 'Toys', description: 'Interactive wand with feather lure for active cats.' },
  { sku: 'PET-120', name: 'Silicone Grooming Glove', price: 16, stock: 77, category: 'Grooming', description: 'Loose-hair remover glove for daily coat maintenance.' },
  { sku: 'PET-121', name: 'De-Shedding Comb Pro', price: 31, stock: 42, category: 'Grooming', description: 'Undercoat comb for reducing shedding on double coats.' },
  { sku: 'PET-122', name: 'Dry Shampoo Foam', price: 19, stock: 63, category: 'Grooming', description: 'No-rinse foam cleanser for quick freshening between baths.' },
  { sku: 'PET-123', name: 'Adventure Harness', price: 37, stock: 54, category: 'Walking', description: 'No-pull harness with front and back leash attachment points.' },
  { sku: 'PET-124', name: 'Hands-Free Running Leash', price: 28, stock: 47, category: 'Walking', description: 'Shock-absorbing leash with adjustable waist belt.' },
  { sku: 'PET-125', name: 'LED Safety Collar', price: 22, stock: 86, category: 'Walking', description: 'Rechargeable illuminated collar for low-light visibility.' },
  { sku: 'PET-126', name: 'Weekend Carrier Backpack', price: 74, stock: 20, category: 'Travel', description: 'Ventilated backpack carrier for city outings and transit.' },
  { sku: 'PET-127', name: 'Collapsible Travel Crate', price: 112, stock: 9, category: 'Travel', description: 'Portable soft crate with steel frame for secure rest stops.' },
  { sku: 'PET-128', name: 'Seat Belt Tether', price: 14, stock: 125, category: 'Travel', description: 'Adjustable in-car tether for safer road trips.' },
  { sku: 'PET-129', name: 'Portable Litter Box', price: 32, stock: 29, category: 'Travel', description: 'Leak-resistant foldable litter box for cat travel.' },
  { sku: 'PET-130', name: 'Ceramic Treat Jar', price: 25, stock: 58, category: 'Accessories', description: 'Counter-top jar with airtight bamboo lid.' },
  { sku: 'PET-131', name: 'Name Tag Set', price: 9, stock: 210, category: 'Accessories', description: 'Three anodized ID tags with engraving area.' },
  { sku: 'PET-132', name: 'Paw Print Frame Kit', price: 23, stock: 46, category: 'Accessories', description: 'Keepsake frame with non-toxic impression clay.' },
  { sku: 'PET-133', name: 'Rainproof Dog Coat', price: 39, stock: 37, category: 'Accessories', description: 'Lightweight weatherproof coat for wet and windy walks.' },
  { sku: 'PET-134', name: 'Biodegradable Waste Bags', price: 12, stock: 300, category: 'Walking', description: 'Leak-resistant compostable waste bag rolls.' },
  { sku: 'PET-135', name: 'Dental Rope Ring', price: 14, stock: 109, category: 'Toys', description: 'Ring-shaped rope toy built for chewing and fetch.' },
  { sku: 'PET-136', name: 'Snuffle Mat Deluxe', price: 36, stock: 33, category: 'Training', description: 'Foraging mat that slows mealtime and enriches play.' },
  { sku: 'PET-137', name: 'Recall Long Line', price: 27, stock: 62, category: 'Training', description: '15-meter line for distance recall practice.' },
  { sku: 'PET-138', name: 'Puppy Potty Bells', price: 10, stock: 154, category: 'Training', description: 'Door-hanging bell strap for potty communication.' },
  { sku: 'PET-139', name: 'Hypoallergenic Shampoo', price: 18, stock: 95, category: 'Grooming', description: 'Gentle shampoo formulated for sensitive skin.' },
  { sku: 'PET-140', name: 'Flea Comb Precision', price: 13, stock: 83, category: 'Grooming', description: 'Fine-tooth comb for close grooming checks.' },
  { sku: 'PET-141', name: 'Freeze-Dried Liver Cubes', price: 20, stock: 101, category: 'Food', description: 'Single-ingredient liver rewards for high-value training.' },
  { sku: 'PET-142', name: 'Turkey & Rice Kibble', price: 44, stock: 52, category: 'Food', description: 'Balanced dry formula for adult maintenance diets.' },
  { sku: 'PET-143', name: 'Probiotic Soft Chews', price: 29, stock: 66, category: 'Health', description: 'Digestive support chews with live cultures.' },
  { sku: 'PET-144', name: 'Calming Aid Drops', price: 22, stock: 39, category: 'Health', description: 'Herbal blend to help with travel and storm anxiety.' },
  { sku: 'PET-145', name: 'Reflective Rain Leash', price: 24, stock: 58, category: 'Walking', description: 'Water-resistant leash for wet weather walks.' },
  { sku: 'PET-146', name: 'Pet Stroller Lite', price: 139, stock: 7, category: 'Travel', description: 'Foldable stroller for small pets and senior companions.' },
  { sku: 'PET-147', name: 'Weekend Road Trip Kit', price: 63, stock: 22, category: 'Travel', description: 'Grab-and-go travel set with bowls, mat, and organizer.' },
  { sku: 'PET-148', name: 'Window Perch Hammock', price: 34, stock: 41, category: 'Sleep', description: 'Sun-bathing perch with reinforced suction support.' },
  { sku: 'PET-149', name: 'Orthopedic Sofa Bed', price: 118, stock: 12, category: 'Sleep', description: 'Bolstered orthopedic bed for larger breeds and seniors.' },
  { sku: 'PET-150', name: 'Interactive Laser Spinner', price: 31, stock: 35, category: 'Toys', description: 'Automatic laser toy with randomized movement patterns.' },
];

function buildProductCatalogContext() {
  const byCategory = {};
  for (const p of PRODUCTS) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  const lines = ['PRODUCT CATALOG (50 items):'];
  for (const [category, items] of Object.entries(byCategory)) {
    lines.push(`\n[${category}]`);
    for (const p of items) {
      const stockNote = p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} in stock`;
      lines.push(`  • ${p.name} (${p.sku}) — $${p.price} — ${stockNote}`);
      lines.push(`    ${p.description}`);
    }
  }
  return lines.join('\n');
}

module.exports = { PRODUCTS, buildProductCatalogContext };
