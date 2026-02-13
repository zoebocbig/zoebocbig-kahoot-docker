document.addEventListener('DOMContentLoaded', () => {
    console.log('creerquiz.js: DOMContentLoaded');

    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');
    const mainContent = document.getElementById('mainContent');

    const COLORS = ['#00bfff', '#ff4c4c', '#ffcc00', '#00c853'];
    const SYMBOLS = ['A', 'B', 'C', 'D'];

    const quizzes = [];
    let currentQuizIndex = null;

    if (!addBtn) {
        console.error('addBtn not found in DOM');
        return;
    }

    // Modal management
    addBtn.onclick = (e) => {
        console.log('addBtn clicked');
        e.preventDefault();
        modal.style.display = 'block';
    };

    closeModal.onclick = (e) => {
        console.log('closeModal clicked');
        modal.style.display = 'none';
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            console.log('modal backdrop clicked');
            modal.style.display = 'none';
        }
    };

    // Handle modal button clicks
    modalBtns.forEach((btn, btnIdx) => {
        btn.onclick = (e) => {
            e.preventDefault();
            console.log('Modal button clicked:', btn.dataset.type);
            
            const quiz = {
                question: "",
                image: null,
                answers: [
                    { text: "", correct: false, color: COLORS[0], symbol: SYMBOLS[0] },
                    { text: "", correct: false, color: COLORS[1], symbol: SYMBOLS[1] },
                    { text: "", correct: false, color: COLORS[2], symbol: SYMBOLS[2] },
                    { text: "", correct: false, color: COLORS[3], symbol: SYMBOLS[3] }
                ],
                answerLimit: 1
            };

            const index = quizzes.length;
            quizzes.push(quiz);

            // Add to sidebar
            const slide = document.createElement('div');
            slide.className = 'quiz-item';
            slide.textContent = `Question ${index + 1}`;

            const del = document.createElement('button');
            del.textContent = "×";
            del.style.background = "transparent";
            del.style.border = "none";
            del.style.color = "white";
            del.style.fontSize = "18px";
            del.style.cursor = "pointer";
            del.style.padding = "0";
            del.onclick = (ev) => {
                ev.stopPropagation();
                console.log('Delete quiz', index);
                quizzes.splice(index, 1);
                slide.remove();
                if (currentQuizIndex === index) {
                    mainContent.innerHTML = "<p>Sélectionne un quiz dans la colonne de gauche pour le modifier.</p>";
                }
            };

            slide.appendChild(del);
            quizList.appendChild(slide);

            slide.onclick = () => {
                console.log('Slide clicked, showing quiz', index);
                showQuiz(index);
            };

            modal.style.display = 'none';
            showQuiz(index);
        };
    });

    function showQuiz(i) {
        console.log('showQuiz:', i);
        currentQuizIndex = i;
        const q = quizzes[i];

        mainContent.innerHTML = '';

        const editor = document.createElement('div');
        editor.className = "quiz-editor";

        // QUESTION
        const question = document.createElement('input');
        question.type = 'text';
        question.placeholder = "Écris ta question...";
        question.value = q.question;
        question.oninput = () => { q.question = question.value; };
        editor.appendChild(question);

        // IMAGE
        const imageInput = document.createElement('input');
        imageInput.type = "file";
        imageInput.accept = "image/*";
        editor.appendChild(imageInput);

        // LIMITE DE RÉPONSES
        const limitLabel = document.createElement('label');
        limitLabel.textContent = 'Limite de réponses: ';
        limitLabel.style.marginRight = '10px';
        const limitInput = document.createElement('input');
        limitInput.type = 'number';
        limitInput.min = 1;
        limitInput.max = 4;
        limitInput.value = q.answerLimit;
        const limitContainer = document.createElement('div');
        limitContainer.style.marginBottom = '20px';
        limitContainer.appendChild(limitLabel);
        limitContainer.appendChild(limitInput);
        editor.appendChild(limitContainer);

        // RÉPONSES
        const answersDiv = document.createElement('div');
        answersDiv.className = "answers";

        function renderAnswers() {
            console.log('renderAnswers called');
            answersDiv.innerHTML = '';
            q.answers.forEach((a, idx) => {
                const d = document.createElement('div');
                d.className = "answer-item";
                d.style.background = a.color;

                const s = document.createElement('span');
                s.textContent = a.symbol;

                const checkbox = document.createElement('input');
                checkbox.type = "checkbox";
                checkbox.checked = a.correct;
                checkbox.addEventListener('change', () => {
                    console.log('Checkbox', idx, 'changed to', checkbox.checked);
                    a.correct = checkbox.checked;
                    updateCheckboxes();
                });

                const t = document.createElement('input');
                t.type = "text";
                t.value = a.text;
                t.placeholder = "Réponse...";
                t.oninput = () => { a.text = t.value; };

                d.appendChild(s);
                d.appendChild(checkbox);
                d.appendChild(t);
                answersDiv.appendChild(d);
            });
            updateCheckboxes();
        }

        function updateCheckboxes() {
            console.log('updateCheckboxes: limit =', q.answerLimit);

            if (!q.answerLimit || isNaN(q.answerLimit)) {
                q.answerLimit = 1;
            }

            // Force limit to be between 1 and 4
            q.answerLimit = Math.max(1, Math.min(4, q.answerLimit));

            // Count checked answers
            const checkedIndexes = [];
            q.answers.forEach((a, idx) => {
                if (a.correct) checkedIndexes.push(idx);
            });

            console.log('Checked indices:', checkedIndexes, 'Limit:', q.answerLimit);

            // Auto-uncheck if too many are checked
            if (checkedIndexes.length > q.answerLimit) {
                const toUncheck = checkedIndexes.length - q.answerLimit;
                console.log('Unchecking', toUncheck, 'answers');
                for (let i = 0; i < toUncheck; i++) {
                    const idx = checkedIndexes.pop();
                    q.answers[idx].correct = false;
                }
            }

            const checkedCount = q.answers.filter(a => a.correct).length;
            const checkboxes = answersDiv.querySelectorAll('input[type=checkbox]');

            checkboxes.forEach((cb, idx) => {
                cb.checked = !!q.answers[idx].correct;
                const shouldDisable = !cb.checked && checkedCount >= q.answerLimit;
                cb.disabled = shouldDisable;
                console.log('Checkbox', idx, '- checked:', cb.checked, 'disabled:', cb.disabled);
            });
        }

        limitInput.addEventListener('input', () => {
            console.log('Limit input changed to:', limitInput.value);
            let v = parseInt(limitInput.value);
            if (isNaN(v)) v = 1;
            v = Math.max(1, Math.min(4, v));
            limitInput.value = v;
            q.answerLimit = v;
            updateCheckboxes();
        });

        editor.appendChild(answersDiv);

        const addAnswer = document.createElement('button');
        addAnswer.textContent = "Ajouter réponse";
        addAnswer.onclick = (e) => {
            e.preventDefault();
            console.log('Add answer clicked');
            if (q.answers.length >= 4) {
                console.log('Already 4 answers, cannot add more');
                return;
            }
            const id = q.answers.length;
            q.answers.push({
                text: "",
                correct: false,
                color: COLORS[id],
                symbol: SYMBOLS[id]
            });
            renderAnswers();
        };

        editor.appendChild(addAnswer);
        mainContent.appendChild(editor);

        renderAnswers();
    }
});
