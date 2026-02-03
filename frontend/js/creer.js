document.addEventListener('DOMContentLoaded', () => {
    const btnQuiz = document.getElementById('btnQuiz');
    const btnQuizDoc = document.getElementById('btnQuizDoc');

    if(btnQuiz) {
        btnQuiz.addEventListener('click', () => {
            alert("Tu vas créer un quiz simple !");
            
        });
    }

    if(btnQuizDoc) {
        btnQuizDoc.addEventListener('click', () => {
            alert("Tu vas créer un quiz avec document !");
            
        });
    }
});
