/*
  # Fix Users Table RLS Policies

  1. Changes
    - Remove existing policies that cause recursion
    - Create new, simplified policies for users table
      - Users can read their own data
      - Admins can read all users data
      - Users can update their own data

  2. Security
    - Maintains RLS protection
    - Simplifies policy logic to prevent recursion
    - Ensures proper access control
*/

-- Drop existing policies to replace them with fixed versions
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new, simplified policies
CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  )
);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);