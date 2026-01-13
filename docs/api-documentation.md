# Kemet Backend API Documentation

## Démarrage Rapide

### 1. Lancer le serveur backend
```bash
cd /home/mericstudent/softride
npm run backend:dev
```

Le serveur démarre sur **http://localhost:5000**

### 2. Comptes de test

**Utilisateur:**
- Email: `meric@kemet.com`
- Password: `password`
- Véhicule: GEZO001KM2026

**Admin:**
- Email: `admin@kemet.com`
- Password: `password`

## Endpoints API

### Authentication

#### POST /api/auth/login
Connexion utilisateur/admin
```json
{
  "email": "meric@kemet.com",
  "password": "password"
}
```
**Réponse:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u1",
    "email": "meric@kemet.com",
    "name": "Méric",
    "role": "user",
    "vehicleId": "v1"
  }
}
```

#### POST /api/auth/register
Créer un nouveau compte
```json
{
  "email": "nouveau@kemet.com",
  "password": "motdepasse",
  "name": "Nouveau Utilisateur"
}
```

#### GET /api/auth/me
Obtenir le profil utilisateur (nécessite token)
```
Headers: Authorization: Bearer <token>
```

### Véhicules

#### GET /api/vehicles/:id
Obtenir les infos d'un véhicule
```
Headers: Authorization: Bearer <token>
```

#### POST /api/vehicles/:id/lock
Verrouiller/Déverrouiller
```json
{
  "locked": true
}
```

#### POST /api/vehicles/:id/climate
Contrôle climatisation
```json
{
  "climate": true
}
```

#### POST /api/vehicles/:id/charge
Contrôle port de charge
```json
{
  "charging": true
}
```

#### GET /api/vehicles/:id/features
Liste des features actives pour un véhicule

### Store

#### GET /api/store/features
Liste toutes les features disponibles

#### POST /api/store/purchase
Acheter une feature
```json
{
  "featureId": "f1",
  "vehicleId": "v1"
}
```

#### GET /api/store/purchases
Mes achats (nécessite token)

### Updates (FOTA)

#### GET /api/updates
Liste toutes les mises à jour

#### GET /api/updates/available/:vehicleId
Mises à jour disponibles pour un véhicule

#### POST /api/updates/deploy
Déployer une mise à jour (Admin uniquement)
```json
{
  "version": "2.5.0",
  "notes": "- Nouvelle feature\n- Corrections bugs",
  "targetVehicles": 1248
}
```

#### GET /api/updates/stats
Statistiques de fragmentation OS (Admin)

### Analytics (Admin uniquement)

#### GET /api/analytics/overview
Vue d'ensemble complète

#### GET /api/analytics/revenue
Statistiques de revenus

#### GET /api/analytics/fleet
Statistiques de la flotte

#### GET /api/analytics/top-sales
Top des ventes

## Intégration Frontend

### Exemple: Login depuis My Kemet

```typescript
// apps/my-kemet/src/lib/api.ts
const API_URL = 'http://localhost:5000/api';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

export async function getVehicle(vehicleId: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.json();
}
```

### Exemple: Contrôle véhicule

```typescript
export async function toggleLock(vehicleId: string, locked: boolean) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/vehicles/${vehicleId}/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ locked })
  });
  
  return response.json();
}
```

## Structure de la Base de Données

Fichier: `backend/src/models/db.json`

```json
{
  "users": [...],
  "vehicles": [...],
  "features": [...],
  "purchases": [...],
  "updates": [...],
  "analytics": {...}
}
```

## Prochaines Étapes

1. ✅ Backend API fonctionnel
2. ⏳ Intégrer l'API dans My Kemet (remplacer mock logic)
3. ⏳ Intégrer l'API dans Kemet Manager
4. ⏳ Ajouter WebSocket pour updates en temps réel
5. ⏳ Migration vers PostgreSQL (optionnel)
