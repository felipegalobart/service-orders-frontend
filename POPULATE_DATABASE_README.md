# 🗄️ Scripts para Popular o Banco de Dados

## 📋 Descrição

Estes scripts foram criados para popular o banco de dados com dados aleatórios de cadastros (clientes e fornecedores) para facilitar os testes do sistema.

## 🚀 Como Usar

### **Opção 1: Script JavaScript (Recomendado)**

```bash
# Execute o script Node.js
node populate-database.js
```

**Requisitos:**
- Node.js 18+ (com fetch nativo)
- Ou instale: `npm install node-fetch`

### **Opção 2: Script Bash**

```bash
# Torne o script executável
chmod +x populate-database.sh

# Execute o script
./populate-database.sh
```

**Requisitos:**
- Bash
- curl
- bc (calculadora)

## 📊 Dados Gerados

### **Quantidade:**
- **25 registros** por execução
- **60% cadastros físicos** (clientes)
- **40% cadastros jurídicos** (clientes/fornecedores)

### **Tipos de Dados:**

#### **Cadastros Físicos:**
- ✅ Nome completo
- ✅ CPF válido (com dígitos verificadores)
- ✅ Telefone formatado
- ✅ Email realista
- ✅ Endereço completo

#### **Cadastros Jurídicos:**
- ✅ Razão social
- ✅ Nome fantasia
- ✅ CNPJ válido (com dígitos verificadores)
- ✅ Telefone comercial
- ✅ Email corporativo
- ✅ Endereço empresarial

### **Dados Realistas:**
- **Nomes:** Lista de nomes brasileiros comuns
- **Empresas:** Tipos reais de empresas (Tech, Construção, Consultoria, etc.)
- **Endereços:** Ruas, cidades e estados brasileiros reais
- **CPF/CNPJ:** Documentos com dígitos verificadores válidos
- **Telefones:** Formatados como (11) 99999-9999
- **Emails:** Baseados no nome/empresa com domínios comuns

## 🎯 Exemplo de Saída

```
🚀 Iniciando população do banco de dados...

📊 Gerando 25 registros de cadastros...

📝 Registro 1/25:
   Nome: João Silva
   Documento: 123.456.789-01
   Tipo: Cliente
   Email: joao.silva@gmail.com
   ✅ Criado com sucesso! ID: 64f8a1b2c3d4e5f6

📝 Registro 2/25:
   Nome: Tech Solutions Ltda
   Documento: 12.345.678/0001-90
   Tipo: Fornecedor
   Email: techsolutions@gmail.com
   ✅ Criado com sucesso! ID: 64f8a1b2c3d4e5f7

...

🎯 Resumo da População:
========================
✅ Registros criados com sucesso: 23
❌ Registros com erro: 2
📊 Total processado: 25
📈 Taxa de sucesso: 92.0%

🌐 Acesse seu frontend para ver os dados:
   http://localhost:3001/persons
```

## ⚙️ Configuração

### **Alterar Servidor da API:**

Edite a variável `API_BASE_URL` nos scripts:

**JavaScript:**
```javascript
const API_BASE_URL = 'http://SEU_SERVIDOR:PORTA';
```

**Bash:**
```bash
API_BASE_URL="http://SEU_SERVIDOR:PORTA"
```

### **Alterar Quantidade de Registros:**

**JavaScript:**
```javascript
const quantidadeRegistros = 50; // Altere aqui
```

**Bash:**
```bash
total=50  # Altere aqui
```

## 🔧 Solução de Problemas

### **Erro: "fetch is not defined"**
```bash
# Instale o node-fetch
npm install node-fetch

# Ou use Node.js 18+
```

### **Erro: "curl: command not found"**
```bash
# Instale o curl
# macOS: brew install curl
# Ubuntu: sudo apt install curl
```

### **Erro: "bc: command not found"**
```bash
# Instale o bc
# macOS: brew install bc
# Ubuntu: sudo apt install bc
```

### **API não responde:**
1. Verifique se o servidor está rodando
2. Confirme a URL da API
3. Teste manualmente: `curl http://192.168.31.75:3000/persons`

## 📝 Notas Importantes

- ✅ Os scripts geram **dados realistas** mas **fictícios**
- ✅ **CPF/CNPJ** são válidos matematicamente
- ✅ **Emails** são formatados corretamente
- ✅ **Telefones** seguem padrão brasileiro
- ✅ **Endereços** usam cidades e estados reais
- ⚠️ **Não use** estes dados em produção real
- ⚠️ **Execute apenas** em ambiente de desenvolvimento/teste

## 🎉 Resultado

Após executar o script, você terá:
- 📊 **25 cadastros** no banco de dados
- 🔍 **Dados para testar** filtros e buscas
- 📱 **Interface populada** para demonstrações
- 🧪 **Dados realistas** para desenvolvimento

**Acesse:** `http://localhost:3001/persons` para ver os dados!
