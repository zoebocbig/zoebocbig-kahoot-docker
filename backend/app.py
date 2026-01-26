from flask import Flask, jsonify
import os
import requests
from dotenv import load_dotenv
from database import init_db, get_questions, add_question


load_dotenv()

app = Flask(__name__)
init_db()

API_KEY = os.getenv("API_KEY")



@app.route("/api/home")
def kahoot():
   return jsonify({
        "message": "Backend Kahoot opérationnel"
    })


@app.route("/api/questions")
def questions():
    return jsonify(get_questions())

@app.route("/api/add")
def add():
    add_question("Capitale de la France ?", "Paris")
    return "Question ajoutée"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
