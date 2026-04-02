# Pharmu Backend API

Plateforme de mise en relation entre clients, pharmacies et livreurs pour la livraison de médicaments à Dakar.

## Démarrage

```bash
npm install
npm start
```

Le serveur démarre sur le port 3000 par défaut.

## Flux de commande

1. **Création** → statut: `en attente pharmacie`
2. **Validation pharmacie** → statut: `en attente paiement`
3. **Paiement** → statut: `payé`
4. **Assignation livreur** → statut: `en livraison`
5. **Livraison** → statut: `livrée`

## Système de commission

- Le client paie: Prix médicament + Frais de livraison
- Le livreur paie à la plateforme: 10% des frais de livraison
- **gain_plateforme**: 10% des frais de livraison (commission du livreur)

## Endpoints

### POST /commande
Créer une nouvelle commande

**Body:**
```json
{
  "medicament": "Doliprane 1000mg",
  "prixMedicament": 5000,
  "prixLivraison": 1000,
  "client": "Moussa Diallo"
}
```

**Réponse:**
```json
{
  "message": "Commande créée avec succès",
  "commande": {
    "id": "uuid",
    "medicament": "Doliprane 1000mg",
    "prix_medicament": 5000,
    "prix_livraison": 1000,
    "commission_medicament": 250,
    "commission_livraison": 100,
    "total_client": 6000,
    "gain_plateforme": 350,
    "client": "Moussa Diallo",
    "statut": "en attente pharmacie",
    "created_at": "2026-04-02T..."
  }
}
```

### GET /commandes
Lister toutes les commandes

**Réponse:**
```json
{
  "total": 10,
  "commandes": [...]
}
```

### GET /commande/:id
Obtenir une commande spécifique

### POST /valider
Pharmacie valide la commande

**Body:**
```json
{
  "commandeId": "uuid",
  "pharmacie": "Pharmacie Plateau"
}
```

### POST /paiement
Valider le paiement (obligatoire avant assignation livreur)

**Body:**
```json
{
  "commandeId": "uuid"
}
```

### POST /livreur
Assigner un livreur (possible uniquement après paiement)

**Body:**
```json
{
  "commandeId": "uuid",
  "livreur": "Ibrahima Sarr"
}
```

### POST /livraison
Confirmer la livraison

**Body:**
```json
{
  "commandeId": "uuid"
}
```

## Exemple complet

```bash
# 1. Créer une commande
curl -X POST http://localhost:3000/commande \
  -H "Content-Type: application/json" \
  -d '{
    "medicament": "Paracétamol",
    "prixMedicament": 3000,
    "prixLivraison": 500,
    "client": "Fatou Sow"
  }'

# 2. Pharmacie valide
curl -X POST http://localhost:3000/valider \
  -H "Content-Type: application/json" \
  -d '{
    "commandeId": "uuid-de-la-commande",
    "pharmacie": "Pharmacie Medina"
  }'

# 3. Valider le paiement
curl -X POST http://localhost:3000/paiement \
  -H "Content-Type: application/json" \
  -d '{
    "commandeId": "uuid-de-la-commande"
  }'

# 4. Assigner un livreur
curl -X POST http://localhost:3000/livreur \
  -H "Content-Type: application/json" \
  -d '{
    "commandeId": "uuid-de-la-commande",
    "livreur": "Ousmane Diop"
  }'

# 5. Confirmer la livraison
curl -X POST http://localhost:3000/livraison \
  -H "Content-Type: application/json" \
  -d '{
    "commandeId": "uuid-de-la-commande"
  }'
```

## Prochaines étapes

- Intégration WhatsApp API
- Système de paiement (Wave, Orange Money)
- Application mobile pour livreurs et pharmacies
- Notifications en temps réel
