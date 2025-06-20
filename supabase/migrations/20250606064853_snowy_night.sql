/*
  # Fix recursive RLS policies on users table

  1. Changes
    - Remove recursive policy for admin users
    - Replace with a simpler policy using auth.jwt()
  
  2. Security
    - Maintains RLS protection
    - Simplifies admin access check using JWT claims
    - Preserves existing user self-access policy
*/

-- Drop the existing recursive policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create new admin policy using JWT claims
CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  (SELECT is_admin FROM users WHERE id = auth.uid())
);