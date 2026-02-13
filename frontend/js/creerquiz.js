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
                answerLimit: 1,
                timeLimit: 30,
                points: 1000
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

        // CONTENEUR PRINCIPAL (2 colonnes)
        const mainWrapper = document.createElement('div');
        mainWrapper.style.display = 'grid';
        mainWrapper.style.gridTemplateColumns = '1fr 300px';
        mainWrapper.style.gap = '20px';

        // ===== COLONNE GAUCHE =====
        const editor = document.createElement('div');
        editor.className = "quiz-editor";

        // QUESTION - Styling amélioré
        const question = document.createElement('input');
        question.type = 'text';
        question.placeholder = "Écris ta question...";
        question.value = q.question;
        question.oninput = () => { q.question = question.value; };
        question.style.width = '100%';
        question.style.padding = '15px';
        question.style.fontSize = '18px';
        question.style.fontWeight = 'bold';
        question.style.border = '3px solid #4b0082';
        question.style.borderRadius = '8px';
        question.style.marginBottom = '20px';
        question.style.boxSizing = 'border-box';
        question.style.boxShadow = '0 2px 8px rgba(75, 0, 130, 0.2)';
        question.style.transition = 'all 0.3s ease';
        question.onfocus = () => {
            question.style.borderColor = '#00bfff';
            question.style.boxShadow = '0 4px 12px rgba(0, 191, 255, 0.3)';
        };
        question.onblur = () => {
            question.style.borderColor = '#4b0082';
            question.style.boxShadow = '0 2px 8px rgba(75, 0, 130, 0.2)';
        };
        editor.appendChild(question);

        // IMAGE - Carré avec preview (CENTRÉ)
        const imageContainerWrapper = document.createElement('div');
        imageContainerWrapper.style.display = 'flex';
        imageContainerWrapper.style.justifyContent = 'center';
        imageContainerWrapper.style.marginBottom = '20px';

        const imageContainer = document.createElement('div');
        imageContainer.style.width = '250px';
        imageContainer.style.height = '250px';
        imageContainer.style.background = '#f0f0f0';
        imageContainer.style.border = '3px dashed #00bfff';
        imageContainer.style.borderRadius = '8px';
        imageContainer.style.display = 'flex';
        imageContainer.style.alignItems = 'center';
        imageContainer.style.justifyContent = 'center';
        imageContainer.style.cursor = 'pointer';
        imageContainer.style.position = 'relative';
        imageContainer.style.overflow = 'hidden';
        imageContainer.style.transition = 'all 0.3s ease';

        const imagePreview = document.createElement('img');
        imagePreview.style.width = '100%';
        imagePreview.style.height = '100%';
        imagePreview.style.objectFit = 'cover';
        imagePreview.style.display = 'none';

        const imagePlaceholder = document.createElement('div');
        imagePlaceholder.style.textAlign = 'center';
        imagePlaceholder.style.color = '#999';
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
                    a.correct = checkbox.checked;
                    updateCheckboxes();
                });

                const t = document.createElement('input');
                t.type = "text";
                t.value = a.text;
                t.placeholder = "Réponse...";
                t.oninput = () => { a.text = t.value; };

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = "✕";
                deleteBtn.style.background = "rgba(255,255,255,0.3)";
                deleteBtn.style.border = "none";
                deleteBtn.style.color = "white";
                deleteBtn.style.cursor = "pointer";
                deleteBtn.style.padding = "5px 10px";
                deleteBtn.style.borderRadius = "4px";
                deleteBtn.style.fontSize = "16px";
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

            // Count checked answers
            const checkedCount = q.answers.filter(a => a.correct).length;
            
            // Mettre à jour la limite en fonction du nombre de cases cochées
            if (checkedCount > 0) {
                q.answerLimit = checkedCount;
                limitInput.value = checkedCount;
                console.log('Updated answerLimit to:', checkedCount);
            }

            if (!q.answerLimit || isNaN(q.answerLimit)) {
                q.answerLimit = 1;
            }

            // Force limit to be between 1 and 4
            q.answerLimit = Math.max(1, Math.min(4, q.answerLimit));

            const checkboxes = answersDiv.querySelectorAll('input[type=checkbox]');

            checkboxes.forEach((cb, idx) => {
                cb.checked = !!q.answers[idx].correct;
                console.log('Checkbox', idx, '- checked:', cb.checked);
            });
        }

        editor.appendChild(answersDiv);

        // BOUTON AJOUTER RÉPONSE - Stylisé
        const addAnswer = document.createElement('button');
        addAnswer.textContent = "+ Ajouter réponse";
        addAnswer.style.width = '100%';
        addAnswer.style.padding = '12px';
        addAnswer.style.fontSize = '16px';
        addAnswer.style.fontWeight = 'bold';
        addAnswer.style.background = 'linear-gradient(135deg, #00bfff, #00c853)';
        addAnswer.style.color = 'white';
        addAnswer.style.border = 'none';
        addAnswer.style.borderRadius = '8px';
        addAnswer.style.cursor = 'pointer';
        addAnswer.style.marginTop = '15px';
        addAnswer.style.transition = 'all 0.3s ease';
        addAnswer.style.boxShadow = '0 4px 8px rgba(0, 191, 255, 0.3)';
        addAnswer.onmouseover = () => {
            addAnswer.style.transform = 'translateY(-2px)';
            addAnswer.style.boxShadow = '0 6px 12px rgba(0, 191, 255, 0.5)';
        };
        addAnswer.onmouseout = () => {
            addAnswer.style.transform = 'translateY(0)';
            addAnswer.style.boxShadow = '0 4px 8px rgba(0, 191, 255, 0.3)';
        };
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

        // ===== COLONNE DROITE =====
        const rightPanel = document.createElement('div');
        rightPanel.style.background = 'white';
        rightPanel.style.padding = '20px';
        rightPanel.style.borderRadius = '8px';
        rightPanel.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        rightPanel.style.display = 'flex';
        rightPanel.style.flexDirection = 'column';
        rightPanel.style.gap = '15px';
        rightPanel.style.height = 'fit-content';

        // LIMITE DE RÉPONSES
        const limitLabel = document.createElement('label');
        limitLabel.textContent = 'Limite de réponses';
        limitLabel.style.fontWeight = 'bold';
        limitLabel.style.color = '#333';
        limitLabel.style.fontSize = '14px';
        const limitInput = document.createElement('input');
        limitInput.type = 'number';
        limitInput.min = 1;
        limitInput.max = 4;
        limitInput.value = q.answerLimit;
        limitInput.style.width = '100%';
        limitInput.style.padding = '8px';
        limitInput.style.border = '2px solid #00bfff';
        limitInput.style.borderRadius = '5px';
        limitInput.style.boxSizing = 'border-box';
        const limitContainer = document.createElement('div');
        limitContainer.appendChild(limitLabel);
        limitContainer.appendChild(limitInput);
        rightPanel.appendChild(limitContainer);

        // TEMPS (en secondes)
        const timeLabel = document.createElement('label');
        timeLabel.textContent = 'Temps (secondes)';
        timeLabel.style.fontWeight = 'bold';
        timeLabel.style.color = '#333';
        timeLabel.style.fontSize = '14px';
        const timeInput = document.createElement('input');
        timeInput.type = 'number';
        timeInput.min = 5;
        timeInput.max = 120;
        timeInput.value = q.timeLimit;
        timeInput.style.width = '100%';
        timeInput.style.padding = '8px';
        timeInput.style.border = '2px solid #ff9500';
        timeInput.style.borderRadius = '5px';
        timeInput.style.boxSizing = 'border-box';
        const timeContainer = document.createElement('div');
        timeContainer.appendChild(timeLabel);
        timeContainer.appendChild(timeInput);
        rightPanel.appendChild(timeContainer);

        // POINTS
        const pointsLabel = document.createElement('label');
        pointsLabel.textContent = 'Points';
        pointsLabel.style.fontWeight = 'bold';
        pointsLabel.style.color = '#333';
        pointsLabel.style.fontSize = '14px';
        const pointsInput = document.createElement('input');
        pointsInput.type = 'number';
        pointsInput.min = 100;
        pointsInput.step = 100;
        pointsInput.value = q.points;
        pointsInput.style.width = '100%';
        pointsInput.style.padding = '8px';
        pointsInput.style.border = '2px solid #00c853';
        pointsInput.style.borderRadius = '5px';
        pointsInput.style.boxSizing = 'border-box';
        const pointsContainer = document.createElement('div');
        pointsContainer.appendChild(pointsLabel);
        pointsContainer.appendChild(pointsInput);
        rightPanel.appendChild(pointsContainer);

        // EVENT LISTENERS
        limitInput.addEventListener('input', () => {
            console.log('Limit input changed to:', limitInput.value);
            let v = parseInt(limitInput.value);
            if (isNaN(v)) v = 1;
            v = Math.max(1, Math.min(4, v));
            limitInput.value = v;
            q.answerLimit = v;
            updateCheckboxes();
        });

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
