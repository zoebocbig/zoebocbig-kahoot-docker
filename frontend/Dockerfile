# Étape 1 : Build React
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build pour production
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine

# Supprime le contenu par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copie le build React (dist pour Vite, build pour CRA)
COPY --from=build /app/dist /usr/share/nginx/html

# Copie la config Nginx custom
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
