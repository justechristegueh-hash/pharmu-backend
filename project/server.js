const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("Message reçu :", req.body);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Serveur WhatsApp prêt 🚀");
});
