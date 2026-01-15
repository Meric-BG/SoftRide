-- 1. Policies pour permettre aux ADMINS de gérer les Mises à jour
-- (Permet INSERT, UPDATE, DELETE si le rôle est 'ADMIN')
CREATE POLICY "Admins manage updates" ON public.software_updates
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- 2. Policies pour permettre aux ADMINS de gérer le Magasin
CREATE POLICY "Admins manage features" ON public.store_features
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- 3. COMMANDE DE SECOURS : S'assurer que votre utilisateur est bien ADMIN
-- Remplacez 'votre-email@gmail.com' par l'email avec lequel vous êtes connecté sur kemet-manager
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'kemetmanager@gmail.com'; -- Ou votre email actuel
