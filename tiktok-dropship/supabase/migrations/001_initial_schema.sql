-- TikTok Drop Shopping Platform - Initial Schema
-- Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase Auth users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT,
  phone           TEXT UNIQUE NOT NULL,
  balance         DECIMAL(12,2) DEFAULT 0,
  total_deposit   DECIMAL(12,2) DEFAULT 0,
  total_profit    DECIMAL(12,2) DEFAULT 0,
  total_withdrawn DECIMAL(12,2) DEFAULT 0,
  vip_level       INT DEFAULT 0,
  tasks_completed_today INT DEFAULT 0,
  last_task_date  DATE,
  referral_code   TEXT UNIQUE,
  referred_by     UUID REFERENCES profiles(id),
  is_frozen       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VIP LEVELS
-- ============================================
CREATE TABLE IF NOT EXISTS vip_levels (
  id              SERIAL PRIMARY KEY,
  level           INT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  tasks_per_day   INT NOT NULL,
  min_total_deposit DECIMAL(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

INSERT INTO vip_levels (level, name, tasks_per_day, min_total_deposit) VALUES
  (0, 'VIP 0', 3, 0),
  (1, 'VIP 1', 10, 100),
  (2, 'VIP 2', 20, 500),
  (3, 'VIP 3', 50, 2000)
ON CONFLICT (level) DO NOTHING;

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  image_url   TEXT,
  price       DECIMAL(12,2) NOT NULL,
  commission  DECIMAL(12,2) NOT NULL,
  category    TEXT,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TASKS (Virtual Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  order_number  TEXT UNIQUE NOT NULL,
  product_name  TEXT NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  commission    DECIMAL(12,2) NOT NULL,
  status        TEXT DEFAULT 'completed',
  completed_at  TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- DEPOSITS
-- ============================================
CREATE TABLE IF NOT EXISTS deposits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  method          TEXT NOT NULL,
  transaction_id  TEXT,
  proof_image     TEXT,
  status          TEXT DEFAULT 'pending',
  approved_by     UUID,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- WITHDRAWALS
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  method          TEXT NOT NULL,
  account_details JSONB NOT NULL,
  status          TEXT DEFAULT 'pending',
  approved_by     UUID,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- REFERRALS
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  level       INT NOT NULL,
  UNIQUE(referrer_id, referred_id)
);

CREATE TABLE IF NOT EXISTS referral_commissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id     UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  level       INT NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ADMIN USERS
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'admin',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SITE SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id    SERIAL PRIMARY KEY,
  key   TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deposits_updated_at ON deposits;
CREATE TRIGGER update_deposits_updated_at
  BEFORE UPDATE ON deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON withdrawals;
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Daily task counter reset (optional: can be handled in app logic)
CREATE OR REPLACE FUNCTION reset_daily_tasks()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET tasks_completed_today = 0,
      last_task_date = CURRENT_DATE
  WHERE last_task_date IS NULL OR last_task_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Increment balance safely
CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET balance = balance + amount,
      total_profit = total_profit + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Approve deposit: update deposit status and add to user balance
CREATE OR REPLACE FUNCTION approve_deposit(deposit_id UUID, user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE deposits SET status = 'approved' WHERE id = deposit_id;
  UPDATE profiles
  SET balance = balance + amount,
      total_deposit = total_deposit + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Approve withdrawal: update status and deduct from total withdrawn tracking
CREATE OR REPLACE FUNCTION approve_withdrawal(withdrawal_id UUID, user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE withdrawals SET status = 'approved' WHERE id = withdrawal_id;
  UPDATE profiles
  SET balance = balance - amount,
      total_withdrawn = total_withdrawn + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Seed sample products
INSERT INTO products (name, image_url, price, commission, category, sort_order) VALUES
  ('Wireless Earbuds', 'https://placehold.co/300x300/000000/FFFFFF?text=Earbuds', 10, 2, 'Electronics', 1),
  ('Running Shoes', 'https://placehold.co/300x300/FF0000/FFFFFF?text=Shoes', 30, 6, 'Fashion', 2),
  ('Gaming Laptop', 'https://placehold.co/300x300/0000FF/FFFFFF?text=Laptop', 500, 50, 'Electronics', 3),
  ('iPhone 15 Pro', 'https://placehold.co/300x300/333333/FFFFFF?text=iPhone', 1000, 100, 'Electronics', 4),
  ('Smart Watch', 'https://placehold.co/300x300/00FF00/FFFFFF?text=Watch', 150, 18, 'Electronics', 5),
  ('Designer Bag', 'https://placehold.co/300x300/FFA500/FFFFFF?text=Bag', 300, 35, 'Fashion', 6),
  ('Headphones', 'https://placehold.co/300x300/800080/FFFFFF?text=Headphones', 80, 10, 'Electronics', 7),
  ('Tablet', 'https://placehold.co/300x300/008080/FFFFFF?text=Tablet', 400, 45, 'Electronics', 8)
ON CONFLICT DO NOTHING;

-- Seed default admin (email: admin@example.com, password: admin123)
-- In production, use bcrypt hash
INSERT INTO admin_users (email, password_hash, role) VALUES
  ('admin@example.com', '$2a$10$YourHashedPasswordHere', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Seed site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', '"TikTok Drop Shopping"'),
  ('withdrawal_min', '{"amount": 10}'),
  ('referral_rates', '{"level1": 0.10, "level2": 0.05, "level3": 0.02}')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_levels ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products: anyone can view active products
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Tasks: users can view own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deposits: users can view/create own deposits
CREATE POLICY "Users can view own deposits" ON deposits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deposits" ON deposits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawals: users can view/create own withdrawals
CREATE POLICY "Users can view own withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals: users can view own referrals
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own referral commissions" ON referral_commissions
  FOR SELECT USING (auth.uid() = referrer_id);

-- VIP levels: public read
CREATE POLICY "VIP levels public read" ON vip_levels
  FOR SELECT USING (true);

-- Site settings: public read
CREATE POLICY "Site settings public read" ON site_settings
  FOR SELECT USING (true);
