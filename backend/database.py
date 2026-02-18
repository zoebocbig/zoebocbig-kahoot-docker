import sqlite3
import hashlib

# Connexion à la base de données (fichier quiz.db)
conn = sqlite3.connect('quiz.db', check_same_thread=False)
cursor = conn.cursor()

# -------------------
# Initialisation
# -------------------
def init_db():
    """Crée les tables si elles n'existent pas encore"""

    # Table des utilisateurs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )
    """)

    # Table des rooms
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rooms (
        room_code TEXT PRIMARY KEY,
        room_name TEXT
    )
    """)

    # Table des questions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_code TEXT,
        text TEXT,
        image_path TEXT,
        FOREIGN KEY(room_code) REFERENCES rooms(room_code)
    )
    """)

    # Table des réponses
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        text TEXT,
        is_correct INTEGER,
        color TEXT,
        symbol TEXT,
        FOREIGN KEY(question_id) REFERENCES questions(id)
    )
    """)

    # Table des quizzes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        type TEXT,
        creator_id INTEGER,
        FOREIGN KEY(creator_id) REFERENCES users(id)
    )
    """)

    conn.commit()
    print("Base initialisée")


# -------------------
# Fonctions pour app.py
# -------------------

# Rooms
def create_room(room_code, room_name):
    try:
        cursor.execute("INSERT INTO rooms (room_code, room_name) VALUES (?, ?)", (room_code, room_name))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False  # Room déjà existante

def join_room(room_code, username):
    cursor.execute("SELECT * FROM rooms WHERE room_code = ?", (room_code,))
    room = cursor.fetchone()
    return room is not None


# Questions & Réponses
def add_question(room_code, question_text, answer_list):
    # Ajouter la question
    cursor.execute("INSERT INTO questions (room_code, text) VALUES (?, ?)", (room_code, question_text))
    question_id = cursor.lastrowid

    # Ajouter les réponses
    for ans in answer_list:
        cursor.execute(
            "INSERT INTO answers (question_id, text, is_correct, color, symbol) VALUES (?, ?, ?, ?, ?)",
            (question_id, ans.get("text"), int(ans.get("correct", False)), ans.get("color"), ans.get("symbol"))
        )

    conn.commit()
    return True

def get_questions(room_code):
    cursor.execute("SELECT id, text, image_path FROM questions WHERE room_code = ?", (room_code,))
    questions = cursor.fetchall()
    result = []

    for q in questions:
        question_id, text, image_path = q
        cursor.execute("SELECT text, is_correct, color, symbol FROM answers WHERE question_id = ?", (question_id,))
        answers = cursor.fetchall()
        ans_list = [{"text": a[0], "correct": bool(a[1]), "color": a[2], "symbol": a[3]} for a in answers]
        result.append({"text": text, "image": image_path, "answers": ans_list})

    return result


# -------------------
# Utilisateurs
# -------------------
def hash_password(pwd):
    return hashlib.sha256(pwd.encode()).hexdigest()

def create_user(email, password):
    try:
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            (email, hash_password(password))
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False  # Email déjà utilisé

def login_user(email, password):
    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, hash_password(password))
    )
    return cursor.fetchone()  # retourne None si pas trouvé


# -------------------
# Quizzes liés à un créateur
# -------------------
def add_quiz(title, type, creator_id):
    cursor.execute(
        "INSERT INTO quizzes (title, type, creator_id) VALUES (?, ?, ?)",
        (title, type, creator_id)
    )
    conn.commit()
    return cursor.lastrowid

def get_user_quizzes(user_id):
    cursor.execute("SELECT id, title, type FROM quizzes WHERE creator_id = ?", (user_id,))
    rows = cursor.fetchall()
    return [{"id": r[0], "title": r[1], "type": r[2]} for r in rows]


# -------------------
# Fermer la DB
# -------------------
def close_db():
    conn.close()
