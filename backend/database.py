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
        room_code TEXT,
        text TEXT,
        image_path TEXT
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        text TEXT,
        is_correct INTEGER,
        color TEXT,
        symbol TEXT
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
    except:
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
        question_text = q.get("question") or q.get("text") or ""
        cursor.execute("INSERT INTO questions (room_code, text, image_path) VALUES (?, ?, ?)",
                       (str(quiz_id), question_text, None))
        question_id = cursor.lastrowid
        for a in q.get("answers", []):
            cursor.execute("INSERT INTO answers (question_id, text, is_correct, color, symbol) VALUES (?, ?, ?, ?, ?)",
                           (question_id, a.get("text", ""), int(a.get("correct", False)), a.get("color"), a.get("symbol")))
    conn.commit()
    return quiz_id

def update_quiz(quiz_id, title, type_, questions):
    cursor.execute("UPDATE quizzes SET title=?, type=? WHERE id=?", (title, type_, quiz_id))
    cursor.execute("SELECT id FROM questions WHERE room_code=?", (str(quiz_id),))
    question_ids = [q[0] for q in cursor.fetchall()]
    for qid in question_ids:
        cursor.execute("DELETE FROM answers WHERE question_id=?", (qid,))
    cursor.execute("DELETE FROM questions WHERE room_code=?", (str(quiz_id),))
    for q in questions:
        question_text = q.get("question") or q.get("text") or ""
        cursor.execute("INSERT INTO questions (room_code, text, image_path) VALUES (?, ?, ?)",
                       (str(quiz_id), question_text, None))
        question_id = cursor.lastrowid
        for a in q.get("answers", []):
            cursor.execute("INSERT INTO answers (question_id, text, is_correct, color, symbol) VALUES (?, ?, ?, ?, ?)",
                           (question_id, a.get("text", ""), int(a.get("correct", False)), a.get("color"), a.get("symbol")))
    conn.commit()
    return True

def delete_quiz(quiz_id):
    cursor.execute("SELECT id FROM questions WHERE room_code=?", (str(quiz_id),))
    question_ids = [q[0] for q in cursor.fetchall()]
    for qid in question_ids:
        cursor.execute("DELETE FROM answers WHERE question_id=?", (qid,))
    cursor.execute("DELETE FROM questions WHERE room_code=?", (str(quiz_id),))
    cursor.execute("DELETE FROM quizzes WHERE id=?", (quiz_id,))
    conn.commit()
    return True

def get_user_quizzes(user_id):
    cursor.execute("SELECT id, title, type FROM quizzes WHERE creator_id=?", (user_id,))
    return [{"id": r[0], "title": r[1], "type": r[2]} for r in cursor.fetchall()]