-- SportSphere: Fix RLS policies on user_profiles
-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/*/sql

-- 1. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 2. Enable RLS (safe to run if already enabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies if they exist and are too restrictive
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.user_profiles;

-- 4. Allow authenticated users to read their own row (by uid OR email)
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  auth.email() = email
);

-- 5. Allow authenticated users to update their own row
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR auth.email() = email);

-- 6. Service role bypass (for webhooks)
CREATE POLICY "Service role full access"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Verify the target user has is_pro = true
SELECT id, email, is_pro, pro_until
FROM public.user_profiles
WHERE email = 'keegan.cuolahan@gmail.com';
