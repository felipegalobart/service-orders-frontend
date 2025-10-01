#!/bin/bash

echo "🚀 Populando banco de dados com ordens de serviço..."
echo "================================================"

# Configurações
BASE_URL="http://localhost:3000"
EMAIL="cursor_user@teste.com"
PASSWORD="123456"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para fazer login e obter token
login() {
    echo -n "🔐 Fazendo login... "
    
    response=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    
    if [[ $response == *"access_token"* ]]; then
        token=$(echo $response | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Sucesso${NC}"
        echo "Token obtido: ${token:0:20}..."
        return 0
    else
        echo -e "${RED}❌ Falhou${NC}"
        echo "Resposta: $response"
        return 1
    fi
}

# Função para criar uma ordem de serviço
create_service_order() {
    local order_data="$1"
    local description="$2"
    
    echo -n "📝 $description... "
    
    response=$(curl -s -X POST "$BASE_URL/service-orders" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$order_data")
    
    if [[ $response == *"_id"* ]]; then
        order_id=$(echo $response | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Criada (ID: ${order_id:0:8}...)${NC}"
        return 1
    else
        echo -e "${RED}❌ Falhou${NC}"
        echo "Erro: $response"
        return 0
    fi
}

# Função para obter um cliente aleatório
get_random_customer() {
    local customers_response=$(curl -s -X GET "$BASE_URL/persons" \
        -H "Authorization: Bearer $token")
    
    if [[ $customers_response == *"data"* ]]; then
        echo "$customers_response" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4 | head -1
    else
        echo ""
    fi
}

# Função para obter todos os clientes disponíveis
get_all_customers() {
    local customers_response=$(curl -s -X GET "$BASE_URL/persons" \
        -H "Authorization: Bearer $token")

    if [[ $customers_response == *"data"* ]]; then
        # Extrair todos os IDs dos clientes
        customer_ids=($(echo $customers_response | grep -o '"_id":"[^"]*"' | cut -d'"' -f4))
        customer_names=($(echo $customers_response | grep -o '"name":"[^"]*"' | cut -d'"' -f4))
        
        echo -e "${GREEN}✅ ${#customer_ids[@]} clientes carregados${NC}"
        return 0
    else
        echo -e "${RED}❌ Não foi possível obter clientes${NC}"
        return 1
    fi
}

# Dados para as ordens
equipment_types=("MOTOR TRIFASICO" "MOTOR MONOFASICO" "COMPRESSOR" "BOMBA" "VENTILADOR" "SECADOR DE CABELO" "ASPIrador" "LIQUIDIFICADOR")
brands=("WEG" "SIEMENS" "ABB" "SCHNEIDER" "PHILCO" "BRASTEMP" "CONSUL" "ELETROLUX")
models=("1,0CV" "1,5CV" "2,0CV" "3,0CV" "5,0CV" "7,5CV" "10CV" "15CV")
defects=("NAO LIGA" "AQUECIMENTO EXCESSIVO" "BARULHO ANORMAL" "VIBRACAO EXCESSIVA" "QUEIMA FREQUENTE" "PERDA DE POTENCIA" "VAZAMENTO" "FALHA NO COMANDO")

# Verificar se o backend está rodando
echo -n "🔍 Verificando backend... "
if curl -s "$BASE_URL/" > /dev/null; then
    echo -e "${GREEN}✅ Backend online${NC}"
else
    echo -e "${RED}❌ Backend offline${NC}"
    echo "Certifique-se de que o backend está rodando em $BASE_URL"
    exit 1
fi

# Fazer login
if ! login; then
    echo -e "${RED}❌ Não foi possível fazer login. Verifique as credenciais.${NC}"
    exit 1
fi

# Obter todos os clientes disponíveis
echo -n "👤 Carregando clientes... "
get_all_customers
if [[ ${#customer_ids[@]} -eq 0 ]]; then
    echo -e "${YELLOW}⚠️ Nenhum cliente encontrado. Criando um cliente padrão...${NC}"
    
    # Criar um cliente padrão
    customer_data='{
        "name": "Cliente Teste",
        "email": "cliente@teste.com",
        "phone": "11999999999",
        "document": "12345678901",
        "sector": "TI"
    }'
    
    customer_response=$(curl -s -X POST "$BASE_URL/persons" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$customer_data")
    
    if [[ $customer_response == *"_id"* ]]; then
        customer_ids=($(echo $customer_response | grep -o '"_id":"[^"]*"' | cut -d'"' -f4))
        customer_names=("Cliente Teste")
        echo -e "${GREEN}✅ Cliente criado${NC}"
    else
        echo -e "${RED}❌ Não foi possível criar cliente${NC}"
        exit 1
    fi
fi

echo ""
echo "🏭 Criando 40 ordens de serviço em lotes..."
echo "=========================================="

# Contadores
total_created=0
total_failed=0

# Função para gerar dados de uma ordem
generate_order_data() {
    local i="$1"
    local status="$2"
    local customer_id="$3"
    
    # Dados aleatórios
    equipment=${equipment_types[$RANDOM % ${#equipment_types[@]}]}
    brand=${brands[$RANDOM % ${#brands[@]}]}
    model=${models[$RANDOM % ${#models[@]}]}
    defect=${defects[$RANDOM % ${#defects[@]}]}
    
    # Datas baseadas no status (compatível com macOS)
    entry_date=$(date -v-$((RANDOM % 30 + 1))d +%Y-%m-%d)
    approval_date=""
    delivery_date=""
    expected_delivery_date=""
    
    if [[ $status == "aprovado" || $status == "pronto" || $status == "entregue" ]]; then
        approval_date=$(date -v-$((RANDOM % 20 + 1))d +%Y-%m-%d)
    fi
    
    if [[ $status == "pronto" || $status == "entregue" ]]; then
        expected_delivery_date=$(date -v+$((RANDOM % 7 + 1))d +%Y-%m-%d)
    fi
    
    if [[ $status == "entregue" ]]; then
        delivery_date=$(date -v-$((RANDOM % 5 + 1))d +%Y-%m-%d)
    fi
    
    # Status financeiro aleatório
    financial_statuses=("em_aberto" "pago" "parcialmente_pago" "deve" "faturado")
    financial=${financial_statuses[$RANDOM % ${#financial_statuses[@]}]}
    
    # Criar JSON da ordem
    local order_json='{
        "customerId": "'$customer_id'",
        "equipment": "'$equipment'",
        "model": "'$model'",
        "brand": "'$brand'",
        "serialNumber": "SN'$(printf "%06d" $i)'",
        "voltage": "'$([ $((RANDOM % 2)) -eq 0 ] && echo "220V" || echo "380V")'",
        "reportedDefect": "'$defect'",
        "customerObservations": "Observação do cliente para ordem #'$i'",
        "notes": "Notas internas da ordem #'$i'",
        "entryDate": "'$entry_date'",
        "status": "'$status'",
        "financial": "'$financial'",
        "paymentType": "'$([ $((RANDOM % 2)) -eq 0 ] && echo "cash" || echo "installment")'",
        "installmentCount": '$((RANDOM % 12 + 1))',
        "warranty": '$([ $((RANDOM % 2)) -eq 0 ] && echo "true" || echo "false")'
    }'
    
    # Adicionar datas condicionais
    if [[ -n "$approval_date" ]]; then
        order_json=$(echo $order_json | sed 's/}/, "approvalDate": "'$approval_date'"}/')
    fi
    
    if [[ -n "$expected_delivery_date" ]]; then
        order_json=$(echo $order_json | sed 's/}/, "expectedDeliveryDate": "'$expected_delivery_date'"}/')
    fi
    
    if [[ -n "$delivery_date" ]]; then
        order_json=$(echo $order_json | sed 's/}/, "deliveryDate": "'$delivery_date'"}/')
    fi
    
    echo "$order_json"
}

# Criar 40 ordens (10 de cada status)
for i in {1..40}; do
    # Determinar status baseado no número
    if [[ $i -le 10 ]]; then
        status="confirmar"
    elif [[ $i -le 20 ]]; then
        status="aprovado"
    elif [[ $i -le 30 ]]; then
        status="pronto"
    else
        status="entregue"
    fi
    
    # Selecionar um cliente aleatório
    random_customer_index=$((RANDOM % ${#customer_ids[@]}))
    selected_customer_id=${customer_ids[$random_customer_index]}
    selected_customer_name=${customer_names[$random_customer_index]}
    
    # Gerar dados da ordem
    order_data=$(generate_order_data $i "$status" "$selected_customer_id")
    
    # Criar a ordem
    create_service_order "$order_data" "Ordem #$i ($status) - $selected_customer_name"
    if [[ $? -eq 1 ]]; then
        ((total_created++))
    fi
    
    # Pequena pausa para não sobrecarregar o servidor
    sleep 0.3
done

echo ""
echo "📊 Resumo da criação:"
echo "===================="
echo -e "${BLUE}Confirmar:${NC} 10 ordens"
echo -e "${YELLOW}Aprovado:${NC} 10 ordens"
echo -e "${GREEN}Pronto:${NC} 10 ordens"
echo -e "${GREEN}Entregue:${NC} 10 ordens"
echo ""
echo -e "${GREEN}✅ Total criadas: $total_created${NC}"
echo -e "${BLUE}📡 Requests realizados: $((total_created + 2)) (1 login + 1 cliente + $total_created ordens)${NC}"

if [[ $total_created -gt 0 ]]; then
    echo ""
    echo -e "${GREEN}🎉 Banco populado com sucesso!${NC}"
    echo "Acesse o frontend para visualizar as ordens criadas."
fi

echo ""
echo "🔗 Frontend: http://localhost:3001"
echo "📧 Login: $EMAIL"
echo "🔑 Senha: $PASSWORD"
