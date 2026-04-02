import http from 'http';

const API_URL = 'http://localhost:3000';

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAPI() {
  console.log('Test du backend Pharmu\n');

  console.log('1. Création d\'une commande...');
  const nouvelleCommande = await makeRequest('POST', '/commande', {
    medicament: 'Doliprane 1000mg',
    prixMedicament: 5000,
    prixLivraison: 1000,
    client: 'Moussa Diallo'
  });
  console.log('Commande créée:', nouvelleCommande.commande.id);
  console.log('Statut:', nouvelleCommande.commande.statut);
  console.log('Total client:', nouvelleCommande.commande.total_client, 'FCFA');
  console.log('Gain plateforme:', nouvelleCommande.commande.gain_plateforme, 'FCFA\n');

  const commandeId = nouvelleCommande.commande.id;

  console.log('2. Validation par la pharmacie...');
  const validation = await makeRequest('POST', '/valider', {
    commandeId,
    pharmacie: 'Pharmacie Plateau'
  });
  console.log('Statut:', validation.commande.statut, '\n');

  console.log('3. Validation du paiement...');
  const paiement = await makeRequest('POST', '/paiement', {
    commandeId
  });
  console.log('Statut:', paiement.commande.statut, '\n');

  console.log('4. Assignation du livreur...');
  const assignation = await makeRequest('POST', '/livreur', {
    commandeId,
    livreur: 'Ibrahima Sarr'
  });
  console.log('Statut:', assignation.commande.statut);
  console.log('Livreur:', assignation.commande.livreur, '\n');

  console.log('5. Confirmation de livraison...');
  const livraison = await makeRequest('POST', '/livraison', {
    commandeId
  });
  console.log('Statut final:', livraison.commande.statut, '\n');

  console.log('6. Liste de toutes les commandes...');
  const commandes = await makeRequest('GET', '/commandes');
  console.log('Total de commandes:', commandes.total, '\n');

  console.log('Test terminé avec succès!');
}

testAPI().catch(console.error);
