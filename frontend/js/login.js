const email = document.getElementById("email");
const password = document.getElementById("password");

document.getElementById("loginBtn").onclick = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        });

        // Vérifie que le serveur a renvoyé du JSON
        const contentType = res.headers.get("Content-Type") || "";
        if (!contentType.includes("application/json")) {
            console.error("Réponse non JSON brute :", await res.text());
            alert("Erreur serveur : réponse invalide");
            return;
        }

        const data = await res.json();

        if (data.success) {
            window.location.href = "compte.html"; // redirection vers la page compte
        } else {
            alert("Email ou mot de passe incorrect");
        }
    } catch (err) {
        console.error(err);
        alert("Impossible de contacter le serveur");
    }
};
