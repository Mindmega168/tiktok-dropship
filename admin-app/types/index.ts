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
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  product_name: string;
  order_number: string;
  amount: number;
  commission: number;
  status: string;
  completed_at: string;
  created_at: string;
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
  user?: Profile;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  account_details: Record<string, string>;
  status: string;
  created_at: string;
  user?: Profile;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface VipLevel {
  id: number;
  level: number;
  name: string;
  tasks_per_day: number;
  min_total_deposit: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfit: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}
