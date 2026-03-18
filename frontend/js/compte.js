document.addEventListener('DOMContentLoaded', async () => {
    const quizListDiv = document.getElementById("quizList");
    const pinsTableBody = document.querySelector("#pinsTable tbody");
    const createQuizBtn = document.getElementById("createQuizBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // ---------------- CHARGER LES QUIZZES ----------------
    async function loadQuizzes() {
        try {
            const res = await fetch("http://localhost:5000/api/my-quizzes", { credentials: "include" });
            const data = await res.json();

            if (!data.success) {
                quizListDiv.innerHTML = "<p>Erreur : Vous devez être connecté.</p>";
                pinsTableBody.innerHTML = "";
                return;
            }

            if (data.quizzes.length === 0) {
                quizListDiv.innerHTML = "<p>Vous n'avez créé aucun quiz pour le moment.</p>";
                pinsTableBody.innerHTML = "";
                return;
            }

            quizListDiv.innerHTML = "";
            pinsTableBody.innerHTML = "";

            data.quizzes.forEach(q => {
                // Section 1 : cartes quiz
                const card = document.createElement("div");
                card.className = "quiz-card";

                const title = document.createElement("h3");
                title.textContent = q.title + " (" + q.type + ")";
                card.appendChild(title);

                // Éditer
                const editBtn = document.createElement("button");
                editBtn.textContent = "Éditer";
                editBtn.className = "edit";
                editBtn.onclick = () => window.location.href = "creerquiz.html?edit=" + q.id;
                card.appendChild(editBtn);

                // Supprimer
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Supprimer";
                deleteBtn.style.background = "#ff4c4c";
                deleteBtn.onclick = async () => {
                    if(confirm("Supprimer ce quiz ?")) {
                        await fetch(`http://localhost:5000/api/delete-quiz/${q.id}`, { method: "DELETE", credentials: "include" });
                        loadQuizzes();
                    }
                };
                card.appendChild(deleteBtn);

                // Jouer
                const playBtn = document.createElement("button");
                playBtn.textContent = "Jouer";
                playBtn.className = "play";
                playBtn.onclick = () => alert("Lancer le quiz " + q.title);
                card.appendChild(playBtn);

                quizListDiv.appendChild(card);

                // Section 2 : tableau PIN
                const row = document.createElement("tr");
                const nameCell = document.createElement("td");
                nameCell.innerText = q.title;
                const pinCell = document.createElement("td");
                pinCell.innerText = q.pin || "Non défini";
                row.appendChild(nameCell);
                row.appendChild(pinCell);
                pinsTableBody.appendChild(row);
            });

        } catch (err) {
            console.error(err);
            quizListDiv.innerHTML = "<p>Erreur serveur, réessayez plus tard.</p>";
            pinsTableBody.innerHTML = "";
        }
    }

    // Créer un nouveau quiz
    createQuizBtn.onclick = () => window.location.href = "creerquiz.html";

    // Déconnexion
    logoutBtn.onclick = async () => {
        await fetch("http://localhost:5000/api/logout", { method: "POST", credentials: "include" });
        window.location.href = "home.html";
    };

    loadQuizzes();
});