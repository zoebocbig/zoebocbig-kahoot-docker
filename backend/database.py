import sqlite3
import hashlib

conn = sqlite3.connect('quiz.db', check_same_thread=False)
cursor = conn.cursor()

def init_db():
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        type TEXT,
        creator_id INTEGER,
        FOREIGN KEY(creator_id) REFERENCES users(id)
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER,
        text TEXT,
        image_path TEXT,
        FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        text TEXT,
        is_correct INTEGER,
        color TEXT,
        symbol TEXT,
        FOREIGN KEY(question_id) REFERENCES questions(id)
    )""")
    conn.commit()
    print("Base initialisée")

# ---------------- USERS ----------------
def hash_password(pwd):
    return hashlib.sha256(pwd.encode()).hexdigest()

def create_user(email, password):
    try:
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)",
                       (email, hash_password(password)))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False

def login_user(email, password):
    cursor.execute("SELECT * FROM users WHERE email=? AND password=?",
                   (email, hash_password(password)))
    return cursor.fetchone()

# ---------------- QUIZZES ----------------
def add_quiz(title, type_, questions, creator_id):
    cursor.execute("INSERT INTO quizzes (title, type, creator_id) VALUES (?, ?, ?)",
                   (title, type_, creator_id))
    quiz_id = cursor.lastrowid

    for q in questions:
        question_text = q.get("question", "")
        image = q.get("image")
        cursor.execute("INSERT INTO questions (quiz_id, text, image_path) VALUES (?, ?, ?)",
                       (quiz_id, question_text, image))
        question_id = cursor.lastrowid
        for a in q.get("answers", []):
            cursor.execute("INSERT INTO answers (question_id, text, is_correct, color, symbol) VALUES (?, ?, ?, ?, ?)",
                           (question_id, a.get("text"), 1 if a.get("correct") else 0, a.get("color"), a.get("symbol")))
    conn.commit()
    return quiz_id

def update_quiz(quiz_id, title, type_, questions):
    cursor.execute("UPDATE quizzes SET title=?, type=? WHERE id=?", (title, type_, quiz_id))

    # Supprimer les questions/answers existantes
    cursor.execute("SELECT id FROM questions WHERE quiz_id=?", (quiz_id,))
    question_ids = [q[0] for q in cursor.fetchall()]
    for qid in question_ids:
        cursor.execute("DELETE FROM answers WHERE question_id=?", (qid,))
    cursor.execute("DELETE FROM questions WHERE quiz_id=?", (quiz_id,))

    # Ajouter les nouvelles questions
    for q in questions:
        cursor.execute("INSERT INTO questions (quiz_id, text, image_path) VALUES (?, ?, ?)",
                       (quiz_id, q.get("question"), q.get("image")))
        question_id = cursor.lastrowid
        for a in q.get("answers", []):
            cursor.execute("INSERT INTO answers (question_id, text, is_correct, color, symbol) VALUES (?, ?, ?, ?, ?)",
                           (question_id, a.get("text"), 1 if a.get("correct") else 0, a.get("color"), a.get("symbol")))
    conn.commit()

def delete_quiz(quiz_id):
    cursor.execute("SELECT id FROM questions WHERE quiz_id=?", (quiz_id,))
    question_ids = [q[0] for q in cursor.fetchall()]
    for qid in question_ids:
        cursor.execute("DELETE FROM answers WHERE question_id=?", (qid,))
    cursor.execute("DELETE FROM questions WHERE quiz_id=?", (quiz_id,))
    cursor.execute("DELETE FROM quizzes WHERE id=?", (quiz_id,))
    conn.commit()
    return True

def get_user_quizzes(user_id):
    cursor.execute("SELECT id, title, type FROM quizzes WHERE creator_id=?", (user_id,))
    return [{"id": r[0], "title": r[1], "type": r[2]} for r in cursor.fetchall()]

def get_quiz(quiz_id):
    cursor.execute("SELECT id, title, type FROM quizzes WHERE id=?", (quiz_id,))
    quiz = cursor.fetchone()
    if not quiz: return None

    cursor.execute("SELECT id, text, image_path FROM questions WHERE quiz_id=?", (quiz_id,))
    questions_db = cursor.fetchall()
    questions = []
    for q in questions_db:
        cursor.execute("SELECT text, is_correct, color, symbol FROM answers WHERE question_id=?", (q[0],))
        answers = [{"text": a[0], "correct": bool(a[1]), "color": a[2], "symbol": a[3]} for a in cursor.fetchall()]
        questions.append({"question": q[1], "image": q[2], "answers": answers})
    return {"id": quiz[0], "title": quiz[1], "type": quiz[2], "questions": questions}
import hashlib

conn = sqlite3.connect('quiz.db', check_same_thread=False)
cursor = conn.cursor()

def init_db():
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        type TEXT,
        creator_id INTEGER,
        FOREIGN KEY(creator_id) REFERENCES users(id)
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER,
        text TEXT,
        image_path TEXT,
        FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        text TEXT,
        is_correct INTEGER,
        color TEXT,
        symbol TEXT,
        FOREIGN KEY(question_id) REFERENCES questions(id)
    )""")
    conn.commit()
    print("Base initialisée")

# ---------------- USERS ----------------
def hash_password(pwd):
    return hashlib.sha256(pwd.encode()).hexdigest()

def create_user(email, password):
    try:
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)",
                       (email, hash_password(password)))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False

def login_user(email, password):
    cursor.execute("SELECT * FROM users WHERE email=? AND password=?",
                   (email, hash_password(password)))
    return cursor.fetchone()

# ---------------- QUIZZES ----------------
def add_quiz(title, type_, questions, creator_id):
    cursor.execute("INSERT INTO quizzes (title, type, creator_id) VALUES (?, ?, ?)",
                   (title, type_, creator_id))
    quiz_id = cursor.lastrowid

    for q in questions:
        question_text = q.get("question", "")
        image = q.get("image")
        cursor.execute("INSERT INTO questions (quiz_id, text, image_path) VALUES (?, ?, ?)",
                       (quiz_id, question_text, image))
        question_id = cursor.lastrowid
        for a in q.get("answers", []):
            cursor.execute("INSERT INTO answers (question_id, text, is_correct, color, symbol) VALUES (?, ?, ?, ?, ?)",
                           (question_id, a.get("text"), 1 if a.get("correct") else 0, a.get("color"), a.get("symbol")))
    conn.commit()
    return quiz_id

def update_quiz(quiz_id, title, type_, questions):
    cursor.execute("UPDATE quizzes SET title=?, type=? WHERE id=?", (title, type_, quiz_id))

    # Supprimer les questions/answers existantes
    cursor.execute("SELECT id FROM questions WHERE quiz_id=?", (quiz_id,))
    question_ids = [q[0] for q in cursor.fetchall()]
    for qid in question_ids:
        cursor.execute("DELETE FROM answers WHERE question_id=?", (qid,))
    cursor.execute("DELETE FROM questions WHERE quiz_id=?", (quiz_id,))

    # Ajouter les nouvelles questions
    for q in questions:
        cursor.execute("INSERT INTO questions (quiz_id, text, image_path) VALUES (?, ?, ?)",
                       (quiz_id, q.get("question"), q.get("image")))
        question_id = cursor.lastrowid
        for a in q.get("answers", []):
            cursor.execute("INSERT INTO answers (question_id, text, is_correct, color, symbol) VALUES (?, ?, ?, ?, ?)",
                           (question_id, a.get("text"), 1 if a.get("correct") else 0, a.get("color"), a.get("symbol")))
    conn.commit()

def delete_quiz(quiz_id):
    cursor.execute("SELECT id FROM questions WHERE quiz_id=?", (quiz_id,))
    question_ids = [q[0] for q in cursor.fetchall()]
    for qid in question_ids:
        cursor.execute("DELETE FROM answers WHERE question_id=?", (qid,))
    cursor.execute("DELETE FROM questions WHERE quiz_id=?", (quiz_id,))
    cursor.execute("DELETE FROM quizzes WHERE id=?", (quiz_id,))
    conn.commit()
    return True

def get_user_quizzes(user_id):
    cursor.execute("SELECT id, title, type FROM quizzes WHERE creator_id=?", (user_id,))
    return [{"id": r[0], "title": r[1], "type": r[2]} for r in cursor.fetchall()]

def get_quiz(quiz_id):
    cursor.execute("SELECT id, title, type FROM quizzes WHERE id=?", (quiz_id,))
    quiz = cursor.fetchone()
    if not quiz: return None

    cursor.execute("SELECT id, text, image_path FROM questions WHERE quiz_id=?", (quiz_id,))
    questions_db = cursor.fetchall()
    questions = []
    for q in questions_db:
        cursor.execute("SELECT text, is_correct, color, symbol FROM answers WHERE question_id=?", (q[0],))
        answers = [{"text": a[0], "correct": bool(a[1]), "color": a[2], "symbol": a[3]} for a in cursor.fetchall()]
        questions.append({"question": q[1], "image": q[2], "answers": answers})
    return {"id": quiz[0], "title": quiz[1], "type": quiz[2], "questions": questions}