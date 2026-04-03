import express from "express";

const app = express();

app.use(express.json());

// ROUTE WEBHOOK
app.post("/webhook", (req, res) => {
  console.log("📩 Message reçu :", req.body);
  res.sendStatus(200);
});

// ROUTE TEST
app.get("/", (req, res) => {
  res.send("Serveur WhatsApp OK 🚀");
});

// LANCEMENT DU SERVEUR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur WhatsApp prêt sur le port ${PORT} 🚀`);
});
