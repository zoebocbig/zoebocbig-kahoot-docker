import "../css/home.css";
import { useState } from "react";

function Home() {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (code.trim() === "") {
      alert("Entre un code de quiz");
      return;
    }

    fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) alert("Quiz trouvé");
        else alert("Code invalide");
      })
      .catch(() => alert("Erreur serveur"));
  };

  return (
    <div className="home-container">
      <h1 className="title">Kahoot Clone</h1>

      <form className="join-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Code du quiz"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit">Rejoindre</button>
      </form>
    </div>
  );
}

export default Home;
