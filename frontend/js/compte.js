document.addEventListener('DOMContentLoaded', () => {

    const quizList = document.getElementById('quizList');
    const logoutBtn = document.getElementById('logoutBtn');

    // Déconnexion
    logoutBtn.onclick = () => {
        fetch("/api/logout", { method: "POST" })
            .then(() => {
                window.location.href = "login.html";
            });
    };

    // Récupérer les quizzes de l'utilisateur connecté
    fetch("/api/my-quizzes")
        .then(r => r.json())
        .then(data => {
            if(data.success && data.quizzes.length > 0){
                data.quizzes.forEach(q => {
                    const card = document.createElement('div');
                    card.className = "quiz-card";

                    const title = document.createElement('h2');
                    title.textContent = q.title;

                    const type = document.createElement('p');
                    type.textContent = `Type : ${q.type}`;

                    const editBtn = document.createElement('button');
                    editBtn.textContent = "Éditer";
                    editBtn.onclick = () => {
                        window.location.href = `creerquiz.html?quiz_id=${q.id}`;
                    };

                    card.append(title, type, editBtn);
                    quizList.appendChild(card);
                });
            } else {
                quizList.textContent = "Vous n'avez créé aucun quiz pour le moment.";
            }
        });
});
