# Etapa de build
FROM node:22.14-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa de produção com Nginx
FROM nginx:alpine

# Copia os arquivos buildados do Vite para a pasta pública do nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Adiciona configuração personalizada para SPA (rotas funcionarem)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
