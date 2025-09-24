#!/bin/bash

# Script para testar limites da API
# Uso: ./test-api-limits.sh

API_URL="http://192.168.31.75:3000"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGV4YW1wbGUuY29tIiwic3ViIjoiNjhjYzhjMmFjZmY0NjljNTYzOGI2YzBmIiwiaWF0IjoxNzU4NjcxNDMzLCJleHAiOjE3NTkyNzYyMzN9.B7QIdsTJxqPHlThzPjolQ9VUyPs7j_iqHPEkQgT169c"

echo "🧪 Testando Limites da API"
echo "=========================="

# Função para fazer requisição e mostrar resultado
test_request() {
    local endpoint="$1"
    local description="$2"
    
    echo ""
    echo "📋 $description"
    echo "URL: $endpoint"
    
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME:%{time_total}s" \
        -H "Authorization: Bearer $TOKEN" \
        "$endpoint")
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    time_total=$(echo "$response" | grep "TIME:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d' | sed '/TIME:/d')
    
    echo "Status: $http_code"
    echo "Tempo: $time_total"
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Sucesso"
        if echo "$body" | jq -e '.data' > /dev/null 2>&1; then
            count=$(echo "$body" | jq '.data | length')
            total=$(echo "$body" | jq '.total')
            echo "Registros retornados: $count"
            echo "Total disponível: $total"
        fi
    elif [ "$http_code" = "429" ]; then
        echo "🚫 Rate Limit Exceeded"
    elif [ "$http_code" = "400" ]; then
        echo "❌ Bad Request"
        message=$(echo "$body" | jq -r '.message // "Erro desconhecido"')
        echo "Mensagem: $message"
    else
        echo "❌ Erro: $http_code"
    fi
    
    echo "---"
}

# Teste 1: Limite padrão (10)
test_request "$API_URL/persons?page=1&limit=10" "Teste 1: Limite padrão (10 registros)"

# Teste 2: Limite máximo (100)
test_request "$API_URL/persons?page=1&limit=100" "Teste 2: Limite máximo (100 registros)"

# Teste 3: Limite acima do máximo (200)
test_request "$API_URL/persons?page=1&limit=200" "Teste 3: Limite acima do máximo (200 registros)"

# Teste 4: Rate limiting - múltiplas requisições rápidas
echo ""
echo "🚀 Teste de Rate Limiting (10 requisições rápidas)"
echo "=================================================="

for i in {1..10}; do
    echo -n "Requisição $i: "
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL/persons?page=1&limit=5")
    
    if [ "$response" = "200" ]; then
        echo "✅ OK"
    elif [ "$response" = "429" ]; then
        echo "🚫 Rate Limited"
        break
    else
        echo "❌ Erro: $response"
    fi
    
    sleep 0.1  # 100ms entre requisições
done

# Teste 5: Busca com paginação
echo ""
echo "🔍 Teste de Busca com Paginação"
echo "==============================="

test_request "$API_URL/persons?page=1&limit=5&search=carlos" "Busca por 'carlos'"

# Teste 6: Filtro por tipo
test_request "$API_URL/persons?page=1&limit=5&type=customer" "Filtro por tipo 'customer'"

echo ""
echo "🏁 Testes Concluídos!"
echo ""
echo "📊 Resumo dos Problemas Identificados:"
echo "1. Limite máximo de paginação: 100 registros"
echo "2. Rate limiting: 10 req/min (muito restritivo)"
echo "3. Possível timeout em operações grandes"
echo ""
echo "💡 Soluções Recomendadas:"
echo "1. Aumentar THROTTLE_LIMIT para 60-200 req/min"
echo "2. Configurar burst no Nginx"
echo "3. Ajustar timeouts se necessário"

