# database.py
rooms = {}  # { room_code: {"name": "Nom du quiz", "users": [], "questions": [] } }

def init_db():
    global rooms
    rooms = {}

def create_room(room_code, room_name):
    if room_code in rooms:
        return False
    rooms[room_code] = {"name": room_name, "users": [], "questions": []}
    return True

def join_room(room_code, username):
    if room_code not in rooms:
        return False
    if username not in rooms[room_code]["users"]:
        rooms[room_code]["users"].append(username)
    return True

def add_question(room_code, question, answer):
    if room_code not in rooms:
        return False
    rooms[room_code]["questions"].append({"question": question, "answer": answer})
    return True

def get_questions(room_code):
    if room_code not in rooms:
        return []
    return rooms[room_code]["questions"]
