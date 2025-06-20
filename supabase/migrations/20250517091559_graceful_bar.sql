/*
  # Schéma initial pour le système de billetterie des JO Paris 2024

  1. Tables principales
    - `users` - Information utilisateurs avec leurs clés sécurisées
    - `offers` - Offres de billets (solo, duo, famille)
    - `reservations` - Réservations effectuées par les utilisateurs
    - `transactions` - Transactions de paiement
    - `e_tickets` - Billets électroniques avec codes QR
  
  2. Security
    - RLS activé sur toutes les tables
    - Politiques d'accès pour les utilisateurs authentifiés
    - Politiques d'accès pour les administrateurs
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  user_key UUID NOT NULL, -- Clé secrète pour la génération des e-tickets
  is_admin BOOLEAN DEFAULT false,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('solo', 'duo', 'family')),
  image_url TEXT,
  max_attendees INTEGER NOT NULL DEFAULT 1,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_key UUID NOT NULL, -- Clé secrète pour la génération des e-tickets
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  offer_id UUID NOT NULL REFERENCES offers(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create e-tickets table
CREATE TABLE IF NOT EXISTS e_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id),
  qr_code_url TEXT NOT NULL, -- Contient la clé concaténée (user_key + transaction_key)
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE e_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read/update their own data
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Offers can be viewed by anyone
CREATE POLICY "Offers are viewable by everyone"
  ON offers FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can manage offers
CREATE POLICY "Admins can manage offers"
  ON offers FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can view their own reservations
CREATE POLICY "Users can view their own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can view their own e-tickets
CREATE POLICY "Users can view their own e-tickets"
  ON e_tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE reservations.id = e_tickets.reservation_id
      AND reservations.user_id = auth.uid()
    )
  );

-- Admins can view all data
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can view all e-tickets"
  ON e_tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Insert default data

-- Create admin user (email: axel.chl28@gmail.com, password already set in client)
INSERT INTO users (id, email, first_name, last_name, user_key, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'axel.chl28@gmail.com',
  'Admin',
  'Olympique',
  gen_random_uuid(),
  true
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample offers
INSERT INTO offers (name, description, price, type, image_url, max_attendees, features)
VALUES
(
  'Pass Solo Découverte',
  'Accès pour une personne à une journée complète d''événements olympiques',
  99.00,
  'solo',
  'https://images.pexels.com/photos/2788488/pexels-photo-2788488.jpeg',
  1,
  ARRAY['Accès à tous les événements du jour', 'Programme officiel inclus', 'Accès prioritaire']
),
(
  'Pass Duo Premium',
  'Accès pour deux personnes avec des places privilégiées pour les finales',
  199.00,
  'duo',
  'https://images.pexels.com/photos/2408666/pexels-photo-2408666.jpeg',
  2,
  ARRAY['Places privilégiées pour les finales', 'Accès lounge VIP', 'Boissons incluses', 'Souvenirs exclusifs']
),
(
  'Pack Famille',
  'La solution idéale pour profiter des Jeux en famille, avec accès pour 4 personnes',
  349.00,
  'family',
  'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
  4,
  ARRAY['Accès pour 4 personnes', 'Réduction sur les produits officiels', 'Kit souvenir famille', 'Places regroupées garanties']
)
ON CONFLICT DO NOTHING;