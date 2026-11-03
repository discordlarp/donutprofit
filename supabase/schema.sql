-- ==========================================================
-- DONUTPROFIT: PRODUCTION SUPABASE DATABASE SCHEMA
-- ==========================================================

-- 1. Profiles & Users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  minecraft_ign TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
  total_wagered NUMERIC(15, 2) DEFAULT 0.00,
  total_won NUMERIC(15, 2) DEFAULT 0.00,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Deposit Requests
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  minecraft_ign TEXT NOT NULL,
  amount_in_game NUMERIC(20, 2) NOT NULL,
  amount_coins NUMERIC(15, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  transaction_proof TEXT,
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Withdrawal Requests
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  minecraft_ign TEXT NOT NULL,
  amount_coins NUMERIC(15, 2) NOT NULL,
  amount_in_game NUMERIC(20, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Game Bets & History
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game TEXT NOT NULL CHECK (game IN ('coinflip', 'crash', 'mines', 'roulette', 'blackjack', 'slots', 'dice', 'jackpot')),
  bet_amount NUMERIC(15, 2) NOT NULL CHECK (bet_amount > 0),
  multiplier NUMERIC(10, 2) NOT NULL,
  payout NUMERIC(15, 2) NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('win', 'loss')),
  game_details JSONB,
  server_seed TEXT,
  client_seed TEXT,
  nonce INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2),
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. System Configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  designated_ign TEXT NOT NULL DEFAULT 'DonutBank_Official',
  exchange_rate NUMERIC(15, 2) NOT NULL DEFAULT 100000,
  min_deposit NUMERIC(15, 2) NOT NULL DEFAULT 500000,
  min_withdrawal NUMERIC(15, 2) NOT NULL DEFAULT 10,
  min_bet NUMERIC(15, 2) NOT NULL DEFAULT 1,
  max_bet NUMERIC(15, 2) NOT NULL DEFAULT 5000,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can view their own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Bets are viewable by everyone" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Public system settings viewable by everyone" ON public.system_settings FOR SELECT USING (true);
