const message = document.getElementById("message");

const API_URL = "http://backend:5000/api"; // Docker Compose
const API_KEY = "TA_CLE_API_ICI";

// Créer un quiz
const createForm = document.getElementById("createForm");
createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const roomName = document.getElementById("roomName").value;
    const roomCode = document.getElementById("roomCode").value;

    try {
        const res = await fetch(`${API_URL}/create-room`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify({ roomName, roomCode })
        });
        const data = await res.json();
        message.style.color = res.ok ? "green" : "red";
        message.textContent = data.message;
    } catch (err) {
        message.style.color = "red";
        message.textContent = "Impossible de contacter le serveur";
        console.error(err);
    }
});

// Rejoindre un quiz
const joinForm = document.getElementById("joinForm");
joinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const roomCode = document.getElementById("joinCode").value;

    try {
        const res = await fetch(`${API_URL}/join-quiz`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify({ username, roomCode })
        });
        const data = await res.json();
        message.style.color = res.ok ? "green" : "red";
        message.textContent = data.message;

        if (res.ok) {
            // redirection vers la page quiz (à créer)
            window.location.href = `/quiz.html?roomCode=${roomCode}&username=${username}`;
        }
    } catch (err) {
        message.style.color = "red";
        message.textContent = "Impossible de contacter le serveur";
        console.error(err);
    }
});
