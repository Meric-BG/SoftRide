# SoftRide - Système de Véhicule Connecté (SDV)

[Visitez Kemet Business](https://69696c34c37ea4b907f917f8--kemetbusiness.netlify.app)

Ce projet contient l'architecture de base de données pour le système SoftRide (Kemet Automotive).

## Intégration Supabase

Ce projet inclut un script automatisé pour déployer l'architecture de base de données sur Supabase.

### Prérequis
- Node.js installé
- Un projet Supabase créé

### Installation

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Configurez l'accès à Supabase :
   - Dupliquez le fichier `.env.example` en `.env`
   - Dans le tableau de bord Supabase, allez dans `Settings` > `Database` > `Connection string` > `Node.js`
   - Copiez la chaîne de connexion et coller-la dans votre fichier `.env` à la place de `DATABASE_URL`
   - **Important** : Remplacez `[YOUR-PASSWORD]` par votre véritable mot de passe de base de données.

### Déploiement

Lancez simplement la commande suivante :
```bash
node deploy_to_supabase.js
```

Le script se connectera à votre base de données et exécutera le fichier `soft_one.sql` pour créer toutes les tables.