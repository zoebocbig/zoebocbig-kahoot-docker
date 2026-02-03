// Import des modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Création de l'application Express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Clé API (à mettre plus tard dans .env)
const API_KEY = "TA_CLE_API_ICI";

// -----------------------------
// ROUTE : rejoindre un quiz
// -----------------------------
app.post("/api/join-quiz", (req, res) => {
    const { username, quizCode } = req.body;
    const apiKey = req.headers["x-api-key"];

    // Vérifie la clé API
    if (apiKey !== API_KEY) {
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

// ----------------------------------------
// ROUTE : créer une room depuis un document
// ----------------------------------------
app.post("/api/create-room-from-doc", (req, res) => {
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== API_KEY) {
        return res.status(403).json({ message: "Clé API invalide" });
    }

    // Exemple : données envoyées par le frontend
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "Questions invalides" });
    }

    // Génération d’un code de room simple
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("Création d'une room depuis document");
    console.log("Room:", roomCode);
    console.log("Questions:", questions);

    // Plus tard :
    // - sauvegarder la room
    // - sauvegarder les questions

    res.json({
        message: "Quiz créé avec succès",
        roomCode: roomCode
    });
});

// -----------------------------
// Démarrage du serveur
// -----------------------------
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend en écoute sur http://localhost:${PORT}`);
});
