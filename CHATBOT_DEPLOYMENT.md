# Guide de Déploiement du Chatbot Kemet

## Prérequis

1. **Compte OpenAI** : Obtenez une clé API sur [platform.openai.com](https://platform.openai.com)
2. **Supabase CLI** : Installez globalement avec `npm install -g supabase`

## Étapes de Déploiement

### 1. Installation de Supabase CLI

```bash
npm install -g supabase
```

### 2. Connexion à Supabase

```bash
supabase login
```

### 3. Lier votre Projet

Récupérez votre `project-ref` depuis le dashboard Supabase (URL du projet), puis :

```bash
cd c:\Users\HP\Desktop\Projet\Kemet\SoftRide
supabase link --project-ref <your-project-ref>
```

### 4. Configurer la Clé OpenAI

```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 5. Déployer la Fonction

```bash
supabase functions deploy chat
```

### 6. Tester la Fonction

L'endpoint sera disponible à :
```
https://<your-project-ref>.supabase.co/functions/v1/chat
```

## Vérification

Une fois déployé, testez le chatbot dans l'application My Kemet :
1. Ouvrez `http://localhost:3001`
2. Cliquez sur le bouton flottant de l'Assistant Kemet
3. Posez une question (ex: "Comment recharger ma voiture ?")

## Coûts OpenAI

- **Modèle** : GPT-3.5-turbo
- **Coût estimé** : ~$0.002 par conversation (très faible)
- **Limite de tokens** : 300 tokens par réponse

## Troubleshooting

**Erreur "Not authenticated"** :
- Vérifiez que l'utilisateur est connecté dans l'application

**Erreur "Failed to get AI response"** :
- Vérifiez que la clé OpenAI est correcte
- Vérifiez que vous avez des crédits OpenAI disponibles

**CORS errors** :
- La fonction gère déjà les CORS, mais vérifiez que l'URL Supabase est correcte dans `.env.local`
