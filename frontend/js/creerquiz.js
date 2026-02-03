document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');

    addBtn.addEventListener('click', () => modal.style.display = 'block');
    closeModal.addEventListener('click', () => modal.style.display = 'none');

    window.addEventListener('click', (e) => {
        if(e.target === modal) modal.style.display = 'none';
    });

    modalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const newQuiz = document.createElement('div');
            newQuiz.className = 'quiz-item';
            newQuiz.textContent = type === 'quiz' ? 'Nouveau Quiz' : 'Nouveau Vrai ou Faux';
            quizList.appendChild(newQuiz);
            modal.style.display = 'none';
        });
    });
});
