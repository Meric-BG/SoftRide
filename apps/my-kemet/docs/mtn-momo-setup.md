# Configuration MTN Mobile Money (Bénin)

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```env
# MTN Mobile Money API
MTN_MOMO_API_KEY=your_api_key_here
MTN_MOMO_API_USER=your_api_user_uuid_here
MTN_MOMO_SUBSCRIPTION_KEY=your_subscription_key_here
MTN_MOMO_ENVIRONMENT=sandbox
MTN_MOMO_CALLBACK_URL=http://localhost:3000/api/payments/momo/callback
```

## Obtenir les credentials MTN MoMo

### 1. Créer un compte développeur
- Visitez https://momodeveloper.mtn.com/
- Créez un compte développeur
- Souscrivez au produit "Collections" (pour recevoir des paiements)

### 2. Mode Sandbox
Pour tester en mode sandbox :

```bash
# Créer un API User (UUID)
curl -X POST https://sandbox.momodeveloper.mtn.com/v1_0/apiuser \
  -H "X-Reference-Id: YOUR_UUID_HERE" \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY" \
  -d '{"providerCallbackHost": "your-callback-url.com"}'

# Créer une API Key
curl -X POST https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/YOUR_UUID/apikey \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY"
```

### 3. Numéros de test (Sandbox)
En mode sandbox, utilisez ces numéros pour tester :
- **Succès** : +22997000001 à +22997000009
- **Échec** : +22997000010

## Utilisation dans le frontend

```typescript
// Exemple d'appel depuis le composant Store
async function handlePurchase(featureId: string, phoneNumber: string) {
  try {
    // Initier le paiement
    const response = await fetch('/api/payments/momo/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        featureId,
        vehicleId: 'VH001',
        userId: 'USR001',
        phoneNumber, // Format: +229XXXXXXXX
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Afficher message à l'utilisateur
      alert('Paiement envoyé ! Approuvez sur votre téléphone.');
      
      // Vérifier le statut toutes les 5 secondes
      const interval = setInterval(async () => {
        const statusResponse = await fetch(
          `/api/payments/momo/checkout?transactionId=${data.transactionId}`
        );
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'COMPLETED') {
          clearInterval(interval);
          alert('Paiement réussi ! Feature activée.');
        } else if (statusData.status === 'FAILED') {
          clearInterval(interval);
          alert('Paiement échoué.');
        }
      }, 5000);
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
}
```

## Format des numéros de téléphone

Le système accepte plusieurs formats :
- `+229XXXXXXXX` (recommandé)
- `00229XXXXXXXX`
- `229XXXXXXXX`
- `XXXXXXXX` (8 chiffres)

Tous seront normalisés en `229XXXXXXXX` pour l'API MTN.

## Webhooks (Production)

En production, configurez votre URL de callback dans le portail MTN :
1. Allez sur https://momodeveloper.mtn.com/
2. Configurez l'URL : `https://votre-domaine.com/api/payments/momo/callback`
3. MTN enverra des notifications POST à cette URL

## Sécurité

⚠️ **Important** :
- Ne commitez JAMAIS vos clés API dans Git
- Utilisez des variables d'environnement
- En production, validez l'origine des webhooks MTN
- Implémentez un système de retry pour les paiements échoués

## Montants et devises

- **Devise** : XOF (Franc CFA)
- **Montant minimum** : 100 XOF
- **Montant maximum** : Varie selon le compte utilisateur

## Support

- Documentation officielle : https://momodeveloper.mtn.com/api-documentation/
- Support MTN : support@momodeveloper.mtn.com
