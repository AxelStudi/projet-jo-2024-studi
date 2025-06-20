
-- D'abord, supprimer les utilisateurs de test existants de la table users
DELETE FROM public.users WHERE email IN ('admin@paris2024.fr', 'user@test.fr');
