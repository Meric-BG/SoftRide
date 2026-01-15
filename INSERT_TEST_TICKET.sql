-- INSERT A TEST TICKET TO VERIFY DISPLAY

INSERT INTO support_tickets (
    user_id, -- We will try to use the current user's ID if possible, but for a raw script we need a valid ID.
             -- Since we don't know the exact UUID, we might fail foreign key constraint if we guess.
             -- BETTER STRATEGY: Update the policy to be absolutely sure, then insert if empty.
    subject,
    description,
    type,
    status,
    priority
)
VALUES (
    auth.uid(), -- This only works if run via dashboard SQL editor while "impersonating" or if specific user ID is known. 
                -- FOR SAFTEY in SQL Editor: rely on the existing user or just ensure policies allow reading.
                -- actually auth.uid() might be null in SQL Editor.
    
    -- Let's just create a ticket linked to the first user found in auth.users
    (SELECT id FROM auth.users LIMIT 1),
    'Test Ticket Visibility',
    'Ceci est un ticket de test pour vérifier l''affichage dans Kemet Manager.',
    'SUPPORT',
    'OPEN',
    'HIGH'
);
