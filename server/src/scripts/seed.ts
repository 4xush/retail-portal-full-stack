import path from 'path';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { DiscountCode } from '../models/DiscountCode.js';
import { Order } from '../models/Order.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/retailportal';

type CatSlug = 'burgers' | 'sides' | 'drinks' | 'desserts' | 'combos' | 'veg-specials';

const CATEGORIES: { name: string; slug: CatSlug; description: string; logo: string }[] = [
  {
    name: 'Burgers',
    slug: 'burgers',
    description: 'Signature crispy and grilled burgers.',
    logo: 'https://loremflickr.com/80/80/burger?lock=10',
  },
  {
    name: 'Sides',
    slug: 'sides',
    description: 'Perfect pairings for your meal.',
    logo: 'https://loremflickr.com/80/80/fries?lock=10',
  },
  {
    name: 'Drinks',
    slug: 'drinks',
    description: 'Refreshing beverages and shakes.',
    logo: 'https://loremflickr.com/80/80/beverage?lock=10',
  },
  {
    name: 'Desserts',
    slug: 'desserts',
    description: 'Sweet endings.',
    logo: 'https://loremflickr.com/80/80/dessert?lock=10',
  },
  {
    name: 'Combos',
    slug: 'combos',
    description: 'Value meals and bundles.',
    logo: 'https://loremflickr.com/80/80/meal?lock=10',
  },
  {
    name: 'Veg Specials',
    slug: 'veg-specials',
    description: 'Vegetarian favourites.',
    logo: 'https://loremflickr.com/80/80/salad?lock=10',
  },
];

type P = {
  title: string;
  description: string;
  cost: number;
  taxPercent: number;
  stock: number;
  tags: string[];
  imageLock: number;
  keyword: string;
};

const PRODUCTS_BY_CAT: Record<CatSlug, P[]> = {
  burgers: [
    {
      title: 'Classic Crispy Burger',
      description: 'Crispy fillet with lettuce and mayo.',
      cost: 199,
      taxPercent: 5,
      stock: 25,
      tags: ['crispy', 'chicken', 'bestseller'],
      imageLock: 1,
      keyword: 'burger',
    },
    {
      title: 'Spicy Zinger Burger',
      description: 'Fiery spice blend and crunchy coating.',
      cost: 229,
      taxPercent: 5,
      stock: 18,
      tags: ['spicy', 'zinger', 'hot'],
      imageLock: 2,
      keyword: 'burger',
    },
    {
      title: 'Double Smash Burger',
      description: 'Two patties, melted cheese, pickles.',
      cost: 279,
      taxPercent: 5,
      stock: 5,
      tags: ['beef', 'smash', 'premium'],
      imageLock: 3,
      keyword: 'burger',
    },
    {
      title: 'BBQ Bacon Stacker',
      description: 'Smoky BBQ sauce and crispy bacon.',
      cost: 319,
      taxPercent: 12,
      stock: 3,
      tags: ['bbq', 'bacon', 'beef'],
      imageLock: 4,
      keyword: 'burger',
    },
    {
      title: 'Cheese Burst Burger',
      description: 'Extra cheese core and soft bun.',
      cost: 249,
      taxPercent: 5,
      stock: 0,
      tags: ['cheese', 'burst', 'chicken'],
      imageLock: 5,
      keyword: 'burger',
    },
  ],
  sides: [
    {
      title: 'Crispy Salted Fries',
      description: 'Golden fries with a light salt sprinkle.',
      cost: 89,
      taxPercent: 5,
      stock: 50,
      tags: ['fries', 'classic'],
      imageLock: 1,
      keyword: 'fries',
    },
    {
      title: 'Peri-Peri Fries',
      description: 'Spicy peri seasoning on hot fries.',
      cost: 109,
      taxPercent: 5,
      stock: 45,
      tags: ['fries', 'peri', 'spicy'],
      imageLock: 2,
      keyword: 'fries',
    },
    {
      title: 'Onion Rings (6 pcs)',
      description: 'Crunchy rings with tangy dip.',
      cost: 129,
      taxPercent: 5,
      stock: 30,
      tags: ['onion', 'rings'],
      imageLock: 1,
      keyword: 'onion-rings',
    },
    {
      title: 'Creamy Coleslaw',
      description: 'Fresh cabbage in creamy dressing.',
      cost: 79,
      taxPercent: 5,
      stock: 40,
      tags: ['coleslaw', 'fresh'],
      imageLock: 1,
      keyword: 'coleslaw',
    },
    {
      title: 'Grilled Corn Cob',
      description: 'Charred corn with butter and spice.',
      cost: 99,
      taxPercent: 5,
      stock: 0,
      tags: ['corn', 'grilled'],
      imageLock: 1,
      keyword: 'corn',
    },
  ],
  drinks: [
    {
      title: 'Classic Cola (Large)',
      description: 'Chilled cola with ice.',
      cost: 89,
      taxPercent: 12,
      stock: 60,
      tags: ['cola', 'cold'],
      imageLock: 1,
      keyword: 'cola',
    },
    {
      title: 'Chocolate Milkshake',
      description: 'Rich chocolate blended thick shake.',
      cost: 169,
      taxPercent: 12,
      stock: 20,
      tags: ['shake', 'chocolate'],
      imageLock: 1,
      keyword: 'milkshake',
    },
    {
      title: 'Strawberry Lemonade',
      description: 'Sweet strawberry with zesty lemon.',
      cost: 139,
      taxPercent: 12,
      stock: 25,
      tags: ['lemonade', 'strawberry'],
      imageLock: 1,
      keyword: 'lemonade',
    },
    {
      title: 'Mango Smoothie',
      description: 'Alphonso mango blended smooth.',
      cost: 159,
      taxPercent: 12,
      stock: 4,
      tags: ['mango', 'smoothie'],
      imageLock: 1,
      keyword: 'mango-drink',
    },
    {
      title: 'Iced Green Tea',
      description: 'Light brew with citrus notes.',
      cost: 119,
      taxPercent: 12,
      stock: 35,
      tags: ['tea', 'iced'],
      imageLock: 1,
      keyword: 'green-tea',
    },
  ],
  desserts: [
    {
      title: 'Chocolate Lava Cake',
      description: 'Warm centre with molten chocolate.',
      cost: 169,
      taxPercent: 12,
      stock: 12,
      tags: ['chocolate', 'cake'],
      imageLock: 1,
      keyword: 'chocolate-cake',
    },
    {
      title: 'NY Cheesecake Slice',
      description: 'Creamy cheesecake with berry compote.',
      cost: 189,
      taxPercent: 12,
      stock: 10,
      tags: ['cheesecake', 'dessert'],
      imageLock: 1,
      keyword: 'cheesecake',
    },
    {
      title: 'Soft Serve Vanilla',
      description: 'Swirled vanilla soft serve.',
      cost: 79,
      taxPercent: 12,
      stock: 30,
      tags: ['ice-cream', 'vanilla'],
      imageLock: 1,
      keyword: 'ice-cream',
    },
    {
      title: 'Brownie Sundae',
      description: 'Brownie chunks with hot fudge.',
      cost: 199,
      taxPercent: 12,
      stock: 3,
      tags: ['brownie', 'sundae'],
      imageLock: 1,
      keyword: 'brownie',
    },
    {
      title: 'Apple Crumble Pie',
      description: 'Baked apples with crumble topping.',
      cost: 149,
      taxPercent: 12,
      stock: 15,
      tags: ['pie', 'apple'],
      imageLock: 1,
      keyword: 'pie',
    },
  ],
  combos: [
    {
      title: 'Classic Meal Combo',
      description: 'Crispy burger + fries + cola.',
      cost: 329,
      taxPercent: 5,
      stock: 20,
      tags: ['combo', 'meal'],
      imageLock: 1,
      keyword: 'meal',
    },
    {
      title: 'Zinger Value Meal',
      description: 'Zinger + peri fries + drink.',
      cost: 359,
      taxPercent: 5,
      stock: 18,
      tags: ['combo', 'zinger'],
      imageLock: 2,
      keyword: 'meal',
    },
    {
      title: 'Family Feast Box',
      description: '4 burgers + 2 fries + 4 drinks.',
      cost: 799,
      taxPercent: 12,
      stock: 10,
      tags: ['family', 'feast'],
      imageLock: 3,
      keyword: 'meal',
    },
    {
      title: 'Snack Duo',
      description: 'Burger + fries + soft serve.',
      cost: 249,
      taxPercent: 5,
      stock: 25,
      tags: ['combo', 'snack'],
      imageLock: 4,
      keyword: 'meal',
    },
    {
      title: 'Premium Double Deal',
      description: 'Double smash + rings + milkshake.',
      cost: 499,
      taxPercent: 12,
      stock: 8,
      tags: ['combo', 'premium'],
      imageLock: 5,
      keyword: 'meal',
    },
  ],
  'veg-specials': [
    {
      title: 'Crispy Veg Burger',
      description: 'Crunchy veg patty with fresh veggies.',
      cost: 179,
      taxPercent: 5,
      stock: 22,
      tags: ['veg', 'burger'],
      imageLock: 1,
      keyword: 'vegetable-burger',
    },
    {
      title: 'Paneer Tikka Wrap',
      description: 'Grilled paneer with mint chutney.',
      cost: 199,
      taxPercent: 5,
      stock: 18,
      tags: ['paneer', 'wrap'],
      imageLock: 1,
      keyword: 'wrap',
    },
    {
      title: 'Aloo Tikki Burger',
      description: 'Spiced potato patty and chutney.',
      cost: 149,
      taxPercent: 5,
      stock: 30,
      tags: ['aloo', 'tikki'],
      imageLock: 1,
      keyword: 'potato-burger',
    },
    {
      title: 'Corn & Cheese Griller',
      description: 'Melted cheese with sweet corn.',
      cost: 169,
      taxPercent: 5,
      stock: 0,
      tags: ['corn', 'cheese', 'veg'],
      imageLock: 1,
      keyword: 'grilled-sandwich',
    },
    {
      title: 'Veg Zinger Supreme',
      description: 'Spicy veg fillet with premium sauce.',
      cost: 209,
      taxPercent: 5,
      stock: 20,
      tags: ['veg', 'spicy'],
      imageLock: 1,
      keyword: 'veggie-burger',
    },
  ],
};

async function seedUsers(): Promise<void> {
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const userHash = await bcrypt.hash('User@123', 10);
  const existingAdmin = await User.findOne({ email: 'admin@demo.com' }).lean();
  const existingUser = await User.findOne({ email: 'user@demo.com' }).lean();
  const adminKey = existingAdmin?.apiKey ?? randomUUID();
  const userKey = existingUser?.apiKey ?? randomUUID();
  await User.findOneAndUpdate(
    { email: 'admin@demo.com' },
    {
      name: 'Admin Demo',
      email: 'admin@demo.com',
      passwordHash: adminHash,
      role: 'admin',
      apiKey: adminKey,
      isActive: true,
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
  await User.findOneAndUpdate(
    { email: 'user@demo.com' },
    {
      name: 'User Demo',
      email: 'user@demo.com',
      passwordHash: userHash,
      role: 'user',
      apiKey: userKey,
      isActive: true,
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

async function seedCategories(): Promise<Map<CatSlug, mongoose.Types.ObjectId>> {
  const map = new Map<CatSlug, mongoose.Types.ObjectId>();
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      {
        name: c.name,
        slug: c.slug,
        description: c.description,
        logo: c.logo,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    map.set(c.slug, doc!._id);
  }
  return map;
}

async function seedProducts(
  catIds: Map<CatSlug, mongoose.Types.ObjectId>
): Promise<Map<string, mongoose.Types.ObjectId>> {
  for (const slug of Object.keys(PRODUCTS_BY_CAT) as CatSlug[]) {
    const catId = catIds.get(slug)!;
    for (const p of PRODUCTS_BY_CAT[slug]) {
      const img = `https://loremflickr.com/400/400/${p.keyword}?lock=${p.imageLock}`;
      const doc = await Product.findOneAndUpdate(
        { title: p.title, category: catId },
        {
          title: p.title,
          description: p.description,
          cost: p.cost,
          taxPercent: p.taxPercent,
          stock: p.stock,
          tags: p.tags,
          images: [img],
          category: catId,
          isActive: true,
          addOns: [],
          combos: [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  const titleToId = new Map<string, mongoose.Types.ObjectId>();
  const allProducts = await Product.find().lean();
  for (const p of allProducts) titleToId.set(p.title, p._id);

  const friesId = titleToId.get('Crispy Salted Fries');
  const periId = titleToId.get('Peri-Peri Fries');
  const colaId = titleToId.get('Classic Cola (Large)');
  const shakeId = titleToId.get('Chocolate Milkshake');
  const ringsId = titleToId.get('Onion Rings (6 pcs)');
  const coleslawId = titleToId.get('Creamy Coleslaw');
  const teaId = titleToId.get('Iced Green Tea');
  const mangoId = titleToId.get('Mango Smoothie');

  const setAddOns = async (title: string, ids: mongoose.Types.ObjectId[]) => {
    await Product.updateOne({ title }, { $set: { addOns: ids } });
  };

  if (friesId && colaId) await setAddOns('Classic Crispy Burger', [friesId, colaId]);
  if (periId && shakeId) await setAddOns('Spicy Zinger Burger', [periId, shakeId]);
  if (ringsId && colaId) await setAddOns('Double Smash Burger', [ringsId, colaId]);
  if (coleslawId && teaId) await setAddOns('Paneer Tikka Wrap', [coleslawId, teaId]);
  if (friesId && mangoId) await setAddOns('Crispy Veg Burger', [friesId, mangoId]);

  const classicCombo = titleToId.get('Classic Meal Combo');
  const zingerCombo = titleToId.get('Zinger Value Meal');
  const premiumCombo = titleToId.get('Premium Double Deal');
  const snackCombo = titleToId.get('Snack Duo');

  const setCombos = async (title: string, ids: mongoose.Types.ObjectId[]) => {
    await Product.updateOne({ title }, { $set: { combos: ids } });
  };

  if (classicCombo) await setCombos('Classic Crispy Burger', [classicCombo]);
  if (zingerCombo) await setCombos('Spicy Zinger Burger', [zingerCombo]);
  if (premiumCombo) await setCombos('Double Smash Burger', [premiumCombo]);
  if (snackCombo) await setCombos('Crispy Veg Burger', [snackCombo]);

  return titleToId;
}

async function seedDiscounts(): Promise<void> {
  await DiscountCode.findOneAndUpdate(
    { code: 'SAVE10' },
    {
      code: 'SAVE10',
      discountType: 'percent',
      discountValue: 10,
      minOrderValue: 200,
      usageLimit: null,
      usedCount: 0,
      isActive: true,
    },
    { upsert: true }
  );
  await DiscountCode.findOneAndUpdate(
    { code: 'FLAT50' },
    {
      code: 'FLAT50',
      discountType: 'flat',
      discountValue: 50,
      minOrderValue: 300,
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
    },
    { upsert: true }
  );
  await DiscountCode.findOneAndUpdate(
    { code: 'DEMO20' },
    {
      code: 'DEMO20',
      discountType: 'percent',
      discountValue: 20,
      minOrderValue: 150,
      usageLimit: 5,
      usedCount: 0,
      isActive: true,
    },
    { upsert: true }
  );
}

async function seedOrders(userId: mongoose.Types.ObjectId, ids: Map<string, mongoose.Types.ObjectId>): Promise<void> {
  if ((await Order.countDocuments({ user: userId })) >= 3) return;

  const burger = await Product.findById(ids.get('Classic Crispy Burger')).lean();
  const fries = await Product.findById(ids.get('Crispy Salted Fries')).lean();
  const cola = await Product.findById(ids.get('Classic Cola (Large)')).lean();
  const zinger = await Product.findById(ids.get('Spicy Zinger Burger')).lean();
  const rings = await Product.findById(ids.get('Onion Rings (6 pcs)')).lean();
  const lemon = await Product.findById(ids.get('Strawberry Lemonade')).lean();
  const feast = await Product.findById(ids.get('Family Feast Box')).lean();

  if (!burger || !fries || !cola || !zinger || !rings || !lemon || !feast) return;

  const snap = (p: NonNullable<typeof burger>) => ({
    title: p.title,
    cost: p.cost,
    taxPercent: p.taxPercent,
    image: p.images?.[0] ?? '',
  });

  await Order.create({
    user: userId,
    items: [
      { product: burger._id, qty: 1, snapshot: snap(burger) },
      { product: fries._id, qty: 1, snapshot: snap(fries) },
      { product: cola._id, qty: 1, snapshot: snap(cola) },
    ],
    discountCode: 'SAVE10',
    discountAmount: 28.35,
    subtotal: 377,
    tax: 28.35,
    total: 377,
    status: 'delivered',
  });

  await Order.create({
    user: userId,
    items: [
      { product: zinger._id, qty: 2, snapshot: snap(zinger) },
      { product: rings._id, qty: 1, snapshot: snap(rings) },
      { product: lemon._id, qty: 2, snapshot: snap(lemon) },
    ],
    discountAmount: 0,
    subtotal: 826,
    tax: 39.12,
    total: 865.12,
    status: 'preparing',
  });

  await Order.create({
    user: userId,
    items: [{ product: feast._id, qty: 1, snapshot: snap(feast) }],
    discountCode: 'FLAT50',
    discountAmount: 50,
    subtotal: 799,
    tax: 95.88,
    total: 844.88,
    status: 'pending',
  });
}

async function main(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log('Seeding…');
  await seedUsers();
  const catIds = await seedCategories();
  const titleIds = await seedProducts(catIds);
  await seedDiscounts();
  const user = await User.findOne({ email: 'user@demo.com' });
  if (user) await seedOrders(user._id, titleIds);
  console.log('Seed complete.');
  await mongoose.disconnect();
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
