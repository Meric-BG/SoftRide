-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX 403 ERRORS

-- 1. Ensure RLS is enabled
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON support_tickets;

-- 3. Policy: Authenticated users can CREATE their own tickets
CREATE POLICY "Users can create own tickets"
ON support_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Policy: Users can view their own tickets OR All tickets (Temporary Dev Mode)
-- We combine this into one policy for simplicity in dev/demo environment.
-- This allows any logged in user (Admin or User) to see ALL tickets.
-- WARNING: In production, change 'true' to a role check like (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
CREATE POLICY "Authenticated users can view tickets"
ON support_tickets FOR SELECT
TO authenticated
USING (true);

-- 5. Policy: Authenticated users can UPDATE tickets (for Admin actions like resolving)
-- Again, permissive for Dev/Demo.
CREATE POLICY "Authenticated users can update tickets"
ON support_tickets FOR UPDATE
TO authenticated
USING (true);

-- 6. Grant permissions
GRANT ALL ON support_tickets TO service_role;
GRANT ALL ON support_tickets TO authenticated;
