const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");

registerBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Merci de remplir tous les champs.");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            alert("Compte créé avec succès !");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Impossible de créer le compte.");
        }
    } catch (err) {
        console.error(err);
        alert("Erreur serveur, réessaye plus tard.");
    }
};
