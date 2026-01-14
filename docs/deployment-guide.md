# Guide de Déploiement - Kemet Assistant

Ce guide couvre plusieurs méthodes de déploiement pour mettre Kemet Assistant en production sur un serveur.

---

## 📋 Prérequis

Avant de déployer, assurez-vous d'avoir :

- ✅ Compte LiveKit Cloud ([cloud.livekit.io](https://cloud.livekit.io))
- ✅ Clé API xAI ([console.x.ai](https://console.x.ai))
- ✅ (Optionnel) Projet Supabase configuré
- ✅ Serveur avec accès SSH (VPS, EC2, etc.)

---

## 🚀 Méthode 1 : Déploiement Docker (Recommandé)

### Avantages
- ✅ Simple et portable
- ✅ Isolation complète
- ✅ Facile à mettre à jour
- ✅ Fonctionne partout (VPS, cloud, local)

### Étapes

#### 1. Préparer le serveur

```bash
# Se connecter au serveur
ssh user@your-server.com

# Installer Docker si nécessaire
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

#### 2. Cloner le projet

```bash
git clone https://github.com/Meric-BG/SoftRide.git
cd SoftRide
git checkout Kemet_Assistant
```

#### 3. Configurer l'environnement

```bash
# Copier le template
cp .env.production .env

# Éditer avec vos vraies clés
nano .env
```

Remplissez avec vos credentials :
```bash
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
XAI_API_KEY=your-xai-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

#### 4. Lancer l'assistant

```bash
# Build et démarrage
docker compose up -d

# Vérifier les logs
docker compose logs -f kemet-assistant
```

✅ **Sortie attendue** :
```
INFO:grok-assistant:Starting job for room: ...
INFO:grok-assistant:Connected to Supabase.
INFO:grok-assistant:Agent is running...
```

#### 5. Gestion du conteneur

```bash
# Voir l'état
docker compose ps

# Redémarrer
docker compose restart

# Arrêter
docker compose down

# Mettre à jour après un git pull
docker compose up -d --build
```

---

## 🖥️ Méthode 2 : Déploiement VPS avec systemd

### Avantages
- ✅ Contrôle total
- ✅ Pas de surcharge Docker
- ✅ Intégration native avec le système

### Étapes

#### 1. Préparer le serveur

```bash
# Se connecter
ssh user@your-server.com

# Installer Python 3.11+
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

#### 2. Créer l'utilisateur et le répertoire

```bash
# Créer utilisateur dédié
sudo useradd -m -s /bin/bash kemet

# Créer le répertoire d'installation
sudo mkdir -p /opt/kemet-assistant
sudo chown kemet:kemet /opt/kemet-assistant

# Basculer sur l'utilisateur
sudo su - kemet
cd /opt/kemet-assistant
```

#### 3. Cloner et installer

```bash
# Cloner le projet
git clone https://github.com/Meric-BG/SoftRide.git .
git checkout Kemet_Assistant

# Créer environnement virtuel
python3.11 -m venv venv
source venv/bin/activate

# Installer dépendances
pip install -r requirements.txt
```

#### 4. Configurer l'environnement

```bash
# Copier et éditer .env
cp .env.production .env
nano .env
```

#### 5. Installer le service systemd

```bash
# Revenir en root
exit

# Copier le fichier service
sudo cp /opt/kemet-assistant/deploy/systemd/kemet-assistant.service /etc/systemd/system/

# Recharger systemd
sudo systemctl daemon-reload

# Activer le service au démarrage
sudo systemctl enable kemet-assistant

# Démarrer le service
sudo systemctl start kemet-assistant
```

#### 6. Vérifier et gérer le service

```bash
# Voir le statut
sudo systemctl status kemet-assistant

# Voir les logs en temps réel
sudo journalctl -u kemet-assistant -f

# Redémarrer
sudo systemctl restart kemet-assistant

# Arrêter
sudo systemctl stop kemet-assistant
```

---

## ☁️ Méthode 3 : Déploiement Cloud Platform

### Option A : Render.com

1. Créer un compte sur [render.com](https://render.com)
2. Connecter votre repo GitHub
3. Créer un **Background Worker**
4. Configurer :
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python assitant.py dev`
5. Ajouter les variables d'environnement dans le dashboard
6. Déployer !

### Option B : Railway.app

1. Créer un compte sur [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Sélectionner le repo `SoftRide`
4. Ajouter les variables d'environnement
5. Railway détectera automatiquement le Dockerfile

### Option C : Fly.io

```bash
# Installer flyctl
curl -L https://fly.io/install.sh | sh

# Se connecter
flyctl auth login

# Dans le répertoire du projet
flyctl launch

# Configurer les secrets
flyctl secrets set XAI_API_KEY=your-key
flyctl secrets set LIVEKIT_URL=wss://...
flyctl secrets set LIVEKIT_API_KEY=...
flyctl secrets set LIVEKIT_API_SECRET=...

# Déployer
flyctl deploy
```

---

## 🧪 Tester le déploiement

### 1. Vérifier que l'assistant tourne

**Docker** :
```bash
docker compose logs kemet-assistant | grep "Assistant is running"
```

**Systemd** :
```bash
sudo journalctl -u kemet-assistant | grep "Assistant is running"
```

### 2. Se connecter via LiveKit Playground

1. Ouvrir [agents-playground.livekit.io](https://agents-playground.livekit.io/)
2. Entrer vos credentials LiveKit
3. Cliquer sur "Connect"
4. Parler : "Hey Kemet, what's up?"
5. ✅ Vous devriez entendre une réponse avec sa personnalité !

### 3. Tester les outils

Dire :
- "What's my battery level?"
- "Turn on the AC"
- "Is my car locked?"

✅ Kemet devrait exécuter les fonctions et répondre

---

## 📊 Monitoring et Logs

### Logs Docker

```bash
# Logs en temps réel
docker compose logs -f kemet-assistant

# Dernières 100 lignes
docker compose logs --tail=100 kemet-assistant

# Logs depuis une date
docker compose logs --since="2026-01-14T17:00:00" kemet-assistant
```

### Logs systemd

```bash
# Logs en temps réel
sudo journalctl -u kemet-assistant -f

# Dernière heure
sudo journalctl -u kemet-assistant --since "1 hour ago"

# Erreurs uniquement
sudo journalctl -u kemet-assistant -p err
```

### Métriques

```bash
# Docker - Utilisation ressources
docker stats kemet-assistant

# Systemd - Info sur le processus
systemctl status kemet-assistant
```

---

## 🔧 Dépannage

### Problème : "SSL Certificate Error"

**Solution** : Le code inclut déjà un workaround. Si persistant :
```python
# Dans assitant.py, le SSL est déjà configuré :
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE
```

### Problème : "Connection to LiveKit failed"

**Vérifications** :
1. LIVEKIT_URL correcte (commence par `wss://`)
2. API Key et Secret valides
3. Pas de firewall bloquant les connexions WebSocket
4. Le serveur a accès à internet

### Problème : "Module not found"

```bash
# Docker : rebuild
docker compose up -d --build

# Systemd : réinstaller
source /opt/kemet-assistant/venv/bin/activate
pip install -r requirements.txt --upgrade
sudo systemctl restart kemet-assistant
```

### Problème : Assistant crash au démarrage

```bash
# Vérifier les logs détaillés
# Docker
docker compose logs kemet-assistant | tail -50

# Systemd
sudo journalctl -u kemet-assistant -n 50

# Causes communes :
# - Variables d'environnement manquantes
# - Mauvaises credentials
# - Problème réseau
```

### Problème : Pas de réponse vocale

**Vérifications** :
1. LiveKit Playground connecté correctement
2. Micro autorisé dans le navigateur
3. Logs de l'assistant montrent bien les messages reçus
4. xAI API Key valide et avec crédit

---

## 🔒 Sécurité Production

### Recommandations

1. **Variables d'environnement** : Ne jamais commit `.env` dans git
   ```bash
   # Vérifier que .env est dans .gitignore
   cat .gitignore | grep .env
   ```

2. **Firewall** : Autoriser uniquement SSH et le port LiveKit si nécessaire
   ```bash
   sudo ufw allow ssh
   sudo ufw enable
   ```

3. **Mises à jour** : Garder le système à jour
   ```bash
   sudo apt update && sudo apt upgrade
   ```

4. **Backups** : Sauvegarder régulièrement la config
   ```bash
   # Backup de .env (chiffré)
   tar czf kemet-backup-$(date +%F).tar.gz .env
   ```

5. **Monitoring** : Configurer des alertes (Uptime Robot, etc.)

---

## 🚀 Mises à jour

### Mettre à jour le code

#### Docker
```bash
cd /path/to/SoftRide
git pull origin Kemet_Assistant
docker compose up -d --build
```

#### Systemd
```bash
sudo su - kemet
cd /opt/kemet-assistant
git pull origin Kemet_Assistant
source venv/bin/activate
pip install -r requirements.txt --upgrade
exit
sudo systemctl restart kemet-assistant
```

---

## 📈 Scaling (Pour plus tard)

Quand vous aurez beaucoup d'utilisateurs :

1. **Multi-instances** : Lancer plusieurs conteneurs
2. **Load Balancer** : Répartir la charge
3. **Auto-scaling** : Kubernetes ou Docker Swarm
4. **Monitoring avancé** : Prometheus + Grafana

---

## 🆘 Support

**Problèmes courants** :
- Consulter cette documentation
- Vérifier les logs
- Tester en local d'abord

**Communauté** :
- [LiveKit Discord](https://livekit.io/discord)
- [GitHub Issues](https://github.com/Meric-BG/SoftRide/issues)

---

## ✅ Checklist de déploiement

Avant de mettre en production :

- [ ] Credentials LiveKit configurées
- [ ] xAI API Key ajoutée
- [ ] Supabase configuré (optionnel)
- [ ] Tests en local réussis
- [ ] .env configuré sur le serveur
- [ ] Service démarré (Docker ou systemd)
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Test vocal réussi depuis LiveKit Playground
- [ ] Monitoring configuré
- [ ] Backups configurés

---

**Kemet Assistant est maintenant en production !** 🎉🚗⚡
