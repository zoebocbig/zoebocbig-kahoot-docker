document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');
    const mainContent = document.getElementById('mainContent');

    const quizzes = []; // Stocker tous les quiz

    addBtn.addEventListener('click', () => modal.style.display = 'block');
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    modalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const quiz = {
                type: type,
                questions: []
            };
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

                // Ajouter question
                const questionInput = document.createElement('input');
                questionInput.type = 'text';
                questionInput.placeholder = 'Écris ta question ici...';
                editor.appendChild(questionInput);

                // Ajouter image
                const imageInput = document.createElement('input');
                imageInput.type = 'file';
                imageInput.accept = 'image/*';
                editor.appendChild(imageInput);

                const imagePreview = document.createElement('img');
                imagePreview.style.display = 'none';
                editor.appendChild(imagePreview);

                imageInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if(file){
                        const reader = new FileReader();
                        reader.onload = function(ev){
                            imagePreview.src = ev.target.result;
                            imagePreview.style.display = 'block';
                        }
                        reader.readAsDataURL(file);
                    }
                });

                // Ajouter réponses
                const answersContainer = document.createElement('div');
                answersContainer.className = 'answers';
                editor.appendChild(answersContainer);

                const addAnswerBtn = document.createElement('button');
                addAnswerBtn.className = 'add-answer-btn';
                addAnswerBtn.textContent = 'Ajouter une réponse';
                editor.appendChild(addAnswerBtn);

                addAnswerBtn.addEventListener('click', () => {
                    const answerDiv = document.createElement('div');
                    answerDiv.style.display = 'flex';
                    answerDiv.style.gap = '10px';
                    const answerInput = document.createElement('input');
                    answerInput.type = 'text';
                    answerInput.placeholder = 'Nouvelle réponse...';

                    const correctCheckbox = document.createElement('input');
                    correctCheckbox.type = 'checkbox';
                    correctCheckbox.title = 'Bonne réponse';

                    answerDiv.appendChild(answerInput);
                    answerDiv.appendChild(correctCheckbox);
                    answersContainer.appendChild(answerDiv);
                });

                // Bouton lancer quiz
                const launchQuizBtn = document.createElement('button');
                launchQuizBtn.className = 'launch-quiz-btn';
                launchQuizBtn.textContent = 'Lancer le quiz';
                editor.appendChild(launchQuizBtn);

                launchQuizBtn.addEventListener('click', () => {
                    const questionText = questionInput.value;
                    const imageSrc = imagePreview.src || null;
                    const answers = [];

                    answersContainer.querySelectorAll('div').forEach(div => {
                        const text = div.querySelector('input[type="text"]').value;
                        const correct = div.querySelector('input[type="checkbox"]').checked;
                        if(text) answers.push({text, correct});
                    });

                    if(!questionText || answers.length === 0){
                        alert('Question ou réponses manquantes !');
                        return;
                    }

                    quiz.questions.push({question: questionText, image: imageSrc, answers});

                    // Afficher le quiz interactif
                    displayInteractiveQuiz({question: questionText, image: imageSrc, answers});
                });

                mainContent.appendChild(editor);
            });

            modal.style.display = 'none';
        });
    });

    function displayInteractiveQuiz(q) {
        mainContent.innerHTML = '';

        const questionEl = document.createElement('div');
        questionEl.className = 'quiz-question';
        const h2 = document.createElement('h2');
        h2.textContent = q.question;
        questionEl.appendChild(h2);

        if(q.image){
            const img = document.createElement('img');
            img.src = q.image;
            img.style.maxWidth = '100%';
            questionEl.appendChild(img);
        }

        mainContent.appendChild(questionEl);

        q.answers.forEach(a => {
            const btn = document.createElement('button');
            btn.className = 'quiz-answer-btn';
            btn.textContent = a.text;

            btn.addEventListener('click', () => {
                if(a.correct){
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('wrong');
                }
                // désactiver tous les boutons
                mainContent.querySelectorAll('.quiz-answer-btn').forEach(b => b.disabled = true);
            });

            mainContent.appendChild(btn);
        });
    }
});
