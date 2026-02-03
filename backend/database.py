import sqlite3

# Connexion à la base de données (fichier quiz.db)
conn = sqlite3.connect('quiz.db')
cursor = conn.cursor()

# Création des tables si elles n'existent pas
cursor.execute('''
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    type TEXT
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    text TEXT,
    image_path TEXT,
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
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

# Fonction pour ajouter un quiz
def add_quiz(title, type):
    cursor.execute("INSERT INTO quizzes (title, type) VALUES (?, ?)", (title, type))
    conn.commit()
    return cursor.lastrowid  # id du quiz ajouté

# Fonction pour ajouter une question
def add_question(quiz_id, text, image_path=None):
    cursor.execute("INSERT INTO questions (quiz_id, text, image_path) VALUES (?, ?, ?)", (quiz_id, text, image_path))
    conn.commit()
    return cursor.lastrowid  # id de la question

# Fonction pour ajouter une réponse
def add_answer(question_id, text, is_correct, color, symbol):
    cursor.execute(
        "INSERT INTO answers (question_id, text, is_correct, color, symbol) VALUES (?, ?, ?, ?, ?)",
        (question_id, text, int(is_correct), color, symbol)
    )
    conn.commit()

# Fonction pour fermer la base de données
def close_db():
    conn.close()
