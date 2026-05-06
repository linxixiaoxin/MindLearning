-- Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行

-- profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row-Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 管理员判断需要绕开 profiles 自身 RLS，避免在 profiles policy 中查询 profiles 造成递归
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 用户可读自己的 profile
DROP POLICY IF EXISTS "users_read_own" ON profiles;
CREATE POLICY "users_read_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 管理员可读所有 profile
DROP POLICY IF EXISTS "admins_read_all" ON profiles;
CREATE POLICY "admins_read_all" ON profiles
  FOR SELECT USING (current_user_is_admin());

-- 管理员可更新 profile
DROP POLICY IF EXISTS "admins_update" ON profiles;
CREATE POLICY "admins_update" ON profiles
  FOR UPDATE USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- 手动设置第一个管理员（将 your-email@example.com 替换为实际邮箱）
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
