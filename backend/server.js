// Import des modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Création de l'application Express
const app = express();

// Middleware pour accepter les requêtes JSON
app.use(bodyParser.json());

// Autoriser le frontend (cors)
app.use(cors());

// Route pour joindre un quiz
app.post("/api/join-quiz", (req, res) => {
    const { username, quizCode } = req.body;
    const apiKey = req.headers["x-api-key"];

    // Vérifie la clé API
    if (apiKey !== "TA_CLE_API_ICI") {
        return res.status(403).json({ message: "Clé API invalide" });
    }

    // Vérifie les données
    if (!username || !quizCode) {
        return res.status(400).json({ message: "Pseudo et code du quiz requis" });
    }

    console.log(`Nouvel utilisateur: ${username}, Quiz: ${quizCode}`);

    // Réponse simulée
    res.json({ message: "Inscription réussie !" });
});

// Démarrage du serveur sur le port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend en écoute sur http://localhost:${PORT}`);
});
