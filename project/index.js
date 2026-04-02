import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const PORT = process.env.PORT || 3000;

function calculerCommissions(prixMedicament, prixLivraison) {
  const commissionMedicament = prixMedicament * 0.05;
  const commissionLivreur = prixLivraison * 0.10;
  const totalClient = prixMedicament + prixLivraison;
  const gainPlateforme = commissionLivreur;

  return {
    commissionMedicament,
    commissionLivreur,
    totalClient,
    gainPlateforme
  };
}

app.post('/commande', async (req, res) => {
  try {
    const { medicament, prixMedicament, prixLivraison, client } = req.body;

    if (!medicament || !prixMedicament || !prixLivraison || !client) {
      return res.status(400).json({
        error: 'Tous les champs sont requis: medicament, prixMedicament, prixLivraison, client'
      });
    }

    const commissions = calculerCommissions(prixMedicament, prixLivraison);

    const { data, error } = await supabase
      .from('commandes')
      .insert([{
        medicament,
        prix_medicament: prixMedicament,
        prix_livraison: prixLivraison,
        commission_medicament: commissions.commissionMedicament,
        commission_livraison: commissions.commissionLivreur,
        total_client: commissions.totalClient,
        gain_plateforme: commissions.gainPlateforme,
        client,
        statut: 'en attente pharmacie'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Commande créée avec succès',
      commande: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/commandes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('commandes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      total: data.length,
      commandes: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/valider', async (req, res) => {
  try {
    const { commandeId, pharmacie } = req.body;

    if (!commandeId) {
      return res.status(400).json({ error: 'commandeId est requis' });
    }

    const { data: commande, error: fetchError } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', commandeId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (commande.statut !== 'en attente pharmacie') {
      return res.status(400).json({
        error: `La commande doit être "en attente pharmacie" (statut actuel: ${commande.statut})`
      });
    }

    const { data, error } = await supabase
      .from('commandes')
      .update({
        statut: 'en attente paiement',
        pharmacie: pharmacie || 'Pharmacie acceptée',
        updated_at: new Date().toISOString()
      })
      .eq('id', commandeId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Commande validée par la pharmacie',
      commande: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/paiement', async (req, res) => {
  try {
    const { commandeId } = req.body;

    if (!commandeId) {
      return res.status(400).json({ error: 'commandeId est requis' });
    }

    const { data: commande, error: fetchError } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', commandeId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (commande.statut !== 'en attente paiement') {
      return res.status(400).json({
        error: `La commande doit être "en attente paiement" (statut actuel: ${commande.statut})`
      });
    }

    const { data, error } = await supabase
      .from('commandes')
      .update({
        statut: 'payé',
        updated_at: new Date().toISOString()
      })
      .eq('id', commandeId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Paiement validé avec succès',
      commande: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/livreur', async (req, res) => {
  try {
    const { commandeId, livreur } = req.body;

    if (!commandeId || !livreur) {
      return res.status(400).json({ error: 'commandeId et livreur sont requis' });
    }

    const { data: commande, error: fetchError } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', commandeId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (commande.statut !== 'payé') {
      return res.status(400).json({
        error: `La commande doit être "payé" avant assignation (statut actuel: ${commande.statut})`
      });
    }

    const { data, error } = await supabase
      .from('commandes')
      .update({
        statut: 'en livraison',
        livreur,
        updated_at: new Date().toISOString()
      })
      .eq('id', commandeId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Livreur assigné avec succès',
      commande: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/livraison', async (req, res) => {
  try {
    const { commandeId } = req.body;

    if (!commandeId) {
      return res.status(400).json({ error: 'commandeId est requis' });
    }

    const { data: commande, error: fetchError } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', commandeId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (commande.statut !== 'en livraison') {
      return res.status(400).json({
        error: `La commande doit être "en livraison" (statut actuel: ${commande.statut})`
      });
    }

    const { data, error } = await supabase
      .from('commandes')
      .update({
        statut: 'livrée',
        updated_at: new Date().toISOString()
      })
      .eq('id', commandeId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Livraison confirmée avec succès',
      commande: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/commande/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur Pharmu API',
    endpoints: {
      'POST /commande': 'Créer une nouvelle commande',
      'GET /commandes': 'Lister toutes les commandes',
      'GET /commande/:id': 'Obtenir une commande spécifique',
      'POST /valider': 'Pharmacie valide la commande',
      'POST /paiement': 'Valider le paiement',
      'POST /livreur': 'Assigner un livreur',
      'POST /livraison': 'Confirmer la livraison'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Pharmu API démarrée sur le port ${PORT}`);
});
