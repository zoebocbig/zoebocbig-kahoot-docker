from flask import Flask, request, jsonify, session, redirect, send_from_directory
from flask_cors import CORS
from database import *
import random, os

app = Flask(__name__, static_folder="../frontend", static_url_path="")
app.secret_key = "SUPER_SECRET_KEY"
CORS(app, supports_credentials=True)

init_db()

# ---------------- PIN ----------------
def generate_pin():
    return str(random.randint(100000, 999999))

def generate_unique_pin():
    while True:
        pin = generate_pin()
        if not pin_exists(pin):
            return pin

# ---------------- MULTIPLAYER STATE ----------------
quizzes_state = {}
for quiz in get_all_quizzes():
    pin = quiz["pin"]
    quizzes_state[pin] = {"started": False, "current_question": 0, "players": {}}

# ---------------- AUTH ----------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if create_user(data["email"], data["password"]):
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Email déjà utilisé"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = login_user(data["email"], data["password"])
    if user:
        session["user"] = user[0]
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Email ou mot de passe incorrect"})

@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"success": True})

# ---------------- QUIZZES ----------------
@app.route("/api/add-quiz", methods=["POST"])
def add_quiz_api():
    if "user" not in session:
        return jsonify({"success": False}), 403
    data = request.get_json()
    pin = generate_unique_pin()
    quiz_id = add_quiz(data.get("title"), data.get("type"), data.get("questions", []), session["user"], pin)
    quizzes_state[pin] = {"started": False, "current_question": 0, "players": {}}
    return jsonify({"success": True, "quiz_id": quiz_id, "pin": pin})

@app.route("/api/my-quizzes")
def my_quizzes():
    if "user" not in session:
        return jsonify({"success": False}), 403
    return jsonify({"success": True, "quizzes": get_user_quizzes(session["user"])})

@app.route("/api/start-quiz", methods=["POST"])
def api_start_quiz():
    data = request.get_json()
    pin = data.get("pin")
    if pin in quizzes_state:
        quizzes_state[pin]["started"] = True
        quizzes_state[pin]["current_question"] = 0
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "PIN invalide"}), 404

@app.route("/api/quiz-status", methods=["GET"])
def quiz_status():
    pin = request.args.get("pin")
    if pin in quizzes_state:
        return jsonify({"started": quizzes_state[pin]["started"]})
    return jsonify({"success": False, "message": "PIN invalide"}), 404

@app.route("/api/join-quiz", methods=["POST"])
def join_quiz():
    data = request.get_json()
    pin, pseudo = data.get("pin"), data.get("pseudo")
    quiz = get_quiz_by_pin(pin)
    if not quiz:
        return jsonify({"success": False, "message": "PIN invalide"})
    if pin not in quizzes_state:
        quizzes_state[pin] = {"started": False, "current_question": 0, "players": {}}
    quizzes_state[pin]["players"].setdefault(pseudo, 0)
    return jsonify({"success": True, "quiz": quiz})

# ---------------- CURRENT QUESTION ----------------
@app.route("/api/current-question", methods=["GET"])
def current_question():
    pin = request.args.get("pin")
    if pin not in quizzes_state:
        return jsonify({"success": False, "message": "PIN invalide"}), 404

    state = quizzes_state[pin]
    quiz = get_quiz_by_pin(pin)
    index = state["current_question"]

    if index >= len(quiz["questions"]):
        return jsonify({"success": True, "finished": True})

    return jsonify({"success": True, "question": quiz["questions"][index], "index": index})

@app.route("/api/answer", methods=["POST"])
def answer_question():
    data = request.get_json()
    pin, pseudo, answer_index = data.get("pin"), data.get("pseudo"), data.get("answer_index")

    if pin not in quizzes_state or pseudo not in quizzes_state[pin]["players"]:
        return jsonify({"success": False}), 404

    state = quizzes_state[pin]
    quiz = get_quiz_by_pin(pin)
    index = state["current_question"]
    question = quiz["questions"][index]

    if question["answers"][answer_index].get("correct"):
        state["players"][pseudo] += question["points"]

    # Pour simplifier, avancer immédiatement à la question suivante
    state["current_question"] += 1
    return jsonify({"success": True, "score": state["players"][pseudo]})

# ---------------- LEADERBOARD ----------------
@app.route("/api/leaderboard/<pin>")
def leaderboard(pin):
    if pin not in quizzes_state:
        return jsonify({"success": False}), 404
    players = quizzes_state[pin]["players"]
    leaderboard = sorted([{"name": p, "score": s} for p, s in players.items()],
                         key=lambda x: x["score"], reverse=True)
    return jsonify({"success": True, "leaderboard": leaderboard})

# ---------------- CRUD / STATIC / PAGES ----------------
@app.route("/api/update-quiz/<int:quiz_id>", methods=["POST"])
def update_quiz_api(quiz_id):
    if "user" not in session:
        return jsonify({"success": False}), 403
    data = request.get_json()
    update_quiz(quiz_id, data.get("title"), data.get("type"), data.get("questions", []))
    return jsonify({"success": True})

@app.route("/api/delete-quiz/<int:quiz_id>", methods=["DELETE"])
def delete_quiz_api(quiz_id):
    if "user" not in session:
        return jsonify({"success": False}), 403
    delete_quiz(quiz_id)
    return jsonify({"success": True})

@app.route("/api/quiz/<int:quiz_id>")
def quiz_api(quiz_id):
    if "user" not in session:
        return jsonify({"success": False}), 403
    quiz = get_quiz(quiz_id)
    if not quiz:
        return jsonify({"success": False})
    return jsonify({"success": True, "quiz": quiz})

@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory(os.path.join(app.static_folder, "js"), filename)

@app.route("/css/<path:filename>")
def serve_css(filename):
    return send_from_directory(os.path.join(app.static_folder, "css"), filename)

@app.route("/creerquiz.html")
def creer_quiz_page():
    if "user" not in session:
        return redirect("/login.html")
    return send_from_directory(app.static_folder, "creerquiz.html")

@app.route("/compte.html")
def compte_page():
    if "user" not in session:
        return redirect("/login.html")
    return send_from_directory(app.static_folder, "compte.html")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and path != "favicon.ico":
        try:
            return send_from_directory(app.static_folder, path)
        except:
            pass
    return send_from_directory(app.static_folder, "home.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)