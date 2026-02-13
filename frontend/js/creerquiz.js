document.addEventListener('DOMContentLoaded', () => {

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

    addBtn.onclick = () => modal.style.display = 'block';
    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = e => { if(e.target === modal) modal.style.display = 'none'; };

    modalBtns.forEach(btn => {
        btn.onclick = () => {
            const quiz = {
                question: "",
                image: null,
                answers: []
            };

            quizzes.push(quiz);
            const index = quizzes.length - 1;

            const slide = document.createElement('div');
            slide.className = 'quiz-item';
            slide.textContent = `Question ${index+1}`;
            slide.style.display = "flex";
            slide.style.justifyContent = "space-between";
            slide.style.alignItems = "center";

            const del = document.createElement('button');
            del.textContent = "×";
            del.style.background = "transparent";
            del.style.border = "none";
            del.style.color = "white";
            del.style.fontSize = "18px";
            del.style.cursor = "pointer";
            del.onclick = e => {
                e.stopPropagation();
                quizzes.splice(index,1);
                slide.remove();
                if(currentQuizIndex === index) mainContent.innerHTML="";
            };

            slide.appendChild(del);
            quizList.appendChild(slide);

            slide.onclick = () => showQuiz(index);
            modal.style.display = 'none';
        };
    });

    function showQuiz(i){
        currentQuizIndex = i;
        const q = quizzes[i];

        mainContent.innerHTML = '';

        const editor = document.createElement('div');
        editor.className = "quiz-editor";

        // QUESTION
        const question = document.createElement('input');
        question.placeholder = "Écris ta question...";
        question.value = q.question;
        question.oninput = ()=> q.question = question.value;
        editor.appendChild(question);

        // IMAGE : bouton PARCOURIR classique
        const imageInput = document.createElement('input');
        imageInput.type = "file";
        imageInput.accept = "image/*";
        imageInput.onchange = e => {
            const f = e.target.files[0];
            if(!f) return;
            const reader = new FileReader();
            reader.onload = ev => {
                q.image = ev.target.result;
                if(!editor.querySelector('img')) {
                    const img = document.createElement('img');
                    img.src = ev.target.result;
                    img.style.width = "400px";
                    img.style.height = "220px";
                    img.style.objectFit = "cover";
                    img.style.marginBottom = "15px";
                    editor.insertBefore(img, answersDiv);
                } else {
                    editor.querySelector('img').src = ev.target.result;
                }
            };
            reader.readAsDataURL(f);
        };
        editor.appendChild(imageInput);

        // RÉPONSES
        const answersDiv = document.createElement('div');
        answersDiv.className="answers";

        function renderAnswers(){
            answersDiv.innerHTML='';
            q.answers.forEach((a,idx)=>{
                const d = document.createElement('div');
                d.className="answer-item";
                d.style.background=a.color;

                const s = document.createElement('span');
                s.textContent=a.symbol;

                const r = document.createElement('input');
                r.type="radio";
                r.name="correct";
                r.checked=a.correct;
                r.onchange=()=> q.answers.forEach((x,j)=>x.correct=j===idx);

                const t = document.createElement('input');
                t.value=a.text;
                t.placeholder="Réponse...";
                t.oninput=()=>a.text=t.value;

                d.append(s,r,t);
                answersDiv.appendChild(d);
            });
        }

        editor.appendChild(answersDiv);

        const addAnswer = document.createElement('button');
        addAnswer.textContent="Ajouter réponse";
        addAnswer.onclick=()=>{
            if(q.answers.length>=4) return;
            const id = q.answers.length;
            q.answers.push({
                text:"",
                correct:false,
                color:COLORS[id],
                symbol:SYMBOLS[id]
            });
            renderAnswers();
        };

        editor.appendChild(addAnswer);
        mainContent.appendChild(editor);

        renderAnswers();
    }

});
