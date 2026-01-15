-- CRÉATION D'UNE VUE SÉCURISÉE POUR LES TICKETS + UTILISATEURS
-- Cela permet à Kemet Manager de voir l'email et le nom de l'utilisateur sans problèmes de jointure API.

CREATE OR REPLACE VIEW tickets_and_users AS
SELECT 
    st.id,
    st.user_id,
    st.vehicle_id,
    st.type,
    st.subject,
    st.description,
    st.status,
    st.priority,
    st.admin_notes,
    st.admin_id,
    st.resolved_at,
    st.ai_analysis,
    st.created_at,
    st.updated_at,
    au.email as user_email,
    au.raw_user_meta_data as user_metadata
FROM support_tickets st
JOIN auth.users au ON st.user_id = au.id;

-- Donner les accès à la vue (pour les users authentifiés comme le Manager)
GRANT SELECT ON tickets_and_users TO authenticated;
GRANT SELECT ON tickets_and_users TO service_role;
