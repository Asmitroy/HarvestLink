-- KisanConnect Seed Data  (mirrors previous mock state)
-- Run AFTER schema.sql

INSERT INTO users (id, name, role, location, location_lat, location_lng) VALUES
  (1, 'Ramesh Patel',   'farmer',   'Nashik District', 20.08, 73.69),
  (2, 'Priya Desai',    'farmer',   'Nashik District', 19.92, 73.71),
  (3, 'Sanjay More',    'farmer',   'Nashik District', 20.03, 73.65),
  (4, 'Local Grocers Combined',   'buyer', 'Nashik Hub',  20.00, 73.78),
  (5, 'FPO Batch #12 Sangamner',  'buyer', 'Sangamner',   19.75, 73.99),
  (6, 'Hotel Chains Pune',         'buyer', 'Pune Central Hub', 18.52, 73.86);

INSERT INTO produce_listings (farmer_id, farmer_name, crop, qty, price, status, pos_x, pos_y, lat, lng) VALUES
  (1, 'Farm A', 'Tomato', 200, 25, 'assigned', 60,  55,  20.08, 73.69),
  (2, 'Farm B', 'Onion',  120, 18, 'listed',   100, 170, 19.92, 73.71),
  (3, 'Farm C', 'Potato', 150, 16, 'assigned', 75,  120, 20.03, 73.65);

INSERT INTO demand_pool (buyer_id, buyer_label, crop, requested_qty, matched_qty, target_price, status, location, deadline, is_priority) VALUES
  (4, '3 local grocers combined',  'Tomato', 450, 260, 28, 'matching', 'Nashik Hub, 12km away', '18:00', 1),
  (5, 'FPO Batch #12 — Sangamner', 'Onion',  800, 704, 21, 'ready',    'Sangamner, 28km away',  'tomorrow 09:00', 0),
  (6, '2 hotel chains · Pune',     'Potato', 300,  70, 16, 'open',     'Pune Central Hub, 45km','+48h', 0);
