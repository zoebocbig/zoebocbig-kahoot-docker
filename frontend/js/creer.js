const button = document.getElementById("createBtn");
const message = document.getElementById("message");

const API_URL = "http://backend:5000/api";
const API_KEY = "TA_CLE_API_ICI";

button.addEventListener("click", async () => {
    try {
        const res = await fetch(`${API_URL}/create-room-from-doc`, {
            method: "POST",
            headers: {
                "x-api-key": API_KEY
            }
        });

        const data = await res.json();

        if (!res.ok) {
            message.style.color = "red";
            message.textContent = data.message;
            return;
        }

        message.style.color = "green";
        message.textContent = `Quiz créé ! Code : ${data.roomCode}`;


    } catch (err) {
        message.style.color = "red";
        message.textContent = "Serveur indisponible";
        console.error(err);
    }
});

document.getElementById("creerDoc").addEventListener("click", async () => {
    const response = await fetch("http://localhost:3000/api/create-room-from-doc", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": "TA_CLE_API_ICI"
        },
        body: JSON.stringify({
            questions: [
                { question: "Capitale de la France ?", answer: "Paris" },
                { question: "2 + 2 ?", answer: "4" }
            ]
        })
    });

    const data = await response.json();
    alert("Code du quiz : " + data.roomCode);
});
