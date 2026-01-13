# Guide de Test - Kemet Platform

## Vue d'ensemble

Ce guide vous permet de tester l'intégration complète entre les frontends (My Kemet et Kemet Manager) et le backend Supabase, notamment le système FOTA (Firmware Over-The-Air).

## Prérequis

### 1. Démarrer le Backend
```bash
cd /home/mericstudent/softride
node backend/src/server.js
```
✅ Backend disponible sur: **http://localhost:5001**

### 2. Démarrer My Kemet (User App)
```bash
cd apps/my-kemet
npm run dev
```
✅ App disponible sur: **http://localhost:3000**

### 3. Démarrer Kemet Manager (Admin)
```bash
cd apps/kemet-manager
npm run dev
```
✅ App disponible sur: **http://localhost:3002**

## Comptes de Test

### Utilisateur
- **Email**: `meric@kemet.com`
- **Password**: `password`
- **Véhicule**: Gezo (VIN: GEZO001KM2026)

### Administrateur
- **Email**: `admin@kemet.com`
- **Password**: `password`

## Scénario de Test Complet: Publication et Installation FOTA

### Étape 1: Admin Publie une Mise à Jour

1. Ouvrez **Kemet Manager** (http://localhost:3002)
2. Connectez-vous avec le compte admin
3. Naviguez vers **Mises à jour** (Updates)
4. Remplissez le formulaire:
   - **Version**: `2.5.0`
   - **Notes**: 
     ```
     - Amélioration de la gestion batterie
     - Nouveau mode Eco+
     - Corrections de bugs
     ```
   - **Cible**: Flotte complète
5. Cliquez sur **"Lancer le déploiement"**
6. ✅ Vérifiez le message de succès

**Résultat attendu**: Une nouvelle campagne FOTA est créée dans Supabase.

### Étape 2: User Voit la Mise à Jour

1. Ouvrez **My Kemet** (http://localhost:3000)
2. Connectez-vous avec le compte utilisateur
3. Naviguez vers **Mises à jour**
4. ✅ Vous devriez voir la mise à jour v2.5.0 disponible

**Résultat attendu**: La mise à jour publiée par l'admin apparaît dans la liste.

### Étape 3: User Installe la Mise à Jour

1. Sur la page Mises à jour de My Kemet
2. Cliquez sur **"Installer"** pour la version 2.5.0
3. ✅ Attendez 2 secondes (simulation d'installation)
4. ✅ Vérifiez le message de succès

**Résultat attendu**: Message "Mise à jour vers 2.5.0 installée avec succès !"

### Étape 4: Vérification dans Supabase

1. Ouvrez le Dashboard Supabase: https://zjjkfjxhzqnagasufeok.supabase.co
2. Allez dans **Table Editor** → `fota_campaigns`
3. ✅ Vérifiez que la campagne v2.5.0 existe
4. Allez dans **Table Editor** → `vehicles`
5. ✅ Vérifiez que `last_connected` a été mis à jour

## Tests Supplémentaires

### Test 2: Contrôle Véhicule

**My Kemet:**
1. Sur le Dashboard
2. Testez les contrôles:
   - ✅ Verrouiller/Déverrouiller
   - ✅ Climatisation On/Off
   - ✅ Port de charge

**Vérification Backend:**
```bash
curl http://localhost:5001/api/vehicles/v1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Achat de Feature

**My Kemet:**
1. Naviguez vers **Store**
2. Sélectionnez une feature (ex: Mode Sentinelle)
3. Cliquez sur **"Acheter"**
4. ✅ Vérifiez le message de succès

**Vérification Supabase:**
- Table `subscriptions` → Nouvelle ligne créée
- Table `feature_activations` → Feature activée

### Test 4: Analytics Admin

**Kemet Manager:**
1. Dashboard principal
2. ✅ Vérifiez les KPIs:
   - Revenu total
   - Flotte active
   - Ventes Store
3. ✅ Vérifiez le graphique de revenus
4. ✅ Vérifiez "Top Ventes"

## Vérification des Données

### Via API (curl)

#### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"meric@kemet.com","password":"password"}'
```

#### Voir les mises à jour disponibles
```bash
curl http://localhost:5001/api/updates/available/v1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Publier une mise à jour (Admin)
```bash
curl -X POST http://localhost:5001/api/updates/deploy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"version":"2.6.0","notes":"Test update"}'
```

### Via Supabase Dashboard

1. **Table `fota_campaigns`**: Voir toutes les campagnes
2. **Table `vehicles`**: État des véhicules
3. **Table `subscriptions`**: Abonnements actifs
4. **Vue `revenue_analytics_view`**: Analytics en temps réel

## Résolution de Problèmes

### Erreur "Token invalide"
- Reconnectez-vous
- Vérifiez que le backend est démarré

### Erreur "Véhicule non trouvé"
- Vérifiez que la migration Supabase a réussi
- Exécutez: `node backend/src/scripts/migrate-to-supabase.js`

### Mises à jour non visibles
- Vérifiez que la campagne a le statut `COMPLETED` dans Supabase
- Rechargez la page

### CORS Error
- Vérifiez que le backend autorise `localhost:3000` et `localhost:3002`
- Voir `backend/src/server.js` ligne 14-16

## Checklist de Test

- [ ] Backend démarré (port 5001)
- [ ] My Kemet démarré (port 3000)
- [ ] Kemet Manager démarré (port 3002)
- [ ] Login utilisateur fonctionne
- [ ] Login admin fonctionne
- [ ] Admin peut publier une mise à jour
- [ ] User voit les mises à jour disponibles
- [ ] User peut installer une mise à jour
- [ ] Contrôles véhicule fonctionnent
- [ ] Achat de feature fonctionne
- [ ] Analytics admin affichent des données réelles

## Support

Pour plus d'informations:
- **API Documentation**: `docs/api-documentation.md`
- **Supabase Guide**: `docs/supabase-integration.md`
- **Backend Features**: `docs/backend-features.md`
