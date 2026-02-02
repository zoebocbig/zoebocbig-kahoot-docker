FROM python:3.11-slim

WORKDIR /app

# Copier les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le backend
COPY . .

EXPOSE 5000

# Lancer Gunicorn pour que le backend reste actif
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
