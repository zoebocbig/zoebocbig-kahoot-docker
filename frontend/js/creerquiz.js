document.addEventListener('DOMContentLoaded', async () => {
    console.log('creerquiz.js: DOMContentLoaded');

    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const quizList = document.getElementById('quizList');
    const mainContent = document.getElementById('mainContent');
    const saveQuizBtn = document.getElementById("saveQuizBtn");

    const COLORS = ['#00bfff', '#ff4c4c', '#ffcc00', '#00c853', '#ff6b9d', '#38ada9', '#78e08f', '#f368e0'];
    const SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    let quizzes = [];
    let currentQuizIndex = null;
    let editingQuizId = null; // ID si édition

    // ----------------- Vérifier si on est en mode édition -----------------
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("edit")) {
        editingQuizId = parseInt(urlParams.get("edit"));
        try {
            const res = await fetch(`http://localhost:5000/api/quiz/${editingQuizId}`, { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                quizzes = data.quiz.questions;
                document.title = `Éditer: ${data.quiz.title}`;
            }
        } catch (err) { console.error(err); }
    }

    // ----------------- Ajouter Question -----------------
    if(addBtn){
        addBtn.onclick = (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        };
    }

    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if(e.target===modal) modal.style.display='none'; }

    modalBtns.forEach((btn) => {
        btn.onclick = (e) => {
            e.preventDefault();
            const type = btn.dataset.type;
            const newQuiz = type === 'vrai-faux' ? {
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
            } : {
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
            quizzes.push(newQuiz);
            currentQuizIndex = quizzes.length-1;
            modal.style.display = 'none';
            renderSidebar();
            showQuiz(currentQuizIndex);
        };
    });

    // ----------------- Sidebar -----------------
    function renderSidebar(){
        quizList.innerHTML = '';
        quizzes.forEach((q,i)=>{
            const div = document.createElement('div');
            div.className='quiz-item';
            div.textContent=`Question ${i+1}`;
            div.onclick=()=>{currentQuizIndex=i; showQuiz(i);}
            const del = document.createElement('button');
            del.textContent='×';
            del.style.marginLeft='5px';
            del.onclick=(e)=>{
                e.stopPropagation(); 
                quizzes.splice(i,1); 
                renderSidebar(); 
                mainContent.innerHTML="<p>Sélectionne un quiz pour modifier.</p>";
            };
            div.appendChild(del);
            quizList.appendChild(div);
        });
    }

    // ----------------- Afficher Question -----------------
    function showQuiz(i){
        const q = quizzes[i];
        mainContent.innerHTML='';

        const mainWrapper=document.createElement('div');
        mainWrapper.className="quiz-layout";

        // --------- Colonne gauche (question + réponses + image) ---------
        const editor=document.createElement('div');
        editor.className="quiz-editor";

        // Question
        const questionInput=document.createElement('input');
        questionInput.type='text'; 
        questionInput.className = "question-input";
        questionInput.value=q.question;
        questionInput.placeholder="Écris ta question...";
        questionInput.oninput=()=>{q.question=questionInput.value;};
        editor.appendChild(questionInput);

        // Image
        const imageContainer=document.createElement('div');
        imageContainer.className="image-container";
        const imagePreview=document.createElement('img');
        imagePreview.src=q.image||''; 
        imagePreview.style.display=q.image?'block':'none';
        imageContainer.appendChild(imagePreview);
        editor.appendChild(imageContainer);

        const fileInput=document.createElement('input');
        fileInput.type='file'; fileInput.accept='image/*'; fileInput.style.display='none';
        fileInput.onchange=(e)=>{
            const file=e.target.files[0];
            if(file){
                const reader=new FileReader();
                reader.onload=(ev)=>{
                    q.image=ev.target.result; 
                    imagePreview.src=q.image; 
                    imagePreview.style.display='block';
                };
                reader.readAsDataURL(file);
            }
        };
        imageContainer.onclick=()=>fileInput.click();
        editor.appendChild(fileInput);

        // Answers
        const answersDiv=document.createElement('div'); answersDiv.className='answers';
        function renderAnswers(){
            answersDiv.innerHTML='';
            q.answers.forEach((a,idx)=>{
                const d=document.createElement('div'); d.className='answer-item'; d.style.background=a.color;
                const s=document.createElement('span'); s.textContent=a.symbol; d.appendChild(s);
                const checkbox=document.createElement('input'); checkbox.type='checkbox'; checkbox.checked=a.correct;
                checkbox.onchange=()=>{
                    if(q.type==='vrai-faux'){
                        if(checkbox.checked){ q.answers.forEach((ans,j)=>ans.correct=(j===idx)); }
                        else q.answers[idx].correct=false;
                    } else {
                        const count=q.answers.filter(x=>x.correct).length;
                        if(checkbox.checked && count>=q.answerLimit){ checkbox.checked=false; return; }
                        q.answers[idx].correct=checkbox.checked;
                    }
                    renderAnswers();
                };
                d.appendChild(checkbox);
                const t=document.createElement('input'); t.type='text'; t.value=a.text; t.placeholder="Réponse...";
                t.oninput=()=>{a.text=t.value;}; d.appendChild(t);
                const del=document.createElement('button'); del.textContent='✕';
                del.onclick=(e)=>{
                    e.preventDefault(); 
                    if(q.answers.length>2){q.answers.splice(idx,1); renderAnswers();} 
                    else alert("Minimum 2 réponses");
                };
                d.appendChild(del);
                answersDiv.appendChild(d);
            });
        }
        renderAnswers();
        editor.appendChild(answersDiv);

        // Ajouter réponse (quiz normal)
        if(q.type!=='vrai-faux'){
            const addAnswerBtn=document.createElement('button'); 
            addAnswerBtn.className="btn-add-answer"; // <-- Correction CSS
            addAnswerBtn.textContent='+ Ajouter réponse';
            addAnswerBtn.onclick=(e)=>{
                e.preventDefault(); 
                if(q.answers.length<8){
                    q.answers.push({text:'',correct:false,color:COLORS[q.answers.length],symbol:SYMBOLS[q.answers.length]}); 
                    renderAnswers();
                } else alert('Max 8 réponses');
            };
            editor.appendChild(addAnswerBtn);
        }

        // --------- Colonne droite (limite, temps, points) ---------
        const right=document.createElement('div'); right.className='right-panel';

        if(q.type!=='vrai-faux'){
            const limitLabel=document.createElement('label'); limitLabel.textContent='Limite réponses';
            const limitInput=document.createElement('input'); limitInput.type='number'; limitInput.value=q.answerLimit; limitInput.min=1; limitInput.max=4;
            limitInput.oninput=()=>{ 
                let v=parseInt(limitInput.value); 
                if(isNaN(v))v=1; 
                v=Math.max(1,Math.min(4,v)); 
                q.answerLimit=v; 
                renderAnswers(); 
            };
            right.appendChild(limitLabel); right.appendChild(limitInput);
        }

        const timeLabel=document.createElement('label'); timeLabel.textContent='Temps (s)';
        const timeInput=document.createElement('input'); timeInput.type='number'; timeInput.value=q.timeLimit; timeInput.min=5; timeInput.max=120;
        timeInput.oninput=()=>{ let v=parseInt(timeInput.value); if(isNaN(v))v=30; v=Math.max(5,Math.min(120,v)); q.timeLimit=v; };
        right.appendChild(timeLabel); right.appendChild(timeInput);

        const pointsLabel=document.createElement('label'); pointsLabel.textContent='Points';
        const pointsInput=document.createElement('input'); pointsInput.type='number'; pointsInput.value=q.points; pointsInput.min=100; pointsInput.step=100;
        pointsInput.oninput=()=>{ let v=parseInt(pointsInput.value); if(isNaN(v))v=1000; v=Math.max(100,v); q.points=v; };
        right.appendChild(pointsLabel); right.appendChild(pointsInput);

        mainWrapper.appendChild(editor); mainWrapper.appendChild(right);
        mainContent.appendChild(mainWrapper);
        renderSidebar();
    }

    // ----------------- Enregistrer Quiz -----------------
    if(saveQuizBtn){
        saveQuizBtn.onclick=async()=>{
            if(quizzes.length===0){ alert("Ajoute au moins une question !"); return; }
            const title=prompt("Titre du quiz :", "Quiz du "+new Date().toLocaleDateString());
            if(!title)return;
            const type = quizzes.some(q=>q.type==='vrai-faux') ? 'vrai-faux' : 'quiz';
            try{
                let url = "http://localhost:5000/api/add-quiz";
                let method = "POST";
                if(editingQuizId){ url=`http://localhost:5000/api/update-quiz/${editingQuizId}`; method="POST"; }
                const res = await fetch(url,{
                    method,
                    headers:{"Content-Type":"application/json"},
                    credentials:"include",
                    body:JSON.stringify({title,type,questions:quizzes})
                });
                const data = await res.json();
                if(data.success){ alert("Quiz enregistré !"); window.location.href="compte.html"; }
                else alert(data.message||"Erreur lors de l'enregistrement");
            }catch(err){ console.error(err); alert("Erreur serveur"); }
        }
    }

    // Si on était en mode édition, afficher la première question
    if(quizzes.length>0) showQuiz(0);
});