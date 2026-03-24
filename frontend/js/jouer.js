document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pin = urlParams.get("pin");

    if (!pin) {
        alert("PIN manquant !");
        return;
    }

    const pseudoInput = document.getElementById("pseudoInput");
    const joinBtn = document.getElementById("joinBtn");
    const quizContainer = document.getElementById("quizContainer");
    const pseudoContainer = document.getElementById("pseudoContainer");

    // ---------------- JOIN QUIZ ----------------
    async function joinQuiz(pseudo) {
        try {
            const res = await fetch("/api/join-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ pin, pseudo })
            });
            const data = await res.json();
            if (!data.success) {
                alert(data.message || "PIN invalide !");
                joinBtn.disabled = false;
                return null;
            }
            return data.quiz;
        } catch (err) {
            console.error("Erreur joinQuiz:", err);
            joinBtn.disabled = false;
            return null;
        }
    }

    // ---------------- WAIT QUIZ START ----------------
    async function waitForStart() {
        try {
            const res = await fetch(`/api/quiz-status?pin=${pin}`, {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();
            if (data.started) {
                loadCurrentQuestion();
            } else {
                quizContainer.innerHTML = "<p>En attente que le quiz commence...</p>";
                setTimeout(waitForStart, 1000);
            }
        } catch (err) {
            console.error("Erreur ping serveur:", err);
            setTimeout(waitForStart, 3000);
        }
    }

    // ---------------- CURRENT QUESTION ----------------
    async function loadCurrentQuestion() {
        const res = await fetch(`/api/current-question?pin=${pin}`, { credentials: "include" });
        const data = await res.json();
        if (!data.success) return;

        if (data.finished) {
            showLeaderboard();
            return;
        }

        const q = data.question;

        // Affichage du quiz avec style
        quizContainer.innerHTML = `
            <div class="question-container">
                <p class="question-text">${q.question}</p>
                <div class="answers-container"></div>
                <p class="timer">Temps restant : <span id="timer">${q.timeLimit}</span>s</p>
            </div>
        `;

        const answersDiv = quizContainer.querySelector(".answers-container");
        q.answers.forEach((a, idx) => {
            const btn = document.createElement("button");
            btn.textContent = a.text;
            btn.style.backgroundColor = a.color || "#ccc";
            btn.onclick = async () => {
                await fetch("/api/answer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pin, pseudo: pseudoInput.value.trim(), answer_index: idx }),
                    credentials: "include"
                });
                loadCurrentQuestion();
            };
            answersDiv.appendChild(btn);
        });

        // Timer countdown
        let time = q.timeLimit;
        const timerSpan = document.getElementById("timer");
        const timerInterval = setInterval(() => {
            time--;
            timerSpan.textContent = time;
            if (time <= 0) {
                clearInterval(timerInterval);
                loadCurrentQuestion();
            }
        }, 1000);
    }

    // ---------------- LEADERBOARD ----------------
    async function showLeaderboard() {
        try {
            const res = await fetch(`/api/leaderboard/${pin}`, { credentials: "include" });
            const data = await res.json();
            if (!data.success) return;

            let html = "<h2>Classement</h2><ol>";
            data.leaderboard.forEach(p => html += `<li>${p.name} : ${p.score}</li>`);
            html += "</ol>";
            quizContainer.innerHTML = html;
        } catch (err) {
            console.error("Erreur showLeaderboard:", err);
        }
    }

    // ---------------- JOIN BUTTON ----------------
    joinBtn.addEventListener("click", async () => {
        const pseudo = pseudoInput.value.trim() || "Joueur";
        joinBtn.disabled = true;
        pseudoInput.disabled = true;

        const quiz = await joinQuiz(pseudo);
        if (quiz) {
            // Masquer le formulaire pseudo
            pseudoContainer.style.display = "none";
            // Afficher message attente
            quizContainer.innerHTML = "<p>En attente que le quiz commence...</p>";
            waitForStart();
        }
    });
});