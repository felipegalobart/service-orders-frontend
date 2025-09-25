#!/bin/bash

# Script para testar a configuração SSL com Cloudflare
# Este script testa se o SSL está funcionando corretamente

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testando Configuração SSL + Cloudflare${NC}"
echo "================================================"

# Testar se o Nginx está rodando
echo -e "${BLUE}1. Verificando Nginx...${NC}"
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx está rodando${NC}"
else
    echo -e "${RED}❌ Nginx não está rodando${NC}"
    echo -e "${YELLOW}   Execute: sudo systemctl start nginx${NC}"
    exit 1
fi

# Testar configuração do Nginx
echo -e "${BLUE}2. Testando configuração...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Configuração válida${NC}"
else
    echo -e "${RED}❌ Configuração inválida${NC}"
    exit 1
fi

# Testar certificado SSL
echo -e "${BLUE}3. Verificando certificado SSL...${NC}"
if [ -f "/etc/letsencrypt/live/mitsuwa.com.br/fullchain.pem" ]; then
    echo -e "${GREEN}✅ Certificado SSL encontrado${NC}"
    
    # Verificar validade do certificado
    CERT_EXPIRY=$(openssl x509 -in /etc/letsencrypt/live/mitsuwa.com.br/fullchain.pem -noout -dates | grep notAfter | cut -d= -f2)
    echo -e "${BLUE}   Certificado válido até: $CERT_EXPIRY${NC}"
else
    echo -e "${RED}❌ Certificado SSL não encontrado${NC}"
    echo -e "${YELLOW}   Execute: ./setup-ssl-cloudflare.sh${NC}"
fi

# Testar HTTP (deve redirecionar para HTTPS)
echo -e "${BLUE}4. Testando redirecionamento HTTP → HTTPS...${NC}"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://mitsuwa.com.br/)
if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ Redirecionamento HTTP → HTTPS funcionando${NC}"
else
    echo -e "${YELLOW}⚠️  Redirecionamento pode não estar funcionando (HTTP: $HTTP_RESPONSE)${NC}"
fi

# Testar HTTPS
echo -e "${BLUE}5. Testando HTTPS...${NC}"
if curl -f https://mitsuwa.com.br/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS funcionando${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS pode não estar funcionando ainda${NC}"
    echo -e "${YELLOW}   Aguarde propagação DNS ou verifique Cloudflare Tunnel${NC}"
fi

# Testar endpoint de health
echo -e "${BLUE}6. Testando health endpoint...${NC}"
if curl -f https://mitsuwa.com.br/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health endpoint funcionando via HTTPS${NC}"
else
    echo -e "${RED}❌ Health endpoint não está funcionando via HTTPS${NC}"
fi

# Testar frontend
echo -e "${BLUE}7. Testando frontend...${NC}"
if curl -f https://mitsuwa.com.br/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend acessível via HTTPS${NC}"
else
    echo -e "${RED}❌ Frontend não está acessível via HTTPS${NC}"
    echo -e "${YELLOW}   Verifique se o frontend está rodando na porta 3001${NC}"
fi

# Testar API
echo -e "${BLUE}8. Testando API...${NC}"
if curl -f https://mitsuwa.com.br/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API acessível via HTTPS${NC}"
else
    echo -e "${RED}❌ API não está acessível via HTTPS${NC}"
    echo -e "${YELLOW}   Verifique se a API está rodando na porta 3000${NC}"
fi

# Testar login
echo -e "${BLUE}9. Testando login via HTTPS...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"123456"}' \
    https://mitsuwa.com.br/api/auth/login)

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Login funcionando via HTTPS${NC}"
else
    echo -e "${RED}❌ Login não está funcionando via HTTPS${NC}"
    echo -e "${YELLOW}   Resposta: $LOGIN_RESPONSE${NC}"
fi

# Testar CORS
echo -e "${BLUE}10. Testando CORS...${NC}"
CORS_RESPONSE=$(curl -s -H "Origin: https://mitsuwa.com.br" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    https://mitsuwa.com.br/api/auth/login)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS configurado corretamente${NC}"
else
    echo -e "${YELLOW}⚠️  CORS pode não estar funcionando${NC}"
fi

# Testar Cloudflare Tunnel (se configurado)
echo -e "${BLUE}11. Verificando Cloudflare Tunnel...${NC}"
if command -v cloudflared &> /dev/null; then
    echo -e "${GREEN}✅ Cloudflared instalado${NC}"
    
    # Verificar se o tunnel está rodando
    if pgrep cloudflared > /dev/null; then
        echo -e "${GREEN}✅ Cloudflare Tunnel está rodando${NC}"
    else
        echo -e "${YELLOW}⚠️  Cloudflare Tunnel não está rodando${NC}"
        echo -e "${YELLOW}   Execute: cloudflared tunnel run <tunnel-name>${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cloudflared não está instalado${NC}"
    echo -e "${YELLOW}   Instale se necessário: wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared-linux-amd64.deb${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Testes concluídos!${NC}"
echo "================================================"
echo -e "${BLUE}📊 Resumo:${NC}"
echo "  • Nginx: $(sudo systemctl is-active nginx)"
echo "  • SSL: $(if [ -f "/etc/letsencrypt/live/mitsuwa.com.br/fullchain.pem" ]; then echo "Configurado"; else echo "Não configurado"; fi)"
echo "  • Frontend: https://mitsuwa.com.br/"
echo "  • API: https://mitsuwa.com.br/api/"
echo "  • Health: https://mitsuwa.com.br/health"
echo ""
echo -e "${BLUE}🔧 Próximos passos:${NC}"
echo "  1. Acesse https://mitsuwa.com.br/ no navegador"
echo "  2. Teste o login na interface"
echo "  3. Verifique se todas as funcionalidades estão funcionando"
echo "  4. Configure Cloudflare Tunnel se necessário"
echo ""
echo -e "${YELLOW}⚠️  Se algo não estiver funcionando:${NC}"
echo -e "${YELLOW}  • Verifique os logs: sudo tail -f /var/log/nginx/frontend_error.log${NC}"
echo -e "${YELLOW}  • Reinicie o Nginx: sudo systemctl restart nginx${NC}"
echo -e "${YELLOW}  • Verifique o Cloudflare Tunnel: cloudflared tunnel list${NC}"
echo -e "${YELLOW}  • Aguarde propagação DNS (pode levar até 24h)${NC}"
