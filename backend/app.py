from flask import Flask, request, jsonify, session, redirect, send_from_directory
from flask_cors import CORS
from database import init_db, create_user, login_user, add_quiz, update_quiz, delete_quiz, get_user_quizzes, get_quiz, pin_exists, get_quiz_by_pin
import random

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

    quiz_id = add_quiz(
        data.get("title"),
        data.get("type"),
        data.get("questions", []),
        session["user"],
        pin
    )

    return jsonify({
        "success": True,
        "quiz_id": quiz_id,
        "pin": pin
    })

# 👉 NOUVEAU : rejoindre avec PIN
@app.route("/api/join-quiz", methods=["POST"])
def join_quiz():
    data = request.get_json()
    pin = data.get("pin")

    quiz = get_quiz_by_pin(pin)

    if not quiz:
        return jsonify({"success": False, "message": "PIN invalide"})

    return jsonify({
        "success": True,
        "quiz": quiz
    })

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

@app.route("/api/my-quizzes")
def my_quizzes():
    if "user" not in session:
        return jsonify({"success": False}), 403

    return jsonify({
        "success": True,
        "quizzes": get_user_quizzes(session["user"])
    })

@app.route("/api/quiz/<int:quiz_id>")
def quiz_api(quiz_id):
    if "user" not in session:
        return jsonify({"success": False}), 403

    quiz = get_quiz(quiz_id)
    if not quiz:
        return jsonify({"success": False})

    return jsonify({
        "success": True,
        "quiz": quiz
    })

# ---------------- PAGES ----------------
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