# 🚀 Service Orders Frontend - Deploy com Nginx

## 📋 **Pré-requisitos**

- ✅ **Node.js 22 LTS** instalado
- ✅ **Docker** e **Docker Compose** instalados
- ✅ **Nginx** instalado (será instalado automaticamente)
- ✅ **API** rodando na porta 3000
- ✅ **Frontend** rodando na porta 3001

## 🔧 **Instalação Completa**

### **1. Clone e Configure o Projeto**

```bash
# Clone o repositório
git clone https://github.com/felipegalobart/service-orders-frontend.git
cd service-orders-frontend

# Configure o ambiente
cp .env.example .env
# Edite o .env com suas configurações
```

### **2. Deploy do Frontend**

```bash
# Deploy do frontend
./deploy-frontend.sh
```

### **3. Configurar Nginx como Proxy Reverso**

```bash
# Configurar Nginx
./setup-nginx-proxy.sh
```

### **4. Testar a Configuração**

```bash
# Testar tudo
./test-nginx-config.sh
```

## 🌐 **Acesso à Aplicação**

Após a configuração, acesse:

- **Frontend**: http://192.168.31.75/
- **API**: http://192.168.31.75/api/
- **Health Check**: http://192.168.31.75/health

## 🔍 **Verificação de Funcionamento**

### **Testes Básicos:**

```bash
# Testar frontend
curl http://192.168.31.75/

# Testar API
curl http://192.168.31.75/api/health

# Testar login
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  http://192.168.31.75/api/auth/login
```

### **Testes no Navegador:**

1. **Acesse** http://192.168.31.75/
2. **Teste o login** com credenciais válidas
3. **Verifique** se todas as funcionalidades estão funcionando
4. **Teste** a listagem de cadastros, busca, filtros, etc.

## 🔧 **Comandos de Manutenção**

### **Nginx:**

```bash
# Verificar status
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/frontend_error.log

# Testar configuração
sudo nginx -t
```

### **Frontend:**

```bash
# Ver logs do container
docker logs service-orders-frontend

# Reiniciar container
docker compose restart

# Rebuild
./deploy-frontend.sh
```

### **API:**

```bash
# Verificar se está rodando
curl http://localhost:3000/health

# Ver logs (se estiver em container)
docker logs service-orders-api
```

## 🚨 **Solução de Problemas**

### **Problema: Frontend não carrega**

```bash
# Verificar se o frontend está rodando
curl http://localhost:3001

# Se não estiver, executar:
./deploy-frontend.sh
```

### **Problema: API não responde**

```bash
# Verificar se a API está rodando
curl http://localhost:3000/health

# Se não estiver, verificar o container da API
```

### **Problema: Erro de CORS**

```bash
# Verificar configuração do Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar logs
sudo tail -f /var/log/nginx/frontend_error.log
```

### **Problema: Login não funciona**

```bash
# Testar API diretamente
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  http://localhost:3000/auth/login

# Testar via proxy
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  http://192.168.31.75/api/auth/login
```

## 📊 **Arquitetura Final**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Frontend      │    │   API           │
│   Porta 80      │    │   Porta 3001    │    │   Porta 3000    │
│   (Proxy)       │    │   (Docker)      │    │   (Docker)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
         ✅ Proxy Reverso
```

## 🔒 **Próximos Passos (Opcionais)**

### **1. SSL/HTTPS (Let's Encrypt)**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d 192.168.31.75
```

### **2. Monitoring (Prometheus + Grafana)**

```bash
# Instalar Prometheus
sudo apt install prometheus

# Configurar monitoring do Nginx
```

### **3. Backup Automatizado**

```bash
# Script de backup do MongoDB
# Script de backup do Redis
# Script de backup dos logs
```

## 📞 **Suporte**

Se encontrar problemas:

1. **Execute** `./test-nginx-config.sh` para diagnóstico
2. **Verifique** os logs do Nginx
3. **Confirme** que todos os serviços estão rodando
4. **Teste** cada componente individualmente

## 🎯 **Resumo**

- ✅ **Frontend**: http://192.168.31.75/
- ✅ **API**: http://192.168.31.75/api/
- ✅ **CORS**: Resolvido via Nginx
- ✅ **Performance**: Melhorada com proxy reverso
- ✅ **Escalabilidade**: Pronto para crescimento
