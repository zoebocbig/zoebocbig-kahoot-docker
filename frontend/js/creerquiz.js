document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');
    const mainContent = document.getElementById('mainContent');

    const COLORS = ['#00bfff', '#ff4c4c', '#ffcc00', '#00c853']; // couleurs réponses
    const SYMBOLS = ['A', 'B', 'C', 'D']; // symboles réponses

    addBtn.addEventListener('click', () => modal.style.display = 'block');
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });

    modalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;

            const newQuiz = document.createElement('div');
            newQuiz.className = 'quiz-item';
            newQuiz.textContent = type === 'quiz' ? 'Nouveau Quiz' : 'Nouveau Vrai ou Faux';
            quizList.appendChild(newQuiz);

            newQuiz.addEventListener('click', () => {
                document.querySelectorAll('.quiz-item').forEach(q => q.classList.remove('active'));
                newQuiz.classList.add('active');

                mainContent.innerHTML = '';
                const editor = document.createElement('div');
                editor.className = 'quiz-editor';

                // Question
                const questionInput = document.createElement('input');
                questionInput.type = 'text';
                questionInput.placeholder = 'Écris ta question ici...';
                editor.appendChild(questionInput);

                // Image
                const imageInput = document.createElement('input');
                imageInput.type = 'file';
                imageInput.accept = 'image/*';
                editor.appendChild(imageInput);

                const imagePreview = document.createElement('img');
                imagePreview.style.display = 'none';
                editor.appendChild(imagePreview);

                imageInput.addEventListener('change', e => {
                    const file = e.target.files[0];
                    if(file){
                        const reader = new FileReader();
                        reader.onload = ev => {
                            imagePreview.src = ev.target.result;
                            imagePreview.style.display = 'block';
                        }
                        reader.readAsDataURL(file);
                    }
                });

                // Container réponses
                const answersContainer = document.createElement('div');
                answersContainer.className = 'answers';
                editor.appendChild(answersContainer);

                // Bouton Ajouter Réponse
                const addAnswerBtn = document.createElement('button');
                addAnswerBtn.textContent = 'Ajouter une réponse';
                editor.appendChild(addAnswerBtn);

                addAnswerBtn.addEventListener('click', () => {
                    const idx = answersContainer.children.length;
                    if(idx >= 4) return; // max 4 réponses

                    const answerDiv = document.createElement('div');
                    answerDiv.className = 'answer-item';
                    answerDiv.style.backgroundColor = COLORS[idx];

                    const symbolSpan = document.createElement('span');
                    symbolSpan.textContent = SYMBOLS[idx];
                    symbolSpan.style.fontWeight = 'bold';
                    symbolSpan.style.fontSize = '18px';
                    symbolSpan.style.color = '#fff';

                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = 'correctAnswer';

                    const answerInput = document.createElement('input');
                    answerInput.type = 'text';
                    answerInput.placeholder = 'Réponse...';
                    answerInput.style.color = '#fff';
                    answerInput.style.background = 'transparent';
                    answerInput.style.border = 'none';
                    answerInput.style.flex = '1';

                    answerDiv.appendChild(symbolSpan);
                    answerDiv.appendChild(radio);
                    answerDiv.appendChild(answerInput);

                    answersContainer.appendChild(answerDiv);
                });

                mainContent.appendChild(editor);
            });

            modal.style.display = 'none';
        });
    });
});
