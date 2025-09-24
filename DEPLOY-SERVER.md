# 🚀 Deploy no Servidor - Service Orders Frontend

## 📋 Pré-requisitos

- Servidor com Docker e Docker Compose instalados
- Acesso SSH ao servidor
- API rodando em `192.168.31.75:3000`

## 🔧 Configuração do Servidor

### 1. Conectar via SSH
```bash
ssh usuario@192.168.31.75
```

### 2. Clonar o repositório
```bash
git clone https://github.com/felipegalobart/service-orders-frontend.git
cd service-orders-frontend
```

### 3. Configurar variáveis de ambiente

#### Opção A: Usar arquivo .env (RECOMENDADO)
```bash
# Copiar template
cp .env.example .env

# Editar o arquivo
nano .env
```

**Conteúdo do .env:**
```bash
# Configuração da API
VITE_API_URL=http://192.168.31.75:3000

# Nome da aplicação
VITE_APP_NAME=Service Orders
```

#### Opção B: Usar variáveis de ambiente do sistema
```bash
export VITE_API_URL=http://192.168.31.75:3000
export VITE_APP_NAME="Service Orders"
```

### 4. Executar o Docker
```bash
# Construir e executar
docker-compose up -d --build

# Verificar se está rodando
docker-compose ps

# Ver logs
docker-compose logs -f
```

## 🌐 Acesso

- **Frontend**: http://192.168.31.75:3001
- **API**: http://192.168.31.75:3000

## 🔧 Configuração do Nginx (Opcional)

Se você quiser usar um domínio personalizado, configure o Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📝 Comandos Úteis

```bash
# Parar o container
docker-compose down

# Reconstruir imagem
docker-compose build --no-cache

# Ver logs em tempo real
docker-compose logs -f frontend

# Entrar no container
docker-compose exec frontend sh
```

## 🔄 Atualizações

Para atualizar o frontend:

```bash
# Parar o container
docker-compose down

# Atualizar código
git pull origin main

# Reconstruir e executar
docker-compose up -d --build
```

## ⚠️ Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs frontend

# Verificar se a porta está livre
netstat -tulpn | grep 3001
```

### API não conecta
- Verificar se a API está rodando em `192.168.31.75:3000`
- Verificar firewall do servidor
- Testar conectividade: `curl http://192.168.31.75:3000/health`

### Problemas de permissão
```bash
# Dar permissões corretas
sudo chown -R $USER:$USER .
chmod +x docker-compose.yml
```
