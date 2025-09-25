#!/bin/bash

# Script para testar a configuração do Nginx
# Este script testa se o proxy reverso está funcionando corretamente

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testando Configuração do Nginx${NC}"
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

# Testar endpoint de health
echo -e "${BLUE}3. Testando health endpoint...${NC}"
if curl -f http://192.168.31.75/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health endpoint funcionando${NC}"
else
    echo -e "${RED}❌ Health endpoint não está funcionando${NC}"
fi

# Testar frontend
echo -e "${BLUE}4. Testando frontend...${NC}"
if curl -f http://192.168.31.75/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend acessível${NC}"
else
    echo -e "${RED}❌ Frontend não está acessível${NC}"
    echo -e "${YELLOW}   Verifique se o frontend está rodando na porta 3001${NC}"
fi

# Testar API
echo -e "${BLUE}5. Testando API...${NC}"
if curl -f http://192.168.31.75/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API acessível via proxy${NC}"
else
    echo -e "${RED}❌ API não está acessível via proxy${NC}"
    echo -e "${YELLOW}   Verifique se a API está rodando na porta 3000${NC}"
fi

# Testar login
echo -e "${BLUE}6. Testando login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"123456"}' \
    http://192.168.31.75/api/auth/login)

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Login funcionando${NC}"
else
    echo -e "${RED}❌ Login não está funcionando${NC}"
    echo -e "${YELLOW}   Resposta: $LOGIN_RESPONSE${NC}"
fi

# Testar CORS
echo -e "${BLUE}7. Testando CORS...${NC}"
CORS_RESPONSE=$(curl -s -H "Origin: http://192.168.31.75" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    http://192.168.31.75/api/auth/login)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS configurado corretamente${NC}"
else
    echo -e "${YELLOW}⚠️  CORS pode não estar funcionando${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Testes concluídos!${NC}"
echo "================================================"
echo -e "${BLUE}📊 Resumo:${NC}"
echo "  • Nginx: $(sudo systemctl is-active nginx)"
echo "  • Frontend: http://192.168.31.75/"
echo "  • API: http://192.168.31.75/api/"
echo "  • Health: http://192.168.31.75/health"
echo ""
echo -e "${BLUE}🔧 Próximos passos:${NC}"
echo "  1. Acesse http://192.168.31.75/ no navegador"
echo "  2. Teste o login na interface"
echo "  3. Verifique se todas as funcionalidades estão funcionando"
echo ""
echo -e "${YELLOW}⚠️  Se algo não estiver funcionando:${NC}"
echo -e "${YELLOW}  • Verifique os logs: sudo tail -f /var/log/nginx/frontend_error.log${NC}"
echo -e "${YELLOW}  • Reinicie o Nginx: sudo systemctl restart nginx${NC}"
echo -e "${YELLOW}  • Verifique se os serviços estão rodando nas portas corretas${NC}"
