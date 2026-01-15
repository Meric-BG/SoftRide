# Supabase Edge Function: Chat

Assistant virtuel Kemet utilisant OpenAI GPT-3.5-turbo.

## Configuration

1. Installer Supabase CLI :
```bash
npm install -g supabase
```

2. Se connecter à Supabase :
```bash
supabase login
```

3. Lier votre projet :
```bash
supabase link --project-ref <your-project-ref>
```

4. Définir les secrets (variables d'environnement) :
```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key
```

5. Déployer la fonction :
```bash
supabase functions deploy chat
```

## Utilisation

L'endpoint sera disponible à :
```
https://<your-project-ref>.supabase.co/functions/v1/chat
```

### Exemple de requête :
```typescript
const { data: { session } } = await supabase.auth.getSession()

const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Comment recharger ma voiture ?' })
  }
)

const data = await response.json()
console.log(data.response)
```

## Fonctionnalités

- ✅ Authentification via Supabase Auth
- ✅ Contexte du véhicule de l'utilisateur
- ✅ Réponses en français
- ✅ Gestion des erreurs
- ✅ CORS configuré pour les appels depuis le frontend
