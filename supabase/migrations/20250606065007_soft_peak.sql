/*
  # Fix Users RLS Policies

  1. Changes
    - Remove recursive policies from users table
    - Simplify admin check using auth.jwt() directly
    - Update offers policies to use simplified admin check
    
  2. Security
    - Maintain data access security
    - Prevent infinite recursion
    - Keep existing functionality but implement it more efficiently
*/

-- Drop existing policies from users table
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- Create new, simplified policies for users table
CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'admin'
);

CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
);

-- Update offers policies to use simplified admin check
DROP POLICY IF EXISTS "Admins can manage offers" ON offers;

CREATE POLICY "Admins can manage offers"
ON offers
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'admin'
);

-- Ensure offers are still viewable by everyone
DROP POLICY IF EXISTS "Offers are viewable by everyone" ON offers;

CREATE POLICY "Offers are viewable by everyone"
ON offers
FOR SELECT
TO anon, authenticated
USING (true);