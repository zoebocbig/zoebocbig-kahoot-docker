import sqlite3

def get_connection():
    conn = sqlite3.connect("kahoot.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()
    
def add_question(question, answer):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO questions (question, answer) VALUES (?, ?)",
        (question, answer)
    )

    conn.commit()
    conn.close()

def get_questions():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM questions")
    rows = cursor.fetchall()

    conn.close()
    return [dict(row) for row in rows]

