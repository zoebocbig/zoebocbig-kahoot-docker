document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');
    const mainContent = document.getElementById('mainContent');

    const quizzes = [];

    const COLORS = ['#00bfff', '#ff4c4c', '#ffcc00', '#00c853']; // bleu, rouge, jaune, vert
    const SYMBOLS = ['A', 'B', 'C', 'D'];

    addBtn.addEventListener('click', () => modal.style.display = 'block');
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });

    modalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const quiz = { type, questions: [] };
            quizzes.push(quiz);

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

                // Réponses
                const answersContainer = document.createElement('div');
                answersContainer.className = 'answers';
                editor.appendChild(answersContainer);

                const addAnswerBtn = document.createElement('button');
                addAnswerBtn.className = 'add-answer-btn';
                addAnswerBtn.textContent = 'Ajouter une réponse';
                editor.appendChild(addAnswerBtn);

                addAnswerBtn.addEventListener('click', () => {
                    if(answersContainer.children.length >= 4) return; 

                    const idx = answersContainer.children.length;
                    const answerDiv = document.createElement('div');
                    answerDiv.className = 'answer-item';

                    const answerInput = document.createElement('input');
                    answerInput.type = 'text';
                    answerInput.placeholder = 'Réponse...';

                    const correctCheckbox = document.createElement('input');
                    correctCheckbox.type = 'checkbox';
                    correctCheckbox.title = 'Bonne réponse';

                    answerDiv.appendChild(answerInput);
                    answerDiv.appendChild(correctCheckbox);
                    answersContainer.appendChild(answerDiv);

                    renderInteractiveQuiz();
                });

                mainContent.appendChild(editor);

                function renderInteractiveQuiz() {
                    const questionText = questionInput.value || 'Question';
                    const imageSrc = imagePreview.src || null;
                    const answers = Array.from(answersContainer.children).map((div, i) => {
                        return {
                            text: div.querySelector('input[type="text"]').value || 'Réponse',
                            correct: div.querySelector('input[type="checkbox"]').checked,
                            color: COLORS[i],
                            symbol: SYMBOLS[i]
                        };
                    });

                    mainContent.innerHTML = '';

                    const questionEl = document.createElement('div');
                    questionEl.className = 'quiz-question';
                    const h2 = document.createElement('h2');
                    h2.textContent = questionText;
                    questionEl.appendChild(h2);

                    if(imageSrc){
                        const img = document.createElement('img');
                        img.src = imageSrc;
                        img.style.maxWidth = '100%';
                        questionEl.appendChild(img);
                    }

                    mainContent.appendChild(questionEl);

                    answers.forEach(a => {
                        const btn = document.createElement('button');
                        btn.className = 'quiz-answer-btn';
                        btn.style.backgroundColor = a.color;

                        const symbolSpan = document.createElement('span');
                        symbolSpan.className = 'symbol';
                        symbolSpan.textContent = a.symbol;

                        const textSpan = document.createElement('span');
                        textSpan.textContent = a.text;

                        btn.appendChild(symbolSpan);
                        btn.appendChild(textSpan);

                        btn.addEventListener('click', () => {
                            if(a.correct){
                                btn.classList.add('correct');
                            } else {
                                btn.classList.add('wrong');
                            }
                            mainContent.querySelectorAll('.quiz-answer-btn').forEach(b => b.disabled = true);
                        });

                        mainContent.appendChild(btn);
                    });
                }

                // Mettre à jour le quiz interactif à chaque changement
                questionInput.addEventListener('input', renderInteractiveQuiz);
                imageInput.addEventListener('change', renderInteractiveQuiz);
                answersContainer.addEventListener('input', renderInteractiveQuiz);
            });

            modal.style.display = 'none';
        });
    });
});
