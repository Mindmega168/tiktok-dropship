export interface Profile {
  id: string;
  username: string | null;
  phone: string;
  balance: number;
  total_deposit: number;
  total_profit: number;
  total_withdrawn: number;
  vip_level: number;
  tasks_completed_today: number;
  last_task_date: string | null;
  referral_code: string | null;
  referred_by: string | null;
  is_frozen: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  commission: number;
  category: string | null;
  is_active: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  product_id: string;
  order_number: string;
  product_name: string;
  amount: number;
  commission: number;
  status: string;
  completed_at: string;
  created_at: string;
}

export interface VipLevel {
  id: number;
  level: number;
  name: string;
  tasks_per_day: number;
  min_total_deposit: number;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  transaction_id: string | null;
  proof_image: string | null;
  status: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  account_details: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    usdt_address?: string;
  };
  status: string;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  level: number;
}

export interface SiteSettings {
  withdrawal_min: number;
  referral_rates: {
    level1: number;
    level2: number;
    level3: number;
  };
}
