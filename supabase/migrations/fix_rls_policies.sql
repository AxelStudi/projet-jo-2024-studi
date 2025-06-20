
-- Supprimer les anciennes politiques pour les réservations
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create own reservations" ON public.reservations;

-- Créer les nouvelles politiques pour les réservations
CREATE POLICY "Users can view own reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create own reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Supprimer les anciennes politiques pour les transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;

-- Créer les nouvelles politiques pour les transactions
CREATE POLICY "Users can view own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Supprimer les anciennes politiques pour les e-tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.e_tickets;

-- Créer les nouvelles politiques pour les e-tickets
CREATE POLICY "Users can view own tickets"
ON public.e_tickets
FOR SELECT
TO authenticated
USING (
  auth.uid() = (
    SELECT user_id FROM public.reservations 
    WHERE id = reservation_id
  ) OR public.is_admin()
);
