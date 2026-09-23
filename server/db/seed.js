/**
 * seed.js — Seeds demo data into the live Supabase PostgreSQL schema.
 *
 * Actual column names (from information_schema inspection):
 *   users:            id, name, email, password_hash, role, lat, lng, created_at
 *   produce_listings: id, farmer_id, crop, qty, price, status, lat, lng, x, y, created_at
 *   demand_pool:      id, buyer_id, crop, requested_qty, matched_qty, target_price,
 *                     status, deadline, created_at
 *
 * Run with: npm run db:seed
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from './database.js';

const SALT_ROUNDS = 10;

const DEMO_USERS = [
  { name: 'Ramesh Patel',            role: 'farmer',    email: 'farmer@demo.com', password: 'farmer123', lat: 20.08, lng: 73.69 },
  { name: 'Priya Desai',             role: 'farmer',    email: 'priya@demo.com',  password: 'farmer123', lat: 19.92, lng: 73.71 },
  { name: 'Sanjay More',             role: 'farmer',    email: 'sanjay@demo.com', password: 'farmer123', lat: 20.03, lng: 73.65 },
  { name: 'Local Grocers Combined',  role: 'buyer',     email: 'buyer@demo.com',  password: 'buyer123',  lat: 20.00, lng: 73.78 },
  { name: 'FPO Batch Sangamner',     role: 'buyer',     email: 'fpo@demo.com',    password: 'buyer123',  lat: 19.75, lng: 73.99 },
  { name: 'KisanConnect Admin',      role: 'logistics', email: 'admin@demo.com',  password: 'admin123',  lat: 20.00, lng: 73.78 },
];

async function seed() {

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('[Seed] Starting seed transaction…');

    // Check if already seeded
    const { rows: existing } = await client.query('SELECT COUNT(*)::int AS n FROM users');
    if (existing[0].n > 0) {
      console.log(`[Seed] Database already has ${existing[0].n} user(s). Skipping.`);
      await client.query('ROLLBACK');
      return;
    }

    // ── Insert Users ──────────────────────────────────────────────────────
    const userIds = {};
    for (const u of DEMO_USERS) {
      const hash = bcrypt.hashSync(u.password, SALT_ROUNDS);
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash, role, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [u.name, u.email, hash, u.role, u.lat, u.lng]
      );
      userIds[u.email] = rows[0].id;
      console.log(`  [Seed] User: ${u.email} (id=${rows[0].id}, role=${u.role})`);
    }

    // ── Insert Produce Listings ───────────────────────────────────────────
    // Schema columns: farmer_id, crop, qty, price, status, x, y, lat, lng
    const listings = [
      { email: 'farmer@demo.com', crop: 'Tomato', qty: 200, price: 25, status: 'assigned', x: 60,  y: 55,  lat: 20.08, lng: 73.69 },
      { email: 'priya@demo.com',  crop: 'Onion',  qty: 120, price: 18, status: 'listed',   x: 100, y: 170, lat: 19.92, lng: 73.71 },
      { email: 'sanjay@demo.com', crop: 'Potato', qty: 150, price: 16, status: 'assigned', x: 75,  y: 120, lat: 20.03, lng: 73.65 },
    ];
    for (const l of listings) {
      await client.query(
        `INSERT INTO produce_listings (farmer_id, crop, qty, price, status, x, y, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [userIds[l.email], l.crop, l.qty, l.price, l.status, l.x, l.y, l.lat, l.lng]
      );
    }
    console.log(`  [Seed] ${listings.length} produce listings inserted.`);

    // ── Insert Demand Pool ────────────────────────────────────────────────
    // Schema columns: buyer_id, crop, requested_qty, matched_qty, target_price, status, deadline
    const demands = [
      { email: 'buyer@demo.com', crop: 'Tomato', requestedQty: 450, matchedQty: 260, targetPrice: 28, status: 'matching', deadline: '18:00'          },
      { email: 'fpo@demo.com',   crop: 'Onion',  requestedQty: 800, matchedQty: 704, targetPrice: 21, status: 'ready',    deadline: 'tomorrow 09:00'  },
      { email: 'buyer@demo.com', crop: 'Potato', requestedQty: 300, matchedQty:  70, targetPrice: 16, status: 'matching', deadline: '+48h'            },
    ];
    for (const d of demands) {
      await client.query(
        `INSERT INTO demand_pool (buyer_id, crop, requested_qty, matched_qty, target_price, status, deadline)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userIds[d.email], d.crop, d.requestedQty, d.matchedQty, d.targetPrice, d.status, d.deadline]
      );
    }
    console.log(`  [Seed] ${demands.length} demand pool entries inserted.`);

    await client.query('COMMIT');
    console.log('\n[Seed] ✅ Done! Demo credentials:');
    console.log('  Farmer    → farmer@demo.com / farmer123');
    console.log('  Buyer     → buyer@demo.com  / buyer123');
    console.log('  Admin     → admin@demo.com  / admin123');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed] ❌ Error — rolled back:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
