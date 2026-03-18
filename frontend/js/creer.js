document.addEventListener('DOMContentLoaded', () => {
    const btnQuiz = document.getElementById('btnQuiz');
    const btnQuizDoc = document.getElementById('btnQuizDoc');

    if(btnQuiz) {
        btnQuiz.addEventListener('click', () => {
            window.location.href = 'creerquiz.html'; 
        });
    }

    if(btnQuizDoc) {
        btnQuizDoc.addEventListener('click', () => {
            window.location.href = 'creerquiz.html'; 
        });
    }
});
