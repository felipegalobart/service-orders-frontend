# 🚀 Deploy do Frontend - Service Orders

Este guia explica como fazer o deploy do frontend React no seu servidor homelab.

## 📋 Pré-requisitos

- Servidor com Docker e Docker Compose instalados
- Git instalado no servidor
- Acesso SSH ao servidor
- API já rodando e acessível

## 🛠️ Deploy Automático (Recomendado)

### 1. Clone o repositório no servidor

```bash
git clone https://github.com/felipegalobart/service-orders-frontend.git
cd service-orders-frontend
```

### 2. Execute o script de deploy

```bash
./deploy-frontend.sh
```

O script irá:
- ✅ Verificar dependências (Docker, Git)
- 📥 Puxar as últimas mudanças do repositório
- 📝 Criar arquivo `.env` se não existir
- 🛑 Parar containers existentes
- 🔨 Construir e iniciar o container
- 🏥 Verificar se o serviço está funcionando
- 📊 Mostrar informações do serviço

## 🛠️ Deploy Manual

### 1. Clone e configure

```bash
git clone https://github.com/felipegalobart/service-orders-frontend.git
cd service-orders-frontend
```

### 2. Configure variáveis de ambiente

```bash
cp env.production.example .env
nano .env
```

Edite o arquivo `.env`:
```bash
# Configuração da API para produção
VITE_API_URL=http://192.168.31.75:3000

# Nome da aplicação
VITE_APP_NAME=Service Orders
```

### 3. Execute o Docker

```bash
docker compose up -d --build
```

### 4. Verifique se está funcionando

```bash
# Verificar status
docker compose ps

# Ver logs
docker compose logs -f frontend

# Testar acesso
curl http://localhost:3001
```

## 🌐 Configuração do Nginx

Para servir o frontend através do seu Nginx existente, adicione esta configuração:

```nginx
server {
    listen 80;
    server_name seu_dominio.com; # Ou IP do servidor

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔄 Atualizações

Para atualizar o frontend:

```bash
# Usando o script (recomendado)
./deploy-frontend.sh

# Ou manualmente
git pull origin main
docker compose up -d --build
```

## 🏥 Verificação de Saúde

### Comandos úteis:

```bash
# Status dos containers
docker compose ps

# Logs em tempo real
docker compose logs -f frontend

# Acessar o container
docker compose exec frontend sh

# Parar serviços
docker compose down

# Reiniciar serviços
docker compose restart
```

### Testes de conectividade:

```bash
# Frontend
curl http://localhost:3001

# API (substitua pelo IP da sua API)
curl http://192.168.31.75:3000/health
```

## ⚠️ Troubleshooting

### Problema: `401 Unauthorized` ao construir

**Causa**: Problema de conectividade com Docker Hub

**Soluções**:
1. Verificar conexão de internet
2. Tentar novamente em alguns minutos
3. Usar proxy se necessário

### Problema: Frontend não acessível

**Causa**: Firewall ou container não iniciou

**Soluções**:
```bash
# Verificar firewall
sudo ufw status

# Verificar logs
docker compose logs frontend

# Verificar se a porta está aberta
netstat -tlnp | grep 3001
```

### Problema: API não acessível

**Causa**: `VITE_API_URL` incorreto

**Soluções**:
1. Verificar se a API está rodando
2. Testar conectividade: `curl http://IP_DA_API:3000/health`
3. Atualizar `.env` com o IP correto
4. Reconstruir: `docker compose up -d --build`

## 📊 Informações do Serviço

Após o deploy bem-sucedido:

- **Frontend**: http://localhost:3001
- **API**: Conforme configurado no `.env`
- **Logs**: `docker compose logs -f frontend`
- **Status**: `docker compose ps`

## 🔒 Segurança

- Configure SSL/TLS para HTTPS
- Use firewall adequado
- Mantenha o sistema atualizado
- Faça backups regulares

---

**🎉 Seu frontend está rodando!** Acesse http://seu_ip:3001 ou configure o Nginx para servir na porta 80.
