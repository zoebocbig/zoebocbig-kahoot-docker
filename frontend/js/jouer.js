document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pin = urlParams.get("pin");

    if (!pin) {
        alert("PIN manquant !");
        return;
    }

    const pseudo = prompt("Entrez votre pseudo") || "Joueur";

    const socket = io("http://localhost:5000");

    // Rejoindre la salle
    socket.emit("join_room", { pin, pseudo });

    const lobbyDiv = document.getElementById("lobby");
    const quizDiv = document.getElementById("quiz");
    const startBtn = document.getElementById("startBtn");
    const leaderboardDiv = document.getElementById("leaderboard");

    lobbyDiv.style.display = "block";
    quizDiv.style.display = "none";

    // ---------------- MISE À JOUR SALLE D'ATTENTE ----------------
    socket.on("lobby_update", (data) => {
        lobbyDiv.innerHTML = `<h3>Joueurs (${data.players.length}/${data.max})</h3>`;
        data.players.forEach(p => {
            const pDiv = document.createElement("div");
            pDiv.textContent = p;
            lobbyDiv.appendChild(pDiv);
        });
    });

    // ---------------- LANCEMENT DU QUIZ ----------------
    socket.on("quiz_started", () => {
        lobbyDiv.style.display = "none";
        quizDiv.style.display = "block";
        alert("Le quiz commence !");
        // Ici tu peux ajouter le code pour afficher les questions
    });

    // ---------------- LEADERBOARD ----------------
    socket.on("leaderboard", (data) => {
        leaderboardDiv.innerHTML = "<h3>Classement</h3>";
        data.forEach(p => {
            const pDiv = document.createElement("div");
            pDiv.textContent = `${p.name} : ${p.score}`;
            leaderboardDiv.appendChild(pDiv);
        });
    });
});