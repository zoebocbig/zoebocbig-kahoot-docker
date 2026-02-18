const form = document.getElementById("joinForm");
const message = document.getElementById("message");

const API_URL = "http://backend:5000/api";
const API_KEY = "TA_CLE_API_ICI";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const roomCode = document.getElementById("roomCode").value;

    try {
        const res = await fetch(`${API_URL}/join-quiz`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify({
                username: "Player",
                roomCode: roomCode
            })
        });

        const data = await res.json();

        if (!res.ok) {
            message.textContent = data.message || "Erreur";
            return;
        }

        window.location.href = `/quiz.html?roomCode=${roomCode}`;

    } catch (err) {
        message.textContent = "Serveur indisponible";
        console.error(err);
    }

});

document.querySelector(".create").addEventListener("click", () => {
    window.location.href = "/creer.html";
});

document.querySelector(".learn").onclick = () => {
    window.location.href = "/learn.html";
};

document.getElementById("creatorBtn").addEventListener("click", () => {
    window.location.href = "login.html";
});

