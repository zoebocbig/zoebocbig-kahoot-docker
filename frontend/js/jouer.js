document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pin = urlParams.get('pin');

    const quizContainer = document.getElementById('quizContainer');
    const scoreContainer = document.getElementById('scoreContainer');
    const scoreSpan = document.getElementById('score');
    const restartBtn = document.getElementById('restartBtn');

    if (!pin) {
        quizContainer.innerHTML = "<p>PIN invalide ou manquant.</p>";
        return;
    }

    // ---------------- SOCKET ----------------
    const socket = io("http://localhost:5000");

    const pseudo = prompt("Pseudo ?");
    if (!pseudo) {
        window.location.href = "/";
        return;
    }

    socket.emit("join_room", {
        pin: pin,
        pseudo: pseudo
    });

    // Leaderboard (debug console pour l'instant)
    socket.on("leaderboard", (players) => {
        console.log("Classement :", players);
    });

    try {
        const res = await fetch(`http://localhost:5000/api/join-quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin })
        });

        const data = await res.json();

        if (!data.success) {
            quizContainer.innerHTML = "<p>PIN invalide.</p>";
            return;
        }

        const quiz = data.quiz;

        let currentQuestion = 0;
        let score = 0;
        let timerInterval = null;

        function showQuestion() {
            if (timerInterval) clearInterval(timerInterval);

            if (currentQuestion >= quiz.questions.length) {
                quizContainer.style.display = "none";
                scoreContainer.style.display = "block";
                scoreSpan.textContent = score;
                return;
            }

            const q = quiz.questions[currentQuestion];

            quizContainer.innerHTML = `
                <h2>Question ${currentQuestion + 1} / ${quiz.questions.length}</h2>
                <p>${q.question}</p>
                ${q.image ? `<img src="${q.image}" style="max-width:300px;">` : ""}
                <p id="timer"></p>
                <div id="answers"></div>
            `;

            const answersDiv = document.getElementById('answers');
            const timerDiv = document.getElementById("timer");

            // ---------------- TIMER ----------------
            let timeLeft = q.timeLimit || 10;

            timerDiv.textContent = "Temps restant : " + timeLeft + "s";

            timerInterval = setInterval(() => {
                timeLeft--;
                timerDiv.textContent = "Temps restant : " + timeLeft + "s";

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    currentQuestion++;
                    showQuestion();
                }
            }, 1000);

            // ---------------- REPONSES ----------------
            q.answers.forEach(a => {
                const btn = document.createElement('button');
                btn.textContent = a.text;
                btn.style.background = a.color || '#333';

                btn.onclick = () => {
                    clearInterval(timerInterval);

                    let pts = a.correct ? q.points : 0;
                    score += pts;

                    // 🔥 ENVOI AU SERVEUR
                    socket.emit("answer", {
                        pin: pin,
                        pseudo: pseudo,
                        points: pts
                    });

                    currentQuestion++;
                    showQuestion();
                };

                answersDiv.appendChild(btn);
            });
        }

        restartBtn.onclick = () => window.location.reload();

        showQuestion();

    } catch (err) {
        console.error(err);
        quizContainer.innerHTML = "<p>Erreur serveur, réessayez plus tard.</p>";
    }
});