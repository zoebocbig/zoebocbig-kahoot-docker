document.addEventListener('DOMContentLoaded', async () => {
    const quizListDiv = document.getElementById("quizList");
    const createBtn = document.getElementById("createQuizBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Charger les quiz de l'utilisateur
    async function loadQuizzes() {
        try {
            const res = await fetch("http://localhost:5000/api/my-quizzes", {
                credentials: "include"
            });
            const data = await res.json();

            if (!data.success) {
                quizListDiv.innerHTML = "<p>Erreur : Vous devez être connecté.</p>";
                return;
            }

            if (data.quizzes.length === 0) {
                quizListDiv.innerHTML = "<p>Vous n'avez créé aucun quiz pour le moment.</p>";
                return;
            }

            quizListDiv.innerHTML = "";
            data.quizzes.forEach(q => {
                const card = document.createElement("div");
                card.className = "quiz-card";

                const title = document.createElement("h3");
                title.textContent = q.title + " (" + q.type + ")";
                card.appendChild(title);

                const editBtn = document.createElement("button");
                editBtn.textContent = "Éditer";
                editBtn.className = "edit";
                editBtn.onclick = () => {
                    window.location.href = "creerquiz.html?quizId=" + q.id;
                };
                card.appendChild(editBtn);

                const playBtn = document.createElement("button");
                playBtn.textContent = "Jouer";
                playBtn.className = "play";
                playBtn.onclick = () => {
                    alert("Lancer le quiz " + q.title); // À remplacer par le lancement réel
                };
                card.appendChild(playBtn);

                quizListDiv.appendChild(card);
            });

        } catch (err) {
            console.error(err);
            quizListDiv.innerHTML = "<p>Erreur serveur, réessayez plus tard.</p>";
        }
    }

    // 🔑 Redirection vers creer.html pour créer un nouveau quiz
    createQuizBtn.onclick = () => {
        window.location.href = "creer.html";
    };

    // Déconnexion
    logoutBtn.onclick = async () => {
        await fetch("http://localhost:5000/api/logout", { method: "POST", credentials: "include" });
        window.location.href = "home.html";
    };

    loadQuizzes();
});
