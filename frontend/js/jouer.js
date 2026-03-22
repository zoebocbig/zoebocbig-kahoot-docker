document.addEventListener('DOMContentLoaded', async () => {
    const pin = new URLSearchParams(window.location.search).get('pin');

    const quizContainer = document.getElementById('quizContainer');
    const leaderboardDiv = document.getElementById('leaderboard');

    const name = prompt("Pseudo ?");
    if (!name) return location.href = "/";

    const socket = io();

    const res = await fetch("/api/join-quiz", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ pin })
    });

    const quiz = (await res.json()).quiz;

    socket.emit("join", {
        pin,
        name,
        max_players: quiz.max_players
    });

    socket.on("players_update", (players) => {
        leaderboardDiv.innerHTML = "<h3>Joueurs</h3>" + players.map(p => `<p>${p}</p>`).join("");
    });

    socket.on("quiz_start", () => {
        startQuiz();
    });

    socket.on("leaderboard", (players) => {
        leaderboardDiv.innerHTML = "<h3>Classement</h3>" +
            players.map((p,i)=>`<p>${i+1}. ${p.name} - ${p.score}</p>`).join("");
    });

    let current = 0;
    let score = 0;

    function startQuiz() {
        showQuestion();
    }

    function showQuestion() {
        if (current >= quiz.questions.length) {
            quizContainer.innerHTML = `<h2>Score: ${score}</h2>`;
            return;
        }

        const q = quiz.questions[current];

        quizContainer.innerHTML = `
            <h2>${q.question}</h2>
            <div id="answers"></div>
        `;

        const div = document.getElementById("answers");

        q.answers.forEach(a => {
            const btn = document.createElement("button");
            btn.textContent = a.text;

            btn.onclick = () => {
                let pts = a.correct ? q.points : 0;
                score += pts;

                socket.emit("answer", { pin, name, points: pts });

                current++;
                showQuestion();
            };

            div.appendChild(btn);
        });
    }
});