# 🐳 Docker - Service Orders Frontend

Configuração simples para rodar o frontend em container Docker.

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado

## 🚀 Como usar

### Construir e executar

```bash
# Construir e executar
docker-compose up --build

# Executar em background
docker-compose up -d --build

# Parar
docker-compose down
```

### Comandos úteis

```bash
# Ver logs
docker-compose logs -f

# Ver status
docker-compose ps

# Reconstruir imagem
docker-compose build --no-cache
```

## 🌐 Acesso

- **Frontend**: http://localhost:3001

## 📁 Arquivos

- `Dockerfile` - Configuração do container
- `docker-compose.yml` - Orquestração simples
- `.dockerignore` - Arquivos ignorados no build

## 🔧 Configuração

O frontend roda na porta 3001 e serve arquivos estáticos usando `serve`.

Para conectar com a API, ajuste a variável `REACT_APP_API_URL` no arquivo `.env` ou no `docker-compose.yml`.
