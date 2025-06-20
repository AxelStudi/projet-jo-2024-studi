
-- Ajouter une politique pour permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Users can create their own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
