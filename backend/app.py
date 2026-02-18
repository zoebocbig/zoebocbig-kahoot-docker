from flask import Flask, request, jsonify, session, redirect, send_from_directory
from flask_cors import CORS

from database import (
    init_db,
    create_user,
    login_user,
    create_room,
    join_room,
    add_question,
    get_questions,
    get_user_quizzes
)

# ---------------- FLASK ----------------
app = Flask(__name__, static_folder="../frontend", static_url_path="")
app.secret_key = "SUPER_SECRET_KEY"
CORS(app)

# ---------------- INIT DB ----------------
init_db()  # Crée toutes les tables si elles n'existent pas

API_KEY = "TA_CLE_API_ICI"

# ---------------- API QUIZ ----------------

@app.route("/api/create-room", methods=["POST"])
def api_create_room():
    data = request.get_json()
    if request.headers.get("x-api-key") != API_KEY:
        return jsonify({"message": "Clé API invalide"}), 403

    if not create_room(data["roomCode"], data["roomName"]):
        return jsonify({"message": "Room déjà existante"}), 400

    return jsonify({"success": True})


@app.route("/api/join-quiz", methods=["POST"])
def api_join_quiz():
    data = request.get_json()
    if not join_room(data["roomCode"], data["username"]):
        return jsonify({"message": "Room inexistante"}), 404

    return jsonify({"success": True})


@app.route("/api/add-question", methods=["POST"])
def api_add_question():
    data = request.get_json()
    if not add_question(data["roomCode"], data["question"], data["answer"]):
        return jsonify({"message": "Room inexistante"}), 404

    return jsonify({"success": True})


@app.route("/api/questions/<room_code>")
def api_get_questions(room_code):
    return jsonify(get_questions(room_code))

# ---------------- AUTH ----------------

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if create_user(data["email"], data["password"]):
        return jsonify({"success": True})
    return jsonify({"success": False})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = login_user(data["email"], data["password"])
    if user:
        session["user"] = user[0]  # stocke l'id
        return jsonify({"success": True})
    return jsonify({"success": False})


@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"success": True})

# ---------------- PROTECTION CREATEUR ----------------

@app.route("/creerquiz.html")
def creator():
    if "user" not in session:
        return redirect("/login.html")
    return send_from_directory(app.static_folder, "creerquiz.html")


@app.route("/compte.html")
def compte_page():
    if "user" not in session:
        return redirect("/login.html")
    return send_from_directory(app.static_folder, "compte.html")


@app.route("/api/my-quizzes")
def my_quizzes():
    if "user" not in session:
        return jsonify({"success": False, "message": "Non connecté"}), 403
    user_id = session["user"]
    quizzes = get_user_quizzes(user_id)
    return jsonify({"success": True, "quizzes": quizzes})

# ---------------- FRONTEND ----------------

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and path != "favicon.ico":
        try:
            return send_from_directory(app.static_folder, path)
        except:
            pass
    return send_from_directory(app.static_folder, "home.html")

# ---------------- LANCEMENT ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
