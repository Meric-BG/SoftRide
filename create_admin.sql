-- ACTIVEZ L'EXTENSION pgcrypto SI CE N'EST PAS DÉJÀ FAIT
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CRÉATION DE L'UTILISATEUR ADMIN
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- instance_id (par défaut pour Supabase local/hosted)
  gen_random_uuid(), -- id
  'authenticated', -- aud
  'authenticated', -- role
  'kemetmanager@gmail.com', -- email
  crypt('password', gen_salt('bf')), -- mot de passe chiffré
  now(), -- email_confirmed_at (auto-confirmé)
  now(), -- last_sign_in_at
  '{"provider": "email", "providers": ["email"]}', -- raw_app_meta_data
  '{}', -- raw_user_meta_data
  now(), -- created_at
  now(), -- updated_at
  '', -- confirmation_token
  '', -- email_change
  '', -- email_change_token_new
  '' -- recovery_token
);

-- OPTIONNEL : Si vous avez une table 'profiles' ou 'admins' liée, ajoutez l'insertion ici
-- INSERT INTO public.profiles (id, email, role) 
-- VALUES ((SELECT id FROM auth.users WHERE email = 'kemetmanager@gmail.com'), 'kemetmanager@gmail.com', 'admin');
