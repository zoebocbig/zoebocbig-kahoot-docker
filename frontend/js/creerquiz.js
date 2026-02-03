document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');

    // Ouvrir modal
    addBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Fermer modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fermer modal si clic en dehors
    window.addEventListener('click', (e) => {
        if(e.target === modal) modal.style.display = 'none';
    });

    // Gestion choix type quiz
    modalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            const newQuiz = document.createElement('div');
            newQuiz.className = 'quiz-item';
            newQuiz.textContent = type === 'quiz' ? 'Nouveau Quiz' : 'Nouveau Vrai ou Faux';
            quizList.appendChild(newQuiz);
            modal.style.display = 'none';
        });
    });
});
