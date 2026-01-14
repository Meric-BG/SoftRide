# Guide de Démarrage - Kemet (SoftRide)

Ce document explique comment démarrer les différents services du projet Kemet. Chaque service a été configuré sur un port unique pour éviter les conflits.

## Ports Utilisés
- **Backend API** : [http://localhost:5000](http://localhost:5000)
- **My-Kemet (Client)** : [http://localhost:3001](http://localhost:3001)
- **Kemet-Manager (Admin)** : [http://localhost:3002](http://localhost:3002)

---

## 1. Démarrage Tout-en-Un (Recommandé)
Pour démarrer tous les services simultanément dans un seul terminal :

```bash
npm run dev
```

---

## 2. Démarrage Séparé (Terminaux Multiples)
Si vous préférez contrôler chaque service individuellement, lancez ces commandes dans des terminaux séparés à la racine du projet :

### Backend
```bash
npm run backend
```

### My-Kemet (Customer UI)
```bash
npm run dev:my-kemet
```

### Kemet-Manager (Manager UI)
```bash
npm run dev:kemet-manager
```

---

## Notes Importantes
- **Environnement** : Les applications frontales sont configurées via des fichiers `.env.local` pour cibler automatiquement le backend sur le port 5000.
---

## Résolution des problèmes

### Erreur `EADDRINUSE` (Port déjà utilisé)
Si vous voyez une erreur comme `listen EADDRINUSE: address already in use :::5000`, cela signifie qu'un processus utilise déjà ce port.

**Solution rapide (Windows) :**
Ouvrez un terminal et tapez ces commandes pour libérer les ports :
```powershell
# Pour libérer le port 5000 (Backend)
stop-process -id (get-netstat -localport 5000).owningprocess -force

# Pour libérer le port 3001 (My-Kemet)
stop-process -id (get-netstat -localport 3001).owningprocess -force

# Pour libérer le port 3002 (Manager)
stop-process -id (get-netstat -localport 3002).owningprocess -force
```
*(Alternative simple : Redémarrez votre terminal ou utilisez le `Gestionnaire des tâches` pour arrêter les processus `Node.js`)*
