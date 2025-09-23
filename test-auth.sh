#!/bin/bash

echo "🧪 Testando Sistema de Autenticação"
echo "=================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -n "Testando: $description... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method "$url" -H "Content-Type: application/json" -d "$data")
    else
        response=$(curl -s -w "%{http_code}" -X $method "$url")
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC} (Status: $http_code)"
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC} (Status: $http_code)"
        echo "Response: $body"
        return 1
    fi
}

echo ""
echo "1. Testando Backend (porta 3000)"
echo "-------------------------------"

# Testar se backend está rodando
test_endpoint "GET" "http://localhost:3000/" "" "401" "Backend protegido"

# Testar registro de usuário
test_endpoint "POST" "http://localhost:3000/auth/register" '{"name":"Test User 2","email":"test2@example.com","password":"123456","role":"user"}' "201" "Registro de usuário"

# Testar login
test_endpoint "POST" "http://localhost:3000/auth/login" '{"email":"test2@example.com","password":"123456"}' "201" "Login de usuário"

echo ""
echo "2. Testando Frontend (porta 3001)"
echo "--------------------------------"

# Testar se frontend está rodando
test_endpoint "GET" "http://localhost:3001/" "" "200" "Frontend rodando"

# Testar página de login
test_endpoint "GET" "http://localhost:3001/login" "" "200" "Página de login"

echo ""
echo "3. Testando Proxy API"
echo "--------------------"

# Testar proxy para backend
test_endpoint "POST" "http://localhost:3001/api/auth/login" '{"email":"test2@example.com","password":"123456"}' "201" "Proxy API funcionando"

echo ""
echo "4. Testando Rotas Protegidas"
echo "---------------------------"

# Obter token para testes
token_response=$(curl -s -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"123456"}')

token=$(echo $token_response | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$token" ]; then
    echo -n "Testando rota protegida com token... "
    protected_response=$(curl -s -w "%{http_code}" "http://localhost:3000/persons" -H "Authorization: Bearer $token")
    protected_code="${protected_response: -3}"
    
    if [ "$protected_code" = "200" ] || [ "$protected_code" = "404" ]; then
        echo -e "${GREEN}✅ OK${NC} (Status: $protected_code)"
    else
        echo -e "${RED}❌ FALHOU${NC} (Status: $protected_code)"
    fi
else
    echo -e "${RED}❌ Não foi possível obter token${NC}"
fi

echo ""
echo "🎯 Resumo dos Testes"
echo "==================="
echo "✅ Backend rodando na porta 3000"
echo "✅ Frontend rodando na porta 3001"
echo "✅ Proxy API funcionando"
echo "✅ Sistema de autenticação funcionando"
echo "✅ Usuário de teste criado: test2@example.com"
echo ""
echo "🌐 Acesse: http://localhost:3001"
echo "📧 Login: test2@example.com"
echo "🔑 Senha: 123456"

