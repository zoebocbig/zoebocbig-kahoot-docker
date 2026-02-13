import sqlite3

# Connexion à la base de données (fichier quiz.db)
conn = sqlite3.connect('quiz.db', check_same_thread=False)
cursor = conn.cursor()

# -------------------
# Initialisation
# -------------------
def init_db():
    """Crée les tables si elles n'existent pas encore"""
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rooms (
            room_code TEXT PRIMARY KEY,
            room_name TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_code TEXT,
            text TEXT,
            image_path TEXT,
            FOREIGN KEY(room_code) REFERENCES rooms(room_code)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER,
            text TEXT,
            is_correct INTEGER,
            color TEXT,
            symbol TEXT,
            FOREIGN KEY(question_id) REFERENCES questions(id)
        )
    ''')

    conn.commit()
    print("Base initialisée")

# -------------------
# Fonctions pour app.py
# -------------------

def create_room(room_code, room_name):
    try:
        cursor.execute("INSERT INTO rooms (room_code, room_name) VALUES (?, ?)", (room_code, room_name))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False  # room déjà existante

def join_room(room_code, username):
    cursor.execute("SELECT * FROM rooms WHERE room_code = ?", (room_code,))
    room = cursor.fetchone()
    return room is not None  # True si la room existe

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

def close_db():
    conn.close()
