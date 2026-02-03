const form = document.getElementById("createForm");
const message = document.getElementById("message");

const API_URL = "http://backend:5000/api";
const API_KEY = "TA_CLE_API_ICI";

form.addEventListener("submit", async (e) => {
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

        if (!res.ok) {
            message.style.color = "red";
            message.textContent = data.message;
            return;
        }

        message.style.color = "green";
        message.textContent = "Quiz créé avec succès 🎉";

        // Redirection vers le home après création
        setTimeout(() => {
            window.location.href = "/home.html";
        }, 1500);

    } catch (err) {
        message.style.color = "red";
        message.textContent = "Serveur indisponible";
        console.error(err);
    }
});
