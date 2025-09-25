#!/bin/bash

# Script para configurar Nginx como proxy reverso para o frontend
# Este script configura o Nginx para servir o frontend e fazer proxy para a API

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Configurando Nginx como proxy reverso${NC}"
echo "================================================"

# Verificar se o Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx não está instalado. Instalando...${NC}"
    sudo apt update
    sudo apt install -y nginx
    echo -e "${GREEN}✅ Nginx instalado com sucesso${NC}"
else
    echo -e "${GREEN}✅ Nginx já está instalado${NC}"
fi

# Verificar se o arquivo de configuração existe
if [ ! -f "nginx-frontend.conf" ]; then
    echo -e "${RED}❌ Arquivo nginx-frontend.conf não encontrado${NC}"
    exit 1
fi

# Fazer backup da configuração atual
echo -e "${YELLOW}📋 Fazendo backup da configuração atual...${NC}"
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)

# Aplicar nova configuração
echo -e "${YELLOW}📝 Aplicando nova configuração...${NC}"
sudo cp nginx-frontend.conf /etc/nginx/sites-available/default

# Testar configuração
echo -e "${YELLOW}🧪 Testando configuração do Nginx...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Configuração válida${NC}"
else
    echo -e "${RED}❌ Configuração inválida. Restaurando backup...${NC}"
    sudo cp /etc/nginx/sites-available/default.backup.* /etc/nginx/sites-available/default
    exit 1
fi

# Reiniciar Nginx
echo -e "${YELLOW}🔄 Reiniciando Nginx...${NC}"
sudo systemctl restart nginx

# Verificar status
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx está rodando${NC}"
else
    echo -e "${RED}❌ Erro ao iniciar Nginx${NC}"
    exit 1
fi

# Verificar se os serviços estão rodando
echo -e "${BLUE}🔍 Verificando serviços...${NC}"

# Verificar se o frontend está rodando na porta 3001
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend está rodando na porta 3001${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend não está rodando na porta 3001${NC}"
    echo -e "${YELLOW}   Execute: ./deploy-frontend.sh${NC}"
fi

# Verificar se a API está rodando na porta 3000
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API está rodando na porta 3000${NC}"
else
    echo -e "${YELLOW}⚠️  API não está rodando na porta 3000${NC}"
    echo -e "${YELLOW}   Verifique se a API está rodando${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuração concluída com sucesso!${NC}"
echo "================================================"
echo -e "${BLUE}📊 Informações:${NC}"
echo "  • Frontend: http://192.168.31.75/"
echo "  • API: http://192.168.31.75/api/"
echo "  • Health: http://192.168.31.75/health"
echo "  • Nginx: Proxy reverso configurado"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "  • Ver logs: sudo tail -f /var/log/nginx/frontend_error.log"
echo "  • Testar config: sudo nginx -t"
echo "  • Reiniciar: sudo systemctl restart nginx"
echo "  • Status: sudo systemctl status nginx"
echo ""
echo -e "${BLUE}🧪 Testes:${NC}"
echo "  • Testar frontend: curl http://192.168.31.75/"
echo "  • Testar API: curl http://192.168.31.75/api/health"
echo "  • Testar login: curl -X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"123456\"}' http://192.168.31.75/api/auth/login"
echo ""
echo -e "${YELLOW}⚠️  Próximos passos:${NC}"
echo -e "${YELLOW}   1. Certifique-se de que o frontend está rodando na porta 3001${NC}"
echo -e "${YELLOW}   2. Certifique-se de que a API está rodando na porta 3000${NC}"
echo -e "${YELLOW}   3. Acesse http://192.168.31.75/ para testar${NC}"
