import sqlite3
import hashlib

def get_db_connection():
    return sqlite3.connect('quiz.db', check_same_thread=False)

conn = get_db_connection()
cursor = conn.cursor()

# ---------------- INIT DB ----------------
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
        pin TEXT UNIQUE,
        player_limit INTEGER DEFAULT 5,
        FOREIGN KEY(creator_id) REFERENCES users(id)
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER,
        text TEXT,
        image_path TEXT,
        time_limit INTEGER,
        points INTEGER,
        answer_limit INTEGER,
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

# ---------------- USERS ----------------
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
        return False

def login_user(email, password):
    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, hash_password(password))
    )
    return cursor.fetchone()

# ---------------- QUIZZES ----------------
def add_quiz(title, type_, questions, creator_id, pin, player_limit=5):
    cursor.execute(
        "INSERT INTO quizzes (title, type, creator_id, pin, player_limit) VALUES (?, ?, ?, ?, ?)",
        (title, type_, creator_id, pin, player_limit)
    )
    quiz_id = cursor.lastrowid

    for q in questions:
        cursor.execute("""
        INSERT INTO questions (quiz_id, text, image_path, time_limit, points, answer_limit)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            quiz_id,
            q.get("question"),
            q.get("image"),
            q.get("timeLimit", 30),
            q.get("points", 1000),
            q.get("answerLimit", 1)
        ))
        question_id = cursor.lastrowid

        for a in q.get("answers", []):
            cursor.execute("""
            INSERT INTO answers (question_id, text, is_correct, color, symbol)
            VALUES (?, ?, ?, ?, ?)
            """, (
                question_id,
                a.get("text"),
                1 if a.get("correct") else 0,
                a.get("color"),
                a.get("symbol")
            ))

    conn.commit()
    return quiz_id

def get_quiz(quiz_id):
    cursor.execute(
        "SELECT id, title, type, pin, player_limit FROM quizzes WHERE id=?",
        (quiz_id,)
    )
    quiz = cursor.fetchone()
    if not quiz:
        return None

    cursor.execute("""
    SELECT id, text, image_path, time_limit, points, answer_limit
    FROM questions WHERE quiz_id=?
    """, (quiz_id,))
    questions_db = cursor.fetchall()

    questions = []
    for q in questions_db:
        cursor.execute(
            "SELECT text, is_correct, color, symbol FROM answers WHERE question_id=?",
            (q[0],)
        )
        answers = [{"text": a[0], "correct": bool(a[1]), "color": a[2], "symbol": a[3]} for a in cursor.fetchall()]
        questions.append({
            "question": q[1],
            "image": q[2],
            "timeLimit": q[3],
            "points": q[4],
            "answerLimit": q[5],
            "answers": answers
        })

    return {
        "id": quiz[0],
        "title": quiz[1],
        "type": quiz[2],
        "pin": quiz[3],
        "player_limit": quiz[4],
        "questions": questions
    }

def get_quiz_by_pin(pin):
    cursor.execute("SELECT id FROM quizzes WHERE pin=?", (pin,))
    result = cursor.fetchone()
    if not result:
        return None
    return get_quiz(result[0])

def get_all_quizzes():
    cursor.execute("SELECT id, pin FROM quizzes")
    return [{"id": r[0], "pin": r[1]} for r in cursor.fetchall()]

def update_quiz(quiz_id, title, type_, questions):
    cursor.execute("UPDATE quizzes SET title=?, type=? WHERE id=?", (title, type_, quiz_id))
    cursor.execute("SELECT id FROM questions WHERE quiz_id=?", (quiz_id,))
    question_ids = [q[0] for q in cursor.fetchall()]

    for qid in question_ids:
        cursor.execute("DELETE FROM answers WHERE question_id=?", (qid,))
    cursor.execute("DELETE FROM questions WHERE quiz_id=?", (quiz_id,))

    for q in questions:
        cursor.execute("""
        INSERT INTO questions (quiz_id, text, image_path, time_limit, points, answer_limit)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            quiz_id,
            q.get("question"),
            q.get("image"),
            q.get("timeLimit", 30),
            q.get("points", 1000),
            q.get("answerLimit", 1)
        ))
        question_id = cursor.lastrowid

        for a in q.get("answers", []):
            cursor.execute("""
            INSERT INTO answers (question_id, text, is_correct, color, symbol)
            VALUES (?, ?, ?, ?, ?)
            """, (
                question_id,
                a.get("text"),
                1 if a.get("correct") else 0,
                a.get("color"),
                a.get("symbol")
            ))

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
    cursor.execute(
        "SELECT id, title, type, pin, player_limit FROM quizzes WHERE creator_id=?",
        (user_id,)
    )
    return [{"id": r[0], "title": r[1], "type": r[2], "pin": r[3], "player_limit": r[4]} for r in cursor.fetchall()]

def pin_exists(pin):
    cursor.execute("SELECT id FROM quizzes WHERE pin=?", (pin,))
    return cursor.fetchone() is not None