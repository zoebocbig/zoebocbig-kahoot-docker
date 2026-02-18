const email = document.getElementById("email");
const password = document.getElementById("password");

document.getElementById("registerBtn").onclick = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        });

        const contentType = res.headers.get("Content-Type") || "";
        if (!contentType.includes("application/json")) {
            console.error("Réponse non JSON brute :", await res.text());
            alert("Erreur serveur : réponse invalide");
            return;
        }

        const data = await res.json();

        if (data.success) {
            window.location.href = "login.html"; // redirection vers login après création
        } else {
            alert("Compte déjà existant");
        }
    } catch (err) {
        console.error(err);
        alert("Impossible de contacter le serveur");
    }
};
