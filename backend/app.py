from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from database import init_db, create_room, join_room, add_question, get_questions

app = Flask(__name__, static_folder="frontend", static_url_path="")
CORS(app)


init_db()

API_KEY = "TA_CLE_API_ICI"


@app.route("/api/create-room", methods=["POST"])
def api_create_room():
    data = request.get_json()
    api_key = request.headers.get("x-api-key")
    if api_key != API_KEY:
        return jsonify({"message": "Clé API invalide"}), 403

    room_code = data.get("roomCode")
    room_name = data.get("roomName")
    if not room_code or not room_name:
        return jsonify({"message": "roomCode et roomName requis"}), 400

    if not create_room(room_code, room_name):
        return jsonify({"message": "Room déjà existante"}), 400

    return jsonify({"message": f"Room {room_name} créée !"})

@app.route("/api/join-quiz", methods=["POST"])
def api_join_quiz():
    data = request.get_json()
    api_key = request.headers.get("x-api-key")
    if api_key != API_KEY:
        return jsonify({"message": "Clé API invalide"}), 403

    username = data.get("username")
    room_code = data.get("roomCode")
    if not username or not room_code:
        return jsonify({"message": "username et roomCode requis"}), 400

    if not join_room(room_code, username):
        return jsonify({"message": "Room inexistante"}), 404

    return jsonify({"message": f"{username} a rejoint le quiz {room_code}"})

@app.route("/api/add-question", methods=["POST"])
def api_add_question():
    data = request.get_json()
    api_key = request.headers.get("x-api-key")
    if api_key != API_KEY:
        return jsonify({"message": "Clé API invalide"}), 403

    room_code = data.get("roomCode")
    question = data.get("question")
    answer = data.get("answer")

    if not room_code or not question or not answer:
        return jsonify({"message": "roomCode, question et answer requis"}), 400

    if not add_question(room_code, question, answer):
        return jsonify({"message": "Room inexistante"}), 404

    return jsonify({"message": "Question ajoutée"})

@app.route("/api/questions/<room_code>")
def api_get_questions(room_code):
    return jsonify(get_questions(room_code))


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and path != "favicon.ico":
        try:
            return send_from_directory(app.static_folder, path)
        except:
            pass
    return send_from_directory(app.static_folder, "creerquiz.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
