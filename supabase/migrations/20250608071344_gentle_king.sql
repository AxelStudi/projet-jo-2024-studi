/*
  # Créer des utilisateurs de test avec des UUIDs valides

  1. Utilisateurs de test
    - Administrateur : admin@paris2024.fr
    - Utilisateur normal : user@test.fr
  
  2. Données de test
    - Transactions d'exemple
    - Réservations d'exemple
    - E-tickets d'exemple
*/

-- Supprimer l'ancien utilisateur admin s'il existe
DELETE FROM users WHERE email = 'axel.chl28@gmail.com';

-- Créer un utilisateur admin de test avec un UUID valide
INSERT INTO users (
  id, 
  email, 
  first_name, 
  last_name, 
  user_key, 
  is_admin, 
  mfa_enabled
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@paris2024.fr',
  'Admin',
  'Paris2024',
  gen_random_uuid(),
  true,
  false
) ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  first_name = 'Admin',
  last_name = 'Paris2024';

-- Créer un utilisateur normal de test avec un UUID valide
INSERT INTO users (
  id, 
  email, 
  first_name, 
  last_name, 
  user_key, 
  is_admin, 
  mfa_enabled
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'user@test.fr',
  'Utilisateur',
  'Test',
  gen_random_uuid(),
  false,
  false
) ON CONFLICT (email) DO UPDATE SET
  first_name = 'Utilisateur',
  last_name = 'Test';

-- Ajouter quelques transactions de test
INSERT INTO transactions (user_id, amount, status, payment_method, transaction_key) VALUES
('22222222-2222-2222-2222-222222222222', 99.00, 'completed', 'credit_card', gen_random_uuid()),
('22222222-2222-2222-2222-222222222222', 199.00, 'pending', 'credit_card', gen_random_uuid()),
('11111111-1111-1111-1111-111111111111', 349.00, 'completed', 'credit_card', gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Ajouter quelques réservations de test
DO $$
DECLARE
    offer_record RECORD;
    transaction_record RECORD;
BEGIN
    -- Récupérer la première offre disponible
    SELECT id INTO offer_record FROM offers LIMIT 1;
    
    -- Récupérer une transaction complétée de l'utilisateur test
    SELECT id INTO transaction_record 
    FROM transactions 
    WHERE user_id = '22222222-2222-2222-2222-222222222222' 
    AND status = 'completed' 
    LIMIT 1;
    
    -- Insérer la réservation si les données existent
    IF offer_record.id IS NOT NULL AND transaction_record.id IS NOT NULL THEN
        INSERT INTO reservations (user_id, offer_id, quantity, transaction_id) 
        VALUES (
            '22222222-2222-2222-2222-222222222222',
            offer_record.id,
            1,
            transaction_record.id
        )
        ON CONFLICT DO NOTHING;
        
        -- Créer un e-ticket pour cette réservation
        INSERT INTO e_tickets (reservation_id, qr_code_url, is_used)
        SELECT 
            r.id,
            'test-qr-code-' || r.id,
            false
        FROM reservations r
        WHERE r.user_id = '22222222-2222-2222-2222-222222222222'
        AND r.offer_id = offer_record.id
        AND r.transaction_id = transaction_record.id
        ON CONFLICT DO NOTHING;
    END IF;
END $$;