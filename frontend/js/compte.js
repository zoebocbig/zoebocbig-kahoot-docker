document.addEventListener('DOMContentLoaded', async () => {
    const quizListDiv = document.getElementById("quizList");
    const createQuizBtn = document.getElementById("createQuizBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // ---------------- CHARGER LES QUIZZES ----------------
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

                // Bouton Éditer
                const editBtn = document.createElement("button");
                editBtn.textContent = "Éditer";
                editBtn.className = "edit";
                editBtn.onclick = () => {
                    window.location.href = "creerquiz.html?edit=" + q.id;
                };
                card.appendChild(editBtn);

                // Bouton Supprimer
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Supprimer";
                deleteBtn.style.background = "#ff4c4c"; // rouge
                deleteBtn.style.marginBottom = "5px";
                deleteBtn.onclick = async () => {
                    if(confirm("Supprimer ce quiz ?")){
                        await fetch(`http://localhost:5000/api/delete-quiz/${q.id}`, {
                            method: "DELETE",
                            credentials: "include"
                        });
                        loadQuizzes(); // recharger la liste
                    }
                };
                card.appendChild(deleteBtn);

                // Bouton Jouer
                const playBtn = document.createElement("button");
                playBtn.textContent = "Jouer";
                playBtn.className = "play";
                playBtn.onclick = () => {
                    alert("Lancer le quiz " + q.title); // remplacer par la logique réelle
                };
                card.appendChild(playBtn);

                quizListDiv.appendChild(card);
            });

        } catch (err) {
            console.error(err);
            quizListDiv.innerHTML = "<p>Erreur serveur, réessayez plus tard.</p>";
        }
    }

    // ---------------- CRÉER UN NOUVEAU QUIZ ----------------
    createQuizBtn.onclick = () => {
        window.location.href = "creerquiz.html";
    };

    // ---------------- DÉCONNEXION ----------------
    logoutBtn.onclick = async () => {
        await fetch("http://localhost:5000/api/logout", { method: "POST", credentials: "include" });
        window.location.href = "home.html";
    };

    loadQuizzes();
});