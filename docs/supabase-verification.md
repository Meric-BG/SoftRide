# Vérification de la Connexion Supabase

## Test de Connexion Backend → Supabase

### 1. Test de Login (Auth)
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"meric@kemet.com","password":"password"}'
```

**Résultat attendu :** Token JWT + données utilisateur

### 2. Test de Récupération des Features (Store)
```bash
curl http://localhost:5001/api/store/features
```

**Résultat attendu :** Liste des 4 features de la base Supabase

### 3. Test de Récupération des Mises à Jour (FOTA)
```bash
curl http://localhost:5001/api/updates
```

**Résultat attendu :** Liste des 3 campagnes FOTA de Supabase

### 4. Vérification Directe dans Supabase

1. Ouvrez https://zjjkfjxhzqnagasufeok.supabase.co
2. Allez dans **Table Editor**
3. Vérifiez les tables :
   - `users` → 2 lignes (meric@kemet.com, admin@kemet.com)
   - `vehicles` → 2 lignes
   - `features` → 4 lignes
   - `fota_campaigns` → 3+ lignes (selon les tests)

## Confirmation

✅ **OUI, le backend est connecté à Supabase**

Toutes les routes utilisent `supabaseDB.js` qui fait des requêtes SQL via le client Supabase :
- Auth routes → Table `users`
- Vehicle routes → Table `vehicles`
- Store routes → Tables `features`, `subscriptions`
- Updates routes → Table `fota_campaigns`
- Analytics routes → Vues SQL `revenue_analytics_view`, `vehicle_status_view`

## Preuve de Connexion

Le fichier `backend/src/models/supabaseDB.js` utilise :
```javascript
const supabase = require('../config/supabase');
// ...
await supabase.from('users').select('*')
```

Toutes les données sont stockées dans PostgreSQL via Supabase, pas en JSON local.
