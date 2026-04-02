/*
  # Pharmu - Création de la table des commandes
  
  1. Nouvelle table
    - `commandes`
      - `id` (uuid, clé primaire)
      - `medicament` (text) - Nom du médicament
      - `prix_medicament` (numeric) - Prix du médicament
      - `prix_livraison` (numeric) - Frais de livraison
      - `commission_medicament` (numeric) - 5% du prix médicament
      - `commission_livraison` (numeric) - 10% du prix livraison
      - `total_client` (numeric) - Total à payer par le client
      - `gain_plateforme` (numeric) - Total des commissions
      - `client` (text) - Nom ou identifiant du client
      - `pharmacie` (text) - Nom de la pharmacie (optionnel)
      - `livreur` (text) - Nom du livreur (optionnel)
      - `statut` (text) - Statut de la commande
      - `created_at` (timestamptz) - Date de création
      - `updated_at` (timestamptz) - Date de dernière modification
  
  2. Sécurité
    - Active RLS sur la table `commandes`
    - Politique permettant la lecture publique (pour simplifier le développement initial)
    - Politique permettant la création publique
    - Politique permettant la mise à jour publique
  
  3. Notes importantes
    - Les commissions sont calculées automatiquement côté application
    - Les statuts possibles: "en attente pharmacie", "en attente paiement", "payé", "en livraison", "livrée"
    - Le paiement est obligatoire avant l'assignation d'un livreur
*/

CREATE TABLE IF NOT EXISTS commandes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicament text NOT NULL,
  prix_medicament numeric NOT NULL CHECK (prix_medicament >= 0),
  prix_livraison numeric NOT NULL CHECK (prix_livraison >= 0),
  commission_medicament numeric NOT NULL DEFAULT 0,
  commission_livraison numeric NOT NULL DEFAULT 0,
  total_client numeric NOT NULL DEFAULT 0,
  gain_plateforme numeric NOT NULL DEFAULT 0,
  client text NOT NULL,
  pharmacie text,
  livreur text,
  statut text NOT NULL DEFAULT 'en attente pharmacie',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permettre lecture publique des commandes"
  ON commandes FOR SELECT
  USING (true);

CREATE POLICY "Permettre création publique des commandes"
  ON commandes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permettre mise à jour publique des commandes"
  ON commandes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permettre suppression publique des commandes"
  ON commandes FOR DELETE
  USING (true);