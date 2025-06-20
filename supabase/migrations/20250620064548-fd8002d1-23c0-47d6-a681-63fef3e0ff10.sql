
-- Supprimer toutes les politiques existantes pour e_tickets pour repartir proprement
DROP POLICY IF EXISTS "Users can view own tickets" ON public.e_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON public.e_tickets;

-- Créer la politique INSERT pour permettre aux utilisateurs de créer des billets pour leurs réservations
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

-- Créer la politique SELECT pour permettre aux utilisateurs de voir leurs billets
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
