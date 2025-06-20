
-- Supprimer toutes les anciennes politiques pour les e_tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.e_tickets;

-- Créer la politique INSERT manquante pour les e_tickets
CREATE POLICY "Users can create own tickets"
ON public.e_tickets
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = (
    SELECT user_id FROM public.reservations 
    WHERE id = reservation_id
  ) OR public.is_admin()
);

-- Créer la politique SELECT pour les e_tickets
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
