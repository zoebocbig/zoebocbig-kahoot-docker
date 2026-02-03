document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');
    const mainContent = document.getElementById('mainContent');

    // Ouvrir le modal
    addBtn.addEventListener('click', () => modal.style.display = 'block');

    // Fermer le modal avec le X
    closeModal.addEventListener('click', () => modal.style.display = 'none');

    // Fermer le modal si on clique à l'extérieur
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Ajouter un quiz selon le type sélectionné
    modalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;

            // Créer un nouvel élément dans la liste
            const newQuiz = document.createElement('div');
            newQuiz.className = 'quiz-item';
            newQuiz.textContent = type === 'quiz' ? 'Nouveau Quiz' : 'Nouveau Vrai ou Faux';
            newQuiz.dataset.type = type;
            quizList.appendChild(newQuiz);

            // Ajouter la sélection du quiz (diapo)
            newQuiz.addEventListener('click', () => {
                // Retirer l'état actif des autres
                document.querySelectorAll('.quiz-item').forEach(q => q.classList.remove('active'));
                newQuiz.classList.add('active');

                
                mainContent.innerHTML = '';
                const title = document.createElement('h1');
                title.textContent = type === 'quiz' ? 'Éditeur de Quiz' : 'Éditeur Vrai ou Faux';
                const desc = document.createElement('p');
                desc.textContent = 'Ici tu peux éditer ton quiz ' + (type === 'quiz' ? '' : 'Vrai ou Faux') + '.';
                mainContent.appendChild(title);
                mainContent.appendChild(desc);
            });

            modal.style.display = 'none';
        });
    });
});
