const form = document.getElementById("joinForm");
const joinBtn = document.getElementById("joinBtn");
const message = document.getElementById("message");

const API_URL = "http://localhost:5000/api"; // changer selon ton setup

joinBtn.addEventListener("click", async () => {
    const roomCode = document.getElementById("roomCode").value.trim();
    if (!roomCode) return message.textContent = "Entrez un code PIN";

    try {
        const res = await fetch(`${API_URL}/join-quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin: roomCode })
        });
        const data = await res.json();

        if (data.success) {
            message.textContent = "Quiz trouvé !";
            window.location.href = `/quiz.html?pin=${roomCode}`;
        } else {
            message.textContent = "PIN invalide";
        }
    } catch (err) {
        message.textContent = "Serveur indisponible";
        console.error(err);
    }
});

// Bouton "Créer" => accès libre à creerquiz.html
document.getElementById("createBtn")?.addEventListener("click", () => {
    window.location.href = "creerquiz.html";
});

// Bouton "Apprentissage"
document.querySelector(".learn")?.addEventListener("click", () => {
    window.location.href = "learn.html";
});

// Bouton "Compte"
document.getElementById("creatorBtn")?.addEventListener("click", () => {
    window.location.href = "login.html";
});