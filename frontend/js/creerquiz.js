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

                // Créer l'éditeur de quiz
                mainContent.innerHTML = '';
                const editor = document.createElement('div');
                editor.className = 'quiz-editor';

                // Champ question
                const questionInput = document.createElement('input');
                questionInput.type = 'text';
                questionInput.placeholder = 'Écris ta question ici...';
                editor.appendChild(questionInput);

                // Zone image
                const imageInput = document.createElement('input');
                imageInput.type = 'file';
                imageInput.accept = 'image/*';
                editor.appendChild(imageInput);

                const imagePreview = document.createElement('img');
                imagePreview.style.display = 'none';
                editor.appendChild(imagePreview);

                imageInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if(file) {
                        const reader = new FileReader();
                        reader.onload = function(ev) {
                            imagePreview.src = ev.target.result;
                            imagePreview.style.display = 'block';
                        }
                        reader.readAsDataURL(file);
                    }
                });

                // Réponses
                const answersContainer = document.createElement('div');
                answersContainer.className = 'answers';
                editor.appendChild(answersContainer);

                const addAnswerBtn = document.createElement('button');
                addAnswerBtn.className = 'add-answer-btn';
                addAnswerBtn.textContent = 'Ajouter une réponse';
                editor.appendChild(addAnswerBtn);

                addAnswerBtn.addEventListener('click', () => {
                    const answerInput = document.createElement('input');
                    answerInput.type = 'text';
                    answerInput.placeholder = 'Nouvelle réponse...';
                    answersContainer.appendChild(answerInput);
                });

                mainContent.appendChild(editor);
            });

            modal.style.display = 'none';
        });
    });
});
