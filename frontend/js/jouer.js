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
                <p>${q.question}</p>
                ${q.image ? `<img src="${q.image}" alt="Question image" style="max-width:300px;">` : ""}
                <div id="answers"></div>
            `;

            const answersDiv = document.getElementById('answers');
            q.answers.forEach(a => {
                const btn = document.createElement('button');
                btn.textContent = a.text;
                btn.style.background = a.color || '#333';
                btn.onclick = () => {
                    if (a.correct) score++;
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