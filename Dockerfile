# Dockerfile simples para Frontend React
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código e fazer build
COPY . .
RUN npm run build

# Estágio de produção - servidor simples
FROM node:18-alpine

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve

WORKDIR /app

# Copiar arquivos buildados
COPY --from=builder /app/dist ./dist

# Expor porta 3000
EXPOSE 3000

# Servir arquivos estáticos
CMD ["serve", "-s", "dist", "-l", "3000"]
