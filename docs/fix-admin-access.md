# Fix Admin Access - Instructions

## Problème
L'interface Kemet Manager affiche "Accès refusé. Droits administrateur requis."

## Cause
Le token d'authentification stocké dans le navigateur a été créé avant la correction du rôle admin et ne contient pas le bon rôle.

## Solution

### Option 1: Vider le localStorage du navigateur (Recommandé)

1. Ouvrez Kemet Manager dans votre navigateur (http://localhost:3001)
2. Ouvrez les DevTools (F12 ou Ctrl+Shift+I)
3. Allez dans l'onglet **Console**
4. Tapez cette commande et appuyez sur Entrée:
   ```javascript
   localStorage.clear(); location.reload();
   ```
5. La page va se recharger et se reconnecter automatiquement avec le bon rôle admin

### Option 2: Navigation privée

1. Ouvrez une fenêtre de navigation privée (Ctrl+Shift+N sur Chrome/Edge)
2. Allez sur http://localhost:3001/updates
3. L'application devrait fonctionner correctement

### Option 3: Attendre le rechargement automatique

Le code frontend a été mis à jour pour détecter automatiquement un rôle incorrect et forcer une reconnexion. Cela devrait se produire automatiquement au prochain rechargement de la page.

## Vérification

Une fois le localStorage vidé, vous devriez pouvoir :
- ✅ Accéder à la page Updates sans erreur
- ✅ Remplir le formulaire de déploiement
- ✅ Publier une mise à jour FOTA

## Test Complet

```bash
# 1. Vérifier que le backend retourne le bon rôle
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kemet.com","password":"password"}' \
  | jq '.user.role'

# Résultat attendu: "admin"
```

Si le problème persiste après avoir vidé le localStorage, contactez le support.
