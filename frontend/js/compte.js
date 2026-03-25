document.addEventListener('DOMContentLoaded', async () => {
    const quizListDiv = document.getElementById("quizList");
    const pinsTableBody = document.querySelector("#pinsTable tbody");
    const createQuizBtn = document.getElementById("createQuizBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    async function loadQuizzes() {
        try {
            const res = await fetch("/api/my-quizzes", { credentials: "include" });
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
                const card = document.createElement("div");
                card.className = "quiz-card";

                const title = document.createElement("h3");
                title.textContent = `${q.title} (${q.type})`;
                card.appendChild(title);

                const editBtn = document.createElement("button");
                editBtn.textContent = "Éditer";
                editBtn.style.background = "#782fff";
                editBtn.onclick = () => window.location.href = `creerquiz.html?edit=${q.id}`;
                card.appendChild(editBtn);

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Supprimer";
                deleteBtn.style.background = "#ff4c4c";
                deleteBtn.onclick = async () => {
                    if(confirm("Supprimer ce quiz ?")) {
                        await fetch(`/api/delete-quiz/${q.id}`, { method: "DELETE", credentials: "include" });
                        loadQuizzes();
                    }
                };
                card.appendChild(deleteBtn);

                const playBtn = document.createElement("button");
                playBtn.textContent = "Lancer";
                playBtn.style.background = "#4CAF50";
                playBtn.type = "button"; // <- important pour éviter un nouvel onglet
                playBtn.onclick = async (e) => {
                    e.preventDefault(); // <- empêche tout comportement par défaut
                    if (!q.pin) { 
                        alert("PIN non défini"); 
                        return; 
                    }
                    // Démarrer le quiz côté serveur
                    await fetch("/api/start-quiz", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ pin: q.pin }),
                        credentials: "include"
                    });
                    // On peut afficher un message ou activer l'interface salle d'attente ici
                    alert("Le quiz a été lancé ! Les joueurs peuvent maintenant y participer.");
                };
                card.appendChild(playBtn);

                quizListDiv.appendChild(card);

                // Ajouter dans le tableau PIN
                const row = document.createElement("tr");
                row.innerHTML = `<td>${q.title}</td><td>${q.pin || "Non défini"}</td>`;
                pinsTableBody.appendChild(row);
            });

        } catch (err) {
            console.error(err);
            quizListDiv.innerHTML = "<p>Erreur serveur, réessayez plus tard.</p>";
            pinsTableBody.innerHTML = "";
        }
    }

    createQuizBtn.onclick = () => window.location.href = "creerquiz.html";
    logoutBtn.onclick = async () => {
        await fetch("/api/logout", { method: "POST", credentials: "include" });
        window.location.href = "home.html";
    };

    loadQuizzes();
});