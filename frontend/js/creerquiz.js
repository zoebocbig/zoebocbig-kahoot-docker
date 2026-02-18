if(!localStorage.getItem("creator")){
    location.href="login.html";
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('creerquiz.js: DOMContentLoaded');

    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');
    const mainContent = document.getElementById('mainContent');

    const COLORS = ['#00bfff', '#ff4c4c', '#ffcc00', '#00c853', '#ff6b9d', '#38ada9', '#78e08f', '#f368e0'];
    const SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    const quizzes = [];
    let currentQuizIndex = null;

    if (!addBtn) {
        console.error('addBtn not found in DOM');
        return;
    }

    
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

    modalBtns.forEach((btn, btnIdx) => {
        btn.onclick = (e) => {
            e.preventDefault();
            const quizType = btn.dataset.type;
            console.log('Modal button clicked:', quizType);
            
            let quiz;
            
            if (quizType === 'vrai-faux') {
                quiz = {
                    type: 'vrai-faux',
                    question: "",
                    image: null,
                    answers: [
                        { text: "Vrai", correct: false, color: '#00c853', symbol: '✓' },
                        { text: "Faux", correct: false, color: '#ff4c4c', symbol: '✕' }
                    ],
                    answerLimit: 1,
                    timeLimit: 30,
                    points: 1000
                };
            } else {
                quiz = {
                    type: 'quiz',
                    question: "",
                    image: null,
                    answers: [
                        { text: "", correct: false, color: COLORS[0], symbol: SYMBOLS[0] },
                        { text: "", correct: false, color: COLORS[1], symbol: SYMBOLS[1] },
                        { text: "", correct: false, color: COLORS[2], symbol: SYMBOLS[2] },
                        { text: "", correct: false, color: COLORS[3], symbol: SYMBOLS[3] }
                    ],
                    answerLimit: 1,
                    timeLimit: 30,
                    points: 1000
                };
            }

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

        // CONTENEUR PRINCIPAL (2 colonnes)
        const mainWrapper = document.createElement('div');
        mainWrapper.className = "quiz-layout";

        // ===== COLONNE GAUCHE =====
        const editor = document.createElement('div');
        editor.className = "quiz-editor";

        // QUESTION
        const question = document.createElement('input');
        question.type = 'text';
        question.className = "question-input";
        question.placeholder = "Écris ta question...";
        question.value = q.question;
        question.oninput = () => { q.question = question.value; };
        editor.appendChild(question);

        // IMAGE - Carré avec preview (CENTRÉ)
        const imageContainerWrapper = document.createElement('div');
        imageContainerWrapper.className = "image-wrapper";

        const imageContainer = document.createElement('div');
        imageContainer.className = "image-container";

        const imagePreview = document.createElement('img');
        imagePreview.style.display = 'none';

        const imagePlaceholder = document.createElement('div');
        imagePlaceholder.className = "image-placeholder";
        imagePlaceholder.innerHTML = '<div>Cliquez ou glissez une image</div>';

        imageContainer.appendChild(imagePreview);
        imageContainer.appendChild(imagePlaceholder);

        const hiddenImageInput = document.createElement('input');
        hiddenImageInput.type = "file";
        hiddenImageInput.accept = "image/*";
        hiddenImageInput.style.display = 'none';
        hiddenImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    q.image = event.target.result;
                    imagePreview.src = event.target.result;
                    imagePreview.style.display = 'block';
                    imagePlaceholder.style.display = 'none';
                    imageContainer.style.borderColor = '#00c853';
                    imageContainer.style.background = 'white';
                };
                reader.readAsDataURL(file);
            }
        });

        imageContainer.onclick = () => hiddenImageInput.click();

        // Drag and drop
        imageContainer.ondragover = (e) => {
            e.preventDefault();
            imageContainer.style.background = '#e8f5e9';
            imageContainer.style.borderColor = '#00c853';
        };

        imageContainer.ondragleave = () => {
            imageContainer.style.background = '#f0f0f0';
            imageContainer.style.borderColor = '#00bfff';
        };

        imageContainer.ondrop = (e) => {
            e.preventDefault();
            imageContainer.style.background = '#f0f0f0';
            imageContainer.style.borderColor = '#00bfff';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                hiddenImageInput.files = e.dataTransfer.files;
                const reader = new FileReader();
                reader.onload = (event) => {
                    q.image = event.target.result;
                    imagePreview.src = event.target.result;
                    imagePreview.style.display = 'block';
                    imagePlaceholder.style.display = 'none';
                    imageContainer.style.borderColor = '#00c853';
                    imageContainer.style.background = 'white';
                };
                reader.readAsDataURL(file);
            }
        };

        imageContainerWrapper.appendChild(imageContainer);
        editor.appendChild(imageContainerWrapper);

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

                    if (q.type === 'vrai-faux') {
                        // Vrai/Faux => mono-sélection
                        if (checkbox.checked) {
                            q.answers.forEach((ans, j) => ans.correct = (j === idx));
                        } else {
                            q.answers[idx].correct = false;
                        }
                    } else {
                        // Quiz normal => respecter q.answerLimit
                        if (checkbox.checked) {
                            const checkedCount = q.answers.filter(x => x.correct).length;
                            if (checkedCount > q.answerLimit) {
                                // Revert: cannot check more than limit
                                checkbox.checked = false;
                                q.answers[idx].correct = false;
                                return;
                            }
                            q.answers[idx].correct = true;
                        } else {
                            q.answers[idx].correct = false;
                        }
                    }

                    updateCheckboxes();
                });

                const t = document.createElement('input');
                t.type = "text";
                t.value = a.text;
                t.placeholder = "Réponse...";
                t.oninput = () => { a.text = t.value; };

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = "✕";
                deleteBtn.onclick = (e) => {
                    e.preventDefault();
                    if (q.answers.length > 2) {
                        console.log('Delete answer', idx);
                        q.answers.splice(idx, 1);
                        // Réassigner les symboles et couleurs
                        q.answers.forEach((a, i) => {
                            a.symbol = SYMBOLS[i];
                            a.color = COLORS[i];
                        });
                        renderAnswers();
                        updateCheckboxes();
                    } else {
                        alert('Vous devez avoir au minimum 2 réponses!');
                    }
                };

                d.appendChild(s);
                d.appendChild(checkbox);
                d.appendChild(t);
                d.appendChild(deleteBtn);
                answersDiv.appendChild(d);
            });
            updateCheckboxes();
        }

        function updateCheckboxes() {
            console.log('updateCheckboxes: limit =', q.answerLimit);

            // Ensure answerLimit is valid
            if (!q.answerLimit || isNaN(q.answerLimit)) {
                q.answerLimit = 1;
            }
            // Clamp between 1 and max answers
            q.answerLimit = Math.max(1, Math.min(q.answers.length, q.answerLimit));

            const checkedCount = q.answers.filter(a => a.correct).length;
            const checkboxes = answersDiv.querySelectorAll('input[type=checkbox]');

            checkboxes.forEach((cb, idx) => {
                cb.checked = !!q.answers[idx].correct;
                // For vrai-faux enforce single selection; for quiz, disable extras when at limit
                if (q.type === 'vrai-faux') {
                    // If one is checked, other is disabled
                    cb.disabled = !cb.checked && checkedCount >= 1;
                } else {
                    cb.disabled = !cb.checked && checkedCount >= q.answerLimit;
                }
            });
        }

        editor.appendChild(answersDiv);

        // BOUTON AJOUTER RÉPONSE - Stylisé (seulement pour quiz normal)
        if (q.type !== 'vrai-faux') {
            const addAnswer = document.createElement('button');
            addAnswer.className = "btn-add-answer";
            addAnswer.textContent = "+ Ajouter réponse";
            addAnswer.onclick = (e) => {
                e.preventDefault();
                console.log('Add answer clicked');
                if (q.answers.length >= 8) {
                    alert('Maximum 8 réponses!');
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
        }

        // ===== COLONNE DROITE =====
        const rightPanel = document.createElement('div');
        rightPanel.className = "right-panel";

        // LIMITE DE RÉPONSES (seulement pour quiz normal)
        if (q.type !== 'vrai-faux') {
            const limitLabel = document.createElement('label');
            limitLabel.textContent = 'Limite de réponses';
            const limitInput = document.createElement('input');
            limitInput.type = 'number';
            limitInput.className = "limit-input";
            limitInput.min = 1;
            limitInput.max = 4;
            limitInput.value = q.answerLimit;
            const limitContainer = document.createElement('div');
            limitContainer.appendChild(limitLabel);
            limitContainer.appendChild(limitInput);
            rightPanel.appendChild(limitContainer);

            limitInput.addEventListener('input', () => {
                console.log('Limit input changed to:', limitInput.value);
                let v = parseInt(limitInput.value);
                if (isNaN(v)) v = 1;
                v = Math.max(1, Math.min(4, v));
                limitInput.value = v;
                q.answerLimit = v;
                updateCheckboxes();
            });
        }

        // TEMPS (en secondes)
        const timeLabel = document.createElement('label');
        timeLabel.textContent = 'Temps (secondes)';
        const timeInput = document.createElement('input');
        timeInput.type = 'number';
        timeInput.className = "time-input";
        timeInput.min = 5;
        timeInput.max = 120;
        timeInput.value = q.timeLimit;
        const timeContainer = document.createElement('div');
        timeContainer.appendChild(timeLabel);
        timeContainer.appendChild(timeInput);
        rightPanel.appendChild(timeContainer);

        // POINTS
        const pointsLabel = document.createElement('label');
        pointsLabel.textContent = 'Points';
        const pointsInput = document.createElement('input');
        pointsInput.type = 'number';
        pointsInput.className = "points-input";
        pointsInput.min = 100;
        pointsInput.step = 100;
        pointsInput.value = q.points;
        const pointsContainer = document.createElement('div');
        pointsContainer.appendChild(pointsLabel);
        pointsContainer.appendChild(pointsInput);
        rightPanel.appendChild(pointsContainer);

        // EVENT LISTENERS TEMPS ET POINTS
        timeInput.addEventListener('input', () => {
            console.log('Time input changed to:', timeInput.value);
            let v = parseInt(timeInput.value);
            if (isNaN(v)) v = 30;
            v = Math.max(5, Math.min(120, v));
            timeInput.value = v;
            q.timeLimit = v;
        });

        pointsInput.addEventListener('input', () => {
            console.log('Points input changed to:', pointsInput.value);
            let v = parseInt(pointsInput.value);
            if (isNaN(v)) v = 1000;
            v = Math.max(100, v);
            pointsInput.value = v;
            q.points = v;
        });

        // ASSEMBLER LE LAYOUT
        mainWrapper.appendChild(editor);
        mainWrapper.appendChild(rightPanel);
        mainContent.appendChild(mainWrapper);

        renderAnswers();
    }
});
