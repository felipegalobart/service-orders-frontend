#!/bin/bash

# Script para popular o banco de dados com dados aleatórios
# Execute: ./populate-database.sh

API_BASE_URL="http://192.168.31.75:3000"

echo "🚀 Populando banco de dados com dados aleatórios..."
echo "=================================================="

# Função para gerar CPF aleatório
gerar_cpf() {
    local cpf=$(printf "%03d%03d%03d" $((RANDOM % 900 + 100)) $((RANDOM % 900 + 100)) $((RANDOM % 900 + 100)))
    local d1=$(( (${cpf:0:1} * 10 + ${cpf:1:1} * 9 + ${cpf:2:1} * 8 + ${cpf:3:1} * 7 + ${cpf:4:1} * 6 + ${cpf:5:1} * 5 + ${cpf:6:1} * 4 + ${cpf:7:1} * 3 + ${cpf:8:1} * 2) % 11 ))
    local d2=$(( (${cpf:0:1} * 11 + ${cpf:1:1} * 10 + ${cpf:2:1} * 9 + ${cpf:3:1} * 8 + ${cpf:4:1} * 7 + ${cpf:5:1} * 6 + ${cpf:6:1} * 5 + ${cpf:7:1} * 4 + ${cpf:8:1} * 3 + d1 * 2) % 11 ))
    
    if [ $d1 -lt 2 ]; then d1=0; else d1=$((11 - d1)); fi
    if [ $d2 -lt 2 ]; then d2=0; else d2=$((11 - d2)); fi
    
    echo "${cpf:0:3}.${cpf:3:3}.${cpf:6:3}-${d1}${d2}"
}

# Função para gerar CNPJ aleatório
gerar_cnpj() {
    local cnpj=$(printf "%02d%03d%03d%04d" $((RANDOM % 90 + 10)) $((RANDOM % 900 + 100)) $((RANDOM % 900 + 100)) $((RANDOM % 9000 + 1000)))
    local d1=$(( (${cnpj:0:1} * 5 + ${cnpj:1:1} * 4 + ${cnpj:2:1} * 3 + ${cnpj:3:1} * 2 + ${cnpj:4:1} * 9 + ${cnpj:5:1} * 8 + ${cnpj:6:1} * 7 + ${cnpj:7:1} * 6 + ${cnpj:8:1} * 5 + ${cnpj:9:1} * 4 + ${cnpj:10:1} * 3 + ${cnpj:11:1} * 2) % 11 ))
    local d2=$(( (${cnpj:0:1} * 6 + ${cnpj:1:1} * 5 + ${cnpj:2:1} * 4 + ${cnpj:3:1} * 3 + ${cnpj:4:1} * 2 + ${cnpj:5:1} * 9 + ${cnpj:6:1} * 8 + ${cnpj:7:1} * 7 + ${cnpj:8:1} * 6 + ${cnpj:9:1} * 5 + ${cnpj:10:1} * 4 + ${cnpj:11:1} * 3 + d1 * 2) % 11 ))
    
    if [ $d1 -lt 2 ]; then d1=0; else d1=$((11 - d1)); fi
    if [ $d2 -lt 2 ]; then d2=0; else d2=$((11 - d2)); fi
    
    echo "${cnpj:0:2}.${cnpj:2:3}.${cnpj:5:3}/${cnpj:8:4}-${d1}${d2}"
}

# Função para gerar telefone aleatório
gerar_telefone() {
    local ddd=$((RANDOM % 80 + 11))
    local numero=$((RANDOM % 900000000 + 100000000))
    echo "($ddd) ${numero:0:5}-${numero:5}"
}

# Função para gerar email aleatório
gerar_email() {
    local nome=$1
    local dominios=("gmail.com" "hotmail.com" "outlook.com" "yahoo.com.br")
    local dominio=${dominios[$RANDOM % ${#dominios[@]}]}
    local nome_email=$(echo "$nome" | tr '[:upper:]' '[:lower:]' | sed 's/ /./g')
    echo "${nome_email}@${dominio}"
}

# Arrays de dados
nomes=("João Silva" "Maria Santos" "Pedro Oliveira" "Ana Costa" "Carlos Ferreira" "Lucia Rodrigues" "Roberto Alves" "Fernanda Lima" "Antonio Pereira" "Carla Souza" "Rafael Mendes" "Juliana Barbosa" "Marcos Nascimento" "Patricia Gomes" "Diego Martins" "Camila Rocha" "Lucas Carvalho" "Beatriz Ribeiro" "Felipe Araujo" "Gabriela Dias")

empresas=("Tech Solutions Ltda" "Construções Modernas S.A." "Consultoria Empresarial Eireli" "Comércio Digital Me" "Serviços Integrados Ltda" "Tecnologia Avançada S.A." "Consultoria Financeira Eireli" "Construções Rápidas Me" "Indústria Alimentícia Ltda" "Distribuição Nacional S.A.")

cidades=("São Paulo" "Rio de Janeiro" "Belo Horizonte" "Salvador" "Brasília" "Fortaleza" "Manaus" "Curitiba" "Recife" "Porto Alegre")

estados=("SP" "RJ" "MG" "BA" "DF" "CE" "AM" "PR" "PE" "RS")

ruas=("Rua das Flores" "Avenida Paulista" "Rua da Consolação" "Alameda Santos" "Rua Augusta")

# Contadores
sucessos=0
erros=0
total=25

echo "📊 Gerando $total registros de cadastros..."
echo ""

for i in $(seq 1 $total); do
    echo "📝 Registro $i/$total:"
    
    # Decidir se é cadastro físico ou jurídico (60% físico, 40% jurídico)
    if [ $((RANDOM % 10)) -lt 6 ]; then
        # Cadastro físico
        nome=${nomes[$RANDOM % ${#nomes[@]}]}
        documento=$(gerar_cpf)
        tipo="client"
        corporate_name=""
    else
        # Cadastro jurídico
        nome=${empresas[$RANDOM % ${#empresas[@]}]}
        documento=$(gerar_cnpj)
        tipo=$([ $((RANDOM % 2)) -eq 0 ] && echo "supplier" || echo "client")
        corporate_name="$nome"
    fi
    
    telefone=$(gerar_telefone)
    email=$(gerar_email "$nome")
    rua=${ruas[$RANDOM % ${#ruas[@]}]}
    numero=$((RANDOM % 9999 + 1))
    cidade=${cidades[$RANDOM % ${#cidades[@]}]}
    estado=${estados[$RANDOM % ${#estados[@]}]}
    cep=$(printf "%05d-%03d" $((RANDOM % 90000 + 10000)) $((RANDOM % 900 + 100)))
    
    echo "   Nome: $nome"
    echo "   Documento: $documento"
    echo "   Tipo: $([ "$tipo" = "client" ] && echo "Cliente" || echo "Fornecedor")"
    echo "   Email: $email"
    
    # Criar JSON do cadastro
    if [ -n "$corporate_name" ]; then
        json_data=$(cat <<EOF
{
  "name": "$nome",
  "corporateName": "$corporate_name",
  "document": "$documento",
  "type": "$tipo",
  "contacts": [
    {"type": "phone", "value": "$telefone"},
    {"type": "email", "value": "$email"}
  ],
  "addresses": [
    {
      "street": "$rua, $numero",
      "city": "$cidade",
      "state": "$estado",
      "zipCode": "$cep"
    }
  ]
}
EOF
        )
    else
        json_data=$(cat <<EOF
{
  "name": "$nome",
  "document": "$documento",
  "type": "$tipo",
  "contacts": [
    {"type": "phone", "value": "$telefone"},
    {"type": "email", "value": "$email"}
  ],
  "addresses": [
    {
      "street": "$rua, $numero",
      "city": "$cidade",
      "state": "$estado",
      "zipCode": "$cep"
    }
  ]
}
EOF
        )
    fi
    
    # Fazer requisição para a API
    response=$(curl -s -w "%{http_code}" -X POST "$API_BASE_URL/persons" \
        -H "Content-Type: application/json" \
        -d "$json_data")
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
        echo "   ✅ Criado com sucesso!"
        sucessos=$((sucessos + 1))
    else
        echo "   ❌ Erro ao criar: HTTP $http_code"
        echo "   Response: $body"
        erros=$((erros + 1))
    fi
    
    echo ""
    
    # Pequena pausa para não sobrecarregar o servidor
    sleep 0.1
done

# Resumo final
echo "🎯 Resumo da População:"
echo "========================"
echo "✅ Registros criados com sucesso: $sucessos"
echo "❌ Registros com erro: $erros"
echo "📊 Total processado: $((sucessos + erros))"
echo "📈 Taxa de sucesso: $(echo "scale=1; $sucessos * 100 / $((sucessos + erros))" | bc -l)%"

if [ $sucessos -gt 0 ]; then
    echo ""
    echo "🌐 Acesse seu frontend para ver os dados:"
    echo "   http://localhost:3001/persons"
fi
