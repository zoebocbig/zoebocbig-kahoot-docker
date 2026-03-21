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

        let timer;
        let timeLeft;
        let answered = false;

        function showQuestion() {
            if (currentQuestion >= quiz.questions.length) {
                quizContainer.style.display = "none";
                scoreContainer.style.display = "block";
                scoreSpan.textContent = score;
                return;
            }

            const q = quiz.questions[currentQuestion];

            quizContainer.innerHTML = `
                <h2>Question ${currentQuestion + 1} / ${quiz.questions.length}</h2>
                <p class="question">${q.question}</p>
                <p class="timer">⏱️ Temps restant : <span id="timer"></span>s</p>
                ${q.image ? `<img src="${q.image}" class="question-img">` : ""}
                <div id="answers"></div>
            `;

            const answersDiv = document.getElementById('answers');

            // TIMER
            timeLeft = q.timeLimit;
            answered = false;

            document.getElementById("timer").textContent = timeLeft;

            timer = setInterval(() => {
                timeLeft--;
                document.getElementById("timer").textContent = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    currentQuestion++;
                    setTimeout(showQuestion, 500);
                }
            }, 1000);

            // REPONSES
            q.answers.forEach(a => {
                const btn = document.createElement('button');
                btn.textContent = a.text;
                btn.style.background = a.color || '#333';

                btn.onclick = () => {
                    if (answered) return;
                    answered = true;

                    clearInterval(timer);

                    // Calcul des points dynamique
                    if (a.correct) {
                        let points = Math.floor(q.points * (timeLeft / q.timeLimit));
                        score += points;
                    }

                    currentQuestion++;

                    setTimeout(showQuestion, 800);
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