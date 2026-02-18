const email = document.getElementById("email");
const password = document.getElementById("password");

document.getElementById("loginBtn").onclick = async () => {
    console.log("Email:", email.value, "Password:", password.value); // debug
    try {
        const res = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        });

        const data = await res.json();  // ici tu dois recevoir du JSON
        console.log("Réponse backend:", data);
        if (data.success) {
            window.location.href = "compte.html";
        } else {
            alert(data.message || "Email ou mot de passe incorrect");
        }
    } catch (err) {
        console.error(err);
        alert("Erreur serveur");
    }
};
