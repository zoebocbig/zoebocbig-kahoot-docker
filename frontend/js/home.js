const form = document.getElementById("joinForm");
const message = document.getElementById("message");

const API_URL = "http://localhost:5000/api"; // changer selon ton setup

document.addEventListener("DOMContentLoaded", () => {
    // ---------------- Formulaire rejoindre quiz ----------------
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // empêcher le reload de page
        const roomCode = document.getElementById("roomCode").value.trim();
        if (!roomCode) {
            message.textContent = "Entrez un code PIN";
            return;
        }

        try {
            const res = await fetch(`${API_URL}/join-quiz`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: roomCode })
            });
            const data = await res.json();

            if (data.success) {
                message.textContent = "Quiz trouvé !";
                // Redirection vers la page jouer.html avec le PIN
                window.location.href = `/jouer.html?pin=${roomCode}`;
            } else {
                message.textContent = "PIN invalide";
            }
        } catch (err) {
            message.textContent = "Serveur indisponible";
            console.error(err);
        }
    });


    // ---------------- Bouton "Compte" ----------------
    const creatorBtn = document.getElementById("creatorBtn");
    if (creatorBtn) {
        creatorBtn.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }
});