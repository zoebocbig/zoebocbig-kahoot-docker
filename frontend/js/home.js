const form = document.getElementById("joinForm");
const message = document.getElementById("message");

const API_URL = "http://localhost:5000/api"; // changer selon ton setup

document.addEventListener("DOMContentLoaded", () => {
    // Formulaire rejoindre quiz
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
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

    // Bouton "Créer"
    document.getElementById("createBtn")?.addEventListener("click", () => {
        window.location.href = "creerquiz.html";
    });

    // Bouton "Apprentissage"
    document.querySelector(".learn")?.addEventListener("click", () => {
        window.location.href = "learn.html";
    });

    // Bouton "Compte"
    const creatorBtn = document.getElementById("creatorBtn");
    if (creatorBtn) {
        creatorBtn.addEventListener("click", () => {
            window.location.href = "login.html"; 
        });
    }
});