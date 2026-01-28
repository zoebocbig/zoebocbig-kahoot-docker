from flask import Flask, jsonify, send_from_directory
import os
from dotenv import load_dotenv
from database import init_db, get_questions, add_question

load_dotenv()

app = Flask(
    __name__,
    static_folder="frontend/dist",
    static_url_path=""
)
init_db()



@app.route("/api/questions")
def questions():
    return jsonify(get_questions())

@app.route("/api/add")
def add():
    add_question("Capitale de la France ?", "Paris")
    return "Question ajoutée"

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
