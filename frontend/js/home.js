const form = document.getElementById("quizForm");
const message = document.getElementById("message");

// Exemple d'URL backend (à adapter à ton Docker)
const API_URL = "http://localhost:3000/api/join-quiz";

// Exemple de clé API (NE PAS hardcoder en prod)
const API_KEY = "TA_CLE_API_ICI";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const quizCode = document.getElementById("quizCode").value;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify({
                username: username,
                quizCode: quizCode
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Erreur lors de l'inscription";
            return;
        }

        // Redirection vers la page du quiz
        window.location.href = `/quiz.html?quizCode=${quizCode}&username=${username}`;

    } catch (error) {
        message.textContent = "Impossible de contacter le serveur";
        console.error(error);
    }
});
