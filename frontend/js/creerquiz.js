document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');
    const mainContent = document.getElementById('mainContent');

    const COLORS = ['#00bfff', '#ff4c4c', '#ffcc00', '#00c853'];
    const SYMBOLS = ['A', 'B', 'C', 'D'];

    const quizzes = []; // stocke toutes les slides
    let currentQuizIndex = null;

    addBtn.addEventListener('click', () => modal.style.display = 'block');
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });

    modalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const quiz = { type, questions: [{ text: "", image: null, answers: [] }] };
            quizzes.push(quiz);
            const quizIndex = quizzes.length - 1;

            const newQuiz = document.createElement('div');
        newQuiz.className = 'quiz-item';
        newQuiz.textContent = type === 'quiz' ? 'Nouveau Quiz' : 'Nouveau Vrai ou Faux';

        // Création du bouton supprimer
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×'; // petit X
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.border = 'none';
        deleteBtn.style.color = '#fff';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontWeight = 'bold';
        deleteBtn.style.fontSize = '16px';

        // Action du bouton supprimer
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // empêche le clic de sélectionner la slide
            quizzes.splice(quizIndex, 1); // supprime du tableau
            quizList.removeChild(newQuiz); // supprime de la sidebar

        // Si la slide affichée était celle supprimée
        if(currentQuizIndex === quizIndex) {
            mainContent.innerHTML = '<h1>Créer ton quiz</h1><p>Selectionne un quiz dans la colonne de gauche pour le modifier.</p>';
            currentQuizIndex = null;
        }
    });

    // Ajouter le bouton à la slide
    newQuiz.appendChild(deleteBtn);

    // Ajouter la diapo à la sidebar
    quizList.appendChild(newQuiz);


                newQuiz.addEventListener('click', () => showQuiz(quizIndex));

                modal.style.display = 'none';
            });
        });

    function showQuiz(quizIndex) {
        currentQuizIndex = quizIndex;
        document.querySelectorAll('.quiz-item').forEach(q => q.classList.remove('active'));
        quizList.children[quizIndex].classList.add('active');

        mainContent.innerHTML = '';
        const editor = document.createElement('div');
        editor.className = 'quiz-editor';

        const quiz = quizzes[quizIndex];
        const question = quiz.questions[0]; // ici on prend la première question

        // Question
        const questionInput = document.createElement('input');
        questionInput.type = 'text';
        questionInput.placeholder = 'Écris ta question ici...';
        questionInput.value = question.text;
        questionInput.addEventListener('input', () => question.text = questionInput.value);
        editor.appendChild(questionInput);

        // Image
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        editor.appendChild(imageInput);

        const imagePreview = document.createElement('img');
        if(question.image){
            imagePreview.src = question.image;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
        }
        editor.appendChild(imagePreview);

        imageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if(file){
                const reader = new FileReader();
                reader.onload = ev => {
                    imagePreview.src = ev.target.result;
                    imagePreview.style.display = 'block';
                    question.image = ev.target.result;
                }
                reader.readAsDataURL(file);
            }
        });

        // Réponses
        const answersContainer = document.createElement('div');
        answersContainer.className = 'answers';
        editor.appendChild(answersContainer);

        function renderAnswers() {
            answersContainer.innerHTML = '';
            question.answers.forEach((a, idx) => {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-item';
                answerDiv.style.backgroundColor = a.color;

                const symbolSpan = document.createElement('span');
                symbolSpan.textContent = a.symbol;

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'correctAnswer';
                radio.checked = a.is_correct;
                radio.addEventListener('change', () => {
                    question.answers.forEach((ans, i) => ans.is_correct = i === idx);
                });

                const answerInput = document.createElement('input');
                answerInput.type = 'text';
                answerInput.value = a.text;
                answerInput.addEventListener('input', () => a.text = answerInput.value);

                answerDiv.appendChild(symbolSpan);
                answerDiv.appendChild(radio);
                answerDiv.appendChild(answerInput);
                answersContainer.appendChild(answerDiv);
            });
        }

        renderAnswers();

        const addAnswerBtn = document.createElement('button');
        addAnswerBtn.textContent = 'Ajouter une réponse';
        addAnswerBtn.addEventListener('click', () => {
            if(question.answers.length >= 4) return;
            const idx = question.answers.length;
            question.answers.push({
                text: '',
                is_correct: false,
                color: COLORS[idx],
                symbol: SYMBOLS[idx]
            });
            renderAnswers();
        });
        editor.appendChild(addAnswerBtn);

        mainContent.appendChild(editor);
    }
});
