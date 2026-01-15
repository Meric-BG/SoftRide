# Guide de Déploiement Vercel

Ce projet est structuré comme un monorepo contenant deux applications Next.js distinctes :
1. **my-kemet** : L'application client (Frontend).
2. **kemet-manager** : L'application de gestion (Dashboard).

Pour déployer ces applications sur Vercel, vous devez créer deux projets distincts dans Vercel, un pour chaque application, connectés au même dépôt Git.

## Prérequis

Assurez-vous d'avoir les variables d'environnement Supabase prêtes :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 1. Déployer `my-kemet` (Client App)

1. **Importez le dépôt** dans Vercel.
2. Lorsqu'on vous demande de configurer le projet :
   - **Nom du projet** : `my-kemet` (ou le nom de votre choix).
   - **Root Directory** (Répertoire racine) : Cliquez sur `Edit` et sélectionnez `apps/my-kemet`.
3. **Framework Preset** : Vercel devrait détecter automatiquement `Next.js`.
4. **Environment Variables** :
   Ajoutez les variables suivantes :
   - `NEXT_PUBLIC_SUPABASE_URL` : *Votre URL Supabase*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : *Votre clé Anon Supabase*
5. Cliquez sur **Deploy**.

**Note PWA** : Cette application est configurée comme une PWA (Progressive Web App). Vercel générera automatiquement les service workers lors du build de production.

---

## 2. Déployer `kemet-manager` (Admin Dashboard)

1. **Importez à nouveau le même dépôt** dans Vercel (Add New -> Project).
2. Configuration du projet :
   - **Nom du projet** : `kemet-manager` (ou le nom de votre choix).
   - **Root Directory** (Répertoire racine) : Cliquez sur `Edit` et sélectionnez `apps/kemet-manager`.
3. **Internal Settings** :
   - Assurez-vous que le framework est bien détecté comme `Next.js`.
   - La commande de build par défaut (`next build`) est correcte.
4. **Environment Variables** :
   Ajoutez les mêmes variables :
   - `NEXT_PUBLIC_SUPABASE_URL` : *Votre URL Supabase*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : *Votre clé Anon Supabase*
5. Cliquez sur **Deploy**.

---

## Dépannage

### Problèmes de dépendances
Si Vercel échoue à installer les dépendances pour l'une des applications :
- Vérifiez que le fichier `package-lock.json` est bien présent à la racine du monorepo.
- Vercel gère intelligemment les monorepos, mais assurez-vous de ne pas avoir ignoré le fichier lock dans `.vercelignore` ou `.gitignore` si vous l'avez modifié.

### Build Fail
Si le build échoue :
- Vérifiez les logs sur Vercel. Une erreur courante est liée aux types TypeScript stricts. Vous pouvez désactiver temporairement la vérification stricte lors du build en modifiant `next.config.mjs` (ignoreBuildErrors), mais il est recommandé de corriger les erreurs.
