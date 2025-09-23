# 🚀 Como Alterar o Servidor da API

## ⚡ **Alteração Rápida**

### **Para Desenvolvimento:**
Edite o arquivo `vite.config.ts` na linha 11:
```typescript
target: 'http://SEU_NOVO_SERVIDOR:PORTA'
```

### **Para Produção:**
Edite o arquivo `src/config/api.ts` na linha 8:
```typescript
PRODUCTION_URL: 'https://sua-nova-api.com'
```

## 🔄 **Aplicar Mudanças**

1. **Desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Produção:**
   ```bash
   npm run build
   ```

## 📝 **Exemplos**

- **Local diferente:** `http://localhost:8080`
- **IP local:** `http://192.168.1.100:3000`
- **Servidor remoto:** `http://meuservidor.com:3000`
- **HTTPS:** `https://api.exemplo.com`

## ✅ **Pronto!**

Sua aplicação agora está configurada para usar o novo servidor da API.
