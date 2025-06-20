
-- Créer la fonction is_admin manquante
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Maintenant on peut appliquer les politiques RLS correctement
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;

-- Créer les bonnes politiques pour les transactions
CREATE POLICY "Users can create own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Même chose pour les réservations
DROP POLICY IF EXISTS "Users can create own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;

CREATE POLICY "Users can create own reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Même chose pour les e-tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.e_tickets;

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
