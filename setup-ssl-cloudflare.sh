#!/bin/bash

# Script para implementar SSL com Let's Encrypt + Cloudflare
# Este script configura SSL para o domínio mitsuwa.com.br

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Implementando SSL com Let's Encrypt + Cloudflare${NC}"
echo "================================================"

# Verificar se o Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx não está instalado${NC}"
    exit 1
fi

# Verificar se o Certbot está instalado
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando Certbot...${NC}"
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot instalado${NC}"
else
    echo -e "${GREEN}✅ Certbot já está instalado${NC}"
fi

# Verificar se o arquivo de configuração existe
if [ ! -f "nginx-frontend.conf" ]; then
    echo -e "${RED}❌ Arquivo nginx-frontend.conf não encontrado${NC}"
    exit 1
fi

# Fazer backup da configuração atual
echo -e "${YELLOW}📋 Fazendo backup da configuração atual...${NC}"
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)

# Aplicar configuração básica primeiro
echo -e "${YELLOW}📝 Aplicando configuração básica...${NC}"
sudo cp nginx-frontend.conf /etc/nginx/sites-available/default

# Testar configuração
echo -e "${YELLOW}🧪 Testando configuração do Nginx...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Configuração válida${NC}"
else
    echo -e "${RED}❌ Configuração inválida${NC}"
    exit 1
fi

# Reiniciar Nginx
echo -e "${YELLOW}🔄 Reiniciando Nginx...${NC}"
sudo systemctl restart nginx

# Obter certificado SSL
echo -e "${YELLOW}🔐 Obtendo certificado SSL...${NC}"
echo -e "${BLUE}📋 Certificado será emitido para: service.mitsuwa.com.br${NC}"

# Executar Certbot
sudo certbot --nginx -d service.mitsuwa.com.br --non-interactive --agree-tos --email admin@mitsuwa.com.br

# Verificar se o certificado foi obtido
if [ -f "/etc/letsencrypt/live/service.mitsuwa.com.br/fullchain.pem" ]; then
    echo -e "${GREEN}✅ Certificado SSL obtido com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao obter certificado SSL${NC}"
    exit 1
fi

# Configurar renovação automática
echo -e "${YELLOW}🔄 Configurando renovação automática...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

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

# Testar HTTPS
echo -e "${BLUE}🧪 Testando HTTPS...${NC}"
if curl -f https://service.mitsuwa.com.br/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS funcionando${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS pode não estar funcionando ainda${NC}"
    echo -e "${YELLOW}   Aguarde alguns minutos para propagação${NC}"
fi

echo ""
echo -e "${GREEN}🎉 SSL implementado com sucesso!${NC}"
echo "================================================"
echo -e "${BLUE}📊 Informações:${NC}"
echo "  • Frontend: https://service.mitsuwa.com.br/"
echo "  • API: https://service.mitsuwa.com.br/api/"
echo "  • Health: https://service.mitsuwa.com.br/health"
echo "  • SSL: Let's Encrypt (renovação automática)"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "  • Ver logs: sudo tail -f /var/log/nginx/frontend_error.log"
echo "  • Testar config: sudo nginx -t"
echo "  • Reiniciar: sudo systemctl restart nginx"
echo "  • Status SSL: sudo certbot certificates"
echo "  • Renovar: sudo certbot renew"
echo ""
echo -e "${BLUE}🧪 Testes:${NC}"
echo "  • Testar frontend: curl https://service.mitsuwa.com.br/"
echo "  • Testar API: curl https://service.mitsuwa.com.br/api/health"
echo "  • Testar login: curl -X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"123456\"}' https://service.mitsuwa.com.br/api/auth/login"
echo ""
echo -e "${YELLOW}⚠️  Próximos passos:${NC}"
echo -e "${YELLOW}   1. Aguarde a propagação DNS (pode levar até 24h)${NC}"
echo -e "${YELLOW}   2. Teste o acesso via https://service.mitsuwa.com.br/${NC}"
echo -e "${YELLOW}   3. Configure o Cloudflare Tunnel se necessário${NC}"
echo -e "${YELLOW}   4. Monitore os logs para verificar funcionamento${NC}"
