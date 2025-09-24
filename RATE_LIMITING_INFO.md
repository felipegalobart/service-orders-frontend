# 🚦 Informações sobre Rate Limiting

## ⚙️ **Configuração do Nginx**

Seu nginx está configurado com:
- **TTL:** 60 segundos
- **LIMIT:** 10 requisições por minuto

## 📊 **Cálculo de Requisições**

### **Por minuto:**
- ✅ **Máximo:** 10 requisições
- ⏱️ **Intervalo seguro:** 6 segundos entre requisições (60s ÷ 10 = 6s)

### **Por hora:**
- ✅ **Máximo:** 600 requisições
- ⏱️ **Intervalo seguro:** 6 segundos entre requisições

## 🛠️ **Scripts Disponíveis**

### **1. Script Básico (`populate-database.js`)**
```bash
node populate-database.js
```
- ✅ **5 registros** por execução
- ⏱️ **7 segundos** entre requisições
- 🎯 **Ideal para:** Testes rápidos

### **2. Script Seguro (`populate-database-safe.js`)**
```bash
node populate-database-safe.js
```
- ✅ **15 registros** por execução
- 📦 **Lotes de 8** registros
- ⏱️ **7 segundos** entre requisições
- 🔄 **Aguarda rate limit** resetar entre lotes
- 🎯 **Ideal para:** População completa

## ⚠️ **Erros Comuns**

### **HTTP 429 - Too Many Requests**
```
❌ Erro: HTTP Error: 429 - Too Many Requests
```
**Solução:**
- Aguardar 60 segundos
- Usar script seguro
- Reduzir velocidade das requisições

### **HTTP 401 - Unauthorized**
```
❌ Erro: HTTP Error: 401 - Unauthorized
```
**Solução:**
- Verificar se login foi feito
- Token pode ter expirado
- Executar script novamente

## 🔧 **Configurações Recomendadas**

### **Para Desenvolvimento:**
```javascript
const quantidadeRegistros = 5;
const pausaEntreRequisicoes = 7000; // 7 segundos
```

### **Para Produção:**
```javascript
const quantidadeRegistros = 10;
const pausaEntreRequisicoes = 7000; // 7 segundos
const aguardarRateLimit = true; // Aguardar reset
```

## 📈 **Estratégias de População**

### **Estratégia 1: Lotes Pequenos**
- ✅ **5 registros** por execução
- ⏱️ **7 segundos** entre requisições
- 🔄 **Executar múltiplas vezes**

### **Estratégia 2: Lotes Grandes**
- ✅ **15 registros** por execução
- 📦 **Lotes de 8** registros
- ⏱️ **Aguarda rate limit** resetar

### **Estratégia 3: Manual**
- ✅ **1 registro** por vez
- ⏱️ **6+ segundos** entre requisições
- 🎯 **Controle total**

## 🎯 **Exemplos de Uso**

### **População Rápida (5 registros):**
```bash
node populate-database.js
```

### **População Completa (15 registros):**
```bash
node populate-database-safe.js
```

### **População Contínua:**
```bash
# Executar múltiplas vezes com intervalo
node populate-database.js
sleep 300  # 5 minutos
node populate-database.js
```

## 📝 **Monitoramento**

### **Verificar Rate Limiting:**
```bash
# Verificar se ainda está bloqueado
curl -s -o /dev/null -w "%{http_code}" http://192.168.31.75:3000/persons
```

### **Contar Registros:**
```bash
# Contar pessoas no banco
curl -s -H "Authorization: Bearer TOKEN" "http://192.168.31.75:3000/persons" | jq '.data | length'
```

## 🚀 **Dicas de Otimização**

1. **Use o script seguro** para grandes volumes
2. **Execute em horários de baixo uso** do servidor
3. **Monitore os logs** do nginx
4. **Configure alertas** para rate limiting
5. **Use cache** quando possível

## 🔍 **Troubleshooting**

### **Script trava no meio:**
- Aguardar 60 segundos
- Executar novamente
- Verificar logs do servidor

### **Muitos erros 429:**
- Reduzir quantidade de registros
- Aumentar pausa entre requisições
- Usar script seguro

### **Erros 401 persistentes:**
- Verificar credenciais
- Renovar token de autenticação
- Verificar status do servidor
