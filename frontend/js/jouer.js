document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pin = urlParams.get("pin");

    if (!pin) { 
        alert("PIN manquant !"); 
        return; 
    }

    const pseudo = prompt("Entrez votre pseudo") || "Joueur";
    const quizContainer = document.getElementById("quizContainer");

    // ---------------- JOIN QUIZ ----------------
    async function joinQuiz() {
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
                return null; 
            }
            return data.quiz;
        } catch (err) {
            console.error("Erreur joinQuiz:", err);
            return null;
        }
    }

    // ---------------- WAIT QUIZ START ----------------
    async function waitForStart() {
        try {
            console.log("Ping serveur pour vérifier le quiz..."); // log pour debug
            const res = await fetch(`/api/quiz-status?pin=${pin}`, {
                method: "GET",
                credentials: "include" // inclut la session pour reconnaitre l'utilisateur
            });
            const data = await res.json();
            console.log("Status quiz:", data); // log pour debug

            if (data.started) {
                startQuiz();
            } else {
                quizContainer.innerHTML = "<p>En attente que le quiz commence...</p>";
                setTimeout(waitForStart, 1000); // relancer toutes les 1s
            }
        } catch (err) {
            console.error("Erreur ping serveur:", err);
            setTimeout(waitForStart, 3000); // réessayer plus tard si erreur
        }
    }

    // ---------------- SUBMIT SCORE ----------------
    async function submitScore(score) {
        try {
            await fetch("/api/submit-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ pin, pseudo, points: score })
            });
        } catch (err) {
            console.error("Erreur submitScore:", err);
        }
    }

    // ---------------- SHOW LEADERBOARD ----------------
    async function showLeaderboard() {
        try {
            const res = await fetch(`/api/leaderboard/${pin}`, {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();
            if (!data.success) return;

            const leaderboard = data.leaderboard;
            let html = "<h2>Classement</h2><ol>";
            leaderboard.forEach(p => { html += `<li>${p.name} : ${p.score}</li>`; });
            html += "</ol>";
            quizContainer.innerHTML = html;
        } catch (err) {
            console.error("Erreur showLeaderboard:", err);
        }
    }

    // ---------------- START QUIZ ----------------
    async function startQuiz() {
        const quiz = await joinQuiz();
        if (!quiz) return;

        let current = 0;
        let score = 0;

        function showQuestion(index) {
            if (index >= quiz.questions.length) {
                quizContainer.innerHTML = `<h2>Quiz terminé !</h2><p>Score : ${score}</p><button id="leaderBtn">Voir classement</button>`;
                submitScore(score); // envoyer score final
                document.getElementById("leaderBtn").onclick = showLeaderboard;
                return;
            }

            const q = quiz.questions[index];
            quizContainer.innerHTML = `<p>${q.question}</p>`;
            q.answers.forEach(a => {
                const btn = document.createElement("button");
                btn.textContent = a.text;
                btn.onclick = () => {
                    if(a.correct) score++;
                    current++;
                    showQuestion(current);
                };
                quizContainer.appendChild(btn);
            });
        }

        showQuestion(current);
    }

    // ---------------- LANCER ----------------
    waitForStart();
});