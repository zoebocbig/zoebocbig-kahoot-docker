const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const API_KEY = "TA_CLE_API_ICI";

app.post("/api/join-quiz", (req, res) => {
    const { username, quizCode } = req.body;
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== API_KEY) {
        return res.status(403).json({ message: "Clé API invalide" });
    }

    if (!username || !quizCode) {
        return res.status(400).json({ message: "Pseudo et code du quiz requis" });
    }

    console.log(`Nouvel utilisateur: ${username}, Quiz: ${quizCode}`);

    res.json({ message: "Inscription réussie !" });
});

app.post("/api/create-room-from-doc", (req, res) => {
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== API_KEY) {
        return res.status(403).json({ message: "Clé API invalide" });
    }

    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "Questions invalides" });
    }

    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("Création d'une room depuis document");
    console.log("Room:", roomCode);
    console.log("Questions:", questions);


    res.json({
        message: "Quiz créé avec succès",
        roomCode: roomCode
    });
});

app.post("/api/save-quiz", (req, res) => {
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== API_KEY) {
        return res.status(403).json({ message: "Clé API invalide" });
    }

    const { title, type, questions } = req.body;

    if (!title || !type || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "Données du quiz invalides" });
    }

    console.log("Quiz à sauvegarder :");
    console.log("Titre:", title);
    console.log("Type:", type);
    console.log("Questions:", questions);


    res.json({ message: "Quiz reçu avec succès !" });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend en écoute sur http://localhost:${PORT}`);
});
